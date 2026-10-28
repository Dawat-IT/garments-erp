"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchSharedErp } from "@/lib/clientErp";
import type { 
  Quotation, 
  ConfirmOrder, 
  OrderStatus, 
  AccRmBooking, 
  FabricBooking, 
  AccessoriesBooking, 
  PiRegister,
  AccEstimation
} from "@/lib/types";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface MerchandisingState {
  quotations: Quotation[];
  confirmOrders: ConfirmOrder[];
  orderStatuses: OrderStatus[];
  accRmBookings: AccRmBooking[];
  fabricBookings: FabricBooking[];
  accessoriesBookings: AccessoriesBooking[];
  piRegisters: PiRegister[];
  accEstimations: AccEstimation[];

  addQuotation: (input: Omit<Quotation, "id">) => Quotation;
  updateQuotation: (id: string, patch: Partial<Omit<Quotation, "id">>) => void;
  deleteQuotation: (id: string) => Promise<void>;
  saveQuotation: (input: Omit<Quotation, "id"> & { id?: string }) => Promise<Quotation>;

  addConfirmOrder: (input: Omit<ConfirmOrder, "id">) => ConfirmOrder;
  updateConfirmOrder: (id: string, patch: Partial<Omit<ConfirmOrder, "id">>) => void;
  deleteConfirmOrder: (id: string) => void;
  flushConfirmOrders: () => Promise<void>;

  addOrderStatus: (input: Omit<OrderStatus, "id">) => OrderStatus;
  updateOrderStatus: (id: string, patch: Partial<Omit<OrderStatus, "id">>) => void;
  deleteOrderStatus: (id: string) => void;

  addAccRmBooking: (input: Omit<AccRmBooking, "id">) => AccRmBooking;
  updateAccRmBooking: (id: string, patch: Partial<Omit<AccRmBooking, "id">>) => void;
  deleteAccRmBooking: (id: string) => void;

  addFabricBooking: (input: Omit<FabricBooking, "id">) => FabricBooking;
  updateFabricBooking: (id: string, patch: Partial<Omit<FabricBooking, "id">>) => void;
  deleteFabricBooking: (id: string) => void;

  addAccessoriesBooking: (input: Omit<AccessoriesBooking, "id">) => AccessoriesBooking;
  updateAccessoriesBooking: (id: string, patch: Partial<Omit<AccessoriesBooking, "id">>) => void;
  deleteAccessoriesBooking: (id: string) => void;

  addPiRegister: (input: Omit<PiRegister, "id">) => PiRegister;
  updatePiRegister: (id: string, patch: Partial<Omit<PiRegister, "id">>) => void;
  deletePiRegister: (id: string) => void;

  addAccEstimation: (input: Omit<AccEstimation, "id">) => AccEstimation;
  updateAccEstimation: (id: string, patch: Partial<Omit<AccEstimation, "id">>) => void;
  deleteAccEstimation: (id: string) => void;

  refresh: () => Promise<boolean>;
}

let merchandisingServerReady = false;

function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of rows) {
    if (!row?.id || map.has(row.id)) continue;
    map.set(row.id, row);
  }
  return [...map.values()];
}

async function readMerchandising() {
  const res = await fetch("/api/data?store=merchandising");
  const json = await res.json();
  if (!res.ok || !json?.success || !json.data) {
    throw new Error(json?.error || "Could not load quotations.");
  }
  return json.data as Pick<
    MerchandisingState,
    | "quotations"
    | "confirmOrders"
    | "orderStatuses"
    | "accRmBookings"
    | "fabricBookings"
    | "accessoriesBookings"
    | "piRegisters"
    | "accEstimations"
  >;
}

async function writeMerchandising(data: Partial<Awaited<ReturnType<typeof readMerchandising>>>) {
  const res = await fetch("/api/data?store=merchandising", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || "Could not save quotation.");
  }
  return json.data as Partial<Awaited<ReturnType<typeof readMerchandising>>> | undefined;
}

let confirmFlush: Promise<void> = Promise.resolve();

function persistToServer(state: Partial<MerchandisingState>) {
  if (!merchandisingServerReady || typeof window === "undefined") return;
  fetch("/api/data?store=merchandising", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: state }),
  }).catch(() => {});
}

