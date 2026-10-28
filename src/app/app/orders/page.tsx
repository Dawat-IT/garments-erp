"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  DollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  Package,
  Pencil,
  Plus,
  Search,
  TriangleAlert,
  Activity,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Label,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  paymentStatusTone,
  taStatusTone,
} from "@/components/commercial/ui";
import {
  Order,
  OrderStage,
  PaymentStatus,
  TaStatus,
  orderValue,
  useCommercialData,
} from "@/hooks/useCommercialData";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { formatDate, formatMoney, formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";

const STAGES: OrderStage[] = ["Merchandising", "Cutting", "Sewing", "Finishing", "Packing", "Shipped"];
const TA_STATUSES: TaStatus[] = ["On Track", "At Risk", "Delayed"];
const PAYMENT_STATUSES: PaymentStatus[] = ["paid", "partial", "due"];

const stageProgressDefaults: Record<OrderStage, number> = {
  Merchandising: 10,
  Cutting: 25,
  Sewing: 55,
  Finishing: 75,
  Packing: 90,
  Shipped: 100,
};

type OrderFormState = {
  buyerId: string;
  po: string;
  style: string;
  product: string;
  color: string;
  qty: string;
  unitPrice: string;
  shipDate: string;
  stage: OrderStage;
};

const emptyForm: OrderFormState = {
  buyerId: "",
  po: "",
  style: "",
  product: "",
  color: "",
  qty: "",
  unitPrice: "",
  shipDate: "",
  stage: "Merchandising",
};

export default function OrdersPage() {
  const { buyers, orders, addOrder, updateOrder, refresh } = useCommercialData();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const [search, setSearch] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [view360Order, setView360Order] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderFormState>(emptyForm);
  const [updateForm, setUpdateForm] = useState({
    stage: "Merchandising" as OrderStage,
    progress: 0,
    taStatus: "On Track" as TaStatus,
    paymentStatus: "due" as PaymentStatus,
    shipDate: "",
  });

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.po.toLowerCase().includes(q) ||
        o.buyer.toLowerCase().includes(q) ||
        o.style.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q);
      const matchesBuyer = buyerFilter === "all" || o.buyerId === buyerFilter;
      return matchesSearch && matchesBuyer;
    });
  }, [orders, search, buyerFilter]);

  const totalValue = orders.reduce((s, o) => s + orderValue(o), 0);
  const totalQty = orders.reduce((s, o) => s + o.qty, 0);
  const delayedCount = orders.filter((o) => o.taStatus === "Delayed").length;

  function openAdd() {
    setForm(emptyForm);
    setAddOpen(true);
  }

  function openView(order: Order) {
    setViewOrder(order);
  }

  function openEdit(order: Order) {
    setUpdateForm({
      stage: order.stage,
      progress: order.progress,
      taStatus: order.taStatus,
      paymentStatus: order.paymentStatus,
      shipDate: order.shipDate,
    });
    setEditOrder(order);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const buyer = buyers.find((b) => b.id === form.buyerId);
    if (!buyer) return;
    addOrder({
      buyerId: buyer.id,
      buyer: buyer.name,
      po: form.po,
      style: form.style,
      product: form.product,
      color: form.color,
      qty: Number(form.qty) || 0,
      unitPrice: Number(form.unitPrice) || 0,
      shipDate: form.shipDate,
      stage: form.stage,
      progress: stageProgressDefaults[form.stage],
      taStatus: "On Track",
      paymentStatus: "due",
    });
    setAddOpen(false);
  }

  function handleUpdateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editOrder) return;
    updateOrder(editOrder.id, { ...updateForm });
    setEditOrder(null);
  }

  const exportColumns = [
    { header: "Buyer", key: "buyer" },
    { header: "PO", key: "po" },
    { header: "Style", key: "style" },
    { header: "Product", key: "product" },
    { header: "Color", key: "color" },
    { header: "Qty", key: "qty" },
    { header: "Unit Price", key: "unitPrice" },
    { header: "Value", key: "value" },
    { header: "Ship Date", key: "shipDate" },
    { header: "Stage", key: "stage" },
    { header: "Progress", key: "progress" },
    { header: "T&A Status", key: "taStatus" },
    { header: "Payment", key: "paymentStatus" },
  ];

  function exportRows() {
    return filteredOrders.map((o) => ({
      buyer: o.buyer,
      po: o.po,
      style: o.style,
      product: o.product,
      color: o.color,
      qty: formatNumber(o.qty),
      unitPrice: formatMoney(o.unitPrice),
      value: formatMoney(orderValue(o)),
      shipDate: formatDate(o.shipDate),
      stage: o.stage,
      progress: `${o.progress}%`,
      taStatus: o.taStatus,
      paymentStatus: o.paymentStatus,
    }));
  }

  async function handleExportPdf() {
    await exportToPDF({
      title: "Style / PO Orders",
      subtitle: bn.orders.subtitle,
      columns: exportColumns,
      data: exportRows(),
      filename: "style-po-orders",
    });
  }

  async function handleExportExcel() {
    await exportToExcel({ columns: exportColumns, data: exportRows(), filename: "style-po-orders", sheetName: "Orders" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{bn.orders.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{bn.orders.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            {bn.exportExcel}
          </Button>
          <Button variant="secondary" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            {bn.exportPdf}
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {bn.orders.newOrder}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile icon={<Package className="h-5 w-5" />} label="Total orders" value={formatNumber(orders.length)} tone="teal" />
        <KpiTile icon={<Boxes className="h-5 w-5" />} label="Total quantity" value={`${formatNumber(totalQty)} pcs`} tone="blue" />
        <KpiTile icon={<DollarSign className="h-5 w-5" />} label="Total value" value={formatMoney(totalValue)} tone="green" />
        <KpiTile icon={<TriangleAlert className="h-5 w-5" />} label="Delayed orders" value={formatNumber(delayedCount)} tone="red" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-sm flex-1">
            <Label className="sr-only">{bn.orders.searchOrder}</Label>
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder={bn.orders.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select value={buyerFilter} onChange={(e) => setBuyerFilter(e.target.value)}>
              <option value="all">{bn.all} — {bn.orders.selectBuyer}</option>
              {buyers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
          <p className="ml-auto text-xs text-slate-400">
            {bn.totalRecords}: {filteredOrders.length}
          </p>
        </CardContent>
      </Card>

      <Card>
        {filteredOrders.length === 0 ? (
          <EmptyState message={bn.noData} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Info</TableHead>
                <TableHead>Product Details</TableHead>
                <TableHead>Value &amp; Shipment</TableHead>
                <TableHead>Stage &amp; Progress</TableHead>
                <TableHead>T&amp;A &amp; Payment</TableHead>
                <TableHead className="text-right">{bn.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-800">{order.buyer}</p>
                    <p className="text-xs text-slate-500">PO: {order.po}</p>
                    <p className="text-xs text-slate-400">Style: {order.style}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-700">{order.product}</p>
                    <p className="text-xs text-slate-400">
                      {order.color} · {formatNumber(order.qty)} pcs
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-slate-800">{formatMoney(orderValue(order))}</p>
                    <p className="text-xs text-slate-400">
                      {formatMoney(order.unitPrice)}/pc · Ship: {formatDate(order.shipDate)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-700">{order.stage}</p>
                    <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${Math.min(order.progress, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{order.progress}% complete</p>
                  </TableCell>
                  <TableCell>
                    <Badge tone={taStatusTone(order.taStatus)}>{order.taStatus}</Badge>
                    <div className="mt-1.5">
                      <Badge tone={paymentStatusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => setView360Order(order)} title="Order 360 View">
                        <Activity className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline ml-1">360°</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openView(order)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(order)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add order modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={bn.orders.newOrder} size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>{bn.orders.selectBuyer}</Label>
              <Select required value={form.buyerId} onChange={(e) => setForm({ ...form, buyerId: e.target.value })}>
                <option value="">— {bn.orders.selectBuyer} —</option>
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label required>{bn.orders.po}</Label>
              <Input required value={form.po} onChange={(e) => setForm({ ...form, po: e.target.value })} placeholder="HM-2026-0200" />
            </div>
            <div>
              <Label required>{bn.orders.style}</Label>
              <Input required value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} placeholder="STY-2026010" />
            </div>
            <div>
              <Label required>{bn.orders.product}</Label>
              <Input required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Men's Basic T-Shirt" />
            </div>
            <div>
              <Label required>{bn.orders.color}</Label>
              <Input required value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Navy" />
            </div>
            <div>
              <Label required>{bn.orders.qty}</Label>
              <Input required type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="48000" />
            </div>
            <div>
              <Label required>{bn.orders.unitPrice}</Label>
              <Input
                required
                type="number"
                min={0}
                step="0.01"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                placeholder="3.85"
              />
            </div>
            <div>
              <Label required>{bn.orders.shipDate}</Label>
              <Input required type="date" value={form.shipDate} onChange={(e) => setForm({ ...form, shipDate: e.target.value })} />
            </div>
            <div>
              <Label required>{bn.orders.stage}</Label>
              <Select required value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as OrderStage })}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>
              {bn.cancel}
            </Button>
            <Button type="submit">{bn.save}</Button>
          </div>
        </form>
      </Modal>

      {/* View order modal */}
      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={viewOrder ? `${viewOrder.buyer} — ${viewOrder.po}` : ""}
        description={viewOrder?.style}
        size="lg"
      >
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <ViewField label={bn.orders.product} value={viewOrder.product} />
              <ViewField label={bn.orders.color} value={viewOrder.color} />
              <ViewField label={bn.orders.qty} value={`${formatNumber(viewOrder.qty)} pcs`} />
              <ViewField label={bn.orders.unitPrice} value={formatMoney(viewOrder.unitPrice)} />
              <ViewField label={bn.orders.orderValue} value={formatMoney(orderValue(viewOrder))} />
              <ViewField label={bn.orders.shipDate} value={formatDate(viewOrder.shipDate)} />
              <ViewField label={bn.orders.stage} value={viewOrder.stage} />
              <ViewField label={bn.orders.progress} value={`${viewOrder.progress}%`} />
              <ViewField label={bn.orders.taStatus} value={viewOrder.taStatus} />
              <ViewField label={bn.orders.paymentStatus} value={viewOrder.paymentStatus} />
            </div>
          </div>
        )}
      </Modal>

      {/* Update order modal */}
      <Modal
        open={!!editOrder}
        onClose={() => setEditOrder(null)}
        title={editOrder ? `${bn.update} — ${editOrder.po}` : ""}
        size="md"
      >
        {editOrder && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{bn.orders.stage}</Label>
                <Select
                  value={updateForm.stage}
                  onChange={(e) => {
                    const stage = e.target.value as OrderStage;
                    setUpdateForm({ ...updateForm, stage, progress: stageProgressDefaults[stage] });
                  }}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{bn.orders.progress} (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={updateForm.progress}
                  onChange={(e) => setUpdateForm({ ...updateForm, progress: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{bn.orders.taStatus}</Label>
                <Select value={updateForm.taStatus} onChange={(e) => setUpdateForm({ ...updateForm, taStatus: e.target.value as TaStatus })}>
                  {TA_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{bn.orders.paymentStatus}</Label>
                <Select
                  value={updateForm.paymentStatus}
                  onChange={(e) => setUpdateForm({ ...updateForm, paymentStatus: e.target.value as PaymentStatus })}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>{bn.orders.shipDate}</Label>
                <Input type="date" value={updateForm.shipDate} onChange={(e) => setUpdateForm({ ...updateForm, shipDate: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditOrder(null)}>
                {bn.cancel}
              </Button>
              <Button type="submit">{bn.save}</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Order 360 Modal */}
      <Modal
        open={!!view360Order}
        onClose={() => setView360Order(null)}
        title={view360Order ? `Order 360° Dashboard — ${view360Order.po}` : ""}
        description={view360Order ? `${view360Order.buyer} · ${view360Order.style}` : ""}
        size="lg"
      >
        {view360Order && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Production Status</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{view360Order.stage}</p>
                <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: `${view360Order.progress}%` }} />
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider">T&A Health</p>
                <div className="mt-1">
                  <Badge tone={taStatusTone(view360Order.taStatus)}>{view360Order.taStatus}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-2">Ship Date: {formatDate(view360Order.shipDate)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Financials</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{formatMoney(orderValue(view360Order))}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase"><Badge tone={paymentStatusTone(view360Order.paymentStatus)}>{view360Order.paymentStatus}</Badge></p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Material Readiness</p>
                <p className="text-lg font-bold text-slate-800 mt-1">85%</p>
                <p className="text-xs text-slate-500 mt-1">Trims Pending</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Recent QC Inspections</h3>
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stage</TableHead>
                        <TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Inline (Sewing)</TableCell>
                        <TableCell><Badge tone="green">Passed</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cutting Panel</TableCell>
                        <TableCell><Badge tone="green">Passed</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">T&A Milestones</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-teal-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Yarn In-house</p>
                      <p className="text-xs text-slate-500">Completed 12 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">PP Sample Approval</p>
                      <p className="text-xs text-amber-600">Pending (Due in 2 days)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Final Inspection</p>
                      <p className="text-xs text-slate-400">Scheduled for {formatDate(view360Order.shipDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
      <p className="text-[10px] uppercase text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "teal" | "blue" | "green" | "red";
}) {
  const toneClasses: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
