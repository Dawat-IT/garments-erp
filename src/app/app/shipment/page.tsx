"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  CheckCircle2,
  Container,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Package,
  Pencil,
  Plus,
  Search,
  Ship,
  Trash2,
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
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { toast } from "@/components/ui/Toast";
import { useErpRecords } from "@/hooks/useErpRecords";
import type { CustomsStatus, PackingJob, Shipment, ShipmentDocuments, ShipmentMode, ShipmentStatus } from "@/lib/types";
import { exportCommercialInvoicePdf, exportToExcel, exportToPdf, type PdfColumn } from "@/lib/export";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const SHIP_TABS = [
  { value: "plan", label: "Shipment Plan" },
  { value: "packing", label: "Packing List" },
  { value: "carton", label: "Cartons" },
  { value: "export", label: "Export Docs" },
];

const MODES: ShipmentMode[] = ["SEA", "AIR"];
const STATUSES: ShipmentStatus[] = ["prepared", "submitted", "approved", "shipped"];
const CUSTOMS: CustomsStatus[] = ["Pending", "Under Review", "Cleared"];

const DOCUMENT_FIELDS: { key: keyof ShipmentDocuments; label: string }[] = [
  { key: "invoice", label: "Commercial Invoice" },
  { key: "packing", label: "Packing List" },
  { key: "exp", label: "EXP Form" },
  { key: "coo", label: "Certificate of Origin (CoO)" },
  { key: "bl", label: "Bill of Lading (B/L)" },
  { key: "gsp", label: "GSP Certificate" },
  { key: "buyer", label: "Buyer Nominated Docs" },
];

function shipmentStatusTone(status: ShipmentStatus) {
  if (status === "shipped") return "success" as const;
  if (status === "approved") return "info" as const;
  if (status === "submitted") return "warning" as const;
  return "neutral" as const;
}

type ShipmentFormState = {
  orderId: string;
  orderQty: string;
  packedQty: string;
  cartons: string;
  shipDate: string;
  forwarder: string;
  mode: ShipmentMode;
  status: ShipmentStatus;
  customsStatus: CustomsStatus;
};

const emptyShipmentForm: ShipmentFormState = {
  orderId: "",
  orderQty: "",
  packedQty: "",
  cartons: "",
  shipDate: "",
  forwarder: "",
  mode: "SEA",
  status: "prepared",
  customsStatus: "Pending",
};

type PackingFormState = {
  orderId: string;
  color: string;
  size: string;
  cartons: string;
  packed: string;
  ready: string;
  date: string;
};

const emptyPackingForm: PackingFormState = {
  orderId: "",
  color: "",
  size: "",
  cartons: "",
  packed: "",
  ready: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function ShipmentPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-ink-400">Loading shipment console…</div>}>
      <ShipmentContent />
    </Suspense>
  );
}

function ShipmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = ["packing", "carton", "export"].includes(tabParam ?? "") ? (tabParam as string) : "plan";

  const {
    data,
    addShipment,
    updateShipment,
    deleteShipment,
    toggleShipmentDocument,
    addPackingJob,
    updatePackingJob,
    deletePackingJob,
  } = useErpRecords();
  const { shipments, packingJobs, orders, buyers } = data;

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addShipmentOpen, setAddShipmentOpen] = useState(false);
  const [editShipmentRecord, setEditShipmentRecord] = useState<Shipment | null>(null);
  const [viewShipmentRecord, setViewShipmentRecord] = useState<Shipment | null>(null);
  const [shipmentForm, setShipmentForm] = useState<ShipmentFormState>(emptyShipmentForm);

  const [addPackingOpen, setAddPackingOpen] = useState(false);
  const [editPackingRecord, setEditPackingRecord] = useState<PackingJob | null>(null);
  const [packingForm, setPackingForm] = useState<PackingFormState>(emptyPackingForm);

  const [selectedShipmentId, setSelectedShipmentId] = useState<string>("");

  function setTab(tab: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (tab === "plan") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(`/app/shipment${query ? `?${query}` : ""}`, { scroll: false });
  }

  const kpis = useMemo(() => {
    const totalCartons = shipments.reduce((s, sh) => s + sh.cartons, 0);
    const shippedCount = shipments.filter((s) => s.status === "shipped").length;
    const pendingDocs = shipments.filter((s) => Object.values(s.documents).some((v) => !v)).length;
    return { total: shipments.length, totalCartons, shippedCount, pendingDocs };
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shipments.filter((s) => {
      const matchesSearch =
        !q || s.poNumber.toLowerCase().includes(q) || s.buyerName.toLowerCase().includes(q) || s.style.toLowerCase().includes(q) || s.forwarder.toLowerCase().includes(q);
      const matchesMode = modeFilter === "all" || s.mode === modeFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [shipments, search, modeFilter, statusFilter]);

  const filteredPackingJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return packingJobs.filter(
      (p) =>
        !q ||
        p.poNumber.toLowerCase().includes(q) ||
        p.buyerName.toLowerCase().includes(q) ||
        p.style.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q)
    );
  }, [packingJobs, search]);

  const cartonRows = useMemo(() => {
    type Row = {
      orderId: string;
      poNumber: string;
      buyerName: string;
      style: string;
      packingCartons: number;
      packingPacked: number;
      shipmentCartons: number;
      shipmentPacked: number;
      mode: string;
      status: string;
    };
    const map = new Map<string, Row>();
    packingJobs.forEach((p) => {
      if (!map.has(p.orderId)) {
        map.set(p.orderId, {
          orderId: p.orderId,
          poNumber: p.poNumber,
          buyerName: p.buyerName,
          style: p.style,
          packingCartons: 0,
          packingPacked: 0,
          shipmentCartons: 0,
          shipmentPacked: 0,
          mode: "—",
          status: "Not booked",
        });
      }
      const row = map.get(p.orderId)!;
      row.packingCartons += p.cartons;
      row.packingPacked += p.packed;
    });
    shipments.forEach((s) => {
      if (!map.has(s.orderId)) {
        map.set(s.orderId, {
          orderId: s.orderId,
          poNumber: s.poNumber,
          buyerName: s.buyerName,
          style: s.style,
          packingCartons: 0,
          packingPacked: 0,
          shipmentCartons: 0,
          shipmentPacked: 0,
          mode: s.mode,
          status: s.status,
        });
      }
      const row = map.get(s.orderId)!;
      row.shipmentCartons += s.cartons;
      row.shipmentPacked += s.packedQty;
      row.mode = s.mode;
      row.status = s.status;
    });
    return Array.from(map.values());
  }, [packingJobs, shipments]);

  const cartonKpis = useMemo(() => {
    const totalPacking = cartonRows.reduce((s, r) => s + r.packingCartons, 0);
    const totalShipment = cartonRows.reduce((s, r) => s + r.shipmentCartons, 0);
    const mismatches = cartonRows.filter((r) => r.packingCartons > 0 && r.shipmentCartons > 0 && r.packingCartons !== r.shipmentCartons).length;
    const avgPcsPerCarton = totalShipment ? cartonRows.reduce((s, r) => s + r.shipmentPacked, 0) / totalShipment : 0;
    return { totalPacking, totalShipment, mismatches, avgPcsPerCarton };
  }, [cartonRows]);

  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId) ?? shipments[0] ?? null;
  const selectedOrder = selectedShipment ? orders.find((o) => o.id === selectedShipment.orderId) : undefined;
  const selectedBuyer = selectedShipment ? buyers.find((b) => b.name === selectedShipment.buyerName) : undefined;
  const selectedShipmentPacking = selectedShipment ? packingJobs.filter((p) => p.orderId === selectedShipment.orderId) : [];

  const docsCompletion = selectedShipment
    ? (Object.values(selectedShipment.documents).filter(Boolean).length / DOCUMENT_FIELDS.length) * 100
    : 0;

  /* ---------------------------- Shipment CRUD ---------------------------- */

  function openAddShipment() {
    setShipmentForm(emptyShipmentForm);
    setAddShipmentOpen(true);
  }

  function openEditShipment(shipment: Shipment) {
    setShipmentForm({
      orderId: shipment.orderId,
      orderQty: String(shipment.orderQty),
      packedQty: String(shipment.packedQty),
      cartons: String(shipment.cartons),
      shipDate: shipment.shipDate,
      forwarder: shipment.forwarder,
      mode: shipment.mode,
      status: shipment.status,
      customsStatus: shipment.customsStatus,
    });
    setEditShipmentRecord(shipment);
  }

  function handleAddShipmentSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === shipmentForm.orderId);
    if (!order) {
      toast.error("Select an order", "Choose the PO / style this shipment is for.");
      return;
    }
    addShipment({
      orderId: order.id,
      poNumber: order.poNumber,
      buyerName: order.buyerName,
      style: order.style,
      orderQty: Number(shipmentForm.orderQty) || order.quantity,
      packedQty: Number(shipmentForm.packedQty) || 0,
      cartons: Number(shipmentForm.cartons) || 0,
      shipDate: shipmentForm.shipDate || order.shipDate,
      forwarder: shipmentForm.forwarder || "TBD",
      mode: shipmentForm.mode,
      status: shipmentForm.status,
      customsStatus: shipmentForm.customsStatus,
      documents: { invoice: false, packing: false, exp: false, coo: false, bl: false, gsp: false, buyer: false },
    });
    toast.success("Shipment created", `${order.buyerName} — ${order.poNumber} added to shipment plan.`);
    setAddShipmentOpen(false);
  }

  function handleEditShipmentSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editShipmentRecord) return;
    updateShipment(editShipmentRecord.id, {
      orderQty: Number(shipmentForm.orderQty) || editShipmentRecord.orderQty,
      packedQty: Number(shipmentForm.packedQty) || 0,
      cartons: Number(shipmentForm.cartons) || 0,
      shipDate: shipmentForm.shipDate,
      forwarder: shipmentForm.forwarder,
      mode: shipmentForm.mode,
      status: shipmentForm.status,
      customsStatus: shipmentForm.customsStatus,
    });
    toast.success("Shipment updated");
    setEditShipmentRecord(null);
  }

  function handleDeleteShipment(shipment: Shipment) {
    if (!window.confirm(`Delete shipment ${shipment.poNumber}?`)) return;
    deleteShipment(shipment.id);
    if (selectedShipmentId === shipment.id) setSelectedShipmentId("");
    toast.success("Shipment deleted");
  }

  /* ---------------------------- Packing CRUD ---------------------------- */

  function openAddPacking() {
    setPackingForm(emptyPackingForm);
    setAddPackingOpen(true);
  }

  function openEditPacking(job: PackingJob) {
    setPackingForm({
      orderId: job.orderId,
      color: job.color,
      size: job.size,
      cartons: String(job.cartons),
      packed: String(job.packed),
      ready: String(job.ready),
      date: job.date,
    });
    setEditPackingRecord(job);
  }

  function handleAddPackingSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === packingForm.orderId);
    if (!order) {
      toast.error("Select an order", "Choose the PO / style being packed.");
      return;
    }
    addPackingJob({
      orderId: order.id,
      poNumber: order.poNumber,
      buyerName: order.buyerName,
      style: order.style,
      color: packingForm.color,
      size: packingForm.size,
      cartons: Number(packingForm.cartons) || 0,
      packed: Number(packingForm.packed) || 0,
      ready: Number(packingForm.ready) || 0,
      date: packingForm.date,
    });
    toast.success("Packing record added");
    setAddPackingOpen(false);
  }

  function handleEditPackingSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editPackingRecord) return;
    updatePackingJob(editPackingRecord.id, {
      color: packingForm.color,
      size: packingForm.size,
      cartons: Number(packingForm.cartons) || 0,
      packed: Number(packingForm.packed) || 0,
      ready: Number(packingForm.ready) || 0,
      date: packingForm.date,
    });
    toast.success("Packing record updated");
    setEditPackingRecord(null);
  }

  function handleDeletePacking(job: PackingJob) {
    if (!window.confirm(`Delete packing record for ${job.poNumber} (${job.color} / ${job.size})?`)) return;
    deletePackingJob(job.id);
    toast.success("Packing record deleted");
  }

  /* ---------------------------- Export helpers ---------------------------- */

  function exportShipmentPlan() {
    const headers = ["Buyer", "PO Number", "Style", "Order Qty", "Packed Qty", "Cartons", "Ship Date", "Forwarder", "Mode", "Status", "Customs"];
    const rows = filteredShipments.map((s) => ({
      Buyer: s.buyerName,
      "PO Number": s.poNumber,
      Style: s.style,
      "Order Qty": s.orderQty,
      "Packed Qty": s.packedQty,
      Cartons: s.cartons,
      "Ship Date": formatDate(s.shipDate),
      Forwarder: s.forwarder,
      Mode: s.mode,
      Status: s.status,
      Customs: s.customsStatus,
    }));
    const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
    exportToPdf("Shipment Plan", columns, rows, "shipment-plan", { subtitle: "Dawat RMG SOFT — Shipment booking overview" });
    exportToExcel("shipment-plan", rows, "Shipment Plan");
  }

  function exportPackingList() {
    const rows = filteredPackingJobs.map((p) => ({
      Buyer: p.buyerName,
      "PO Number": p.poNumber,
      Style: p.style,
      Color: p.color,
      Size: p.size,
      Cartons: p.cartons,
      Packed: p.packed,
      Ready: p.ready,
      Date: formatDate(p.date),
    }));
    exportToExcel("packing-list", rows, "Packing List");
    toast.success("Packing list exported", "packing-list.xlsx has been downloaded.");
  }

  function exportPackingListPdf() {
    const headers = ["Buyer", "PO Number", "Style", "Color", "Size", "Cartons", "Packed", "Ready", "Date"];
    const rows = filteredPackingJobs.map((p) => ({
      Buyer: p.buyerName,
      "PO Number": p.poNumber,
      Style: p.style,
      Color: p.color,
      Size: p.size,
      Cartons: p.cartons,
      Packed: p.packed,
      Ready: p.ready,
      Date: formatDate(p.date),
    }));
    const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
    exportToPdf("Packing List", columns, rows, "packing-list", { subtitle: "Dawat RMG SOFT — Pre-shipment packing list" });
  }

  function exportCartonReport() {
    const headers = ["Buyer", "PO Number", "Style", "Packing Cartons", "Shipment Cartons", "Packed Qty", "Mode", "Status"];
    const rows = cartonRows.map((r) => ({
      Buyer: r.buyerName,
      "PO Number": r.poNumber,
      Style: r.style,
      "Packing Cartons": r.packingCartons,
      "Shipment Cartons": r.shipmentCartons,
      "Packed Qty": r.shipmentPacked || r.packingPacked,
      Mode: r.mode,
      Status: r.status,
    }));
    const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
    exportToPdf("Carton Reconciliation", columns, rows, "carton-report", { subtitle: "Packing vs. shipment carton counts" });
    exportToExcel("carton-report", rows, "Cartons");
  }

  function handleGenerateInvoice() {
    if (!selectedShipment) return;
    const order = selectedOrder;
    const buyer = selectedBuyer;
    exportCommercialInvoicePdf(
      {
        invoiceNo: `INV-${selectedShipment.poNumber}`,
        invoiceDate: new Date().toISOString().slice(0, 10),
        poNumber: selectedShipment.poNumber,
        buyerName: selectedShipment.buyerName,
        buyerAddress: buyer?.address ?? `${buyer?.country ?? "Buyer address on file"}`,
        consignee: buyer ? `${buyer.company}\n${buyer.address}` : undefined,
        shipmentMode: selectedShipment.mode === "SEA" ? "Sea Freight (FCL/LCL)" : "Air Freight",
        cartons: selectedShipment.cartons,
        portOfLoading: "Chittagong, Bangladesh",
        portOfDischarge: buyer?.country ? `Main Port, ${buyer.country}` : undefined,
        countryOfOrigin: "Bangladesh",
        countryOfFinalDestination: buyer?.country,
        paymentTerms: order?.paymentStatus === "paid" ? "Paid in advance" : "T/T 30 days after B/L date",
        currency: "USD",
        items: [
          {
            description: order ? `${order.productName} — ${order.colorway}` : `${selectedShipment.style} garments`,
            hsCode: "6109.10",
            quantity: selectedShipment.packedQty,
            unit: "pcs",
            unitPrice: order?.unitPrice ?? 0,
          },
        ],
        bankDetails: [
          "Bank: Standard Chartered Bank, Gulshan Branch, Dhaka",
          "Account Name: DAWAT GARMENTS LTD.",
          "Account No: 01-1234567-01",
          "SWIFT Code: SCBLBDDX",
          "Routing No: 231-267-891",
        ],
      },
      `commercial-invoice-${selectedShipment.poNumber}`
    );
    toast.success("Invoice generated", `Commercial invoice for ${selectedShipment.poNumber} downloaded.`);
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow="Logistics"
        title="Shipment"
        subtitle="Shipment planning, packing lists, carton reconciliation and export documentation."
        actions={
          activeTab === "plan" ? (
            <Button onClick={openAddShipment} leftIcon={<Plus className="h-4 w-4" />}>
              New Shipment
            </Button>
          ) : activeTab === "packing" ? (
            <Button onClick={openAddPacking} leftIcon={<Plus className="h-4 w-4" />}>
              New Packing Record
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Shipments" value={formatNumber(kpis.total)} icon={Ship} hint="all bookings" accent="teal" />
        <KpiCard label="Shipped" value={formatNumber(kpis.shippedCount)} icon={CheckCircle2} hint="ex-factory complete" accent="teal" />
        <KpiCard label="Total Cartons" value={formatNumber(kpis.totalCartons)} icon={Box} hint="across all shipments" accent="accent" />
        <KpiCard label="Docs Pending" value={formatNumber(kpis.pendingDocs)} icon={FileText} hint="shipments missing a document" invertTone accent="accent" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={activeTab} onChange={setTab} items={SHIP_TABS} />
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "plan" && (
            <>
              <Button variant="outline" onClick={exportShipmentPlan} leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
                Excel
              </Button>
              <Button variant="outline" onClick={exportShipmentPlan} leftIcon={<Download className="h-4 w-4" />}>
                PDF
              </Button>
            </>
          )}
          {activeTab === "packing" && (
            <>
              <Button variant="outline" onClick={exportPackingList} leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
                Excel Packing List
              </Button>
              <Button variant="outline" onClick={exportPackingListPdf} leftIcon={<Download className="h-4 w-4" />}>
                PDF
              </Button>
            </>
          )}
          {activeTab === "carton" && (
            <Button variant="outline" onClick={exportCartonReport} leftIcon={<Download className="h-4 w-4" />}>
              Export Carton Report
            </Button>
          )}
        </div>
      </div>

      {activeTab === "plan" && (
        <>
          <Card>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="max-w-sm flex-1">
                <Label className="sr-only">Search</Label>
                <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search PO, buyer, style, forwarder…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="w-full sm:w-40">
                <Select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} options={[{ value: "all", label: "All Modes" }, ...MODES.map((m) => ({ value: m, label: m }))]} />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[{ value: "all", label: "All Statuses" }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
                />
              </div>
              <p className="ml-auto text-xs text-ink-400">{filteredShipments.length} shipments</p>
            </CardContent>
          </Card>

          <Card>
            {filteredShipments.length === 0 ? (
              <EmptyState title="No shipments found" subtitle="No shipments match the selected filters." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Qty / Cartons</TableHead>
                    <TableHead>Ship Date / Forwarder</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Customs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-800">{shipment.buyerName}</p>
                        <p className="text-xs text-slate-500">PO: {shipment.poNumber}</p>
                        <p className="text-xs text-slate-400">Style: {shipment.style}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-700">{formatNumber(shipment.packedQty)} / {formatNumber(shipment.orderQty)} pcs</p>
                        <p className="text-xs text-slate-400">{formatNumber(shipment.cartons)} cartons</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-700">{formatDate(shipment.shipDate)}</p>
                        <p className="text-xs text-slate-400">{shipment.forwarder}</p>
                      </TableCell>
                      <TableCell>
                        <Badge tone="neutral">{shipment.mode}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={shipment.status} tone={shipmentStatusTone(shipment.status)} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={shipment.customsStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => setViewShipmentRecord(shipment)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditShipment(shipment)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteShipment(shipment)}>
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
        </>
      )}

      {activeTab === "packing" && (
        <>
          <Card>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="max-w-sm flex-1">
                <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search PO, buyer, style, color…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <p className="ml-auto text-xs text-ink-400">{filteredPackingJobs.length} packing records</p>
            </CardContent>
          </Card>
          <Card>
            {filteredPackingJobs.length === 0 ? (
              <EmptyState title="No packing records" subtitle="No packing list entries match your search." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Color / Size</TableHead>
                    <TableHead>Cartons</TableHead>
                    <TableHead>Packed / Ready</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackingJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-800">{job.buyerName}</p>
                        <p className="text-xs text-slate-500">PO: {job.poNumber}</p>
                        <p className="text-xs text-slate-400">Style: {job.style}</p>
                      </TableCell>
                      <TableCell>
                        {job.color} / {job.size}
                      </TableCell>
                      <TableCell>{formatNumber(job.cartons)}</TableCell>
                      <TableCell>
                        <p className="text-slate-700">{formatNumber(job.packed)} packed</p>
                        <p className="text-xs text-slate-400">{formatNumber(job.ready)} ready</p>
                      </TableCell>
                      <TableCell>{formatDate(job.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => openEditPacking(job)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeletePacking(job)}>
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
        </>
      )}

      {activeTab === "carton" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Cartons Packed" value={formatNumber(cartonKpis.totalPacking)} icon={Package} accent="teal" />
            <KpiCard label="Cartons Booked" value={formatNumber(cartonKpis.totalShipment)} icon={Container} accent="teal" />
            <KpiCard label="Avg Pcs / Carton" value={cartonKpis.avgPcsPerCarton.toFixed(1)} icon={Box} accent="accent" />
            <KpiCard label="Reconciliation Gaps" value={formatNumber(cartonKpis.mismatches)} icon={FileText} invertTone accent="accent" />
          </div>
          <Card>
            {cartonRows.length === 0 ? (
              <EmptyState title="No carton data" subtitle="Add packing records or shipments to see carton reconciliation." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Packing Cartons</TableHead>
                    <TableHead>Shipment Cartons</TableHead>
                    <TableHead>Packed Qty</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartonRows.map((row) => {
                    const mismatch = row.packingCartons > 0 && row.shipmentCartons > 0 && row.packingCartons !== row.shipmentCartons;
                    return (
                      <TableRow key={row.orderId}>
                        <TableCell>
                          <p className="font-semibold text-slate-800">{row.buyerName}</p>
                          <p className="text-xs text-slate-500">PO: {row.poNumber}</p>
                          <p className="text-xs text-slate-400">Style: {row.style}</p>
                        </TableCell>
                        <TableCell>{formatNumber(row.packingCartons)}</TableCell>
                        <TableCell>
                          {formatNumber(row.shipmentCartons)}
                          {mismatch && <Badge tone="warning" className="ml-2">mismatch</Badge>}
                        </TableCell>
                        <TableCell>{formatNumber(row.shipmentPacked || row.packingPacked)}</TableCell>
                        <TableCell>{row.mode}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}

      {activeTab === "export" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Select Shipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedShipment?.id ?? ""}
                onChange={(e) => setSelectedShipmentId(e.target.value)}
                options={shipments.map((s) => ({ value: s.id, label: `${s.buyerName} — ${s.poNumber}` }))}
                placeholder="Select a shipment"
              />
              {selectedShipment && (
                <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/60 p-4 text-sm">
                  <p className="font-semibold text-slate-800">{selectedShipment.buyerName} — {selectedShipment.style}</p>
                  <p className="text-xs text-slate-500">PO: {selectedShipment.poNumber}</p>
                  <p className="text-xs text-slate-500">Mode: {selectedShipment.mode} · Forwarder: {selectedShipment.forwarder}</p>
                  <p className="text-xs text-slate-500">Ship Date: {formatDate(selectedShipment.shipDate)}</p>
                  <p className="text-xs text-slate-500">Cartons: {formatNumber(selectedShipment.cartons)} · Packed Qty: {formatNumber(selectedShipment.packedQty)}</p>
                  {selectedOrder && (
                    <p className="text-xs text-slate-500">Unit Price: {formatCurrency(selectedOrder.unitPrice, { decimals: 2 })} · Invoice Value: {formatCurrency(selectedShipment.packedQty * selectedOrder.unitPrice)}</p>
                  )}
                </div>
              )}
              <div className="pt-2">
                <div className="mb-1.5 flex items-center justify-between text-xs text-ink-500">
                  <span>Document Completion</span>
                  <span className="font-semibold text-ink-700">{docsCompletion.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${docsCompletion === 100 ? "bg-emerald-500" : "bg-accent-500"}`} style={{ width: `${docsCompletion}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={handleGenerateInvoice} disabled={!selectedShipment} leftIcon={<FileText className="h-4 w-4" />}>
                  Generate Commercial Invoice (PDF)
                </Button>
                <Button
                  variant="outline"
                  disabled={!selectedShipment || selectedShipmentPacking.length === 0}
                  onClick={() => {
                    const rows = selectedShipmentPacking.map((p) => ({
                      Color: p.color,
                      Size: p.size,
                      Cartons: p.cartons,
                      Packed: p.packed,
                      Ready: p.ready,
                      Date: formatDate(p.date),
                    }));
                    exportToExcel(`packing-list-${selectedShipment?.poNumber ?? "shipment"}`, rows, "Packing List");
                    toast.success("Packing list exported");
                  }}
                  leftIcon={<FileSpreadsheet className="h-4 w-4" />}
                >
                  Export Packing List (Excel)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Document Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedShipment ? (
                <EmptyState title="No shipment selected" subtitle="Select a shipment to manage its export documents." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {DOCUMENT_FIELDS.map((doc) => {
                    const ready = selectedShipment.documents[doc.key];
                    return (
                      <div key={doc.key} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${ready ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                          <p className="text-sm font-medium text-slate-700">{doc.label}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge tone={ready ? "success" : "warning"}>{ready ? "Ready" : "Pending"}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleShipmentDocument(selectedShipment.id, doc.key)}
                          >
                            Mark {ready ? "Pending" : "Ready"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add shipment modal */}
      <Modal open={addShipmentOpen} onClose={() => setAddShipmentOpen(false)} title="New Shipment" size="lg">
        <form onSubmit={handleAddShipmentSubmit} className="space-y-4">
          <div>
            <Label required>Order / Style</Label>
            <Select
              required
              value={shipmentForm.orderId}
              onChange={(e) => {
                const order = orders.find((o) => o.id === e.target.value);
                setShipmentForm({
                  ...shipmentForm,
                  orderId: e.target.value,
                  orderQty: order ? String(order.quantity) : shipmentForm.orderQty,
                  shipDate: order?.shipDate ?? shipmentForm.shipDate,
                });
              }}
              placeholder="Select PO / style"
              options={orders.map((o) => ({ value: o.id, label: `${o.buyerName} — ${o.poNumber} (${o.style})` }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Order Qty</Label>
              <Input required type="number" min={0} value={shipmentForm.orderQty} onChange={(e) => setShipmentForm({ ...shipmentForm, orderQty: e.target.value })} />
            </div>
            <div>
              <Label required>Packed Qty</Label>
              <Input required type="number" min={0} value={shipmentForm.packedQty} onChange={(e) => setShipmentForm({ ...shipmentForm, packedQty: e.target.value })} />
            </div>
            <div>
              <Label required>Cartons</Label>
              <Input required type="number" min={0} value={shipmentForm.cartons} onChange={(e) => setShipmentForm({ ...shipmentForm, cartons: e.target.value })} />
            </div>
            <div>
              <Label required>Ship Date</Label>
              <Input required type="date" value={shipmentForm.shipDate} onChange={(e) => setShipmentForm({ ...shipmentForm, shipDate: e.target.value })} />
            </div>
            <div>
              <Label required>Forwarder</Label>
              <Input required value={shipmentForm.forwarder} onChange={(e) => setShipmentForm({ ...shipmentForm, forwarder: e.target.value })} placeholder="Kuehne+Nagel Dhaka" />
            </div>
            <div>
              <Label required>Mode</Label>
              <Select required value={shipmentForm.mode} onChange={(e) => setShipmentForm({ ...shipmentForm, mode: e.target.value as ShipmentMode })} options={MODES.map((m) => ({ value: m, label: m }))} />
            </div>
            <div>
              <Label required>Status</Label>
              <Select required value={shipmentForm.status} onChange={(e) => setShipmentForm({ ...shipmentForm, status: e.target.value as ShipmentStatus })} options={STATUSES.map((s) => ({ value: s, label: s }))} />
            </div>
            <div>
              <Label required>Customs Status</Label>
              <Select
                required
                value={shipmentForm.customsStatus}
                onChange={(e) => setShipmentForm({ ...shipmentForm, customsStatus: e.target.value as CustomsStatus })}
                options={CUSTOMS.map((c) => ({ value: c, label: c }))}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddShipmentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Shipment</Button>
          </div>
        </form>
      </Modal>

      {/* View shipment modal */}
      <Modal
        open={!!viewShipmentRecord}
        onClose={() => setViewShipmentRecord(null)}
        title={viewShipmentRecord ? `${viewShipmentRecord.buyerName} — ${viewShipmentRecord.poNumber}` : ""}
        description={viewShipmentRecord?.style}
        size="lg"
      >
        {viewShipmentRecord && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ViewField label="Order Qty" value={formatNumber(viewShipmentRecord.orderQty)} />
            <ViewField label="Packed Qty" value={formatNumber(viewShipmentRecord.packedQty)} />
            <ViewField label="Cartons" value={formatNumber(viewShipmentRecord.cartons)} />
            <ViewField label="Ship Date" value={formatDate(viewShipmentRecord.shipDate)} />
            <ViewField label="Forwarder" value={viewShipmentRecord.forwarder} />
            <ViewField label="Mode" value={viewShipmentRecord.mode} />
            <ViewField label="Status" value={viewShipmentRecord.status} />
            <ViewField label="Customs" value={viewShipmentRecord.customsStatus} />
          </div>
        )}
      </Modal>

      {/* Edit shipment modal */}
      <Modal open={!!editShipmentRecord} onClose={() => setEditShipmentRecord(null)} title={editShipmentRecord ? `Update — ${editShipmentRecord.poNumber}` : ""} size="lg">
        {editShipmentRecord && (
          <form onSubmit={handleEditShipmentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>Order Qty</Label>
                <Input required type="number" min={0} value={shipmentForm.orderQty} onChange={(e) => setShipmentForm({ ...shipmentForm, orderQty: e.target.value })} />
              </div>
              <div>
                <Label required>Packed Qty</Label>
                <Input required type="number" min={0} value={shipmentForm.packedQty} onChange={(e) => setShipmentForm({ ...shipmentForm, packedQty: e.target.value })} />
              </div>
              <div>
                <Label required>Cartons</Label>
                <Input required type="number" min={0} value={shipmentForm.cartons} onChange={(e) => setShipmentForm({ ...shipmentForm, cartons: e.target.value })} />
              </div>
              <div>
                <Label required>Ship Date</Label>
                <Input required type="date" value={shipmentForm.shipDate} onChange={(e) => setShipmentForm({ ...shipmentForm, shipDate: e.target.value })} />
              </div>
              <div>
                <Label required>Forwarder</Label>
                <Input required value={shipmentForm.forwarder} onChange={(e) => setShipmentForm({ ...shipmentForm, forwarder: e.target.value })} />
              </div>
              <div>
                <Label required>Mode</Label>
                <Select required value={shipmentForm.mode} onChange={(e) => setShipmentForm({ ...shipmentForm, mode: e.target.value as ShipmentMode })} options={MODES.map((m) => ({ value: m, label: m }))} />
              </div>
              <div>
                <Label required>Status</Label>
                <Select required value={shipmentForm.status} onChange={(e) => setShipmentForm({ ...shipmentForm, status: e.target.value as ShipmentStatus })} options={STATUSES.map((s) => ({ value: s, label: s }))} />
              </div>
              <div>
                <Label required>Customs Status</Label>
                <Select
                  required
                  value={shipmentForm.customsStatus}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, customsStatus: e.target.value as CustomsStatus })}
                  options={CUSTOMS.map((c) => ({ value: c, label: c }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditShipmentRecord(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add packing modal */}
      <Modal open={addPackingOpen} onClose={() => setAddPackingOpen(false)} title="New Packing Record" size="lg">
        <form onSubmit={handleAddPackingSubmit} className="space-y-4">
          <div>
            <Label required>Order / Style</Label>
            <Select
              required
              value={packingForm.orderId}
              onChange={(e) => setPackingForm({ ...packingForm, orderId: e.target.value })}
              placeholder="Select PO / style"
              options={orders.map((o) => ({ value: o.id, label: `${o.buyerName} — ${o.poNumber} (${o.style})` }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Color</Label>
              <Input required value={packingForm.color} onChange={(e) => setPackingForm({ ...packingForm, color: e.target.value })} placeholder="Royal Blue" />
            </div>
            <div>
              <Label required>Size</Label>
              <Input required value={packingForm.size} onChange={(e) => setPackingForm({ ...packingForm, size: e.target.value })} placeholder="M" />
            </div>
            <div>
              <Label required>Cartons</Label>
              <Input required type="number" min={0} value={packingForm.cartons} onChange={(e) => setPackingForm({ ...packingForm, cartons: e.target.value })} />
            </div>
            <div>
              <Label required>Packed Qty</Label>
              <Input required type="number" min={0} value={packingForm.packed} onChange={(e) => setPackingForm({ ...packingForm, packed: e.target.value })} />
            </div>
            <div>
              <Label required>Ready Qty</Label>
              <Input required type="number" min={0} value={packingForm.ready} onChange={(e) => setPackingForm({ ...packingForm, ready: e.target.value })} />
            </div>
            <div>
              <Label required>Date</Label>
              <Input required type="date" value={packingForm.date} onChange={(e) => setPackingForm({ ...packingForm, date: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddPackingOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Record</Button>
          </div>
        </form>
      </Modal>

      {/* Edit packing modal */}
      <Modal open={!!editPackingRecord} onClose={() => setEditPackingRecord(null)} title={editPackingRecord ? `Update — ${editPackingRecord.poNumber}` : ""} size="lg">
        {editPackingRecord && (
          <form onSubmit={handleEditPackingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>Color</Label>
                <Input required value={packingForm.color} onChange={(e) => setPackingForm({ ...packingForm, color: e.target.value })} />
              </div>
              <div>
                <Label required>Size</Label>
                <Input required value={packingForm.size} onChange={(e) => setPackingForm({ ...packingForm, size: e.target.value })} />
              </div>
              <div>
                <Label required>Cartons</Label>
                <Input required type="number" min={0} value={packingForm.cartons} onChange={(e) => setPackingForm({ ...packingForm, cartons: e.target.value })} />
              </div>
              <div>
                <Label required>Packed Qty</Label>
                <Input required type="number" min={0} value={packingForm.packed} onChange={(e) => setPackingForm({ ...packingForm, packed: e.target.value })} />
              </div>
              <div>
                <Label required>Ready Qty</Label>
                <Input required type="number" min={0} value={packingForm.ready} onChange={(e) => setPackingForm({ ...packingForm, ready: e.target.value })} />
              </div>
              <div>
                <Label required>Date</Label>
                <Input required type="date" value={packingForm.date} onChange={(e) => setPackingForm({ ...packingForm, date: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditPackingRecord(null)}>
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
