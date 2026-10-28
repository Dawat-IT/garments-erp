"use client";

import { FormEvent, useMemo, useState } from "react";
import { Download, Eye, FileSpreadsheet, Layers, Pencil, Plus, Scissors, Search, TriangleAlert } from "lucide-react";
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
} from "@/components/commercial/ui";
import { Package } from "lucide-react";
import { CuttingJob, useProductionData } from "@/hooks/useProductionData";
import type { CuttingStatus } from "@/lib/types";
import { useErpRecords } from "@/hooks/useErpRecords";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { formatDate, formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";

const CUTTING_STATUSES: CuttingStatus[] = ["Pending", "In Progress", "Completed"];

function statusTone(status: CuttingStatus): BadgeTone {
  if (status === "Completed") return "green";
  if (status === "In Progress") return "blue";
  return "amber";
}

type FormState = {
  orderId: string;
  fabricIssued: string;
  cutQty: string;
  reject: string;
  cuttingDate: string;
  status: CuttingStatus;
};

const emptyForm: FormState = {
  orderId: "",
  fabricIssued: "",
  cutQty: "0",
  reject: "0",
  cuttingDate: new Date().toISOString().slice(0, 10),
  status: "Pending",
};

export default function CuttingPage() {
  const { cuttingJobs, addCuttingJob, updateCuttingJob } = useProductionData();
  const orders = useErpRecords((state) => state.data.orders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [viewJob, setViewJob] = useState<CuttingJob | null>(null);
  const [editJob, setEditJob] = useState<CuttingJob | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [updateForm, setUpdateForm] = useState({ cutQty: "0", reject: "0", status: "Pending" as CuttingStatus });
  const [activeTab, setActiveTab] = useState("cutting");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cuttingJobs.filter((job) => {
      const matchesSearch =
        !q || job.poNumber.toLowerCase().includes(q) || job.buyerName.toLowerCase().includes(q) || job.style.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cuttingJobs, search, statusFilter]);

  const kpis = useMemo(
    () => ({
      totalIssued: cuttingJobs.reduce((s, j) => s + j.fabricIssued, 0),
      totalCut: cuttingJobs.reduce((s, j) => s + j.cutQty, 0),
      totalReject: cuttingJobs.reduce((s, j) => s + j.reject, 0),
      inProgress: cuttingJobs.filter((j) => j.status === "In Progress").length,
    }),
    [cuttingJobs]
  );

  function openEdit(job: CuttingJob) {
    setUpdateForm({ cutQty: String(job.cutQty), reject: String(job.reject), status: job.status });
    setEditJob(job);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === form.orderId);
    if (!order) return;
    addCuttingJob({
      orderId: order.id,
      poNumber: order.poNumber,
      buyerName: order.buyerName,
      style: order.style,
      fabricIssued: Number(form.fabricIssued) || 0,
      cutQty: Number(form.cutQty) || 0,
      reject: Number(form.reject) || 0,
      cuttingDate: form.cuttingDate,
      status: form.status,
    });
    setAddOpen(false);
    setForm(emptyForm);
  }

  function handleUpdateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editJob) return;
    updateCuttingJob(editJob.id, {
      cutQty: Number(updateForm.cutQty) || 0,
      reject: Number(updateForm.reject) || 0,
      status: updateForm.status,
    });
    setEditJob(null);
  }

  const exportColumns = [
    { header: "Buyer", key: "buyer" },
    { header: "PO", key: "po" },
    { header: "Style", key: "style" },
    { header: "Fabric Issued", key: "fabricIssued" },
    { header: "Cut Qty", key: "cutQty" },
    { header: "Reject", key: "reject" },
    { header: "Balance", key: "balance" },
    { header: "Cutting Date", key: "cuttingDate" },
    { header: "Status", key: "status" },
  ];

  function exportRows() {
    return filtered.map((j) => ({
      buyer: j.buyerName,
      po: j.poNumber,
      style: j.style,
      fabricIssued: formatNumber(j.fabricIssued),
      cutQty: formatNumber(j.cutQty),
      reject: formatNumber(j.reject),
      balance: formatNumber(j.balance),
      cuttingDate: formatDate(j.cuttingDate),
      status: j.status,
    }));
  }

  async function handleExportPdf() {
    await exportToPDF({
      title: bn.production.cutting.heading,
      subtitle: bn.production.cutting.subtitle,
      columns: exportColumns,
      data: exportRows(),
      filename: "production-cutting",
    });
  }

  async function handleExportExcel() {
    await exportToExcel({ columns: exportColumns, data: exportRows(), filename: "production-cutting", sheetName: "Cutting" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{bn.production.cutting.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{bn.production.cutting.subtitle}</p>
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
          <Button
            onClick={() => {
              setForm(emptyForm);
              setAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New cutting job
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: "cutting", label: "Cutting Jobs", icon: <Scissors className="h-4 w-4" /> },
          { value: "bundles", label: "Bundle Tracking", icon: <Package className="h-4 w-4" /> },
        ]}
      />

      {activeTab === "cutting" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiTile icon={<Layers className="h-5 w-5" />} label="Total fabric issued" value={`${formatNumber(kpis.totalIssued)} pcs`} tone="teal" />
            <KpiTile icon={<Scissors className="h-5 w-5" />} label={bn.production.cutting.totalCut} value={`${formatNumber(kpis.totalCut)} pcs`} tone="blue" />
            <KpiTile icon={<TriangleAlert className="h-5 w-5" />} label={bn.production.cutting.totalReject} value={`${formatNumber(kpis.totalReject)} pcs`} tone="red" />
            <KpiTile icon={<Scissors className="h-5 w-5" />} label={bn.production.cutting.inProgress} value={formatNumber(kpis.inProgress)} tone="green" />
          </div>

          <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-sm flex-1">
            <Label className="sr-only">Search</Label>
            <Input icon={<Search className="h-4 w-4" />} placeholder="PO, buyer or style..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{bn.all} — {bn.status}</option>
              {CUTTING_STATUSES.map((s) => (
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
                <TableHead>Order Info</TableHead>
                <TableHead>{bn.production.cutting.fabricIssued}</TableHead>
                <TableHead>{bn.production.cutting.cutQty}</TableHead>
                <TableHead>{bn.production.cutting.reject}</TableHead>
                <TableHead>{bn.production.cutting.balance}</TableHead>
                <TableHead>{bn.status}</TableHead>
                <TableHead className="text-right">{bn.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-800">{job.buyerName}</p>
                    <p className="text-xs text-slate-500">PO: {job.poNumber}</p>
                    <p className="text-xs text-slate-400">
                      Style: {job.style} · {formatDate(job.cuttingDate)}
                    </p>
                  </TableCell>
                  <TableCell>{formatNumber(job.fabricIssued)} pcs</TableCell>
                  <TableCell className="font-semibold text-slate-800">{formatNumber(job.cutQty)} pcs</TableCell>
                  <TableCell className="text-red-600">{formatNumber(job.reject)} pcs</TableCell>
                  <TableCell>{formatNumber(job.balance)} pcs</TableCell>
                  <TableCell>
                    <Badge tone={statusTone(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => setViewJob(job)}>
                        <Eye className="h-3.5 w-3.5" />
                        {bn.view}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(job)}>
                        <Pencil className="h-3.5 w-3.5" />
                        {bn.update}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      </div>
      )}

      {activeTab === "bundles" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="max-w-sm flex-1">
                <Label className="sr-only">Search Bundles</Label>
                <Input icon={<Search className="h-4 w-4" />} placeholder="Scan barcode or search Bundle ID..." />
              </div>
              <div className="w-full sm:w-48">
                <Select>
                  <option value="all">All Statuses</option>
                  <option value="ready">Ready for Sewing</option>
                  <option value="in-sewing">In Sewing</option>
                  <option value="completed">Completed</option>
                </Select>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create Bundle
              </Button>
            </CardContent>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bundle ID</TableHead>
                  <TableHead>Order Info</TableHead>
                  <TableHead>Size / Color</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Assigned Line</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mock Bundle Data */}
                {[
                  { id: "BND-24-001", order: "PO-24-001 (ST-8899)", size: "M", color: "Navy", qty: 50, line: "Line 1", status: "In Sewing", tone: "blue" },
                  { id: "BND-24-002", order: "PO-24-001 (ST-8899)", size: "L", color: "Navy", qty: 50, line: "Unassigned", status: "Ready for Sewing", tone: "amber" },
                  { id: "BND-24-003", order: "PO-24-002 (ST-7711)", size: "S", color: "Black", qty: 25, line: "Line 2", status: "Completed", tone: "green" },
                ].map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono font-semibold text-slate-800">{b.id}</TableCell>
                    <TableCell>{b.order}</TableCell>
                    <TableCell>{b.size} / {b.color}</TableCell>
                    <TableCell>{b.qty} pcs</TableCell>
                    <TableCell>{b.line}</TableCell>
                    <TableCell>
                      <Badge tone={b.tone as any}>{b.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm">Print Tag</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Add cutting job modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New cutting job" size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
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
              <Label required>{bn.production.cutting.fabricIssued}</Label>
              <Input required type="number" min={0} value={form.fabricIssued} onChange={(e) => setForm({ ...form, fabricIssued: e.target.value })} placeholder="40000" />
            </div>
            <div>
              <Label>{bn.production.cutting.cutQty}</Label>
              <Input type="number" min={0} value={form.cutQty} onChange={(e) => setForm({ ...form, cutQty: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label>{bn.production.cutting.reject}</Label>
              <Input type="number" min={0} value={form.reject} onChange={(e) => setForm({ ...form, reject: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label required>Cutting Date</Label>
              <Input required type="date" value={form.cuttingDate} onChange={(e) => setForm({ ...form, cuttingDate: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>{bn.status}</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CuttingStatus })}>
                {CUTTING_STATUSES.map((s) => (
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
        open={!!viewJob}
        onClose={() => setViewJob(null)}
        title={viewJob ? `${viewJob.buyerName} — ${viewJob.poNumber}` : ""}
        description={viewJob?.style}
        size="md"
      >
        {viewJob && (
          <div className="grid grid-cols-2 gap-3">
            <ViewField label={bn.production.cutting.fabricIssued} value={`${formatNumber(viewJob.fabricIssued)} pcs`} />
            <ViewField label={bn.production.cutting.cutQty} value={`${formatNumber(viewJob.cutQty)} pcs`} />
            <ViewField label={bn.production.cutting.reject} value={`${formatNumber(viewJob.reject)} pcs`} />
            <ViewField label={bn.production.cutting.balance} value={`${formatNumber(viewJob.balance)} pcs`} />
            <ViewField label="Cutting Date" value={formatDate(viewJob.cuttingDate)} />
            <ViewField label={bn.status} value={viewJob.status} />
          </div>
        )}
      </Modal>

      {/* Update modal */}
      <Modal open={!!editJob} onClose={() => setEditJob(null)} title={editJob ? `${bn.update} — ${editJob.poNumber}` : ""} size="md">
        {editJob && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{bn.production.cutting.cutQty}</Label>
                <Input type="number" min={0} value={updateForm.cutQty} onChange={(e) => setUpdateForm({ ...updateForm, cutQty: e.target.value })} />
              </div>
              <div>
                <Label>{bn.production.cutting.reject}</Label>
                <Input type="number" min={0} value={updateForm.reject} onChange={(e) => setUpdateForm({ ...updateForm, reject: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>{bn.status}</Label>
                <Select value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as CuttingStatus })}>
                  {CUTTING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditJob(null)}>
                {bn.cancel}
              </Button>
              <Button type="submit">{bn.save}</Button>
            </div>
          </form>
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
