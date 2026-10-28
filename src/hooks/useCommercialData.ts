"use client";

/**
 * Dedicated client-side data hook for the Commercial module
 * (Buyers, Orders, T&A Calendar, Merchandising, Costing).
 *
 * Kept self-contained under its own name/store (instead of the shared
 * `@/hooks/useErpData`) so this module's CRUD data model never collides
 * with other in-flight ERP modules being built in parallel.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buyers as canonicalBuyers, orders as canonicalOrders, samples as canonicalSamples, taTasks as canonicalTasks } from "@/lib/seed-data";
import { defaultCommercialCostings, sampleToMerch, toCommercialBuyer, toCommercialOrder, toCommercialTask } from "@/lib/db/commercialView";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Buyer = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
};

export type OrderStage =
  | "Merchandising"
  | "Cutting"
  | "Sewing"
  | "Finishing"
  | "Packing"
  | "Shipped";

export type TaStatus = "On Track" | "At Risk" | "Delayed";
export type PaymentStatus = "paid" | "partial" | "due";

export type Order = {
  id: string;
  buyerId: string;
  buyer: string;
  po: string;
  style: string;
  product: string;
  color: string;
  qty: number;
  unitPrice: number;
  shipDate: string;
  stage: OrderStage;
  progress: number;
  taStatus: TaStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type TaskStatus = "Completed" | "In Progress" | "Pending" | "Delayed";
export type RiskLevel = "On Time" | "At Risk" | "Delayed";

export type TaTask = {
  id: string;
  orderId: string;
  buyer: string;
  po: string;
  style: string;
  taskName: string;
  department: string;
  owner: string;
  plannedDate: string;
  actualDate: string;
  status: TaskStatus;
  risk: RiskLevel;
};

export type SampleStatus = "Approved" | "Pending" | "Rejected";
export type ProductionApproval = "Approved" | "Pending";

export type MerchItem = {
  id: string;
  orderId: string;
  buyer: string;
  po: string;
  style: string;
  fitSample: SampleStatus;
  ppSample: SampleStatus;
  techPack: SampleStatus;
  productionApproval: ProductionApproval;
  riskLevel: TaStatus;
  notes: string;
};

export type QuotationStatus = "Pending" | "Confirmed" | "Rejected";

export type QuotationVersion = {
  version: number;
  date: string;
  offeredPrice: number;
  status: QuotationStatus;
  validUntil: string;
  buyerFeedback: string;
};

export type Costing = {
  id: string;
  orderId: string;
  buyer: string;
  style: string;
  fabricName: string;
  garmentWeight: number;
  consumption: number;
  fabricCost: number;
  trimsCost: number;
  cmCost: number;
  processingCost: number;
  commercialCost: number;
  unitPrice: number;
  isFobLocked: boolean;
  paymentTerms: string;
  shipmentTerms: string;
  quotations: QuotationVersion[];
  createdAt: string;
};


/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/*  Seed data — same buyers and orders as the canonical ERP tables     */
/* ------------------------------------------------------------------ */

const seedBuyers: Buyer[] = canonicalBuyers.map(toCommercialBuyer);
const seedOrders: Order[] = canonicalOrders.map(toCommercialOrder);
const seedTaTasks: TaTask[] = canonicalTasks.map(toCommercialTask);
const seedMerchItems: MerchItem[] = canonicalSamples.map(sampleToMerch);
const seedCostings: Costing[] = defaultCommercialCostings(canonicalOrders);

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

interface CommercialState {
  buyers: Buyer[];
  orders: Order[];
  taTasks: TaTask[];
  merchItems: MerchItem[];
  costings: Costing[];

  addBuyer: (buyer: Omit<Buyer, "id" | "createdAt">) => Buyer;
  updateBuyer: (id: string, patch: Partial<Buyer>) => void;
  deleteBuyer: (id: string) => void;

  addOrder: (order: Omit<Order, "id" | "createdAt">) => Order;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  addTaTask: (task: Omit<TaTask, "id">) => TaTask;
  updateTaTask: (id: string, patch: Partial<TaTask>) => void;
  deleteTaTask: (id: string) => void;

  addMerchItem: (item: Omit<MerchItem, "id">) => MerchItem;
  updateMerchItem: (id: string, patch: Partial<MerchItem>) => void;

  addCosting: (costing: Omit<Costing, "id" | "createdAt">) => Costing;
  updateCosting: (id: string, patch: Partial<Costing>) => void;
  deleteCosting: (id: string) => void;

  refresh: () => Promise<void>;
}

let commercialServerReady = false;

function persistToServer(state: Omit<CommercialState, "addBuyer" | "updateBuyer" | "deleteBuyer" | "addOrder" | "updateOrder" | "deleteOrder" | "addTaTask" | "updateTaTask" | "deleteTaTask" | "addMerchItem" | "updateMerchItem" | "addCosting" | "updateCosting" | "deleteCosting" | "refresh">) {
  if (!commercialServerReady || typeof window === "undefined") return;
  fetch("/api/data?store=commercial", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: state }),
  }).catch(() => {});
}

