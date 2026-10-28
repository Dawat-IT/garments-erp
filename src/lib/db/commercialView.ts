import type { Buyer, Order, OrderStage, PaymentStatus, Sample, TaTask } from "@/lib/types";

export type CommercialBuyer = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
};

export type CommercialOrderStage = "Merchandising" | "Cutting" | "Sewing" | "Finishing" | "Packing" | "Shipped";
export type CommercialPaymentStatus = "paid" | "partial" | "due";
export type CommercialTaskStatus = "Completed" | "In Progress" | "Pending" | "Delayed";
export type CommercialRisk = "On Time" | "At Risk" | "Delayed";

export type CommercialOrder = {
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
  stage: CommercialOrderStage;
  progress: number;
  taStatus: "On Track" | "At Risk" | "Delayed";
  paymentStatus: CommercialPaymentStatus;
  createdAt: string;
};

export type CommercialTask = {
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
  status: CommercialTaskStatus;
  risk: CommercialRisk;
};

export type CommercialMerch = {
  id: string;
  orderId: string;
  buyer: string;
  po: string;
  style: string;
  fitSample: "Approved" | "Pending" | "Rejected";
  ppSample: "Approved" | "Pending" | "Rejected";
  techPack: "Approved" | "Pending" | "Rejected";
  productionApproval: "Approved" | "Pending";
  riskLevel: "On Track" | "At Risk" | "Delayed";
  notes: string;
};

export type CommercialCosting = {
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
  quotations: Array<{
    version: number;
    date: string;
    offeredPrice: number;
    status: "Pending" | "Confirmed" | "Rejected";
    validUntil: string;
    buyerFeedback: string;
  }>;
  createdAt: string;
};

function day(value: string): string {
  return value?.slice(0, 10) ?? "";
}

function toCommercialStage(stage: OrderStage): CommercialOrderStage {
  if (stage === "Shipment" || stage === "Completed") return "Shipped";
  return stage;
}

function toCommercialPayment(status: PaymentStatus): CommercialPaymentStatus {
  if (status === "unpaid") return "due";
  return status;
}

export function toCommercialBuyer(buyer: Buyer): CommercialBuyer {
  return {
    id: buyer.id,
    name: buyer.name,
    company: buyer.company,
    phone: buyer.phone,
    email: buyer.email,
    address: buyer.address,
    createdAt: day(buyer.createdAt),
  };
}

export function toCommercialOrder(order: Order): CommercialOrder {
  return {
    id: order.id,
    buyerId: order.buyerId,
    buyer: order.buyerName,
    po: order.poNumber,
    style: order.style,
    product: order.productName,
    color: order.colorway,
    qty: order.quantity,
    unitPrice: order.unitPrice,
    shipDate: order.shipDate,
    stage: toCommercialStage(order.stage),
    progress: order.progressPercent,
    taStatus: order.taStatus,
    paymentStatus: toCommercialPayment(order.paymentStatus),
    createdAt: day(order.createdAt),
  };
}

export function toCommercialTask(task: TaTask): CommercialTask {
  const status: CommercialTaskStatus = task.status === "Critical" ? "Delayed" : task.status;
  const risk: CommercialRisk =
    task.riskLevel === "On Time" ? "On Time" : task.riskLevel === "Low Risk" || task.riskLevel === "Medium Risk" ? "At Risk" : "Delayed";
  return {
    id: task.id,
    orderId: task.orderId,
    buyer: task.buyerName,
    po: task.poNumber,
    style: task.style,
    taskName: task.taskName,
    department: task.department,
    owner: task.owner,
    plannedDate: task.plannedDate,
    actualDate: task.actualDate ?? "",
    status,
    risk,
  };
}

export function sampleToMerch(sample: Sample): CommercialMerch {
  const riskLevel = sample.riskLevel === "High Risk" ? "Delayed" : sample.riskLevel === "Medium Risk" ? "At Risk" : "On Track";
  return {
    id: `merch-${sample.orderId}`,
    orderId: sample.orderId,
    buyer: sample.buyerName,
    po: sample.poNumber,
    style: sample.style,
    fitSample: sample.fitSampleStatus,
    ppSample: sample.ppSampleStatus,
    techPack: sample.fitSampleStatus,
    productionApproval: sample.productionApprovalStatus === "Approved" ? "Approved" : "Pending",
    riskLevel,
    notes: sample.notes,
  };
}

