import type { Document } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { buildSeedData } from "@/lib/seed-data";
import type { ErpData, Order, Sample } from "@/lib/types";
import {
  commercialBuyerToCanonical,
  defaultCommercialCostings,
  linkCommercialCosting,
  linkCommercialMerch,
  mergeCommercialOrder,
  commercialCostingFromFactory,
  coverMerch,
  sampleToMerch,
  toCommercialBuyer,
  toCommercialOrder,
  toCommercialTask,
  type CommercialBuyer,
  type CommercialCosting,
  type CommercialMerch,
  type CommercialOrder,
} from "@/lib/db/commercialView";
import { buildLinkedRegisters, costingByOrder, isPlaceholderOrder, syncQuotationsToOrders } from "@/lib/db/complete";
import { repairErpData } from "@/lib/db/repair";

const ARRAY_KEYS = [
  ["buyers", "buyers"],
  ["orders", "orders"],
  ["taTasks", "ta_tasks"],
  ["samples", "samples"],
  ["costings", "costings"],
  ["procurements", "procurements"],
  ["inventory", "inventory_items"],
  ["stockLedger", "stock_ledger"],
  ["cuttingJobs", "cutting_jobs"],
  ["sewingLines", "sewing_lines"],
  ["finishingJobs", "finishing_jobs"],
  ["packingJobs", "packing_jobs"],
  ["qcRecords", "qc_records"],
  ["defects", "defects"],
  ["shipments", "shipments"],
  ["buyerLedger", "buyer_ledger"],
  ["supplierLedger", "supplier_ledger"],
  ["expenses", "expenses"],
  ["payments", "payments"],
  ["pnl", "pnl_entries"],
  ["employees", "employees"],
  ["attendance", "attendance_logs"],
  ["payroll", "payroll_records"],
  ["roles", "app_roles"],
  ["quotations", "quotations"],
  ["confirmOrders", "confirm_orders"],
  ["orderStatuses", "order_statuses"],
  ["accRmBookings", "acc_rm_bookings"],
  ["fabricBookings", "fabric_bookings"],
  ["accessoriesBookings", "accessories_bookings"],
  ["piRegisters", "pi_registers"],
  ["accEstimations", "acc_estimations"],
] as const;

let readyPromise: Promise<void> | null = null;

async function database() {
  const mongoose = await connectToDatabase();
  if (!mongoose.connection.db) throw new Error("MongoDB connection is not ready.");
  return mongoose.connection.db;
}

const ROW_COLLECTION = "erp_data";

function stripDoc<T>(doc: Document): T {
  const { _id: _ignored, table: _table, ...rest } = doc;
  return rest as T;
}

async function rowCollection() {
  const db = await database();
  return db.collection(ROW_COLLECTION);
}

const SNAPSHOT_TABLES = [
  ...ARRAY_KEYS.map(([, table]) => table),
  "settings",
  "merch_items",
  "commercial_costings",
];

let snapshotFlight: Promise<Map<string, Document[]>> | null = null;

async function queryTables(): Promise<Map<string, Document[]>> {
  const collection = await rowCollection();
  const docs = await collection
    .find({ table: { $in: SNAPSHOT_TABLES } })
    .project({ _id: 0 })
    .toArray();
  const grouped = new Map<string, Document[]>();
  for (const doc of docs) {
    const table = String(doc.table ?? "");
    if (!table || table === "_schema") continue;
    const bucket = grouped.get(table);
    if (bucket) bucket.push(doc);
    else grouped.set(table, [doc]);
  }
  return grouped;
}

function readSnapshot(fresh = false) {
  if (!fresh && snapshotFlight) return snapshotFlight;
  const run = queryTables().finally(() => {
    if (snapshotFlight === run) snapshotFlight = null;
  });
  if (!fresh) snapshotFlight = run;
  return run;
}

function dropSnapshot() {
  snapshotFlight = null;
}

function rowsFrom<T>(grouped: Map<string, Document[]>, table: string): T[] {
  return (grouped.get(table) ?? []).map((doc) => stripDoc<T>(doc));
}

