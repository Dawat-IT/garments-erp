"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileStack,
  Layers,
  PackageCheck,
  Pencil,
  Plus,
  Ruler,
  Search,
  TriangleAlert,
  Ship,
} from "lucide-react";
import {
  Badge,
  type BadgeTone,
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
  Tabs,
  CardHeader,
  CardTitle,
} from "@/components/commercial/ui";
import {
  Procurement,
  ProcurementStatus,
  ProcurementType,
  isProcurementInHouse,
  procurementProgressPct,
  useProcurementData,
} from "@/hooks/useProcurementData";
import { useErpRecords } from "@/hooks/useErpRecords";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { formatDate, formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";
import { toast } from "@/components/ui/Toast";

const PROCUREMENT_STATUSES: ProcurementStatus[] = ["booked", "ordered", "partial received", "in house", "delayed"];

function statusTone(status: ProcurementStatus): BadgeTone {
  switch (status) {
    case "in house":
      return "green";
    case "partial received":
      return "blue";
    case "ordered":
      return "teal";
    case "delayed":
      return "red";
    case "booked":
    default:
      return "amber";
  }
}

type ProcFormState = {
  type: ProcurementType;
  supplier: string;
  item: string;
  orderId: string;
  required: string;
  received: string;
  expectedDate: string;
  receivedDate: string;
  status: ProcurementStatus;
};

const emptyForm: ProcFormState = {
  type: "fabric",
  supplier: "",
  item: "",
  orderId: "",
  required: "",
  received: "0",
  expectedDate: "",
  receivedDate: "",
  status: "booked",
};

export default function ProcurementPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">{bn.loading}</div>}>
      <ProcurementContent />
    </Suspense>
  );
}

function ProcurementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: "fabric" | "trims" | "po" | "inhouse" | "import" =
    tabParam === "trims" || tabParam === "po" || tabParam === "inhouse" || tabParam === "import" ? tabParam : "fabric";

  const { procurements, addProcurement, updateProcurement } = useProcurementData();
  const orders = useErpRecords((state) => state.data.orders);

  const [search, setSearch] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Procurement | null>(null);
  const [editItem, setEditItem] = useState<Procurement | null>(null);
  const [form, setForm] = useState<ProcFormState>(emptyForm);
  const [updateForm, setUpdateForm] = useState({
    received: "0",
    receivedDate: "",
    status: "booked" as ProcurementStatus,
  });

  function setTab(tab: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (tab === "fabric") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(`/app/procurement${query ? `?${query}` : ""}`, { scroll: false });
  }

  const buyers = useMemo(() => Array.from(new Set(procurements.map((p) => p.buyerName))).sort(), [procurements]);

  const tabScoped = useMemo(() => {
    if (activeTab === "fabric") return procurements.filter((p) => p.type === "fabric");
    if (activeTab === "trims") return procurements.filter((p) => p.type === "trims");
    if (activeTab === "inhouse") return procurements.filter(isProcurementInHouse);
    if (activeTab === "import") return []; // Separate rendering
    return procurements; // Supplier PO — full register across fabric + trims
  }, [procurements, activeTab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tabScoped.filter((p) => {
      const matchesSearch =
        !q ||
        p.supplier.toLowerCase().includes(q) ||
        p.item.toLowerCase().includes(q) ||
        p.poNumber.toLowerCase().includes(q) ||
        p.style.toLowerCase().includes(q) ||
        p.buyerName.toLowerCase().includes(q);
      const matchesBuyer = buyerFilter === "all" || p.buyerName === buyerFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesBuyer && matchesStatus;
    });
  }, [tabScoped, search, buyerFilter, statusFilter]);

  const kpis = useMemo(() => {
    const fabric = procurements.filter((p) => p.type === "fabric");
    const trims = procurements.filter((p) => p.type === "trims");
    const fabricInHouse = fabric.filter(isProcurementInHouse).length;
    const trimsInHouse = trims.filter(isProcurementInHouse).length;
    return {
      totalBookings: procurements.length,
      fabricInHousePct: fabric.length ? Math.round((fabricInHouse / fabric.length) * 100) : 0,
      trimsInHousePct: trims.length ? Math.round((trimsInHouse / trims.length) * 100) : 0,
      delayed: procurements.filter((p) => p.status === "delayed").length,
    };
  }, [procurements]);

  function openAdd() {
    setForm({ ...emptyForm, type: activeTab === "trims" ? "trims" : "fabric" });
    setAddOpen(true);
  }

  function openEdit(item: Procurement) {
    setUpdateForm({ received: String(item.received), receivedDate: item.receivedDate ?? "", status: item.status });
    setEditItem(item);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === form.orderId);
    if (!order) return;
    addProcurement({
      type: form.type,
      supplier: form.supplier,
      item: form.item,
      orderId: order.id,
      poNumber: order.poNumber,
      buyerName: order.buyerName,
      style: order.style,
      required: Number(form.required) || 0,
      received: Number(form.received) || 0,
      expectedDate: form.expectedDate,
      receivedDate: form.receivedDate || null,
      status: form.status,
    });
    setAddOpen(false);
  }

  function handleUpdateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    updateProcurement(editItem.id, {
      received: Number(updateForm.received) || 0,
      receivedDate: updateForm.receivedDate || null,
      status: updateForm.status,
    });
    setEditItem(null);
  }

  const exportColumns = [
    { header: "Supplier", key: "supplier" },
    { header: "Item", key: "item" },
    { header: "Buyer", key: "buyer" },
    { header: "PO", key: "po" },
    { header: "Style", key: "style" },
    { header: "Required", key: "required" },
    { header: "Received", key: "received" },
    { header: "Balance", key: "balance" },
    { header: "Expected Date", key: "expectedDate" },
    { header: "Received Date", key: "receivedDate" },
    { header: "Status", key: "status" },
  ];

  function exportRows() {
    return filtered.map((p) => ({
      supplier: p.supplier,
      item: p.item,
      buyer: p.buyerName,
      po: p.poNumber,
      style: p.style,
      required: formatNumber(p.required),
      received: formatNumber(p.received),
      balance: formatNumber(p.balance),
      expectedDate: formatDate(p.expectedDate),
      receivedDate: p.receivedDate ? formatDate(p.receivedDate) : "—",
      status: p.status,
    }));
  }

  const tabTitle = {
    fabric: bn.procurement.fabricBooking,
    trims: bn.procurement.trimsBooking,
    po: bn.procurement.supplierPo,
    inhouse: bn.procurement.inhouseStatus,
    import: "Commercial Import",
  }[activeTab];

  async function handleExportPdf() {
    await exportToPDF({
      title: `${bn.procurement.heading} — ${tabTitle}`,
      subtitle: bn.procurement.subtitle,
      columns: exportColumns,
      data: exportRows(),
      filename: `procurement-${activeTab}`,
    });
  }

  async function handleExportExcel() {
    await exportToExcel({ columns: exportColumns, data: exportRows(), filename: `procurement-${activeTab}`, sheetName: "Procurement" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{bn.procurement.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{bn.procurement.subtitle}</p>
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
          {activeTab !== "po" && activeTab !== "inhouse" && (
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              {bn.procurement.newBooking}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile icon={<FileStack className="h-5 w-5" />} label={bn.procurement.totalBookings} value={formatNumber(kpis.totalBookings)} tone="teal" />
        <KpiTile icon={<Layers className="h-5 w-5" />} label={`Fabric ${bn.procurement.inHousePct}`} value={`${kpis.fabricInHousePct}%`} tone="blue" />
        <KpiTile icon={<Ruler className="h-5 w-5" />} label={`Trims ${bn.procurement.inHousePct}`} value={`${kpis.trimsInHousePct}%`} tone="green" />
        <KpiTile icon={<TriangleAlert className="h-5 w-5" />} label={bn.procurement.delayedBookings} value={formatNumber(kpis.delayed)} tone="red" />
      </div>

      <Tabs
        value={activeTab}
        onChange={setTab}
        items={[
          { value: "fabric", label: bn.procurement.fabricBooking, icon: <Layers className="h-3.5 w-3.5" /> },
          { value: "trims", label: bn.procurement.trimsBooking, icon: <Ruler className="h-3.5 w-3.5" /> },
          { value: "po", label: bn.procurement.supplierPo, icon: <FileStack className="h-3.5 w-3.5" /> },
          { value: "inhouse", label: bn.procurement.inhouseStatus, icon: <PackageCheck className="h-3.5 w-3.5" /> },
          { value: "import", label: "Comm. Import", icon: <Ship className="h-3.5 w-3.5" /> },
        ]}
      />

      {activeTab === "import" ? (
        <CommercialImportTab />
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-sm flex-1">
            <Label className="sr-only">Search</Label>
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder={bn.procurement.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={buyerFilter} onChange={(e) => setBuyerFilter(e.target.value)}>
              <option value="all">{bn.all} — Buyer</option>
              {buyers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{bn.all} — {bn.status}</option>
              {PROCUREMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <p className="ml-auto text-xs text-slate-400">
            {bn.totalRecords}: {filtered.length}
          </p>
        </CardContent>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState message={bn.noData} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier &amp; Item</TableHead>
                <TableHead>Order Info</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expected vs Received</TableHead>
                <TableHead>{bn.status}</TableHead>
                <TableHead className="text-right">{bn.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const progress = procurementProgressPct(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{p.supplier}</p>
                      <p className="text-xs text-slate-500">{p.item}</p>
                      <Badge tone={p.type === "fabric" ? "blue" : "purple"} className="mt-1">
                        {p.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-700">{p.buyerName}</p>
                      <p className="text-xs text-slate-500">PO: {p.poNumber}</p>
                      <p className="text-xs text-slate-400">Style: {p.style}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-700">
                        {formatNumber(p.received)} / {formatNumber(p.required)}
                      </p>
                      <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-teal-500" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">Balance: {formatNumber(p.balance)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-500">Expected: {formatDate(p.expectedDate)}</p>
                      <p className="text-xs text-slate-500">Received: {p.receivedDate ? formatDate(p.receivedDate) : "—"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => setViewItem(p)}>
                          <Eye className="h-3.5 w-3.5" />
                          {bn.view}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                          {bn.update}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add booking modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={bn.procurement.newBooking} size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Type</Label>
              <Select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ProcurementType })}>
                <option value="fabric">Fabric</option>
                <option value="trims">Trims</option>
              </Select>
            </div>
            <div>
              <Label required>{bn.procurement.selectOrder}</Label>
              <Select required value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}>
                <option value="">— {bn.procurement.selectOrder} —</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.buyerName} — {o.poNumber} ({o.style})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label required>{bn.procurement.supplier}</Label>
              <Input required value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="DBL Textiles" />
            </div>
            <div>
              <Label required>{bn.procurement.item}</Label>
              <Input required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="Single Jersey Fabric" />
            </div>
            <div>
              <Label required>{bn.procurement.required}</Label>
              <Input required type="number" min={0} value={form.required} onChange={(e) => setForm({ ...form, required: e.target.value })} placeholder="40000" />
            </div>
            <div>
              <Label>{bn.procurement.received}</Label>
              <Input type="number" min={0} value={form.received} onChange={(e) => setForm({ ...form, received: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label required>{bn.procurement.expectedDate}</Label>
              <Input required type="date" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} />
            </div>
            <div>
              <Label>{bn.status}</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProcurementStatus })}>
                {PROCUREMENT_STATUSES.map((s) => (
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

      {/* View modal */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem ? `${viewItem.supplier} — ${viewItem.item}` : ""}
        description={viewItem ? `${viewItem.buyerName} · ${viewItem.poNumber} · ${viewItem.style}` : ""}
        size="md"
      >
        {viewItem && (
          <div className="grid grid-cols-2 gap-3">
            <ViewField label="Type" value={viewItem.type} />
            <ViewField label={bn.status} value={viewItem.status} />
            <ViewField label={bn.procurement.required} value={formatNumber(viewItem.required)} />
            <ViewField label={bn.procurement.received} value={formatNumber(viewItem.received)} />
            <ViewField label={bn.procurement.balance} value={formatNumber(viewItem.balance)} />
            <ViewField label={bn.procurement.expectedDate} value={formatDate(viewItem.expectedDate)} />
            <ViewField label={bn.procurement.receivedDate} value={viewItem.receivedDate ? formatDate(viewItem.receivedDate) : "—"} />
          </div>
        )}
      </Modal>

      {/* Update item modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={bn.update} size="sm">
        {editItem && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label required>{bn.procurement.received}</Label>
                <Input required type="number" min={0} value={updateForm.received} onChange={(e) => setUpdateForm({ ...updateForm, received: e.target.value })} />
                <p className="mt-1 text-xs text-slate-500">
                  Total required: {formatNumber(editItem.required)}. Balance: {formatNumber(editItem.required - Number(updateForm.received))}
                </p>
              </div>
              <div>
                <Label>{bn.procurement.receivedDate}</Label>
                <Input type="date" value={updateForm.receivedDate} onChange={(e) => setUpdateForm({ ...updateForm, receivedDate: e.target.value })} />
              </div>
              <div>
                <Label required>{bn.status}</Label>
                <Select required value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as ProcurementStatus })}>
                  {PROCUREMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditItem(null)}>
                {bn.cancel}
              </Button>
              <Button type="submit">{bn.save}</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
      )}
    </div>
  );
}

function CommercialImportTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Commercial Import Tracking</CardTitle>
            <p className="text-xs text-slate-500">PI Handover, Custom Clearance, LC Open, and UD.</p>
          </div>
          <Button size="sm" onClick={() => toast.success("New Booking form opened")}>
            <Plus className="h-4 w-4 mr-1" /> New Booking
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PI No</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>LC Details</TableHead>
                <TableHead>Clearance</TableHead>
                <TableHead>UD Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>PI-2026-001</TableCell>
                <TableCell>DBL Textiles</TableCell>
                <TableCell>
                  <p className="text-sm">LC: 9988776655</p>
                  <p className="text-xs text-slate-500">Value: $45,000</p>
                </TableCell>
                <TableCell><Badge tone="green">Cleared</Badge></TableCell>
                <TableCell><Badge tone="green">Done</Badge></TableCell>
                <TableCell><Button variant="outline" size="sm" onClick={() => toast.success("Update PI-2026-001")}>Update</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>PI-2026-002</TableCell>
                <TableCell>Envoy Textiles</TableCell>
                <TableCell>
                  <p className="text-sm">LC: 4455667788</p>
                  <p className="text-xs text-slate-500">Value: $32,000</p>
                </TableCell>
                <TableCell><Badge tone="amber">Pending</Badge></TableCell>
                <TableCell><Badge tone="amber">Pending</Badge></TableCell>
                <TableCell><Button variant="outline" size="sm" onClick={() => toast.success("Update PI-2026-002")}>Update</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
      <p className="text-[10px] uppercase text-slate-400">{label}</p>
      <p className="text-sm font-semibold capitalize text-slate-700">{value}</p>
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