export function commercialBuyerToCanonical(buyer: CommercialBuyer): Buyer {
  return {
    id: buyer.id,
    name: buyer.name,
    contactPerson: "",
    company: buyer.company,
    country: "",
    phone: buyer.phone,
    email: buyer.email,
    address: buyer.address,
    status: "Active",
    totalOrders: 0,
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    createdAt: buyer.createdAt || new Date().toISOString(),
  };
}

export function mergeCommercialOrder(existing: Order | undefined, incoming: CommercialOrder, buyerName: string): Order {
  const stage: OrderStage =
    incoming.stage === "Shipped" ? (existing?.stage === "Completed" || existing?.stage === "Shipment" ? existing.stage : "Shipment") : incoming.stage;
  return {
    id: existing?.id ?? incoming.id,
    poNumber: incoming.po,
    style: incoming.style,
    buyerId: incoming.buyerId,
    buyerName,
    productName: incoming.product,
    colorway: incoming.color,
    quantity: Number(incoming.qty) || 0,
    unitPrice: Number(incoming.unitPrice) || 0,
    orderValue: 0,
    orderDate: existing?.orderDate ?? day(incoming.createdAt),
    shipDate: incoming.shipDate,
    stage,
    progressPercent: Number(incoming.progress) || 0,
    taStatus: incoming.taStatus,
    paymentStatus: incoming.paymentStatus === "due" ? "unpaid" : incoming.paymentStatus,
    notes: existing?.notes,
    createdAt: existing?.createdAt ?? (incoming.createdAt ? new Date(incoming.createdAt).toISOString() : new Date().toISOString()),
  };
}

export function commercialCostingFromFactory(order: Order, costing?: { fabricType: string; fabricGsm: number; fabricConsumptionYdPc: number; trimsCost: number; cmCost: number; totalCost: number; pricePerPc: number }): CommercialCosting {
  const fabricCost = costing ? Math.max(costing.totalCost - costing.trimsCost - costing.cmCost, 0) : 0;
  return {
    id: `cc-${order.id}`,
    orderId: order.id,
    buyer: order.buyerName,
    style: order.style,
    fabricName: costing?.fabricType || "Fabric",
    garmentWeight: costing?.fabricGsm || 0,
    consumption: costing?.fabricConsumptionYdPc || 0,
    fabricCost,
    trimsCost: costing?.trimsCost || 0,
    cmCost: costing?.cmCost || 0,
    processingCost: 0,
    commercialCost: 0,
    unitPrice: costing?.pricePerPc || order.unitPrice,
    isFobLocked: false,
    paymentTerms: "LC",
    shipmentTerms: "FOB",
    quotations: [],
    createdAt: (order.orderDate || "").slice(0, 10),
  };
}