function materialize(grouped: Map<string, Document[]>): ErpData {
  const settingsDoc = grouped.get("settings")?.[0];
  const settings = settingsDoc
    ? stripDoc<ErpData["settings"]>(settingsDoc)
    : buildSeedData().settings;
  if (settingsDoc) delete (settings as { id?: string }).id;
  const data = { settings } as ErpData;
  for (const [key, table] of ARRAY_KEYS) {
    (data as unknown as Record<string, unknown>)[key] = rowsFrom(grouped, table);
  }
  return data;
}

function dedupeRows<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of rows) {
    if (!row?.id) continue;
    map.set(String(row.id), row);
  }
  return [...map.values()];
}

async function replaceArray(table: string, rows: Array<{ id: string }>) {
  dropSnapshot();
  const collection = await rowCollection();
  const unique = dedupeRows(rows);
  const ids = unique.map((row) => row.id);
  if (unique.length) {
    await collection.bulkWrite(
      unique.map((row) => {
        const copy = { ...row } as Record<string, unknown>;
        delete copy._id;
        copy.table = table;
        copy.id = row.id;
        return {
          updateOne: {
            filter: { table, id: row.id },
            update: { $set: copy },
            upsert: true,
          },
        };
      }),
      { ordered: false }
    );
  }
  await collection.deleteMany(ids.length ? { table, id: { $nin: ids } } : { table });
}

async function writeSettings(settings: ErpData["settings"]) {
  dropSnapshot();
  const collection = await rowCollection();
  await collection.deleteMany({ table: "settings" });
  await collection.insertOne({ table: "settings", id: "company", ...settings });
}

export async function loadErp(): Promise<ErpData> {
  return materialize(await readSnapshot());
}

async function loadErpFresh(): Promise<ErpData> {
  return materialize(await readSnapshot(true));
}

async function writeErp(data: ErpData) {
  for (const [key, collection] of ARRAY_KEYS) {
    await replaceArray(collection, data[key] as Array<{ id: string }>);
  }
  await writeSettings(data.settings);
}

export async function saveErp(input: ErpData) {
  const data = repairErpData(input, { strict: true });
  await writeErp(data);
  await markReady();
  return data;
}

function unionById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map(existing.map((row) => [row.id, row]));
  for (const row of incoming) map.set(row.id, row);
  return [...map.values()];
}

const MERCH_REPLACE_KEYS = new Set<string>([
  "quotations",
  "confirmOrders",
  "orderStatuses",
  "accRmBookings",
  "fabricBookings",
  "accessoriesBookings",
  "piRegisters",
  "accEstimations",
]);

export async function saveSlice(partial: Partial<ErpData>) {
  const current = await loadErpFresh();
  const next: ErpData = { ...current };
  const dirty = new Set<string>();
  for (const [key] of ARRAY_KEYS) {
    const incoming = partial[key];
    if (!Array.isArray(incoming)) continue;
    const rows = incoming as Array<{ id: string }>;
    (next as unknown as Record<string, unknown>)[key] = MERCH_REPLACE_KEYS.has(key)
      ? dedupeRows(rows)
      : unionById(current[key] as Array<{ id: string }>, rows);
    dirty.add(key);
  }
  if (partial.settings) next.settings = { ...current.settings, ...partial.settings };
  if (dirty.has("quotations")) {
    const syncRes = syncQuotationsToOrders(next);
    if (syncRes.ordersChanged) {
      next.orders = syncRes.orders;
      dirty.add("orders");
    }
    if (syncRes.confirmOrdersChanged) {
      next.confirmOrders = syncRes.confirmOrders;
      dirty.add("confirmOrders");
    }
    if (syncRes.orderStatusesChanged) {
      next.orderStatuses = syncRes.orderStatuses;
      dirty.add("orderStatuses");
    }
  }
  const data = repairErpData(next, { strict: true });
  for (const [key, collection] of ARRAY_KEYS) {
    if (!dirty.has(key)) continue;
    await replaceArray(collection, data[key] as Array<{ id: string }>);
  }
  if (partial.settings) await writeSettings(data.settings);
  await markReady();
  return data;
}

