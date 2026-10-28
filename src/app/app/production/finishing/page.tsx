"use client";

import { FormEvent, useMemo, useState } from "react";
import { Download, Eye, FileSpreadsheet, Layers, PackageCheck, Pencil, Plus, Search, TriangleAlert } from "lucide-react";
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
import { FinishingJob, useProductionData } from "@/hooks/useProductionData";
import { useErpRecords } from "@/hooks/useErpRecords";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { formatDate, formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";

type FormState = {
  orderId: string;
  fromSewing: string;
  iron: string;
  finish: string;
  reject: string;
  date: string;
};

const emptyForm: FormState = {
  orderId: "",
  fromSewing: "",
  iron: "0",
  finish: "0",
  reject: "0",
  date: new Date().toISOString().slice(0, 10),
};

export default function FinishingPage() {
  const { finishingJobs, addFinishingJob, updateFinishingJob } = useProductionData();
  const orders = useErpRecords((state) => state.data.orders);

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [viewJob, setViewJob] = useState<FinishingJob | null>(null);
  const [editJob, setEditJob] = useState<FinishingJob | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [updateForm, setUpdateForm] = useState({ iron: "0", finish: "0", reject: "0", readyForPacking: "0" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return finishingJobs.filter(
      (job) =>
        !q || job.poNumber.toLowerCase().includes(q) || job.buyerName.toLowerCase().includes(q) || job.style.toLowerCase().includes(q)
    );
  }, [finishingJobs, search]);

  const kpis = useMemo(
    () => ({
      totalFromSewing: finishingJobs.reduce((s, j) => s + j.fromSewing, 0),
      totalFinish: finishingJobs.reduce((s, j) => s + j.finish, 0),
      totalReject: finishingJobs.reduce((s, j) => s + j.reject, 0),
      totalReady: finishingJobs.reduce((s, j) => s + j.readyForPacking, 0),
    }),
    [finishingJobs]
  );

  function openEdit(job: FinishingJob) {
    setUpdateForm({
      iron: String(job.iron),
      finish: String(job.finish),
      reject: String(job.reject),
      readyForPacking: String(job.readyForPacking),
    });
    setEditJob(job);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === form.orderId);
    if (!order) return;
    const finish = Number(form.finish) || 0;
    addFinishingJob({
      orderId: order.id,
      poNumber: order.poNumber,
      buyerName: order.buyerName,
      style: order.style,
      fromSewing: Number(form.fromSewing) || 0,
      iron: Number(form.iron) || 0,
      finish,
      reject: Number(form.reject) || 0,
      readyForPacking: finish,
      date: form.date,
    });
    setAddOpen(false);
    setForm(emptyForm);
  }

  function handleUpdateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editJob) return;
    updateFinishingJob(editJob.id, {
      iron: Number(updateForm.iron) || 0,
      finish: Number(updateForm.finish) || 0,
      reject: Number(updateForm.reject) || 0,
      readyForPacking: Number(updateForm.readyForPacking) || 0,
    });
    setEditJob(null);
  }

  const exportColumns = [
    { header: "Buyer", key: "buyer" },
    { header: "PO", key: "po" },
    { header: "Style", key: "style" },
    { header: "From Sewing", key: "fromSewing" },
    { header: "Iron", key: "iron" },
    { header: "Finish", key: "finish" },
    { header: "Reject", key: "reject" },
    { header: "Ready For Packing", key: "readyForPacking" },
    { header: "Date", key: "date" },
  ];

  function exportRows() {
    return filtered.map((j) => ({
      buyer: j.buyerName,
      po: j.poNumber,
      style: j.style,
      fromSewing: formatNumber(j.fromSewing),
      iron: formatNumber(j.iron),
      finish: formatNumber(j.finish),
      reject: formatNumber(j.reject),
      readyForPacking: formatNumber(j.readyForPacking),
      date: formatDate(j.date),
    }));
  }

  async function handleExportPdf() {
    await exportToPDF({
      title: bn.production.finishing.heading,
      subtitle: bn.production.finishing.subtitle,
      columns: exportColumns,
      data: exportRows(),
      filename: "production-finishing",
    });
  }

  async function handleExportExcel() {
    await exportToExcel({ columns: exportColumns, data: exportRows(), filename: "production-finishing", sheetName: "Finishing" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{bn.production.finishing.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{bn.production.finishing.subtitle}</p>
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
            New finishing job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile icon={<Layers className="h-5 w-5" />} label={bn.production.finishing.fromSewing} value={`${formatNumber(kpis.totalFromSewing)} pcs`} tone="teal" />
        <KpiTile icon={<PackageCheck className="h-5 w-5" />} label={bn.production.finishing.finish} value={`${formatNumber(kpis.totalFinish)} pcs`} tone="blue" />
        <KpiTile icon={<TriangleAlert className="h-5 w-5" />} label={bn.production.finishing.reject} value={`${formatNumber(kpis.totalReject)} pcs`} tone="red" />
        <KpiTile icon={<PackageCheck className="h-5 w-5" />} label={bn.production.finishing.totalReady} value={`${formatNumber(kpis.totalReady)} pcs`} tone="green" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-sm flex-1">
            <Label className="sr-only">Search</Label>
            <Input icon={<Search className="h-4 w-4" />} placeholder="PO, buyer or style..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <TableHead>{bn.production.finishing.fromSewing}</TableHead>
                <TableHead>{bn.production.finishing.iron}</TableHead>
                <TableHead>{bn.production.finishing.finish}</TableHead>
                <TableHead>{bn.production.finishing.reject}</TableHead>
                <TableHead>{bn.production.finishing.readyForPacking}</TableHead>
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
                  <TableCell>{formatNumber(job.fromSewing)} pcs</TableCell>
                  <TableCell>{formatNumber(job.iron)} pcs</TableCell>
                  <TableCell className="font-semibold text-slate-800">{formatNumber(job.finish)} pcs</TableCell>
                  <TableCell className="text-red-600">{formatNumber(job.reject)} pcs</TableCell>
                  <TableCell className="font-semibold text-emerald-700">{formatNumber(job.readyForPacking)} pcs</TableCell>
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

      {/* Add finishing job modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New finishing job" size="lg">
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
              <Label required>{bn.production.finishing.fromSewing}</Label>
              <Input required type="number" min={0} value={form.fromSewing} onChange={(e) => setForm({ ...form, fromSewing: e.target.value })} placeholder="20000" />
            </div>
            <div>
              <Label>{bn.production.finishing.iron}</Label>
              <Input type="number" min={0} value={form.iron} onChange={(e) => setForm({ ...form, iron: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label>{bn.production.finishing.finish}</Label>
              <Input type="number" min={0} value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label>{bn.production.finishing.reject}</Label>
              <Input type="number" min={0} value={form.reject} onChange={(e) => setForm({ ...form, reject: e.target.value })} placeholder="0" />
            </div>
            <div>
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
            <ViewField label={bn.production.finishing.fromSewing} value={`${formatNumber(viewJob.fromSewing)} pcs`} />
            <ViewField label={bn.production.finishing.iron} value={`${formatNumber(viewJob.iron)} pcs`} />
            <ViewField label={bn.production.finishing.finish} value={`${formatNumber(viewJob.finish)} pcs`} />
            <ViewField label={bn.production.finishing.reject} value={`${formatNumber(viewJob.reject)} pcs`} />
            <ViewField label={bn.production.finishing.readyForPacking} value={`${formatNumber(viewJob.readyForPacking)} pcs`} />
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
                <Label>{bn.production.finishing.iron}</Label>
                <Input type="number" min={0} value={updateForm.iron} onChange={(e) => setUpdateForm({ ...updateForm, iron: e.target.value })} />
              </div>
              <div>
                <Label>{bn.production.finishing.finish}</Label>
                <Input type="number" min={0} value={updateForm.finish} onChange={(e) => setUpdateForm({ ...updateForm, finish: e.target.value })} />
              </div>
              <div>
                <Label>{bn.production.finishing.reject}</Label>
                <Input type="number" min={0} value={updateForm.reject} onChange={(e) => setUpdateForm({ ...updateForm, reject: e.target.value })} />
              </div>
              <div>
                <Label>{bn.production.finishing.readyForPacking}</Label>
                <Input
                  type="number"
                  min={0}
                  value={updateForm.readyForPacking}
                  onChange={(e) => setUpdateForm({ ...updateForm, readyForPacking: e.target.value })}
                />
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