export function defaultCommercialCostings(orders: Order[]): CommercialCosting[] {
  const byStyle = new Map(orders.map((order) => [order.style, order]));
  const templates: Array<Omit<CommercialCosting, "id" | "orderId" | "buyer" | "style"> & { style: string }> = [
    {
      style: "STY-2026001",
      fabricName: "Single Jersey 160 GSM",
      garmentWeight: 120,
      consumption: 1.2,
      fabricCost: 94020,
      trimsCost: 16800,
      cmCost: 52800,
      processingCost: 0,
      commercialCost: 5000,
      unitPrice: 3.85,
      isFobLocked: false,
      paymentTerms: "LC",
      shipmentTerms: "FOB",
      quotations: [{ version: 1, date: "2026-07-14", offeredPrice: 4, status: "Pending", validUntil: "2026-07-30", buyerFeedback: "Awaiting review" }],
      createdAt: "2026-07-14",
    },
    {
      style: "STY-2026002",
      fabricName: "Fleece 280 GSM",
      garmentWeight: 160,
      consumption: 1.35,
      fabricCost: 46800,
      trimsCost: 11200,
      cmCost: 35200,
      processingCost: 2000,
      commercialCost: 3000,
      unitPrice: 4.2,
      isFobLocked: true,
      paymentTerms: "TT",
      shipmentTerms: "CIF",
      quotations: [
        { version: 1, date: "2026-07-15", offeredPrice: 4.5, status: "Rejected", validUntil: "2026-07-20", buyerFeedback: "Too high" },
        { version: 2, date: "2026-07-18", offeredPrice: 4.2, status: "Confirmed", validUntil: "2026-07-25", buyerFeedback: "Accepted" },
      ],
      createdAt: "2026-07-15",
    },
    {
      style: "STY-2026003",
      fabricName: "Denim 12oz",
      garmentWeight: 200,
      consumption: 1.5,
      fabricCost: 42480,
      trimsCost: 8400,
      cmCost: 26400,
      processingCost: 3300,
      commercialCost: 2500,
      unitPrice: 5.1,
      isFobLocked: false,
      paymentTerms: "Advance",
      shipmentTerms: "FOB",
      quotations: [],
      createdAt: "2026-07-08",
    },
    {
      style: "STY-2026004",
      fabricName: "Poplin 120 GSM",
      garmentWeight: 240,
      consumption: 1.2,
      fabricCost: 38475,
      trimsCost: 6300,
      cmCost: 19800,
      processingCost: 1000,
      commercialCost: 1500,
      unitPrice: 12.57,
      isFobLocked: false,
      paymentTerms: "LC",
      shipmentTerms: "FOB",
      quotations: [],
      createdAt: "2026-07-11",
    },
    {
      style: "STY-2026005",
      fabricName: "Pique 200 GSM",
      garmentWeight: 280,
      consumption: 1.35,
      fabricCost: 110530,
      trimsCost: 19600,
      cmCost: 61600,
      processingCost: 5000,
      commercialCost: 4500,
      unitPrice: 4.75,
      isFobLocked: false,
      paymentTerms: "LC",
      shipmentTerms: "FOB",
      quotations: [],
      createdAt: "2026-06-25",
    },
  ];

  return templates.flatMap((template) => {
    const order = byStyle.get(template.style);
    if (!order) return [];
    const { style, ...rest } = template;
    return [{ ...rest, id: `cc-${order.id}`, orderId: order.id, buyer: order.buyerName, style: order.style }];
  });
}

export function linkCommercialCosting(row: CommercialCosting, orders: Order[]): CommercialCosting | null {
  const order =
    orders.find((entry) => entry.id === row.orderId) ??
    orders.find((entry) => entry.style === row.style && entry.buyerName.toLowerCase() === row.buyer.trim().toLowerCase()) ??
    orders.find((entry) => entry.style === row.style);
  if (!order) return null;
  return { ...row, id: row.id || `cc-${order.id}`, orderId: order.id, buyer: order.buyerName, style: order.style };
}

export function coverMerch(orders: Order[], samples: Sample[], existing: CommercialMerch[]): CommercialMerch[] {
  const byOrder = new Map(existing.map((row) => [row.orderId, row]));
  for (const sample of samples) {
    if (!byOrder.has(sample.orderId)) byOrder.set(sample.orderId, sampleToMerch(sample));
  }
  for (const order of orders) {
    if (byOrder.has(order.id)) continue;
    byOrder.set(order.id, {
      id: `merch-${order.id}`,
      orderId: order.id,
      buyer: order.buyerName,
      po: order.poNumber,
      style: order.style,
      fitSample: "Pending",
      ppSample: "Pending",
      techPack: "Pending",
      productionApproval: "Pending",
      riskLevel: order.taStatus === "Delayed" ? "Delayed" : order.taStatus === "At Risk" ? "At Risk" : "On Track",
      notes: order.notes ?? "",
    });
  }
  return [...byOrder.values()];
}

export function linkCommercialMerch(row: CommercialMerch, orders: Order[], orderRemap: Map<string, string>): CommercialMerch | null {
  const orderId = orderRemap.get(row.orderId) ?? row.orderId;
  const order = orders.find((entry) => entry.id === orderId) ?? orders.find((entry) => entry.poNumber === row.po);
  if (!order) return null;
  return {
    ...row,
    id: `merch-${order.id}`,
    orderId: order.id,
    buyer: order.buyerName,
    po: order.poNumber,
    style: order.style,
  };
}