async function readCommercialExtras() {
  const grouped = await readSnapshot();
  return {
    merchItems: rowsFrom<CommercialMerch>(grouped, "merch_items"),
    costings: rowsFrom<CommercialCosting>(grouped, "commercial_costings"),
  };
}

export async function loadCommercialView() {
  const data = await loadErp();
  const extras = await readCommercialExtras();
  const merchItems = coverMerch(data.orders, data.samples, extras.merchItems);
  const costings = extras.costings.length ? extras.costings : defaultCommercialCostings(data.orders);
  return {
    buyers: data.buyers.map(toCommercialBuyer),
    orders: data.orders.map(toCommercialOrder),
    taTasks: data.taTasks.map(toCommercialTask),
    merchItems,
    costings,
  };
}

export async function saveCommercial(payload: {
  buyers?: CommercialBuyer[];
  orders?: CommercialOrder[];
  merchItems?: CommercialMerch[];
  costings?: CommercialCosting[];
}) {
  const current = await loadErpFresh();
  const buyers = current.buyers.map((buyer) => ({ ...buyer }));
  const buyersById = new Map(buyers.map((buyer) => [buyer.id, buyer]));
  const buyersByName = new Map(buyers.map((buyer) => [buyer.name.trim().toLowerCase(), buyer]));
  const buyerRemap = new Map<string, string>();

  for (const incoming of payload.buyers ?? []) {
    const existing = buyersById.get(incoming.id) ?? buyersByName.get(incoming.name.trim().toLowerCase());
    if (existing) {
      buyerRemap.set(incoming.id, existing.id);
      existing.name = incoming.name;
      existing.company = incoming.company;
      existing.phone = incoming.phone;
      existing.email = incoming.email;
      existing.address = incoming.address;
      buyersByName.set(existing.name.trim().toLowerCase(), existing);
    } else {
      const created = commercialBuyerToCanonical(incoming);
      buyerRemap.set(incoming.id, created.id);
      buyers.push(created);
      buyersById.set(created.id, created);
      buyersByName.set(created.name.trim().toLowerCase(), created);
    }
  }

  const orders = current.orders.map((order) => ({ ...order }));
  const ordersById = new Map(orders.map((order) => [order.id, order]));
  const ordersByPo = new Map(orders.map((order) => [order.poNumber, order]));
  const orderRemap = new Map<string, string>();

  for (const incoming of payload.orders ?? []) {
    const buyerId = buyerRemap.get(incoming.buyerId) ?? incoming.buyerId;
    const buyer = buyersById.get(buyerId);
    const existing = ordersById.get(incoming.id) ?? ordersByPo.get(incoming.po);
    const merged = mergeCommercialOrder(existing, { ...incoming, buyerId: buyer?.id ?? buyerId }, buyer?.name ?? incoming.buyer);
    if (existing) {
      orderRemap.set(incoming.id, existing.id);
      Object.assign(existing, merged, { id: existing.id });
    } else {
      orderRemap.set(incoming.id, merged.id);
      orders.push(merged);
      ordersById.set(merged.id, merged);
      ordersByPo.set(merged.poNumber, merged);
    }
  }

  const saved = await saveErp({ ...current, buyers, orders });
  const extras = await readCommercialExtras();

  const merchItems = unionById(
    extras.merchItems,
    (payload.merchItems ?? []).flatMap((row) => {
      const linked = linkCommercialMerch(row, saved.orders, orderRemap);
      return linked ? [linked] : [];
    })
  );
  const costings = unionById(
    extras.costings,
    (payload.costings ?? []).flatMap((row) => {
      const linked = linkCommercialCosting({ ...row, orderId: orderRemap.get(row.orderId) ?? row.orderId }, saved.orders);
      return linked ? [linked] : [];
    })
  );

  await replaceArray("merch_items", merchItems);
  await replaceArray("commercial_costings", costings);
  return loadCommercialView();
}

