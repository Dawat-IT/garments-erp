"use client";

/**
 * Shared client hook over the FULL ERP dataset (`src/lib/types.ts` →
 * `ErpData`), backed by MongoDB via `GET/PUT /api/data` (see
 * `src/app/api/data/route.ts`) and reseedable via `POST /api/seed`.
 *
 * Used by the Quality Control, Shipment, Accounts, Reports and Settings
 * pages — modules whose data model (qcRecords, shipments, ledgers,
 * expenses, payments, pnl, settings, roles…) is only represented in
 * `seed-data.ts` / `types.ts`, not in the narrower dashboard-only
 * `useErpData` hook or the localStorage-only `useCommercialData` store.
 *
 * Design: the zustand store is hydrated synchronously from the bundled
 * seed dataset so pages render instantly with no loading spinner, then
 * `ensureLoaded()` fetches the authoritative copy from MongoDB in the
 * background and swaps it in once available. Every mutation updates local
 * state immediately (optimistic) and fires a best-effort `PUT /api/data`
 * to persist — a failed/slow network never blocks the UI.
 */

import { create } from "zustand";
import { fetchSharedErp } from "@/lib/clientErp";
import { buildSeedData } from "@/lib/seed-data";
import { generateId } from "@/lib/utils";
import type {
  ErpData,
  Expense,
  PackingJob,
  Payment,
  QcRecord,
  Settings,
  Shipment,
  ShipmentDocuments,
} from "@/lib/types";

interface ErpRecordsState {
  data: ErpData;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  hydrated: boolean;
  lastSyncedAt: string | null;

  ensureLoaded: () => void;
  refresh: () => Promise<void>;

  addQcRecord: (record: Omit<QcRecord, "id">) => void;
  updateQcRecord: (id: string, patch: Partial<QcRecord>) => void;
  deleteQcRecord: (id: string) => void;

  addShipment: (shipment: Omit<Shipment, "id">) => void;
  updateShipment: (id: string, patch: Partial<Shipment>) => void;
  deleteShipment: (id: string) => void;
  toggleShipmentDocument: (id: string, doc: keyof ShipmentDocuments) => void;

  addPackingJob: (job: Omit<PackingJob, "id">) => void;
  updatePackingJob: (id: string, patch: Partial<PackingJob>) => void;
  deletePackingJob: (id: string) => void;

  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addPayment: (payment: Omit<Payment, "id">) => void;
  updatePayment: (id: string, patch: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;

  resetToSeed: () => Promise<void>;
  importData: (next: ErpData) => void;
  clearTransactional: () => void;
}

let loadTriggered = false;

function persistToServer(data: ErpData, hydrated: boolean) {
  if (!hydrated || typeof window === "undefined") return;
  fetch("/api/data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  }).catch(() => {
    /* best-effort background sync — local state remains authoritative for the session */
  });
}

export const useErpRecords = create<ErpRecordsState>()((set, get) => {
  const apply = (updater: (data: ErpData) => ErpData) => {
    const next = updater(get().data);
    persistToServer(next, get().hydrated);
    set({ data: next });
    return next;
  };

  return {
    data: buildSeedData(),
    loading: false,
    syncing: false,
    error: null,
    hydrated: false,
    lastSyncedAt: null,

    ensureLoaded: () => {
      if (loadTriggered) return;
      loadTriggered = true;
      void get().refresh();
    },

    refresh: async () => {
      set({ loading: true, error: null });
      try {
        const data = await fetchSharedErp();
        set({ data, loading: false, hydrated: true, lastSyncedAt: new Date().toISOString() });
      } catch (err) {
        set({
          loading: false,
          hydrated: true,
          error: err instanceof Error ? err.message : "Network error while loading ERP data.",
        });
      }
    },

    addQcRecord: (record) => {
      const item: QcRecord = { ...record, id: generateId("qc") };
      apply((d) => ({ ...d, qcRecords: [item, ...d.qcRecords] }));
    },
    updateQcRecord: (id, patch) => {
      apply((d) => ({ ...d, qcRecords: d.qcRecords.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
    },
    deleteQcRecord: (id) => {
      apply((d) => ({ ...d, qcRecords: d.qcRecords.filter((r) => r.id !== id) }));
    },

    addShipment: (shipment) => {
      const item: Shipment = { ...shipment, id: generateId("ship") };
      apply((d) => ({ ...d, shipments: [item, ...d.shipments] }));
    },
    updateShipment: (id, patch) => {
      apply((d) => ({ ...d, shipments: d.shipments.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
    },
    deleteShipment: (id) => {
      apply((d) => ({ ...d, shipments: d.shipments.filter((s) => s.id !== id) }));
    },
    toggleShipmentDocument: (id, doc) => {
      apply((d) => ({
        ...d,
        shipments: d.shipments.map((s) =>
          s.id === id ? { ...s, documents: { ...s.documents, [doc]: !s.documents[doc] } } : s
        ),
      }));
    },

    addPackingJob: (job) => {
      const item: PackingJob = { ...job, id: generateId("pack") };
      apply((d) => ({ ...d, packingJobs: [item, ...d.packingJobs] }));
    },
    updatePackingJob: (id, patch) => {
      apply((d) => ({ ...d, packingJobs: d.packingJobs.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
    },
    deletePackingJob: (id) => {
      apply((d) => ({ ...d, packingJobs: d.packingJobs.filter((p) => p.id !== id) }));
    },

    addExpense: (expense) => {
      const item: Expense = { ...expense, id: generateId("exp") };
      apply((d) => ({ ...d, expenses: [item, ...d.expenses] }));
    },
    updateExpense: (id, patch) => {
      apply((d) => ({ ...d, expenses: d.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
    },
    deleteExpense: (id) => {
      apply((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
    },

    addPayment: (payment) => {
      const item: Payment = { ...payment, id: generateId("pay") };
      apply((d) => ({ ...d, payments: [item, ...d.payments] }));
    },
    updatePayment: (id, patch) => {
      apply((d) => ({ ...d, payments: d.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
    },
    deletePayment: (id) => {
      apply((d) => ({ ...d, payments: d.payments.filter((p) => p.id !== id) }));
    },

    updateSettings: (patch) => {
      apply((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
    },

    resetToSeed: async () => {
      set({ syncing: true });
      try {
        await fetch("/api/seed", { method: "POST" });
      } catch {
        /* fall back to a local reseed even if the server round-trip fails */
      }
      set({ data: buildSeedData(), syncing: false, lastSyncedAt: new Date().toISOString() });
    },

    importData: (next) => {
      set({ data: next });
      persistToServer(next, true);
    },

    clearTransactional: () => {
      apply((d) => ({
        ...d,
        buyers: [],
        orders: [],
        taTasks: [],
        samples: [],
        costings: [],
        procurements: [],
        inventory: [],
        stockLedger: [],
        cuttingJobs: [],
        sewingLines: [],
        finishingJobs: [],
        packingJobs: [],
        qcRecords: [],
        defects: [],
        shipments: [],
        buyerLedger: [],
        supplierLedger: [],
        expenses: [],
        payments: [],
        pnl: [],
      }));
    },
  };
});

export default useErpRecords;
