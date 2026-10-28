"use client";

/**
 * Dedicated client-side data hook for the Inventory module
 * (Fabric Stock, Trims Stock, Cutting Issue, Finished Goods, Stock Ledger).
 *
 * Kept self-contained (like `useCommercialData`) so this module's CRUD data
 * model never collides with other in-flight ERP modules, but the record
 * shape is the canonical `InventoryItem` / `StockLedgerEntry` types from
 * `@/lib/types` and is seeded from `@/lib/seed-data` so figures stay
 * consistent with the rest of the app.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchSharedErp } from "@/lib/clientErp";
import type { InventoryCategory, InventoryItem, StockLedgerEntry } from "@/lib/types";
import { finishingJobs, inventory as seedInventory, stockLedger as seedStockLedger } from "@/lib/seed-data";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function computeBalance(received: number, issued: number): number {
  return Math.max(received - issued, 0);
}

/**
 * The seed dataset does not ship any `category: "finished"` inventory rows
 * yet, so we derive a starter set from the finishing jobs (ready-for-packing
 * quantities) — keeps the "Finished Goods" tab populated and consistent with
 * the Production > Finishing numbers instead of shipping empty.
 */
function buildFinishedGoodsSeed(): InventoryItem[] {
  return finishingJobs.map((job) => ({
    id: `inv-fin-${job.id}`,
    category: "finished",
    itemName: `${job.style} — Finished Goods`,
    colorSpec: "Assorted",
    unitType: "Carton",
    unit: "Pcs",
    orderId: job.orderId,
    poNumber: job.poNumber,
    buyerName: job.buyerName,
    style: job.style,
    received: job.readyForPacking,
    issued: 0,
    balance: job.readyForPacking,
    location: "Unit 01 — Finished Goods Store",
    lastUpdated: job.date,
  }));
}

interface InventoryState {
  inventory: InventoryItem[];
  stockLedger: StockLedgerEntry[];

  addInventoryItem: (input: Omit<InventoryItem, "id" | "balance">) => InventoryItem;
  updateInventoryItem: (id: string, patch: Partial<Omit<InventoryItem, "id">>) => void;
  deleteInventoryItem: (id: string) => void;

  addLedgerEntry: (input: Omit<StockLedgerEntry, "id" | "balance">) => StockLedgerEntry;

  refresh: () => Promise<void>;
}

let inventoryServerReady = false;

function persistToServer(state: Omit<InventoryState, "addInventoryItem" | "updateInventoryItem" | "deleteInventoryItem" | "addLedgerEntry" | "refresh">) {
  if (!inventoryServerReady || typeof window === "undefined") return;
  fetch("/api/data?store=inventory", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: state }),
  }).catch(() => {});
}

export const useInventoryData = create<InventoryState>()(
  persist(
    (set, get) => {
      const apply = (updater: (state: InventoryState) => Partial<InventoryState>) => {
        const next = updater(get());
        set(next);
        const { addInventoryItem, updateInventoryItem, deleteInventoryItem, addLedgerEntry, refresh, ...dataToPersist } = { ...get(), ...next };
        persistToServer(dataToPersist);
      };

      return {
        inventory: [...seedInventory, ...buildFinishedGoodsSeed()],
        stockLedger: seedStockLedger,

        refresh: async () => {
          try {
            const data = await fetchSharedErp();
            set({
              inventory: data.inventory,
              stockLedger: data.stockLedger,
            });
            inventoryServerReady = true;
          } catch {
            /* keep the last local copy if the server is unreachable */
          }
        },

        addInventoryItem: (input) => {
          const record: InventoryItem = {
            ...input,
            id: uid("inv"),
            balance: computeBalance(input.received, input.issued),
          };
          apply((state) => ({ inventory: [record, ...state.inventory] }));
          return record;
        },

        updateInventoryItem: (id, patch) => {
          apply((state) => ({
            inventory: state.inventory.map((item) => {
              if (item.id !== id) return item;
              const merged: InventoryItem = { ...item, ...patch };
              merged.balance = computeBalance(merged.received, merged.issued);
              return merged;
            }),
          }));
        },

        deleteInventoryItem: (id) => {
          apply((state) => ({ inventory: state.inventory.filter((item) => item.id !== id) }));
        },

        addLedgerEntry: (input) => {
          const lastForItem = get().stockLedger.find((entry) => entry.itemName === input.itemName);
          const previousBalance = lastForItem?.balance ?? 0;
          const record: StockLedgerEntry = {
            ...input,
            id: uid("ledger"),
            balance: Math.max(previousBalance + input.inQty - input.outQty, 0),
          };
          apply((state) => ({ stockLedger: [record, ...state.stockLedger] }));
          return record;
        },
      };
    },
    { name: "same-dawat-erp-inventory", version: 1 }
  )
);

export type { InventoryCategory, InventoryItem, StockLedgerEntry };
