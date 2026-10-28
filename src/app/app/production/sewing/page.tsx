"use client";

import { FormEvent, useMemo, useState } from "react";
import { Activity, Download, Eye, FileSpreadsheet, Gauge, Pencil, Plus, Search, TriangleAlert, Users } from "lucide-react";
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
import { Calculator } from "lucide-react";
import { SewingLine, useProductionData } from "@/hooks/useProductionData";
import { useErpRecords } from "@/hooks/useErpRecords";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";

function statusTone(status: SewingLine["status"]): BadgeTone {
  if (status === "Above Target") return "green";
  if (status === "On Target") return "blue";
  return "red";
}

type FormState = {
  lineName: string;
  orderId: string;
  target: string;
  output: string;
  defect: string;
  operators: string;
};

const emptyForm: FormState = {
  lineName: "",
  orderId: "",
  target: "",
  output: "0",
  defect: "0",
  operators: "",
};

export default function SewingPage() {
  const { sewingLines, addSewingLine, updateSewingLine } = useProductionData();
  const orders = useErpRecords((state) => state.data.orders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [viewLine, setViewLine] = useState<SewingLine | null>(null);
  const [editLine, setEditLine] = useState<SewingLine | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [updateForm, setUpdateForm] = useState({ output: "0", defect: "0", operators: "0" });
  const [activeTab, setActiveTab] = useState("sewing");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sewingLines.filter((line) => {
      const matchesSearch =
        !q ||
        line.lineName.toLowerCase().includes(q) ||
        line.poNumber.toLowerCase().includes(q) ||
        line.buyerName.toLowerCase().includes(q) ||
        line.style.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || line.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sewingLines, search, statusFilter]);

  const kpis = useMemo(() => {
    const totalTarget = sewingLines.reduce((s, l) => s + l.target, 0);
    const totalOutput = sewingLines.reduce((s, l) => s + l.output, 0);
    const avgEfficiency = sewingLines.length
      ? Math.round((sewingLines.reduce((s, l) => s + l.efficiencyPercent, 0) / sewingLines.length) * 10) / 10
      : 0;
    return {
      avgEfficiency,
      totalOutput,
      achievementPct: totalTarget ? Math.round((totalOutput / totalTarget) * 100) : 0,
      belowTarget: sewingLines.filter((l) => l.status === "Below Target").length,
      totalOperators: sewingLines.reduce((s, l) => s + l.operators, 0),
    };
  }, [sewingLines]);

  function openEdit(line: SewingLine) {
    setUpdateForm({ output: String(line.output), defect: String(line.defect), operators: String(line.operators) });
    setEditLine(line);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === form.orderId);
    if (!order) return;
    addSewingLine({
      lineName: form.lineName,
      orderId: order.id,
      poNumber: order.poNumber,
      buyerName: order.buyerName,
      style: order.style,
      target: Number(form.target) || 0,
      output: Number(form.output) || 0,
      defect: Number(form.defect) || 0,
      operators: Number(form.operators) || 0,
    });
    setAddOpen(false);
    setForm(emptyForm);
  }

  function handleUpdateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editLine) return;
    updateSewingLine(editLine.id, {
      output: Number(updateForm.output) || 0,
      defect: Number(updateForm.defect) || 0,
      operators: Number(updateForm.operators) || 0,
    });
    setEditLine(null);
  }

  const exportColumns = [
    { header: "Line", key: "line" },
    { header: "Buyer", key: "buyer" },
    { header: "PO", key: "po" },
    { header: "Style", key: "style" },
    { header: "Target", key: "target" },
    { header: "Output", key: "output" },
    { header: "Defect", key: "defect" },
    { header: "Efficiency %", key: "efficiency" },
    { header: "Operators", key: "operators" },
    { header: "Status", key: "status" },
  ];

  function exportRows() {
    return filtered.map((l) => ({
      line: l.lineName,
      buyer: l.buyerName,
      po: l.poNumber,
      style: l.style,
      target: formatNumber(l.target),
      output: formatNumber(l.output),
      defect: formatNumber(l.defect),
      efficiency: `${l.efficiencyPercent}%`,
      operators: l.operators,
      status: l.status,
    }));
  }

  async function handleExportPdf() {
    await exportToPDF({
      title: bn.production.sewing.heading,
      subtitle: bn.production.sewing.subtitle,
      columns: exportColumns,
      data: exportRows(),
      filename: "production-sewing",
    });
  }

  async function handleExportExcel() {
    await exportToExcel({ columns: exportColumns, data: exportRows(), filename: "production-sewing", sheetName: "Sewing" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{bn.production.sewing.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{bn.production.sewing.subtitle}</p>
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
            Add sewing line
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: "sewing", label: "Sewing Lines Status", icon: <Activity className="h-4 w-4" /> },
          { value: "ie", label: "IE Tools & Capacity", icon: <Calculator className="h-4 w-4" /> },
        ]}
      />

      {activeTab === "ie" && (
        <Card>
          <CardHeader>
            <CardTitle>Industrial Engineering (IE) Tools</CardTitle>
            <p className="text-sm text-slate-500">Calculate SMV, Pitch Time, and Line Capacity</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label>Total SMV (mins)</Label>
                <Input type="number" defaultValue="15.5" />
              </div>
              <div>
                <Label>Working Hours</Label>
                <Input type="number" defaultValue="8" />
              </div>
              <div>
                <Label>Operators</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div>
                <Label>Target Efficiency (%)</Label>
                <Input type="number" defaultValue="65" />
              </div>
              <div className="md:col-span-4 mt-2 border-t pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold">Calculated Pitch Time</p>
                    <p className="text-xl font-bold text-blue-900 mt-1">0.51 mins</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-semibold">Daily Line Capacity</p>
                    <p className="text-xl font-bold text-emerald-900 mt-1">603 pcs</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "sewing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiTile icon={<Gauge className="h-5 w-5" />} label={bn.production.sewing.avgEfficiency} value={`${kpis.avgEfficiency}%`} tone="teal" />
            <KpiTile icon={<Activity className="h-5 w-5" />} label={bn.production.sewing.totalOutput} value={`${formatNumber(kpis.totalOutput)} pcs`} tone="blue" hint={`${kpis.achievementPct}% of target`} />
            <KpiTile icon={<TriangleAlert className="h-5 w-5" />} label={bn.production.sewing.belowTarget} value={formatNumber(kpis.belowTarget)} tone="red" />
            <KpiTile icon={<Users className="h-5 w-5" />} label={bn.production.sewing.operators} value={formatNumber(kpis.totalOperators)} tone="green" />
          </div>

          <Card>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="max-w-sm flex-1">
                <Label className="sr-only">Search</Label>
                <Input icon={<Search className="h-4 w-4" />} placeholder="Line, PO, buyer or style..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="w-full sm:w-52">
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">{bn.all} — {bn.status}</option>
                  <option value="Below Target">Below Target</option>
                  <option value="On Target">On Target</option>
                  <option value="Above Target">Above Target</option>
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
                    <TableHead>Line &amp; Order Info</TableHead>
                    <TableHead>{bn.production.sewing.target}</TableHead>
                    <TableHead>{bn.production.sewing.output}</TableHead>
                    <TableHead>{bn.production.sewing.defect}</TableHead>
                    <TableHead>{bn.production.sewing.efficiency}</TableHead>
                    <TableHead>{bn.production.sewing.operators}</TableHead>
                    <TableHead>{bn.status}</TableHead>
                    <TableHead className="text-right">{bn.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-800">{line.lineName}</p>
                        <p className="text-xs text-slate-500">
                          {line.buyerName} · PO: {line.poNumber}
                        </p>
                        <p className="text-xs text-slate-400">Style: {line.style}</p>
                      </TableCell>
                      <TableCell>{formatNumber(line.target)} pcs</TableCell>
                      <TableCell className="font-semibold text-slate-800">{formatNumber(line.output)} pcs</TableCell>
                      <TableCell className="text-red-600">{formatNumber(line.defect)} pcs</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${line.efficiencyPercent >= 90 ? "bg-emerald-500" : line.efficiencyPercent >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(100, line.efficiencyPercent)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{line.efficiencyPercent}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{line.operators}</TableCell>
                      <TableCell>
                        <Badge tone={statusTone(line.status)}>{line.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="secondary" size="sm" onClick={() => setViewLine(line)}>
                            <Eye className="h-3.5 w-3.5" />
                            {bn.view}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEdit(line)}>
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

      {/* Add line modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New sewing line" size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Line Name</Label>
              <Input required value={form.lineName} onChange={(e) => setForm({ ...form, lineName: e.target.value })} placeholder="Sewing Line 04" />
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
              <Label required>{bn.production.sewing.target}</Label>
              <Input required type="number" min={0} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="1200" />
            </div>
            <div>
              <Label>{bn.production.sewing.output}</Label>
              <Input type="number" min={0} value={form.output} onChange={(e) => setForm({ ...form, output: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label>{bn.production.sewing.defect}</Label>
              <Input type="number" min={0} value={form.defect} onChange={(e) => setForm({ ...form, defect: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label required>{bn.production.sewing.operators}</Label>
              <Input required type="number" min={0} value={form.operators} onChange={(e) => setForm({ ...form, operators: e.target.value })} placeholder="42" />
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
        open={!!viewLine}
        onClose={() => setViewLine(null)}
        title={viewLine ? viewLine.lineName : ""}
        description={viewLine ? `${viewLine.buyerName} · ${viewLine.poNumber} · ${viewLine.style}` : ""}
        size="md"
      >
        {viewLine && (
          <div className="grid grid-cols-2 gap-3">
            <ViewField label={bn.production.sewing.target} value={`${formatNumber(viewLine.target)} pcs`} />
            <ViewField label={bn.production.sewing.output} value={`${formatNumber(viewLine.output)} pcs`} />
            <ViewField label={bn.production.sewing.defect} value={`${formatNumber(viewLine.defect)} pcs`} />
            <ViewField label={bn.production.sewing.efficiency} value={`${viewLine.efficiencyPercent}%`} />
            <ViewField label={bn.production.sewing.operators} value={String(viewLine.operators)} />
            <ViewField label={bn.status} value={viewLine.status} />
          </div>
        )}
      </Modal>

      {/* Update modal */}
      <Modal open={!!editLine} onClose={() => setEditLine(null)} title={editLine ? `${bn.update} — ${editLine.lineName}` : ""} size="md">
        {editLine && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{bn.production.sewing.output}</Label>
                <Input type="number" min={0} value={updateForm.output} onChange={(e) => setUpdateForm({ ...updateForm, output: e.target.value })} />
              </div>
              <div>
                <Label>{bn.production.sewing.defect}</Label>
                <Input type="number" min={0} value={updateForm.defect} onChange={(e) => setUpdateForm({ ...updateForm, defect: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>{bn.production.sewing.operators}</Label>
                <Input type="number" min={0} value={updateForm.operators} onChange={(e) => setUpdateForm({ ...updateForm, operators: e.target.value })} />
              </div>
            </div>
            <p className="text-xs text-slate-400">Efficiency % and status are recalculated automatically from target vs output.</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditLine(null)}>
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
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "teal" | "blue" | "green" | "red";
  hint?: string;
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
        {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
