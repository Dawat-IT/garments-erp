"use client";

/**
 * Dedicated client-side data hook for the Procurement module
 * (Fabric Booking, Trims Booking, Supplier PO, In-house Status).
 *
 * Kept self-contained (like `useCommercialData`) so this module's CRUD data
 * model never collides with other in-flight ERP modules, but the record
 * shape is the canonical `Procurement` type from `@/lib/types` and is seeded
 * from `@/lib/seed-data` so figures stay consistent with the rest of the app.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchSharedErp } from "@/lib/clientErp";
import type { Procurement, ProcurementStatus, ProcurementType } from "@/lib/types";
import { procurements as seedProcurements } from "@/lib/seed-data";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function computeBalance(required: number, received: number): number {
  return Math.max(required - received, 0);
}

interface ProcurementState {
  procurements: Procurement[];

  addProcurement: (input: Omit<Procurement, "id" | "balance">) => Procurement;
  updateProcurement: (id: string, patch: Partial<Omit<Procurement, "id">>) => void;
  deleteProcurement: (id: string) => void;

  refresh: () => Promise<void>;
}

let procurementServerReady = false;

function persistToServer(state: Omit<ProcurementState, "addProcurement" | "updateProcurement" | "deleteProcurement" | "refresh">) {
  if (!procurementServerReady || typeof window === "undefined") return;
  fetch("/api/data?store=procurement", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: state }),
  }).catch(() => {});
}

export const useProcurementData = create<ProcurementState>()(
  persist(
    (set, get) => {
      const apply = (updater: (state: ProcurementState) => Partial<ProcurementState>) => {
        const next = updater(get());
        set(next);
        const { addProcurement, updateProcurement, deleteProcurement, refresh, ...dataToPersist } = { ...get(), ...next };
        persistToServer(dataToPersist);
      };

      return {
        procurements: seedProcurements,

        refresh: async () => {
          try {
            const data = await fetchSharedErp();
            set({ procurements: data.procurements });
            procurementServerReady = true;
          } catch {
            /* keep the last local copy if the server is unreachable */
          }
        },

        addProcurement: (input) => {
          const record: Procurement = {
            ...input,
            id: uid("proc"),
            balance: computeBalance(input.required, input.received),
          };
          apply((state) => ({ procurements: [record, ...state.procurements] }));
          return record;
        },

        updateProcurement: (id, patch) => {
          apply((state) => ({
            procurements: state.procurements.map((p) => {
              if (p.id !== id) return p;
              const merged: Procurement = { ...p, ...patch };
              merged.balance = computeBalance(merged.required, merged.received);
              return merged;
            }),
          }));
        },

        deleteProcurement: (id) => {
          apply((state) => ({ procurements: state.procurements.filter((p) => p.id !== id) }));
        },
      };
    },
    { name: "same-dawat-erp-procurement", version: 1 }
  )
);

/* ------------------------------------------------------------------ */
/*  Derived helpers                                                    */
/* ------------------------------------------------------------------ */

export function procurementProgressPct(p: Procurement): number {
  if (!p.required) return 0;
  return Math.min(100, Math.round((p.received / p.required) * 100));
}

export function isProcurementInHouse(p: Procurement): boolean {
  return p.status === "in house" || p.received >= p.required;
}

export type { Procurement, ProcurementStatus, ProcurementType };