const LEGACY_BLOB = { key: { $exists: true }, table: { $exists: false } };
const SCHEMA_VERSION = 2;

const ORDER_LINKED = [
  "taTasks",
  "samples",
  "costings",
  "procurements",
  "inventory",
  "stockLedger",
  "cuttingJobs",
  "sewingLines",
  "finishingJobs",
  "packingJobs",
  "qcRecords",
  "shipments",
  "pnl",
  "quotations",
  "confirmOrders",
  "orderStatuses",
  "accRmBookings",
  "fabricBookings",
  "accessoriesBookings",
  "piRegisters",
  "accEstimations",
] as const;

async function markReady() {
  const collection = await rowCollection();
  const updatedAt = new Date();
  await collection.updateOne(
    { table: "_schema", id: "erp" },
    { $set: { table: "_schema", id: "erp", version: SCHEMA_VERSION, updatedAt } },
    { upsert: true }
  );
  return updatedAt;
}

async function ensureIndexes() {
  const collection = await rowCollection();
  try {
    await collection.createIndex(
      { table: 1, id: 1 },
      { unique: true, partialFilterExpression: { table: { $type: "string" }, id: { $type: "string" } } }
    );
    for (const field of ["orderId", "buyerId", "empId", "inventoryItemId", "partyId", "supplierId", "procurementId"]) {
      await collection.createIndex({ table: 1, [field]: 1 });
    }
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 8000) throw error;
  }
}

async function dropEmptyExtras() {
  const db = await database();
  const extras = [
    ...ARRAY_KEYS.map(([, name]) => name),
    "merch_items",
    "commercial_costings",
    "app_settings",
    "app_roles",
    "_schema",
    "supplierledgers",
    "pnls",
    "settings",
  ];
  for (const name of extras) {
    if (name === ROW_COLLECTION) continue;
    const exists = await db.listCollections({ name }).hasNext();
    if (!exists) continue;
    const count = await db.collection(name).countDocuments();
    if (count === 0) await db.collection(name).drop().catch(() => undefined);
  }
  const roles = db.collection("roles");
  if (await db.listCollections({ name: "roles" }).hasNext()) {
    const roleIds = await roles.distinct("roleId");
    if (roleIds.length && roleIds.every((id) => typeof id === "string" && /^role-\d+$/.test(id))) {
      await roles.drop().catch(() => undefined);
    }
  }
}