export const useCommercialData = create<CommercialState>()(
  persist(
    (set, get) => {
      const apply = (updater: (state: CommercialState) => Partial<CommercialState>) => {
        const next = updater(get());
        set(next);
        const { addBuyer, updateBuyer, deleteBuyer, addOrder, updateOrder, deleteOrder, addTaTask, updateTaTask, deleteTaTask, addMerchItem, updateMerchItem, addCosting, updateCosting, deleteCosting, refresh, ...dataToPersist } = { ...get(), ...next };
        persistToServer(dataToPersist);
      };

      return {
        buyers: seedBuyers,
        orders: seedOrders,
        taTasks: seedTaTasks,
        merchItems: seedMerchItems,
        costings: seedCostings,

        refresh: async () => {
          try {
            const res = await fetch("/api/data?store=commercial");
            const json = await res.json();
            if (json?.success && json.data) {
              set({ ...json.data });
              commercialServerReady = true;
            }
          } catch (e) {}
        },

        addBuyer: (buyer) => {
          const newBuyer: Buyer = { ...buyer, id: uid("buyer"), createdAt: new Date().toISOString().slice(0, 10) };
          apply((state) => ({ buyers: [newBuyer, ...state.buyers] }));
          return newBuyer;
        },
        updateBuyer: (id, patch) => {
          apply((state) => ({ buyers: state.buyers.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
        },
        deleteBuyer: (id) => {
          apply((state) => ({ buyers: state.buyers.filter((b) => b.id !== id) }));
        },

        addOrder: (order) => {
          const newOrder: Order = { ...order, id: uid("order"), createdAt: new Date().toISOString().slice(0, 10) };
          apply((state) => ({ orders: [newOrder, ...state.orders] }));
          return newOrder;
        },
        updateOrder: (id, patch) => {
          apply((state) => ({ orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
        },
        deleteOrder: (id) => {
          apply((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
        },

        addTaTask: (task) => {
          const newTask: TaTask = { ...task, id: uid("ta") };
          apply((state) => ({ taTasks: [newTask, ...state.taTasks] }));
          return newTask;
        },
        updateTaTask: (id, patch) => {
          apply((state) => ({ taTasks: state.taTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
        },
        deleteTaTask: (id) => {
          apply((state) => ({ taTasks: state.taTasks.filter((t) => t.id !== id) }));
        },

        addMerchItem: (item) => {
          const newItem: MerchItem = { ...item, id: uid("mi") };
          apply((state) => ({ merchItems: [newItem, ...state.merchItems] }));
          return newItem;
        },
        updateMerchItem: (id, patch) => {
          apply((state) => ({ merchItems: state.merchItems.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
        },

        addCosting: (costing) => {
          const newCosting: Costing = { ...costing, id: uid("cs"), createdAt: new Date().toISOString().slice(0, 10) };
          apply((state) => ({ costings: [newCosting, ...state.costings] }));
          return newCosting;
        },
        updateCosting: (id, patch) => {
          apply((state) => ({ costings: state.costings.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
        },
        deleteCosting: (id) => {
          apply((state) => ({ costings: state.costings.filter((c) => c.id !== id) }));
        },
      };
    },
    { name: "same-dawat-erp-commercial", version: 2 }
  )
);

/* ------------------------------------------------------------------ */
/*  Derived helpers                                                    */
/* ------------------------------------------------------------------ */

export function orderValue(order: Order): number {
  return order.qty * order.unitPrice;
}

export function buyerStats(buyer: Buyer, orders: Order[]) {
  const buyerOrders = orders.filter((o) => o.buyerId === buyer.id);
  const totalValue = buyerOrders.reduce((sum, o) => sum + orderValue(o), 0);
  const totalQty = buyerOrders.reduce((sum, o) => sum + o.qty, 0);
  const received = buyerOrders.reduce((sum, o) => {
    const value = orderValue(o);
    if (o.paymentStatus === "paid") return sum + value;
    if (o.paymentStatus === "partial") return sum + value * 0.6;
    return sum;
  }, 0);
  return {
    totalOrders: buyerOrders.length,
    totalQty,
    totalValue,
    totalReceived: received,
    totalDue: totalValue - received,
    orders: buyerOrders,
  };
}

export function costingTotal(c: Costing): number {
  return c.fabricCost + c.trimsCost + c.cmCost + c.processingCost + c.commercialCost;
}

export function costingMarginPct(c: Costing, qty: number): number {
  if (!qty || !c.unitPrice) return 0;
  const totalCost = costingTotal(c);
  const costPerPc = totalCost / qty;
  return ((c.unitPrice - costPerPc) / c.unitPrice) * 100;
}
