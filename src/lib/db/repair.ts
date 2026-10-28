import type {
  Buyer,
  Defect,
  ErpData,
  InventoryItem,
  Order,
  Payment,
  Procurement,
  QcRecord,
  StockLedgerEntry,
  SupplierLedgerEntry,
} from "@/lib/types";

export class RelationError extends Error {
  issues: string[];

  constructor(issues: string[]) {
    super(issues.slice(0, 6).join("; "));
    this.name = "RelationError";
    this.issues = issues;
  }
}

const ORDER_CHILDREN = [
  "taTasks",
  "samples",
  "costings",
  "procurements",
  "inventory",
  "cuttingJobs",
  "sewingLines",
  "finishingJobs",
  "packingJobs",
  "qcRecords",
  "shipments",
  "pnl",
] as const;

type OrderChildKey = (typeof ORDER_CHILDREN)[number];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function money(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function supplierIdFromName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `supplier-${slug || "unknown"}`;
}

function ledgerStatus(due: number, paid: number): "paid" | "partial" | "unpaid" {
  if (due <= 0.009) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

function syncOrderFields(row: Record<string, unknown>, order: Order) {
  if ("poNumber" in row) row.poNumber = order.poNumber;
  if ("buyerName" in row) row.buyerName = order.buyerName;
  if ("style" in row) row.style = order.style;
  if ("orderQty" in row) row.orderQty = order.quantity;
}

function linkStockLedger(
  rows: StockLedgerEntry[],
  procurements: Procurement[],
  inventory: InventoryItem[],
  issues: string[]
) {
  const byInventoryId = new Map(inventory.map((item) => [item.id, item]));
  const byInventoryName = new Map(inventory.map((item) => [item.itemName.trim().toLowerCase(), item]));
  const byProcurementItem = new Map<string, Procurement>();
  for (const row of procurements) {
    const key = row.item.trim().toLowerCase();
    if (!byProcurementItem.has(key)) byProcurementItem.set(key, row);
  }

  for (const row of rows) {
    let item = row.inventoryItemId ? byInventoryId.get(row.inventoryItemId) : undefined;
    if (!item) item = byInventoryName.get(row.itemName.trim().toLowerCase());
    if (!item) {
      const proc = row.procurementId
        ? procurements.find((entry) => entry.id === row.procurementId)
        : byProcurementItem.get(row.itemName.trim().toLowerCase());
      if (proc) {
        row.procurementId = proc.id;
        row.orderId = proc.orderId;
        item = inventory.find(
          (entry) => entry.orderId === proc.orderId && entry.category === (proc.type === "fabric" ? "fabric" : "trims")
        );
      }
    }
    if (!item) {
      issues.push(`stockLedger ${row.id} is not linked to an inventory item`);
      continue;
    }
    row.inventoryItemId = item.id;
    row.orderId = item.orderId;
    row.itemName = item.itemName;
    if (!row.procurementId) {
      const proc = procurements.find((entry) => entry.orderId === item.orderId && entry.type === (item.category === "trims" ? "trims" : "fabric"));
      if (proc) row.procurementId = proc.id;
    }
  }

  const groups = new Map<string, StockLedgerEntry[]>();
  for (const row of rows) {
    if (!row.inventoryItemId) continue;
    const list = groups.get(row.inventoryItemId) ?? [];
    list.push(row);
    groups.set(row.inventoryItemId, list);
  }

  for (const list of groups.values()) {
    list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    let running = 0;
    let lowest = 0;
    for (const row of list) {
      running += Number(row.inQty) - Number(row.outQty);
      if (running < lowest) lowest = running;
    }
    const opening = lowest < 0 ? -lowest : 0;
    running = opening;
    for (const row of list) {
      running += Number(row.inQty) - Number(row.outQty);
      row.balance = money(running);
    }
  }
}

function linkDefects(defects: Defect[], qcRecords: QcRecord[]) {
  const grouped = new Map<string, QcRecord[]>();
  for (const record of qcRecords) {
    const list = grouped.get(record.defectType) ?? [];
    list.push(record);
    grouped.set(record.defectType, list);
  }

  const seen = new Set<string>();
  for (const defect of defects) {
    seen.add(defect.defectType);
    const records = grouped.get(defect.defectType) ?? [];
    defect.qcRecordIds = records.map((record) => record.id);
    defect.occurrences = records.length;
    defect.totalDefectQty = records.reduce((sum, record) => sum + Number(record.defectQty), 0);
  }

  for (const [defectType, records] of grouped) {
    if (seen.has(defectType)) continue;
    defects.push({
      id: `defect-${defectType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      defectType,
      occurrences: records.length,
      totalDefectQty: records.reduce((sum, record) => sum + Number(record.defectQty), 0),
      qcRecordIds: records.map((record) => record.id),
    });
  }
}

function linkParty(payment: Payment, buyers: Buyer[], issues: string[]) {
  if (payment.partyType === "other") {
    payment.partyId = payment.partyId || "";
    return;
  }
  if (payment.partyType === "buyer") {
    const buyer =
      buyers.find((entry) => entry.id === payment.partyId) ??
      buyers.find((entry) => entry.name.toLowerCase() === payment.party.trim().toLowerCase());
    if (!buyer) {
      issues.push(`payments ${payment.id} party "${payment.party}" does not match a buyer`);
      return;
    }
    payment.partyId = buyer.id;
    payment.party = buyer.name;
    return;
  }
  const supplierId = payment.partyId?.startsWith("supplier-") ? payment.partyId : supplierIdFromName(payment.party);
  payment.partyId = supplierId;
}

export function repairErpData(input: ErpData, options?: { strict?: boolean }): ErpData {
  const data = clone(input);
  const issues: string[] = [];

  data.buyers ??= [];
  data.orders ??= [];
  for (const key of ORDER_CHILDREN) data[key] ??= [];
  data.stockLedger ??= [];
  data.defects ??= [];
  data.buyerLedger ??= [];
  data.supplierLedger ??= [];
  data.expenses ??= [];
  data.payments ??= [];
  data.employees ??= [];
  data.attendance ??= [];
  data.payroll ??= [];
  data.roles ??= [];
  data.quotations ??= [];
  data.confirmOrders ??= [];
  data.orderStatuses ??= [];
  data.accRmBookings ??= [];
  data.fabricBookings ??= [];
  data.accessoriesBookings ??= [];
  data.piRegisters ??= [];
  data.accEstimations ??= [];

  const buyersById = new Map(data.buyers.map((buyer) => [buyer.id, buyer]));
  const buyersByName = new Map(data.buyers.map((buyer) => [buyer.name.trim().toLowerCase(), buyer]));

  for (const order of data.orders) {
    let buyer = buyersById.get(order.buyerId);
    if (!buyer) buyer = buyersByName.get(order.buyerName?.trim().toLowerCase() ?? "");
    if (!buyer && (order.buyerName?.trim() || order.buyerId)) {
      const buyerName = order.buyerName?.trim() || "Default Buyer";
      const newBuyer: Buyer = {
        id: order.buyerId && order.buyerId.startsWith("buyer-") ? order.buyerId : `buyer-${buyerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown"}`,
        name: buyerName,
        contactPerson: "",
        company: buyerName,
        country: "Bangladesh",
        phone: "",
        email: "",
        address: "",
        status: "Active",
        totalOrders: 0,
        totalAmount: 0,
        paidAmount: 0,
        dueAmount: 0,
        createdAt: new Date().toISOString(),
      };
      data.buyers.push(newBuyer);
      buyersById.set(newBuyer.id, newBuyer);
      buyersByName.set(newBuyer.name.trim().toLowerCase(), newBuyer);
      buyer = newBuyer;
    }
    if (!buyer && data.buyers.length > 0) {
      buyer = data.buyers[0];
    }
    if (!buyer) {
      issues.push(`orders ${order.id} buyerId ${order.buyerId} has no buyer`);
      continue;
    }
    order.buyerId = buyer.id;
    order.buyerName = buyer.name;
    order.orderValue = money(Number(order.quantity) * Number(order.unitPrice));
  }

  const ordersById = new Map(data.orders.map((order) => [order.id, order]));

  for (const key of ORDER_CHILDREN) {
    const rows = data[key] as unknown as Array<Record<string, unknown> & { id: string; orderId?: string }>;
    const kept = rows.filter((row) => {
      const order = row.orderId ? ordersById.get(row.orderId) : undefined;
      if (!order) {
        issues.push(`${key} ${row.id} orderId ${row.orderId || "(empty)"} has no order`);
        return false;
      }
      syncOrderFields(row, order);
      return true;
    });
    (data as unknown as Record<string, unknown>)[key] = kept;
  }

  for (const row of data.procurements) {
    row.supplierId = row.supplierId || supplierIdFromName(row.supplier);
    row.balance = money(Math.max(Number(row.required) - Number(row.received), 0));
  }

  for (const row of data.inventory) {
    row.balance = money(Math.max(Number(row.received) - Number(row.issued), 0));
  }

  linkStockLedger(data.stockLedger, data.procurements, data.inventory, issues);
  data.stockLedger = data.stockLedger.filter((row) => {
    if (!row.inventoryItemId || !ordersById.has(row.orderId ?? "")) return false;
    const order = ordersById.get(row.orderId as string);
    if (order) row.orderId = order.id;
    return true;
  });

  for (const row of data.pnl) {
    const profitFromMargin = money(Number(row.orderValue) * (Number(row.marginPercent) / 100));
    const profitFromCost = money(Number(row.orderValue) - Number(row.totalCost));
    if (Math.abs(profitFromCost - Number(row.profit)) > 0.02 && Math.abs(profitFromMargin - Number(row.profit)) <= 0.02) {
      row.totalCost = money(Number(row.orderValue) - Number(row.profit));
    } else {
      row.profit = profitFromCost;
      row.marginPercent = row.orderValue ? money((row.profit / row.orderValue) * 100) : 0;
    }
  }

  linkDefects(data.defects, data.qcRecords);

  const ordersByBuyer = new Map<string, Order[]>();
  for (const order of data.orders) {
    const list = ordersByBuyer.get(order.buyerId) ?? [];
    list.push(order);
    ordersByBuyer.set(order.buyerId, list);
  }
  for (const buyer of data.buyers) {
    const list = ordersByBuyer.get(buyer.id) ?? [];
    buyer.totalOrders = list.length;
    buyer.totalAmount = money(list.reduce((sum, order) => sum + order.orderValue, 0));
  }

  data.buyerLedger = data.buyerLedger.filter((row) => {
    const buyer = buyersById.get(row.buyerId) ?? buyersByName.get(row.buyerName.trim().toLowerCase());
    if (!buyer) {
      issues.push(`buyerLedger ${row.id} buyerId ${row.buyerId} has no buyer`);
      return false;
    }
    row.buyerId = buyer.id;
    row.buyerName = buyer.name;
    row.dueValue = money(Math.max(Number(row.invoiceValue) - Number(row.receivedValue), 0));
    row.status = ledgerStatus(row.dueValue, Number(row.receivedValue));
    return true;
  });

  const supplierNames = new Set<string>();
  for (const row of data.procurements) supplierNames.add(row.supplier);
  for (const row of data.supplierLedger) supplierNames.add(row.supplierName);

  data.supplierLedger = data.supplierLedger.filter((row: SupplierLedgerEntry) => {
    if (!row.supplierName?.trim()) {
      issues.push(`supplierLedger ${row.id} has no supplier name`);
      return false;
    }
    row.supplierId = supplierIdFromName(row.supplierName);
    row.dueValue = money(Math.max(Number(row.purchaseValue) - Number(row.paidValue), 0));
    row.status = ledgerStatus(row.dueValue, Number(row.paidValue));
    return true;
  });

  for (const row of data.procurements) {
    if (!supplierNames.has(row.supplier)) supplierNames.add(row.supplier);
    row.supplierId = supplierIdFromName(row.supplier);
  }

  for (const payment of data.payments) linkParty(payment, data.buyers, issues);

  const employeesById = new Map(data.employees.map((employee) => [employee.id, employee]));
  data.attendance = data.attendance.filter((row) => {
    const employee = employeesById.get(row.empId);
    if (!employee) {
      issues.push(`attendance ${row.id} empId ${row.empId} has no employee`);
      return false;
    }
    row.name = employee.name;
    return true;
  });
  data.payroll = data.payroll.filter((row) => {
    const employee = employeesById.get(row.empId);
    if (!employee) {
      issues.push(`payroll ${row.id} empId ${row.empId} has no employee`);
      return false;
    }
    row.name = employee.name;
    row.department = employee.department;
    return true;
  });

  if (options?.strict && issues.length) throw new RelationError(issues);
  return data;
}
