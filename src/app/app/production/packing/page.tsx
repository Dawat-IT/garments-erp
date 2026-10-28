"use client";

import { FormEvent, useMemo, useState } from "react";
import { Boxes, Container, Download, Eye, FileSpreadsheet, PackageCheck, Pencil, Plus, Search } from "lucide-react";
import {
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
} from "@/components/commercial/ui";
import { PackingJob, useProductionData } from "@/hooks/useProductionData";
import { useErpRecords } from "@/hooks/useErpRecords";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { formatDate, formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";

type FormState = {
  orderId: string;
  color: string;
  size: string;
  cartons: string;
  packed: string;
  date: string;
};

const emptyForm: FormState = {
  orderId: "",
  color: "",
  size: "",
  cartons: "",
  packed: "0",
  date: new Date().toISOString().slice(0, 10),
};

export default function PackingPage() {
  const { packingJobs, addPackingJob, updatePackingJob } = useProductionData();
  const orders = useErpRecords((state) => state.data.orders);

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [viewJob, setViewJob] = useState<PackingJob | null>(null);
  const [editJob, setEditJob] = useState<PackingJob | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [updateForm, setUpdateForm] = useState({ cartons: "0", packed: "0", ready: "0" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return packingJobs.filter(
      (job) =>
        !q ||
        job.poNumber.toLowerCase().includes(q) ||
        job.buyerName.toLowerCase().includes(q) ||
        job.style.toLowerCase().includes(q) ||
        job.color.toLowerCase().includes(q)
    );
  }, [packingJobs, search]);

  const kpis = useMemo(
    () => ({
      totalCartons: packingJobs.reduce((s, j) => s + j.cartons, 0),
      totalPacked: packingJobs.reduce((s, j) => s + j.packed, 0),
      totalReady: packingJobs.reduce((s, j) => s + j.ready, 0),
      pending: packingJobs.reduce((s, j) => s + Math.max(j.packed - j.ready, 0), 0),
    }),
    [packingJobs]
  );

  function openEdit(job: PackingJob) {
    setUpdateForm({ cartons: String(job.cartons), packed: String(job.packed), ready: String(job.ready) });
    setEditJob(job);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === form.orderId);
    if (!order) return;
    const packed = Number(form.packed) || 0;
    addPackingJob({
      orderId: order.id,
      poNumber: order.poNumber,
      buyerName: order.buyerName,
      style: order.style,
      color: form.color,
      size: form.size,
      cartons: Number(form.cartons) || 0,
      packed,
      ready: packed,
      date: form.date,
    });
    setAddOpen(false);
    setForm(emptyForm);
  }

  function handleUpdateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editJob) return;
    updatePackingJob(editJob.id, {
      cartons: Number(updateForm.cartons) || 0,
      packed: Number(updateForm.packed) || 0,
      ready: Number(updateForm.ready) || 0,
    });
    setEditJob(null);
  }

  const exportColumns = [
    { header: "Buyer", key: "buyer" },
    { header: "PO", key: "po" },
    { header: "Style", key: "style" },
    { header: "Color", key: "color" },
    { header: "Size", key: "size" },
    { header: "Cartons", key: "cartons" },
    { header: "Packed", key: "packed" },
    { header: "Ready", key: "ready" },
    { header: "Date", key: "date" },
  ];

  function exportRows() {
    return filtered.map((j) => ({
      buyer: j.buyerName,
      po: j.poNumber,
      style: j.style,
      color: j.color,
      size: j.size,
      cartons: formatNumber(j.cartons),
      packed: formatNumber(j.packed),
      ready: formatNumber(j.ready),
      date: formatDate(j.date),
    }));
  }

  async function handleExportPdf() {
    await exportToPDF({
      title: bn.production.packing.heading,
      subtitle: bn.production.packing.subtitle,
      columns: exportColumns,
      data: exportRows(),
      filename: "production-packing",
    });
  }

  async function handleExportExcel() {
    await exportToExcel({ columns: exportColumns, data: exportRows(), filename: "production-packing", sheetName: "Packing" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{bn.production.packing.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{bn.production.packing.subtitle}</p>
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
            New packing job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile icon={<Container className="h-5 w-5" />} label={bn.production.packing.totalCartons} value={formatNumber(kpis.totalCartons)} tone="teal" />
        <KpiTile icon={<Boxes className="h-5 w-5" />} label={bn.production.packing.totalPacked} value={`${formatNumber(kpis.totalPacked)} pcs`} tone="blue" />
        <KpiTile icon={<PackageCheck className="h-5 w-5" />} label={bn.production.packing.ready} value={`${formatNumber(kpis.totalReady)} pcs`} tone="green" />
        <KpiTile icon={<Boxes className="h-5 w-5" />} label="Pending QC/Ready" value={`${formatNumber(kpis.pending)} pcs`} tone="red" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-sm flex-1">
            <Label className="sr-only">Search</Label>
            <Input icon={<Search className="h-4 w-4" />} placeholder="PO, buyer, style or color..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <TableHead>{bn.production.packing.color} / {bn.production.packing.size}</TableHead>
                <TableHead>{bn.production.packing.cartons}</TableHead>
                <TableHead>{bn.production.packing.packed}</TableHead>
                <TableHead>{bn.production.packing.ready}</TableHead>
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
                      Style: {job.style} · {formatDate(job.date)}
                    </p>
                  </TableCell>
                  <TableCell>
                    {job.color} / {job.size}
                  </TableCell>
                  <TableCell>{formatNumber(job.cartons)}</TableCell>
                  <TableCell className="font-semibold text-slate-800">{formatNumber(job.packed)} pcs</TableCell>
                  <TableCell className="font-semibold text-emerald-700">{formatNumber(job.ready)} pcs</TableCell>
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

      {/* Add packing job modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New packing job" size="lg">
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
              <Label required>{bn.production.packing.color}</Label>
              <Input required value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Royal Blue" />
            </div>
            <div>
              <Label required>{bn.production.packing.size}</Label>
              <Input required value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="M" />
            </div>
            <div>
              <Label required>{bn.production.packing.cartons}</Label>
              <Input required type="number" min={0} value={form.cartons} onChange={(e) => setForm({ ...form, cartons: e.target.value })} placeholder="120" />
            </div>
            <div>
              <Label>{bn.production.packing.packed}</Label>
              <Input type="number" min={0} value={form.packed} onChange={(e) => setForm({ ...form, packed: e.target.value })} placeholder="0" />
            </div>
            <div className="sm:col-span-2">
              <Label required>Date</Label>
              <Input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
            <ViewField label={bn.production.packing.color} value={viewJob.color} />
            <ViewField label={bn.production.packing.size} value={viewJob.size} />
            <ViewField label={bn.production.packing.cartons} value={formatNumber(viewJob.cartons)} />
            <ViewField label={bn.production.packing.packed} value={`${formatNumber(viewJob.packed)} pcs`} />
            <ViewField label={bn.production.packing.ready} value={`${formatNumber(viewJob.ready)} pcs`} />
            <ViewField label="Date" value={formatDate(viewJob.date)} />
          </div>
        )}
      </Modal>

      {/* Update modal */}
      <Modal open={!!editJob} onClose={() => setEditJob(null)} title={editJob ? `${bn.update} — ${editJob.poNumber}` : ""} size="md">
        {editJob && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{bn.production.packing.cartons}</Label>
                <Input type="number" min={0} value={updateForm.cartons} onChange={(e) => setUpdateForm({ ...updateForm, cartons: e.target.value })} />
              </div>
              <div>
                <Label>{bn.production.packing.packed}</Label>
                <Input type="number" min={0} value={updateForm.packed} onChange={(e) => setUpdateForm({ ...updateForm, packed: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>{bn.production.packing.ready}</Label>
                <Input type="number" min={0} value={updateForm.ready} onChange={(e) => setUpdateForm({ ...updateForm, ready: e.target.value })} />
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
