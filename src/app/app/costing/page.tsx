"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Calculator,
  Download,
  Eye,
  FileSpreadsheet,
  Layers,
  Pencil,
  Plus,
  Search,
  TrendingUp,
  Lock,
  Unlock,
  History,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Costing, costingMarginPct, costingTotal, useCommercialData } from "@/hooks/useCommercialData";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { formatMoney, formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";

type CostingFormState = {
  orderId: string;
  fabricName: string;
  garmentWeight: string;
  consumption: string;
  fabricCost: string;
  trimsCost: string;
  cmCost: string;
  processingCost: string;
  commercialCost: string;
  unitPrice: string;
};

const emptyForm: CostingFormState = {
  orderId: "",
  fabricName: "",
  garmentWeight: "",
  consumption: "",
  fabricCost: "",
  trimsCost: "",
  cmCost: "",
  processingCost: "0",
  commercialCost: "0",
  unitPrice: "",
};

export default function CostingPage() {
  const { orders, costings, addCosting, updateCosting } = useCommercialData();

  const [search, setSearch] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>(costings[0]?.style ?? "");
  const [addOpen, setAddOpen] = useState(false);
  const [viewCosting, setViewCosting] = useState<Costing | null>(null);
  const [editCosting, setEditCosting] = useState<Costing | null>(null);
  const [addQuotationOpen, setAddQuotationOpen] = useState(false);
  const [form, setForm] = useState<CostingFormState>(emptyForm);
  const [quoteForm, setQuoteForm] = useState({ date: "", offeredPrice: "", validUntil: "", status: "Pending", buyerFeedback: "" });

  function qtyForCosting(costing: { orderId?: string; style: string }) {
    return orders.find((o) => o.id === costing.orderId)?.qty ?? orders.find((o) => o.style === costing.style)?.qty ?? 0;
  }

  const filteredCostings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return costings;
    return costings.filter(
      (c) => c.style.toLowerCase().includes(q) || c.buyer.toLowerCase().includes(q) || c.fabricName.toLowerCase().includes(q)
    );
  }, [costings, search]);

  const selectedCosting = costings.find((c) => c.style === selectedStyle) ?? costings[0] ?? null;
  const selectedQty = selectedCosting ? qtyForCosting(selectedCosting) : 0;

  const avgMargin =
    costings.length === 0
      ? 0
      : costings.reduce((sum, c) => sum + costingMarginPct(c, qtyForCosting(c)), 0) / costings.length;

  const uncostedOrders = orders.filter((o) => !costings.some((c) => c.orderId === o.id));

  function openEdit(costing: Costing) {
    setForm({
      orderId: costing.orderId || orders.find((o) => o.style === costing.style)?.id || "",
      fabricName: costing.fabricName,
      garmentWeight: String(costing.garmentWeight),
      consumption: String(costing.consumption),
      fabricCost: String(costing.fabricCost),
      trimsCost: String(costing.trimsCost),
      cmCost: String(costing.cmCost),
      processingCost: String(costing.processingCost),
      commercialCost: String(costing.commercialCost),
      unitPrice: String(costing.unitPrice),
    });
    setEditCosting(costing);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === form.orderId);
    if (!order) return;
    const created = addCosting({
      orderId: order.id,
      buyer: order.buyer,
      style: order.style,
      fabricName: form.fabricName,
      garmentWeight: Number(form.garmentWeight) || 0,
      consumption: Number(form.consumption) || 0,
      fabricCost: Number(form.fabricCost) || 0,
      trimsCost: Number(form.trimsCost) || 0,
      cmCost: Number(form.cmCost) || 0,
      processingCost: Number(form.processingCost) || 0,
      commercialCost: Number(form.commercialCost) || 0,
      unitPrice: Number(form.unitPrice) || order.unitPrice,
      isFobLocked: false,
      paymentTerms: "LC",
      shipmentTerms: "FOB",
      quotations: [],
    });
    setAddOpen(false);
    setSelectedStyle(created.style);
  }

  function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editCosting) return;
    updateCosting(editCosting.id, {
      fabricName: form.fabricName,
      garmentWeight: Number(form.garmentWeight) || 0,
      consumption: Number(form.consumption) || 0,
      fabricCost: Number(form.fabricCost) || 0,
      trimsCost: Number(form.trimsCost) || 0,
      cmCost: Number(form.cmCost) || 0,
      processingCost: Number(form.processingCost) || 0,
      commercialCost: Number(form.commercialCost) || 0,
      unitPrice: Number(form.unitPrice) || 0,
    });
    setEditCosting(null);
  }

  function handleAddQuotation(e: FormEvent) {
    e.preventDefault();
    if (!selectedCosting) return;
    const newVersion = selectedCosting.quotations.length + 1;
    const newQuote = {
      version: newVersion,
      date: quoteForm.date || new Date().toISOString().slice(0, 10),
      offeredPrice: Number(quoteForm.offeredPrice) || 0,
      status: quoteForm.status as "Pending" | "Confirmed" | "Rejected",
      validUntil: quoteForm.validUntil,
      buyerFeedback: quoteForm.buyerFeedback,
    };
    updateCosting(selectedCosting.id, {
      quotations: [...selectedCosting.quotations, newQuote],
    });
    setAddQuotationOpen(false);
    setQuoteForm({ date: "", offeredPrice: "", validUntil: "", status: "Pending", buyerFeedback: "" });
  }

  function toggleFobLock(costing: Costing) {
    updateCosting(costing.id, { isFobLocked: !costing.isFobLocked });
  }

  const exportColumns = [
    { header: "Buyer", key: "buyer" },
    { header: "Style", key: "style" },
    { header: "Fabric", key: "fabricName" },
    { header: "Consumption (yd/pc)", key: "consumption" },
    { header: "Fabric Cost", key: "fabricCost" },
    { header: "Trims Cost", key: "trimsCost" },
    { header: "CM Cost", key: "cmCost" },
    { header: "Total Cost", key: "totalCost" },
    { header: "Unit Price", key: "unitPrice" },
    { header: "Margin %", key: "margin" },
  ];

  function exportRows() {
    return filteredCostings.map((c) => ({
      buyer: c.buyer,
      style: c.style,
      fabricName: c.fabricName,
      consumption: c.consumption,
      fabricCost: formatMoney(c.fabricCost),
      trimsCost: formatMoney(c.trimsCost),
      cmCost: formatMoney(c.cmCost),
      totalCost: formatMoney(costingTotal(c)),
      unitPrice: formatMoney(c.unitPrice),
      margin: `${costingMarginPct(c, qtyForCosting(c)).toFixed(1)}%`,
    }));
  }

  async function handleExportPdf() {
    await exportToPDF({ title: bn.costing.heading, subtitle: bn.costing.subtitle, columns: exportColumns, data: exportRows(), filename: "costing-consumption" });
  }

  async function handleExportExcel() {
    await exportToExcel({ columns: exportColumns, data: exportRows(), filename: "costing-consumption", sheetName: "Costing" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{bn.costing.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{bn.costing.subtitle}</p>
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
          <Button onClick={() => { setForm(emptyForm); setAddOpen(true); }} disabled={uncostedOrders.length === 0}>
            <Plus className="h-4 w-4" />
            New costing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile icon={<Layers className="h-5 w-5" />} label={bn.costing.costedStyles} value={formatNumber(costings.length)} tone="teal" />
        <KpiTile icon={<TrendingUp className="h-5 w-5" />} label={bn.costing.avgMargin} value={`${avgMargin.toFixed(1)}%`} tone="green" />
        <KpiTile
          icon={<Calculator className="h-5 w-5" />}
          label="Total costing value"
          value={formatMoney(costings.reduce((s, c) => s + costingTotal(c), 0))}
          tone="blue"
        />
        <KpiTile icon={<Layers className="h-5 w-5" />} label="Uncosted styles" value={formatNumber(uncostedOrders.length)} tone="amber" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-64">
            <Label>{bn.costing.selectStyle}</Label>
            <Select value={selectedCosting?.style ?? ""} onChange={(e) => setSelectedStyle(e.target.value)}>
              {costings.map((c) => (
                <option key={c.id} value={c.style}>
                  {c.buyer} — {c.style}
                </option>
              ))}
            </Select>
          </div>
          <div className="max-w-sm flex-1">
            <Label>{bn.costing.searchCosting}</Label>
            <Input icon={<Search className="h-4 w-4" />} placeholder={bn.costing.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <p className="ml-auto self-end text-xs text-slate-400 sm:pb-1">
            {bn.totalRecords}: {filteredCostings.length}
          </p>
        </CardContent>
      </Card>

      {/* Cost breakdown panel */}
      {selectedCosting && (
        <Card>
          <CardHeader>
            <CardTitle>
              {bn.costing.breakdown} — {selectedCosting.buyer} · {selectedCosting.style}
            </CardTitle>
            <p className="mt-0.5 text-xs text-slate-500">
              {bn.costing.fabricDetails}: {selectedCosting.fabricName} · {selectedCosting.garmentWeight}g · {selectedCosting.consumption} yd/pc
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <BreakdownTile label={bn.costing.fabricCost} value={formatMoney(selectedCosting.fabricCost)} />
              <BreakdownTile label={bn.costing.trimsCost} value={formatMoney(selectedCosting.trimsCost)} />
              <BreakdownTile label={bn.costing.cmCost} value={formatMoney(selectedCosting.cmCost)} />
              <BreakdownTile label="Processing Cost" value={formatMoney(selectedCosting.processingCost)} />
              <BreakdownTile label="Comm & Overhead" value={formatMoney(selectedCosting.commercialCost)} />
              <BreakdownTile label={bn.costing.totalCost} value={formatMoney(costingTotal(selectedCosting))} highlight />
              <BreakdownTile
                label={bn.costing.margin}
                value={`${costingMarginPct(selectedCosting, selectedQty).toFixed(1)}%`}
                highlight
                tone="green"
              />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">{bn.costing.unitPrice}</p>
                <p className="text-lg font-bold text-slate-800">{formatMoney(selectedCosting.unitPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Order quantity</p>
                <p className="text-lg font-bold text-slate-800">{formatNumber(selectedQty)} pcs</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => openEdit(selectedCosting)}>
                <Pencil className="h-3.5 w-3.5" />
                {bn.edit}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCosting && (
        <Card>
          <CardHeader>
            <CardTitle>Quotation &amp; Final FOB</CardTitle>
            <p className="mt-0.5 text-xs text-slate-500">Manage price offers, versioning, and lock the final FOB.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  FOB Status: {selectedCosting.isFobLocked ? <Badge tone="green">Locked</Badge> : <Badge tone="amber">Open</Badge>}
                </p>
                <p className="text-xs text-slate-500 mt-1">Payment: {selectedCosting.paymentTerms} | Shipment: {selectedCosting.shipmentTerms}</p>
              </div>
              <div>
                <Button variant={selectedCosting.isFobLocked ? "secondary" : "primary"} size="sm" onClick={() => toggleFobLock(selectedCosting)}>
                  {selectedCosting.isFobLocked ? <><Unlock className="h-3.5 w-3.5" /> Unlock FOB</> : <><Lock className="h-3.5 w-3.5" /> Lock Final FOB</>}
                </Button>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><History className="h-4 w-4" /> Quotation Versions</h4>
                {!selectedCosting.isFobLocked && (
                  <Button size="sm" variant="secondary" onClick={() => setAddQuotationOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Add Version
                  </Button>
                )}
              </div>
              {selectedCosting.quotations.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <p className="text-sm text-slate-500">No quotations created yet.</p>
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Offered Price</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Buyer Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCosting.quotations.map(q => (
                        <TableRow key={q.version}>
                          <TableCell className="font-semibold text-slate-800">V{q.version}</TableCell>
                          <TableCell className="text-slate-600">{q.date}</TableCell>
                          <TableCell className="font-semibold text-slate-800">{formatMoney(q.offeredPrice)}</TableCell>
                          <TableCell className="text-slate-600">{q.validUntil}</TableCell>
                          <TableCell>
                            <Badge tone={q.status === 'Confirmed' ? 'green' : q.status === 'Rejected' ? 'red' : 'amber'}>{q.status}</Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">{q.buyerFeedback || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        {filteredCostings.length === 0 ? (
          <EmptyState message={bn.noData} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Style Info</TableHead>
                <TableHead>Fabric Details</TableHead>
                <TableHead>Cost Breakdown</TableHead>
                <TableHead>Price &amp; Margin</TableHead>
                <TableHead className="text-right">{bn.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCostings.map((c) => {
                const qty = qtyForCosting(c);
                const margin = costingMarginPct(c, qty);
                return (
                  <TableRow key={c.id} className={c.style === selectedCosting?.style ? "bg-teal-50/50" : undefined}>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{c.buyer}</p>
                      <p className="text-xs text-slate-400">Style: {c.style}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-700">{c.fabricName}</p>
                      <p className="text-xs text-slate-400">
                        {c.garmentWeight}g · {c.consumption} yd/pc
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-500">Trims: {formatMoney(c.trimsCost)}</p>
                      <p className="text-xs text-slate-500">CM: {formatMoney(c.cmCost)}</p>
                      <p className="text-xs font-semibold text-slate-700">Total: {formatMoney(costingTotal(c))}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{formatMoney(c.unitPrice)}</p>
                      <Badge tone={margin >= 20 ? "green" : margin >= 10 ? "amber" : "red"}>{margin.toFixed(1)}% margin</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => setViewCosting(c)}>
                          <Eye className="h-3.5 w-3.5" />
                          {bn.view}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
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

      {/* Add costing modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New costing" size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <Label required>{bn.orders.style}</Label>
            <Select required value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}>
              <option value="">— Select a style —</option>
              {uncostedOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.buyer} — {o.style} ({o.product})
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>{bn.costing.fabricName}</Label>
              <Input required value={form.fabricName} onChange={(e) => setForm({ ...form, fabricName: e.target.value })} placeholder="Single Jersey 160 GSM" />
            </div>
            <div>
              <Label required>Garment Weight (g)</Label>
              <Input required type="number" min={0} value={form.garmentWeight} onChange={(e) => setForm({ ...form, garmentWeight: e.target.value })} placeholder="120" />
            </div>
            <div>
              <Label required>{bn.costing.consumption}</Label>
              <Input required type="number" min={0} step="0.01" value={form.consumption} onChange={(e) => setForm({ ...form, consumption: e.target.value })} placeholder="1.2" />
            </div>
            <div>
              <Label required>{bn.costing.unitPrice}</Label>
              <Input required type="number" min={0} step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder="3.85" />
            </div>
            <div>
              <Label required>{bn.costing.fabricCost} (total)</Label>
              <Input required type="number" min={0} value={form.fabricCost} onChange={(e) => setForm({ ...form, fabricCost: e.target.value })} placeholder="94020" />
            </div>
            <div>
              <Label required>{bn.costing.trimsCost} (total)</Label>
              <Input required type="number" min={0} value={form.trimsCost} onChange={(e) => setForm({ ...form, trimsCost: e.target.value })} placeholder="16800" />
            </div>
            <div>
              <Label required>{bn.costing.cmCost} (total)</Label>
              <Input required type="number" min={0} value={form.cmCost} onChange={(e) => setForm({ ...form, cmCost: e.target.value })} placeholder="52800" />
            </div>
            <div>
              <Label>Processing Cost (total)</Label>
              <Input type="number" min={0} value={form.processingCost} onChange={(e) => setForm({ ...form, processingCost: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label>Commercial & Overhead</Label>
              <Input type="number" min={0} value={form.commercialCost} onChange={(e) => setForm({ ...form, commercialCost: e.target.value })} placeholder="0" />
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

      {/* View costing modal */}
      <Modal
        open={!!viewCosting}
        onClose={() => setViewCosting(null)}
        title={viewCosting ? `${viewCosting.buyer} — ${viewCosting.style}` : ""}
        size="md"
      >
        {viewCosting && (
          <div className="grid grid-cols-2 gap-3">
            <ViewField label={bn.costing.fabricName} value={viewCosting.fabricName} />
            <ViewField label="Garment Weight" value={`${viewCosting.garmentWeight} g`} />
            <ViewField label={bn.costing.consumption} value={`${viewCosting.consumption} yd/pc`} />
            <ViewField label={bn.costing.fabricCost} value={formatMoney(viewCosting.fabricCost)} />
            <ViewField label={bn.costing.trimsCost} value={formatMoney(viewCosting.trimsCost)} />
            <ViewField label={bn.costing.cmCost} value={formatMoney(viewCosting.cmCost)} />
            <ViewField label="Processing Cost" value={formatMoney(viewCosting.processingCost)} />
            <ViewField label="Commercial & Overhead" value={formatMoney(viewCosting.commercialCost)} />
            <ViewField label={bn.costing.totalCost} value={formatMoney(costingTotal(viewCosting))} />
            <ViewField label={bn.costing.unitPrice} value={formatMoney(viewCosting.unitPrice)} />
            <ViewField label={bn.costing.margin} value={`${costingMarginPct(viewCosting, qtyForCosting(viewCosting)).toFixed(1)}%`} />
          </div>
        )}
      </Modal>

      {/* Update costing modal */}
      <Modal
        open={!!editCosting}
        onClose={() => setEditCosting(null)}
        title={editCosting ? `${bn.update} — ${editCosting.style}` : ""}
        size="lg"
      >
        {editCosting && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>{bn.costing.fabricName}</Label>
                <Input required value={form.fabricName} onChange={(e) => setForm({ ...form, fabricName: e.target.value })} />
              </div>
              <div>
                <Label required>Garment Weight (g)</Label>
                <Input required type="number" min={0} value={form.garmentWeight} onChange={(e) => setForm({ ...form, garmentWeight: e.target.value })} />
              </div>
              <div>
                <Label required>{bn.costing.consumption}</Label>
                <Input required type="number" min={0} step="0.01" value={form.consumption} onChange={(e) => setForm({ ...form, consumption: e.target.value })} />
              </div>
              <div>
                <Label required>{bn.costing.unitPrice}</Label>
                <Input required type="number" min={0} step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
              </div>
              <div>
                <Label required>{bn.costing.fabricCost} (total)</Label>
                <Input required type="number" min={0} value={form.fabricCost} onChange={(e) => setForm({ ...form, fabricCost: e.target.value })} />
              </div>
              <div>
                <Label required>{bn.costing.trimsCost} (total)</Label>
                <Input required type="number" min={0} value={form.trimsCost} onChange={(e) => setForm({ ...form, trimsCost: e.target.value })} />
              </div>
              <div>
                <Label required>{bn.costing.cmCost} (total)</Label>
                <Input required type="number" min={0} value={form.cmCost} onChange={(e) => setForm({ ...form, cmCost: e.target.value })} />
              </div>
              <div>
                <Label>Processing Cost (total)</Label>
                <Input type="number" min={0} value={form.processingCost} onChange={(e) => setForm({ ...form, processingCost: e.target.value })} />
              </div>
              <div>
                <Label>Commercial & Overhead</Label>
                <Input type="number" min={0} value={form.commercialCost} onChange={(e) => setForm({ ...form, commercialCost: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditCosting(null)}>
                {bn.cancel}
              </Button>
              <Button type="submit">{bn.save}</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Quotation modal */}
      <Modal open={addQuotationOpen} onClose={() => setAddQuotationOpen(false)} title="Add Quotation Version" size="md">
        <form onSubmit={handleAddQuotation} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Date</Label>
              <Input required type="date" value={quoteForm.date} onChange={(e) => setQuoteForm({ ...quoteForm, date: e.target.value })} />
            </div>
            <div>
              <Label required>Offered Price</Label>
              <Input required type="number" min={0} step="0.01" value={quoteForm.offeredPrice} onChange={(e) => setQuoteForm({ ...quoteForm, offeredPrice: e.target.value })} />
            </div>
            <div>
              <Label required>Valid Until</Label>
              <Input required type="date" value={quoteForm.validUntil} onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })} />
            </div>
            <div>
              <Label required>Status</Label>
              <Select required value={quoteForm.status} onChange={(e) => setQuoteForm({ ...quoteForm, status: e.target.value })}>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Buyer Feedback</Label>
              <Input value={quoteForm.buyerFeedback} onChange={(e) => setQuoteForm({ ...quoteForm, buyerFeedback: e.target.value })} placeholder="E.g., Price too high, target is $4.00" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddQuotationOpen(false)}>
              {bn.cancel}
            </Button>
            <Button type="submit">{bn.save}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function BreakdownTile({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "green";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        highlight
          ? tone === "green"
            ? "border-emerald-200 bg-emerald-50"
            : "border-teal-200 bg-teal-50"
          : "border-slate-100 bg-slate-50/60"
      }`}
    >
      <p className="text-[10px] uppercase text-slate-400">{label}</p>
      <p className={`text-sm font-bold ${highlight ? (tone === "green" ? "text-emerald-700" : "text-teal-700") : "text-slate-700"}`}>
        {value}
      </p>
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
  tone: "teal" | "green" | "blue" | "amber";
}) {
  const toneClasses: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
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