function latestDoc(docs: Document[]): Document | undefined {
  return [...docs].sort((a, b) => new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime()).at(-1);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function rowsOf<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

async function migrateFromBlob() {
  const db = await database();
  const docs = await db.collection("erp_data").find(LEGACY_BLOB).toArray();
  const mains = docs.filter((doc) => doc.key === "main");
  const main = latestDoc(mains);
  const base = (main?.data as ErpData | undefined) ?? buildSeedData();

  const merged: ErpData = { ...buildSeedData(), ...base };
  for (const key of ["procurement", "inventory", "production"] as const) {
    const doc = docs.find((entry) => entry.key === key);
    const data = asRecord(doc?.data);
    if (key === "procurement") merged.procurements = unionById(merged.procurements, rowsOf(data.procurements));
    if (key === "inventory") {
      merged.inventory = unionById(merged.inventory, rowsOf(data.inventory));
      merged.stockLedger = unionById(merged.stockLedger, rowsOf(data.stockLedger));
    }
    if (key === "production") {
      merged.cuttingJobs = unionById(merged.cuttingJobs, rowsOf(data.cuttingJobs));
      merged.sewingLines = unionById(merged.sewingLines, rowsOf(data.sewingLines));
      merged.finishingJobs = unionById(merged.finishingJobs, rowsOf(data.finishingJobs));
      merged.packingJobs = unionById(merged.packingJobs, rowsOf(data.packingJobs));
    }
  }

  const commercial = asRecord(docs.find((doc) => doc.key === "commercial")?.data);
  const commercialBuyers = rowsOf<CommercialBuyer>(commercial.buyers);
  const commercialOrders = rowsOf<CommercialOrder>(commercial.orders);
  const savedPreview = repairErpData(merged);
  const buyers = savedPreview.buyers.map((buyer) => ({ ...buyer }));
  const buyersByName = new Map(buyers.map((buyer) => [buyer.name.trim().toLowerCase(), buyer]));
  const buyerRemap = new Map<string, string>();
  for (const incoming of commercialBuyers) {
    const existing = buyersByName.get(incoming.name.trim().toLowerCase());
    if (existing) {
      buyerRemap.set(incoming.id, existing.id);
      existing.company = incoming.company || existing.company;
      existing.phone = incoming.phone || existing.phone;
      existing.email = incoming.email || existing.email;
      existing.address = incoming.address || existing.address;
    } else {
      const created = commercialBuyerToCanonical(incoming);
      buyerRemap.set(incoming.id, created.id);
      buyers.push(created);
      buyersByName.set(created.name.trim().toLowerCase(), created);
    }
  }

  const orders: Order[] = savedPreview.orders.map((order) => ({ ...order }));
  const ordersByPo = new Map(orders.map((order) => [order.poNumber, order]));
  const orderRemap = new Map<string, string>();
  for (const incoming of commercialOrders) {
    const buyerId = buyerRemap.get(incoming.buyerId) ?? incoming.buyerId;
    const buyer = buyers.find((entry) => entry.id === buyerId);
    const existing = ordersByPo.get(incoming.po);
    if (existing) {
      orderRemap.set(incoming.id, existing.id);
      Object.assign(
        existing,
        mergeCommercialOrder(existing, { ...incoming, buyerId: buyer?.id ?? existing.buyerId }, buyer?.name ?? existing.buyerName),
        { id: existing.id }
      );
    } else if (buyer) {
      const created = mergeCommercialOrder(undefined, { ...incoming, buyerId: buyer.id }, buyer.name);
      orderRemap.set(incoming.id, created.id);
      orders.push(created);
      ordersByPo.set(created.poNumber, created);
    }
  }

  const repaired = repairErpData({ ...savedPreview, buyers, orders });
  await writeErp(repaired);

  const merchFromSamples = repaired.samples.map(sampleToMerch);
  const merchFromCommercial = rowsOf<CommercialMerch>(commercial.merchItems).flatMap((row) => {
    const linked = linkCommercialMerch(row, repaired.orders, orderRemap);
    return linked ? [linked] : [];
  });
  const costingsFromCommercial = rowsOf<CommercialCosting>(commercial.costings).flatMap((row) => {
    const linked = linkCommercialCosting(row, repaired.orders);
    return linked ? [linked] : [];
  });
  await replaceArray("merch_items", unionById(merchFromSamples, merchFromCommercial));
  await replaceArray(
    "commercial_costings",
    costingsFromCommercial.length ? costingsFromCommercial : defaultCommercialCostings(repaired.orders)
  );

  await db.collection("erp_data").deleteMany(LEGACY_BLOB);
}

async function seedFresh() {
  const data = buildSeedData();
  await writeErp(data);
  await replaceArray("merch_items", data.samples.map((sample: Sample) => sampleToMerch(sample)));
  await replaceArray("commercial_costings", defaultCommercialCostings(data.orders));
}

async function completeDataset() {
  const collection = await rowCollection();
  await collection.deleteMany(LEGACY_BLOB);
  const current = await loadErpFresh();
  const removedOrderIds = new Set(current.orders.filter(isPlaceholderOrder).map((order) => order.id));
  const orders = current.orders.filter((order) => !removedOrderIds.has(order.id));
  const liveBuyerIds = new Set(orders.map((order) => order.buyerId));
  const buyers = current.buyers.filter((buyer) => liveBuyerIds.has(buyer.id));
  const removedBuyerIds = new Set(current.buyers.filter((buyer) => !liveBuyerIds.has(buyer.id)).map((buyer) => buyer.id));

  const next = { ...current, buyers, orders };
  for (const key of ORDER_LINKED) {
    const rows = current[key] as Array<{ orderId?: string }>;
    (next as unknown as Record<string, unknown>)[key] = rows.filter((row) => !row.orderId || !removedOrderIds.has(row.orderId));
  }
  next.buyerLedger = current.buyerLedger.filter((row) => !removedBuyerIds.has(row.buyerId));
  next.payments = current.payments.filter((row) => !row.partyId || !removedBuyerIds.has(row.partyId));

  const repaired = repairErpData(next);
  for (const buyer of repaired.buyers) {
    if (repaired.buyerLedger.some((row) => row.buyerId === buyer.id)) continue;
    const due = Math.max(buyer.dueAmount, 0);
    repaired.buyerLedger.push({
      id: `bl-${buyer.id}`,
      buyerId: buyer.id,
      buyerName: buyer.name,
      orderValue: buyer.totalAmount,
      invoiceValue: buyer.totalAmount,
      receivedValue: buyer.paidAmount,
      dueValue: due,
      status: due <= 0 ? "paid" : buyer.paidAmount > 0 ? "partial" : "unpaid",
    });
  }

  const links = buildLinkedRegisters(repaired.orders, repaired.procurements);
  if (!repaired.quotations.length) repaired.quotations = links.quotations;
  if (!repaired.confirmOrders.length) repaired.confirmOrders = links.confirmOrders;
  if (!repaired.orderStatuses.length) repaired.orderStatuses = links.orderStatuses;
  if (!repaired.fabricBookings.length) repaired.fabricBookings = links.fabricBookings;
  if (!repaired.accessoriesBookings.length) repaired.accessoriesBookings = links.accessoriesBookings;
  if (!repaired.piRegisters.length) repaired.piRegisters = links.piRegisters;
  if (!repaired.accEstimations.length) repaired.accEstimations = links.accEstimations;
  if (!repaired.accRmBookings.length) repaired.accRmBookings = links.accRmBookings;

  await writeErp(repaired);

  const extras = await readCommercialExtras();
  const liveOrderIds = new Set(repaired.orders.map((order) => order.id));
  const costings = extras.costings.filter((row) => liveOrderIds.has(row.orderId));
  for (const order of repaired.orders) {
    if (costings.some((row) => row.orderId === order.id)) continue;
    costings.push(commercialCostingFromFactory(order, costingByOrder(repaired.costings, order.id)));
  }
  const merchItems = coverMerch(
    repaired.orders,
    repaired.samples,
    extras.merchItems.filter((row) => liveOrderIds.has(row.orderId))
  );
  await replaceArray("merch_items", merchItems);
  await replaceArray("commercial_costings", costings);
}

async function doEnsure() {
  const collection = await rowCollection();
  const meta = await collection.findOne({ table: "_schema", id: "erp" }, { projection: { version: 1 } });
  const version = Number(meta?.version ?? 0);
  if (version >= SCHEMA_VERSION) return;
  await dropEmptyExtras();
  await ensureIndexes();
  if (version >= 1) await collection.deleteMany(LEGACY_BLOB);
  if (version < 1) {
    const legacyCount = await collection.countDocuments(LEGACY_BLOB);
    const orderCount = await collection.countDocuments({ table: "orders" });
    if (legacyCount > 0) await migrateFromBlob();
    else if (orderCount === 0) await seedFresh();
  }
  if (version < SCHEMA_VERSION) await completeDataset();
  await collection.deleteMany(LEGACY_BLOB);
  if (version < SCHEMA_VERSION) await markReady();
}

export function ensureReady() {
  if (!readyPromise) {
    readyPromise = doEnsure().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

export async function reseedFromSeed() {
  await ensureIndexes();
  const collection = await rowCollection();
  await collection.deleteMany(LEGACY_BLOB);
  await seedFresh();
  await completeDataset();
  await markReady();
  return loadErpFresh();
}

export async function touchUpdatedAt(): Promise<Date> {
  return markReady();
}
