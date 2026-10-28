"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { toast } from "@/components/ui/Toast";
import { useErpRecords } from "@/hooks/useErpRecords";
import type { QcRecord, QcResult, QcType } from "@/lib/types";
import { exportToExcel, exportToPdf, type PdfColumn } from "@/lib/export";
import { formatNumber } from "@/lib/utils";

const QC_TABS: { value: QcType | "defects"; label: string }[] = [
  { value: "inline", label: "Inline QC" },
  { value: "endline", label: "Endline QC" },
  { value: "final", label: "Final Inspection" },
  { value: "defects", label: "Defect Analysis" },
];

const RESULTS: QcResult[] = ["passed", "rework", "failed"];

function resultTone(result: QcResult): "success" | "warning" | "danger" {
  if (result === "passed") return "success";
  if (result === "rework") return "warning";
  return "danger";
}

type QcFormState = {
  orderId: string;
  inspector: string;
  checked: string;
  passed: string;
  defectQty: string;
  rejected: string;
  defectType: string;
  result: QcResult;
  lotSize?: string;
  aqlLevel?: string;
};

const emptyForm: QcFormState = {
  orderId: "",
  inspector: "",
  checked: "",
  passed: "",
  defectQty: "",
  rejected: "",
  defectType: "",
  result: "passed",
  lotSize: "",
  aqlLevel: "2.5",
};

export default function QualityControlPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-ink-400">Loading quality control…</div>}>
      <QualityControlContent />
    </Suspense>
  );
}

function QualityControlContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: QcType | "defects" =
    tabParam === "endline" || tabParam === "final" || tabParam === "defects" ? tabParam : "inline";

  const { data, addQcRecord, updateQcRecord, deleteQcRecord } = useErpRecords();
  const { qcRecords, orders } = data;

  const [search, setSearch] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<QcRecord | null>(null);
  const [editRecord, setEditRecord] = useState<QcRecord | null>(null);
  const [form, setForm] = useState<QcFormState>(emptyForm);

  function setTab(tab: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (tab === "inline") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(`/app/quality-control${query ? `?${query}` : ""}`, { scroll: false });
  }

  // Global KPI strip — always computed across ALL inspection types.
  const kpis = useMemo(() => {
    const totalChecked = qcRecords.reduce((s, r) => s + r.checked, 0);
    const totalPassed = qcRecords.reduce((s, r) => s + r.passed, 0);
    const totalRejected = qcRecords.reduce((s, r) => s + r.rejected, 0);
    const reworkCount = qcRecords.filter((r) => r.result === "rework").length;
    return {
      inspections: qcRecords.length,
      passRate: totalChecked ? (totalPassed / totalChecked) * 100 : 0,
      failRate: totalChecked ? (totalRejected / totalChecked) * 100 : 0,
      reworkCount,
    };
  }, [qcRecords]);

  const buyerOptions = useMemo(() => Array.from(new Set(qcRecords.map((r) => r.buyerName))).sort(), [qcRecords]);

  const filteredRecords = useMemo(() => {
    if (activeTab === "defects") return [];
    const q = search.trim().toLowerCase();
    return qcRecords.filter((r) => {
      if (r.type !== activeTab) return false;
      const matchesSearch =
        !q ||
        r.poNumber.toLowerCase().includes(q) ||
        r.style.toLowerCase().includes(q) ||
        r.buyerName.toLowerCase().includes(q) ||
        r.inspector.toLowerCase().includes(q) ||
        r.defectType.toLowerCase().includes(q);
      const matchesBuyer = buyerFilter === "all" || r.buyerName === buyerFilter;
      const matchesResult = resultFilter === "all" || r.result === resultFilter;
      return matchesSearch && matchesBuyer && matchesResult;
    });
  }, [qcRecords, activeTab, search, buyerFilter, resultFilter]);

  const defectAggregation = useMemo(() => {
    const q = search.trim().toLowerCase();
    const map = new Map<string, { defectType: string; occurrences: number; totalDefectQty: number; totalRejected: number; types: Set<QcType> }>();
    qcRecords.forEach((r) => {
      if (!r.defectType) return;
      const key = r.defectType;
      if (!map.has(key)) {
        map.set(key, { defectType: key, occurrences: 0, totalDefectQty: 0, totalRejected: 0, types: new Set() });
      }
      const entry = map.get(key)!;
      entry.occurrences += 1;
      entry.totalDefectQty += r.defectQty;
      entry.totalRejected += r.rejected;
      entry.types.add(r.type);
    });
    return Array.from(map.values())
      .filter((entry) => !q || entry.defectType.toLowerCase().includes(q))
      .sort((a, b) => b.totalDefectQty - a.totalDefectQty);
  }, [qcRecords, search]);

  const maxDefectQty = Math.max(1, ...defectAggregation.map((d) => d.totalDefectQty));

  function openAdd() {
    setForm(emptyForm);
    setAddOpen(true);
  }

  function openEdit(record: QcRecord) {
    setForm({
      orderId: record.orderId,
      inspector: record.inspector,
      checked: String(record.checked),
      passed: String(record.passed),
      defectQty: String(record.defectQty),
      rejected: String(record.rejected),
      defectType: record.defectType,
      result: record.result,
    });
    setEditRecord(record);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === form.orderId);
    if (!order) {
      toast.error("Select an order", "Please choose the PO / style this inspection belongs to.");
      return;
    }
    addQcRecord({
      orderId: order.id,
      poNumber: order.poNumber,
      buyerName: order.buyerName,
      style: order.style,
      type: activeTab === "defects" ? "inline" : activeTab,
      inspector: form.inspector || "Unassigned",
      checked: Number(form.checked) || 0,
      passed: Number(form.passed) || 0,
      defectQty: Number(form.defectQty) || 0,
      rejected: Number(form.rejected) || 0,
      defectType: form.defectType || "—",
      result: form.result,
    });
    toast.success("Inspection recorded", `${order.buyerName} — ${order.poNumber} added to ${activeTab} QC.`);
    setAddOpen(false);
  }

  function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editRecord) return;
    updateQcRecord(editRecord.id, {
      inspector: form.inspector || "Unassigned",
      checked: Number(form.checked) || 0,
      passed: Number(form.passed) || 0,
      defectQty: Number(form.defectQty) || 0,
      rejected: Number(form.rejected) || 0,
      defectType: form.defectType || "—",
      result: form.result,
    });
    toast.success("Inspection updated");
    setEditRecord(null);
  }

  function handleDelete(record: QcRecord) {
    if (!window.confirm(`Delete this ${record.type} QC record for ${record.poNumber}?`)) return;
    deleteQcRecord(record.id);
    toast.success("Inspection deleted");
  }

  const tabLabel = QC_TABS.find((t) => t.value === activeTab)?.label ?? "Inline QC";

  function exportCurrentTab() {
    if (activeTab === "defects") {
      const headers = ["Defect Type", "Occurrences", "Total Defect Qty", "Total Rejected", "Inspection Stages"];
      const rows = defectAggregation.map((d) => ({
        "Defect Type": d.defectType,
        Occurrences: d.occurrences,
        "Total Defect Qty": formatNumber(d.totalDefectQty),
        "Total Rejected": formatNumber(d.totalRejected),
        "Inspection Stages": Array.from(d.types).join(", "),
      }));
      const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
      exportToPdf("QC — Defect Analysis", columns, rows, "qc-defect-analysis", {
        subtitle: "Aggregated defect occurrences across all inspection stages",
      });
      exportToExcel("qc-defect-analysis", rows, "Defects");
      return;
    }
    const headers = ["Buyer", "PO Number", "Style", "Inspector", "Checked", "Passed", "Defect Qty", "Defect Type", "Rejected", "Result"];
    const rows = filteredRecords.map((r) => ({
      Buyer: r.buyerName,
      "PO Number": r.poNumber,
      Style: r.style,
      Inspector: r.inspector,
      Checked: r.checked,
      Passed: r.passed,
      "Defect Qty": r.defectQty,
      "Defect Type": r.defectType,
      Rejected: r.rejected,
      Result: r.result,
    }));
    const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
    exportToPdf(`Quality Control — ${tabLabel}`, columns, rows, `qc-${activeTab}`, {
      subtitle: "Dawat RMG SOFT — Quality Control report",
    });
    exportToExcel(`qc-${activeTab}`, rows, tabLabel);
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow="Quality Assurance"
        title="Quality Control"
        subtitle="Inline, endline and final inspections, plus factory-wide defect analysis."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCurrentTab} leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
              Export Excel
            </Button>
            <Button variant="outline" onClick={exportCurrentTab} leftIcon={<Download className="h-4 w-4" />}>
              Export PDF
            </Button>
            {activeTab !== "defects" && (
              <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
                New Inspection
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Inspections" value={formatNumber(kpis.inspections)} icon={ClipboardCheck} hint="all stages" accent="teal" />
        <KpiCard
          label="Fail Rate"
          value={`${kpis.failRate.toFixed(1)}%`}
          icon={TriangleAlert}
          hint="of pieces checked"
          invertTone
          accent="accent"
        />
        <KpiCard label="Passed" value={`${kpis.passRate.toFixed(1)}%`} icon={CheckCircle2} hint="of pieces checked" accent="teal" />
        <KpiCard label="Rework" value={formatNumber(kpis.reworkCount)} icon={RefreshCcw} hint="records flagged" accent="accent" />
      </div>

      <Tabs value={activeTab} onChange={setTab} items={QC_TABS} />

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-sm flex-1">
            <Label className="sr-only">Search</Label>
            <Input
              leftIcon={<Search className="h-4 w-4" />}
              placeholder="Search PO, style, buyer, inspector or defect…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {activeTab !== "defects" && (
            <>
              <div className="w-full sm:w-52">
                <Select
                  value={buyerFilter}
                  onChange={(e) => setBuyerFilter(e.target.value)}
                  options={[{ value: "all", label: "All Buyers" }, ...buyerOptions.map((b) => ({ value: b, label: b }))]}
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  options={[{ value: "all", label: "All Results" }, ...RESULTS.map((r) => ({ value: r, label: r }))]}
                />
              </div>
            </>
          )}
          <p className="ml-auto text-xs text-ink-400">
            {activeTab === "defects" ? defectAggregation.length : filteredRecords.length} records
          </p>
        </CardContent>
      </Card>

      {activeTab === "defects" ? (
        <Card>
          <CardHeader>
            <CardTitle>Defect Analysis — All Inspection Stages</CardTitle>
          </CardHeader>
          {defectAggregation.length === 0 ? (
            <EmptyState title="No defects recorded" subtitle="No defects recorded yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Defect Type</TableHead>
                  <TableHead>Occurrences</TableHead>
                  <TableHead>Total Defect Qty</TableHead>
                  <TableHead>Total Rejected</TableHead>
                  <TableHead>Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defectAggregation.map((d) => (
                  <TableRow key={d.defectType}>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{d.defectType}</p>
                      <p className="text-xs text-slate-400">{Array.from(d.types).join(", ")}</p>
                    </TableCell>
                    <TableCell>{formatNumber(d.occurrences)}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{formatNumber(d.totalDefectQty)}</TableCell>
                    <TableCell>{formatNumber(d.totalRejected)}</TableCell>
                    <TableCell>
                      <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-accent-500"
                          style={{ width: `${Math.max(6, (d.totalDefectQty / maxDefectQty) * 100)}%` }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      ) : (
        <Card>
          {filteredRecords.length === 0 ? (
            <EmptyState title="No inspections found" subtitle="No inspection records found for the selected filters." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Info</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Checked / Passed</TableHead>
                  <TableHead>Defect</TableHead>
                  <TableHead>Rejected</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{record.buyerName}</p>
                      <p className="text-xs text-slate-500">PO: {record.poNumber}</p>
                      <p className="text-xs text-slate-400">Style: {record.style}</p>
                    </TableCell>
                    <TableCell>{record.inspector}</TableCell>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{formatNumber(record.passed)} / {formatNumber(record.checked)}</p>
                      <p className="text-xs text-slate-400">
                        {record.checked ? ((record.passed / record.checked) * 100).toFixed(1) : "0.0"}% pass
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-700">{record.defectType}</p>
                      <p className="text-xs text-slate-400">Qty: {formatNumber(record.defectQty)}</p>
                    </TableCell>
                    <TableCell>{formatNumber(record.rejected)}</TableCell>
                    <TableCell>
                      <Badge tone={resultTone(record.result)}>{record.result}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setViewRecord(record)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(record)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(record)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Add inspection modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={`New ${tabLabel} Inspection`} size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <Label required>Order / Style</Label>
            <Select
              required
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              placeholder="Select PO / style"
              options={orders.map((o) => ({ value: o.id, label: `${o.buyerName} — ${o.poNumber} (${o.style})` }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Inspector</Label>
              <Input required value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })} placeholder="QC — Sabina Yasmin" />
            </div>
            <div>
              <Label required>Result</Label>
              <Select
                required
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value as QcResult })}
                options={RESULTS.map((r) => ({ value: r, label: r }))}
              />
            </div>
            {activeTab === "final" && (
              <>
                <div>
                  <Label>AQL Level</Label>
                  <Select
                    value={form.aqlLevel}
                    onChange={(e) => setForm({ ...form, aqlLevel: e.target.value })}
                    options={[
                      { value: "1.0", label: "AQL 1.0" },
                      { value: "1.5", label: "AQL 1.5" },
                      { value: "2.5", label: "AQL 2.5 (Standard)" },
                      { value: "4.0", label: "AQL 4.0" },
                    ]}
                  />
                </div>
                <div>
                  <Label>Lot Size</Label>
                  <Input type="number" min={0} value={form.lotSize} onChange={(e) => setForm({ ...form, lotSize: e.target.value })} placeholder="1200" />
                </div>
              </>
            )}
            <div>
              <Label required>{activeTab === "final" ? "Sample Size (Checked Qty)" : "Checked Qty"}</Label>
              <Input required type="number" min={0} value={form.checked} onChange={(e) => setForm({ ...form, checked: e.target.value })} placeholder="80" />
            </div>
            <div>
              <Label required>Passed Qty</Label>
              <Input required type="number" min={0} value={form.passed} onChange={(e) => setForm({ ...form, passed: e.target.value })} placeholder="78" />
            </div>
            <div>
              <Label required>Defect Qty</Label>
              <Input required type="number" min={0} value={form.defectQty} onChange={(e) => setForm({ ...form, defectQty: e.target.value })} placeholder="15" />
            </div>
            <div>
              <Label required>Rejected Qty</Label>
              <Input required type="number" min={0} value={form.rejected} onChange={(e) => setForm({ ...form, rejected: e.target.value })} placeholder="5" />
            </div>
            <div className="sm:col-span-2">
              <Label required>Defect Type</Label>
              <Input required value={form.defectType} onChange={(e) => setForm({ ...form, defectType: e.target.value })} placeholder="Broken Stitch" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Inspection</Button>
          </div>
        </form>
      </Modal>

      {/* View modal */}
      <Modal
        open={!!viewRecord}
        onClose={() => setViewRecord(null)}
        title={viewRecord ? `${viewRecord.buyerName} — ${viewRecord.poNumber}` : ""}
        description={viewRecord?.style}
        size="md"
      >
        {viewRecord && (
          <div className="grid grid-cols-2 gap-3">
            <ViewField label="Type" value={viewRecord.type} />
            <ViewField label="Inspector" value={viewRecord.inspector} />
            <ViewField label="Checked" value={formatNumber(viewRecord.checked)} />
            <ViewField label="Passed" value={formatNumber(viewRecord.passed)} />
            <ViewField label="Defect Qty" value={formatNumber(viewRecord.defectQty)} />
            <ViewField label="Rejected" value={formatNumber(viewRecord.rejected)} />
            <ViewField label="Defect Type" value={viewRecord.defectType} />
            <ViewField label="Result" value={viewRecord.result} />
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        title={editRecord ? `Update — ${editRecord.poNumber}` : ""}
        size="lg"
      >
        {editRecord && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>Inspector</Label>
                <Input required value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })} />
              </div>
              <div>
                <Label required>Result</Label>
                <Select
                  required
                  value={form.result}
                  onChange={(e) => setForm({ ...form, result: e.target.value as QcResult })}
                  options={RESULTS.map((r) => ({ value: r, label: r }))}
                />
              </div>
              <div>
                <Label required>Checked Qty</Label>
                <Input required type="number" min={0} value={form.checked} onChange={(e) => setForm({ ...form, checked: e.target.value })} />
              </div>
              <div>
                <Label required>Passed Qty</Label>
                <Input required type="number" min={0} value={form.passed} onChange={(e) => setForm({ ...form, passed: e.target.value })} />
              </div>
              <div>
                <Label required>Defect Qty</Label>
                <Input required type="number" min={0} value={form.defectQty} onChange={(e) => setForm({ ...form, defectQty: e.target.value })} />
              </div>
              <div>
                <Label required>Rejected Qty</Label>
                <Input required type="number" min={0} value={form.rejected} onChange={(e) => setForm({ ...form, rejected: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label required>Defect Type</Label>
                <Input required value={form.defectType} onChange={(e) => setForm({ ...form, defectType: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditRecord(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
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