export const useMerchandisingData = create<MerchandisingState>()(
  persist(
    (set, get) => {
      const apply = (updater: (state: MerchandisingState) => Partial<MerchandisingState>) => {
        const next = updater(get());
        set(next);
        persistToServer(next);
      };

      return {
        quotations: [],
        confirmOrders: [],
        orderStatuses: [],
        accRmBookings: [],
        fabricBookings: [],
        accessoriesBookings: [],
        piRegisters: [],
        accEstimations: [],

        refresh: async () => {
          try {
            const data = await fetchSharedErp();
            set({
              quotations: dedupeById(data.quotations || []),
              confirmOrders: data.confirmOrders || [],
              orderStatuses: data.orderStatuses || [],
              accRmBookings: data.accRmBookings || [],
              fabricBookings: data.fabricBookings || [],
              accessoriesBookings: data.accessoriesBookings || [],
              piRegisters: data.piRegisters || [],
              accEstimations: data.accEstimations || [],
            });
            merchandisingServerReady = true;
            return true;
          } catch {
            return false;
          }
        },

        addQuotation: (input) => {
          const record: Quotation = { ...input, id: uid("qtn"), appStatus: input.appStatus || "Draft" };
          apply((state) => ({ quotations: dedupeById([record, ...state.quotations]) }));
          return record;
        },
        updateQuotation: (id, patch) => {
          apply((state) => ({ quotations: state.quotations.map(p => p.id === id ? { ...p, ...patch } : p) }));
        },
        deleteQuotation: async (id) => {
          const server = await readMerchandising();
          const quotations = dedupeById((server.quotations || []).filter((row) => row.id !== id));
          const next = { ...server, quotations };
          await writeMerchandising(next);
          set(next);
          merchandisingServerReady = true;
        },
        saveQuotation: async (input) => {
          const server = await readMerchandising();
          const id = input.id || uid("qtn");
          const record: Quotation = { ...input, id, appStatus: input.appStatus || "Draft" };
          const quotations = dedupeById([
            record,
            ...(server.quotations || []).filter((row) => row.id !== id),
          ]);
          const next = { ...server, quotations };
          const serverData = await writeMerchandising(next);
          const updatedState = serverData ? { ...next, ...serverData } : next;
          set(updatedState);
          merchandisingServerReady = true;

          // Trigger refresh of commercial store if present in window
          if (typeof window !== "undefined") {
            try {
              const { useCommercialData } = await import("@/hooks/useCommercialData");
              useCommercialData.getState().refresh();
            } catch {}
            try {
              const { useErpRecords } = await import("@/hooks/useErpRecords");
              useErpRecords.getState().refresh();
            } catch {}
          }

          return record;
        },

        addConfirmOrder: (input) => {
          const record: ConfirmOrder = { ...input, id: uid("co") };
          set({ confirmOrders: [record, ...get().confirmOrders] });
          return record;
        },
        updateConfirmOrder: (id, patch) => {
          set({ confirmOrders: get().confirmOrders.map((row) => (row.id === id ? { ...row, ...patch } : row)) });
        },
        deleteConfirmOrder: (id) => {
          set({ confirmOrders: get().confirmOrders.filter((row) => row.id !== id) });
        },
        flushConfirmOrders: () => {
          const run = async () => {
            if (!merchandisingServerReady) {
              throw new Error("Orders are still loading.");
            }
            let latest = dedupeById(get().confirmOrders);
            await writeMerchandising({ confirmOrders: latest });
            const after = dedupeById(get().confirmOrders);
            if (JSON.stringify(after) !== JSON.stringify(latest)) {
              latest = after;
              await writeMerchandising({ confirmOrders: latest });
            }
          };
          const pending = confirmFlush.then(run, run);
          confirmFlush = pending.then(
            () => undefined,
            () => undefined
          );
          return pending;
        },

        addOrderStatus: (input) => {
          const record: OrderStatus = { ...input, id: uid("os") };
          apply((state) => ({ orderStatuses: [record, ...state.orderStatuses] }));
          return record;
        },
        updateOrderStatus: (id, patch) => {
          apply((state) => ({ orderStatuses: state.orderStatuses.map(p => p.id === id ? { ...p, ...patch } : p) }));
        },
        deleteOrderStatus: (id) => {
          apply((state) => ({ orderStatuses: state.orderStatuses.filter(p => p.id !== id) }));
        },

        addAccRmBooking: (input) => {
          const record: AccRmBooking = { ...input, id: uid("acc") };
          apply((state) => ({ accRmBookings: [record, ...state.accRmBookings] }));
          return record;
        },
        updateAccRmBooking: (id, patch) => {
          apply((state) => ({ accRmBookings: state.accRmBookings.map(p => p.id === id ? { ...p, ...patch } : p) }));
        },
        deleteAccRmBooking: (id) => {
          apply((state) => ({ accRmBookings: state.accRmBookings.filter(p => p.id !== id) }));
        },

        addFabricBooking: (input) => {
          const record: FabricBooking = { ...input, id: uid("fab") };
          apply((state) => ({ fabricBookings: [record, ...state.fabricBookings] }));
          return record;
        },
        updateFabricBooking: (id, patch) => {
          apply((state) => ({ fabricBookings: state.fabricBookings.map(p => p.id === id ? { ...p, ...patch } : p) }));
        },
        deleteFabricBooking: (id) => {
          apply((state) => ({ fabricBookings: state.fabricBookings.filter(p => p.id !== id) }));
        },

        addAccessoriesBooking: (input) => {
          const record: AccessoriesBooking = { ...input, id: uid("accb") };
          apply((state) => ({ accessoriesBookings: [record, ...state.accessoriesBookings] }));
          return record;
        },
        updateAccessoriesBooking: (id, patch) => {
          apply((state) => ({ accessoriesBookings: state.accessoriesBookings.map(p => p.id === id ? { ...p, ...patch } : p) }));
        },
        deleteAccessoriesBooking: (id) => {
          apply((state) => ({ accessoriesBookings: state.accessoriesBookings.filter(p => p.id !== id) }));
        },

        addPiRegister: (input) => {
          const record: PiRegister = { ...input, id: uid("pi") };
          apply((state) => ({ piRegisters: [record, ...state.piRegisters] }));
          return record;
        },
        updatePiRegister: (id, patch) => {
          apply((state) => ({ piRegisters: state.piRegisters.map(p => p.id === id ? { ...p, ...patch } : p) }));
        },
        deletePiRegister: (id) => {
          apply((state) => ({ piRegisters: state.piRegisters.filter(p => p.id !== id) }));
        },

        addAccEstimation: (input) => {
          const record: AccEstimation = { ...input, id: uid("ae") };
          apply((state) => ({ accEstimations: [record, ...state.accEstimations] }));
          return record;
        },
        updateAccEstimation: (id, patch) => {
          apply((state) => ({ accEstimations: state.accEstimations.map(p => p.id === id ? { ...p, ...patch } : p) }));
        },
        deleteAccEstimation: (id) => {
          apply((state) => ({ accEstimations: state.accEstimations.filter(p => p.id !== id) }));
        },
      };
    },
    { name: "same-dawat-erp-merchandising", version: 1, skipHydration: true }
  )
);
