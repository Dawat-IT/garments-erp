"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileDown,
  FileSpreadsheet,
  FileText,
  Layers,
  Package,
  Percent,
  Scissors,
  Search,
  Ship,
  ShieldAlert,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs, ToggleChip } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useErpRecords } from "@/hooks/useErpRecords";
import { exportToCsv, exportToExcel, exportToPdf, type PdfColumn } from "@/lib/export";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const REPORT_TABS = [
  { value: "orders", label: "Orders" },
  { value: "ta_delay", label: "TA Delay" },
  { value: "production", label: "Production" },
  { value: "qc", label: "Quality" },
  { value: "stock", label: "Stock" },
  { value: "shipment", label: "Shipment" },
  { value: "accounts", label: "Accounts" },
];

const PRODUCTION_VIEWS = [
  { value: "cutting", label: "Cutting" },
  { value: "sewing", label: "Sewing" },
  { value: "finishing", label: "Finishing" },
] as const;
type ProductionView = (typeof PRODUCTION_VIEWS)[number]["value"];

function inRange(date: string | null | undefined, from: string, to: string): boolean {
  if (!date) return !from && !to;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function badgeToneFor(value: string): "success" | "warning" | "danger" | "neutral" | "info" {
  const v = value.toLowerCase();
  if (["completed", "passed", "paid", "cleared", "shipped", "on track", "approved", "in house", "on time"].includes(v)) return "success";
  if (["delayed", "failed", "rejected", "critical", "high risk", "unpaid", "at risk"].includes(v)) return "danger";
  if (["pending", "in progress", "partial", "rework", "under review", "medium risk", "below target"].includes(v)) return "warning";
  return "neutral";
}

const STATUS_KEYS = new Set([
  "Stage",
  "TA Status",
  "Payment",
  "Status",
  "Risk Level",
  "Result",
  "Mode",
  "Customs",
  "Type",
]);

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-ink-400">Loading reports…</div>}>
      <ReportsContent />
    </Suspense>
  );
}

function ReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = REPORT_TABS.some((t) => t.value === tabParam) ? (tabParam as string) : "orders";

  const { data } = useErpRecords();
  const { orders, taTasks, cuttingJobs, sewingLines, finishingJobs, qcRecords, inventory, shipments, pnl } = data;

  const [search, setSearch] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [prodView, setProdView] = useState<ProductionView>("cutting");
  const [qcTypeFilter, setQcTypeFilter] = useState("all");
  const [shipmentModeFilter, setShipmentModeFilter] = useState("all");
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState("all");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("all");

  function setTab(tab: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (tab === "orders") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(`/app/reports${query ? `?${query}` : ""}`, { scroll: false });
    setSearch("");
    setBuyerFilter("all");
    setFromDate("");
    setToDate("");
  }

  const q = search.trim().toLowerCase();

  /* ------------------------------ Filtered datasets ------------------------------ */

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          (!q || o.poNumber.toLowerCase().includes(q) || o.style.toLowerCase().includes(q) || o.buyerName.toLowerCase().includes(q)) &&
          (buyerFilter === "all" || o.buyerName === buyerFilter) &&
          inRange(o.orderDate, fromDate, toDate)
      ),
    [orders, q, buyerFilter, fromDate, toDate]
  );

  const filteredTaTasks = useMemo(
    () =>
      taTasks.filter(
        (t) =>
          (!q || t.taskName.toLowerCase().includes(q) || t.poNumber.toLowerCase().includes(q) || t.buyerName.toLowerCase().includes(q)) &&
          (buyerFilter === "all" || t.buyerName === buyerFilter) &&
          inRange(t.plannedDate, fromDate, toDate)
      ),
    [taTasks, q, buyerFilter, fromDate, toDate]
  );

  const filteredCutting = useMemo(
    () =>
      cuttingJobs.filter(
        (c) =>
          (!q || c.poNumber.toLowerCase().includes(q) || c.style.toLowerCase().includes(q) || c.buyerName.toLowerCase().includes(q)) &&
          (buyerFilter === "all" || c.buyerName === buyerFilter) &&
          inRange(c.cuttingDate, fromDate, toDate)
      ),
    [cuttingJobs, q, buyerFilter, fromDate, toDate]
  );

  const filteredSewing = useMemo(
    () =>
      sewingLines.filter(
        (s) =>
          (!q || s.lineName.toLowerCase().includes(q) || s.poNumber.toLowerCase().includes(q) || s.buyerName.toLowerCase().includes(q)) &&
          (buyerFilter === "all" || s.buyerName === buyerFilter)
      ),
    [sewingLines, q, buyerFilter]
  );

  const filteredFinishing = useMemo(
    () =>
      finishingJobs.filter(
        (f) =>
          (!q || f.poNumber.toLowerCase().includes(q) || f.style.toLowerCase().includes(q) || f.buyerName.toLowerCase().includes(q)) &&
          (buyerFilter === "all" || f.buyerName === buyerFilter) &&
          inRange(f.date, fromDate, toDate)
      ),
    [finishingJobs, q, buyerFilter, fromDate, toDate]
  );

  const filteredQc = useMemo(
    () =>
      qcRecords.filter(
        (r) =>
          (!q || r.poNumber.toLowerCase().includes(q) || r.style.toLowerCase().includes(q) || r.buyerName.toLowerCase().includes(q) || r.defectType.toLowerCase().includes(q)) &&
          (buyerFilter === "all" || r.buyerName === buyerFilter) &&
          (qcTypeFilter === "all" || r.type === qcTypeFilter)
      ),
    [qcRecords, q, buyerFilter, qcTypeFilter]
  );

  const filteredInventory = useMemo(
    () =>
      inventory.filter(
        (i) =>
          (!q || i.itemName.toLowerCase().includes(q) || i.poNumber.toLowerCase().includes(q) || i.buyerName.toLowerCase().includes(q)) &&
          (buyerFilter === "all" || i.buyerName === buyerFilter) &&
          (stockCategoryFilter === "all" || i.category === stockCategoryFilter) &&
          inRange(i.lastUpdated, fromDate, toDate)
      ),
    [inventory, q, buyerFilter, stockCategoryFilter, fromDate, toDate]
  );

  const filteredShipments = useMemo(
    () =>
      shipments.filter(
        (s) =>
          (!q || s.poNumber.toLowerCase().includes(q) || s.style.toLowerCase().includes(q) || s.buyerName.toLowerCase().includes(q) || s.forwarder.toLowerCase().includes(q)) &&
          (buyerFilter === "all" || s.buyerName === buyerFilter) &&
          (shipmentModeFilter === "all" || s.mode === shipmentModeFilter) &&
          (shipmentStatusFilter === "all" || s.status === shipmentStatusFilter) &&
          inRange(s.shipDate, fromDate, toDate)
      ),
    [shipments, q, buyerFilter, shipmentModeFilter, shipmentStatusFilter, fromDate, toDate]
  );

  const filteredPnl = useMemo(
    () =>
      pnl.filter(
        (p) =>
          (!q || p.poNumber.toLowerCase().includes(q) || p.style.toLowerCase().includes(q) || p.buyerName.toLowerCase().includes(q)) &&
          (buyerFilter === "all" || p.buyerName === buyerFilter)
      ),
    [pnl, q, buyerFilter]
  );

  /* ------------------------------ Buyer options (per tab) ------------------------------ */

  const buyerOptions = useMemo(() => {
    const source =
      activeTab === "orders"
        ? orders.map((o) => o.buyerName)
        : activeTab === "ta_delay"
        ? taTasks.map((t) => t.buyerName)
        : activeTab === "production"
        ? prodView === "cutting"
          ? cuttingJobs.map((c) => c.buyerName)
          : prodView === "sewing"
          ? sewingLines.map((s) => s.buyerName)
          : finishingJobs.map((f) => f.buyerName)
        : activeTab === "qc"
        ? qcRecords.map((r) => r.buyerName)
        : activeTab === "stock"
        ? inventory.map((i) => i.buyerName)
        : activeTab === "shipment"
        ? shipments.map((s) => s.buyerName)
        : pnl.map((p) => p.buyerName);
    return Array.from(new Set(source)).sort();
  }, [activeTab, prodView, orders, taTasks, cuttingJobs, sewingLines, finishingJobs, qcRecords, inventory, shipments, pnl]);

  /* ------------------------------ Table headers + rows (shared by table + export) ------------------------------ */

  const { headers, rows, reportTitle, filenameSlug } = useMemo<{
    headers: string[];
    rows: Record<string, string>[];
    reportTitle: string;
    filenameSlug: string;
  }>(() => {
    if (activeTab === "orders") {
      return {
        headers: ["PO Number", "Buyer", "Style", "Quantity", "Order Value", "Stage", "TA Status", "Payment", "Order Date", "Ship Date"],
        rows: filteredOrders.map((o) => ({
          "PO Number": o.poNumber,
          Buyer: o.buyerName,
          Style: o.style,
          Quantity: formatNumber(o.quantity),
          "Order Value": formatCurrency(o.orderValue),
          Stage: o.stage,
          "TA Status": o.taStatus,
          Payment: o.paymentStatus,
          "Order Date": formatDate(o.orderDate),
          "Ship Date": formatDate(o.shipDate),
        })),
        reportTitle: "Orders Report",
        filenameSlug: "orders-report",
      };
    }
    if (activeTab === "ta_delay") {
      return {
        headers: ["PO Number", "Buyer", "Task", "Department", "Owner", "Planned Date", "Actual Date", "Status", "Risk Level", "Delay Days"],
        rows: filteredTaTasks.map((t) => ({
          "PO Number": t.poNumber,
          Buyer: t.buyerName,
          Task: t.taskName,
          Department: t.department,
          Owner: t.owner,
          "Planned Date": formatDate(t.plannedDate),
          "Actual Date": t.actualDate ? formatDate(t.actualDate) : "—",
          Status: t.status,
          "Risk Level": t.riskLevel,
          "Delay Days": formatNumber(t.delayDays ?? 0),
        })),
        reportTitle: "T&A Delay Report",
        filenameSlug: "ta-delay-report",
      };
    }
    if (activeTab === "production") {
      if (prodView === "cutting") {
        return {
          headers: ["PO Number", "Buyer", "Style", "Fabric Issued", "Cut Qty", "Reject", "Balance", "Cutting Date", "Status"],
          rows: filteredCutting.map((c) => ({
            "PO Number": c.poNumber,
            Buyer: c.buyerName,
            Style: c.style,
            "Fabric Issued": formatNumber(c.fabricIssued),
            "Cut Qty": formatNumber(c.cutQty),
            Reject: formatNumber(c.reject),
            Balance: formatNumber(c.balance),
            "Cutting Date": formatDate(c.cuttingDate),
            Status: c.status,
          })),
          reportTitle: "Production Report — Cutting",
          filenameSlug: "production-cutting-report",
        };
      }
      if (prodView === "sewing") {
        return {
          headers: ["Line", "PO Number", "Buyer", "Style", "Target", "Output", "Defect", "Efficiency %", "Operators", "Status"],
          rows: filteredSewing.map((s) => ({
            Line: s.lineName,
            "PO Number": s.poNumber,
            Buyer: s.buyerName,
            Style: s.style,
            Target: formatNumber(s.target),
            Output: formatNumber(s.output),
            Defect: formatNumber(s.defect),
            "Efficiency %": `${s.efficiencyPercent.toFixed(1)}%`,
            Operators: formatNumber(s.operators),
            Status: s.status,
          })),
          reportTitle: "Production Report — Sewing",
          filenameSlug: "production-sewing-report",
        };
      }
      return {
        headers: ["PO Number", "Buyer", "Style", "From Sewing", "Iron", "Finish", "Reject", "Ready For Packing", "Date"],
        rows: filteredFinishing.map((f) => ({
          "PO Number": f.poNumber,
          Buyer: f.buyerName,
          Style: f.style,
          "From Sewing": formatNumber(f.fromSewing),
          Iron: formatNumber(f.iron),
          Finish: formatNumber(f.finish),
          Reject: formatNumber(f.reject),
          "Ready For Packing": formatNumber(f.readyForPacking),
          Date: formatDate(f.date),
        })),
        reportTitle: "Production Report — Finishing",
        filenameSlug: "production-finishing-report",
      };
    }
    if (activeTab === "qc") {
      return {
        headers: ["PO Number", "Buyer", "Style", "Type", "Inspector", "Checked", "Passed", "Defect Qty", "Rejected", "Result"],
        rows: filteredQc.map((r) => ({
          "PO Number": r.poNumber,
          Buyer: r.buyerName,
          Style: r.style,
          Type: r.type,
          Inspector: r.inspector,
          Checked: formatNumber(r.checked),
          Passed: formatNumber(r.passed),
          "Defect Qty": formatNumber(r.defectQty),
          Rejected: formatNumber(r.rejected),
          Result: r.result,
        })),
        reportTitle: "Quality Control Report",
        filenameSlug: "qc-report",
      };
    }
    if (activeTab === "stock") {
      return {
        headers: ["Category", "Item", "PO Number", "Buyer", "Style", "Received", "Issued", "Balance", "Location", "Last Updated"],
        rows: filteredInventory.map((i) => ({
          Category: i.category,
          Item: i.itemName,
          "PO Number": i.poNumber,
          Buyer: i.buyerName,
          Style: i.style,
          Received: formatNumber(i.received),
          Issued: formatNumber(i.issued),
          Balance: formatNumber(i.balance),
          Location: i.location,
          "Last Updated": formatDate(i.lastUpdated),
        })),
        reportTitle: "Stock Report",
        filenameSlug: "stock-report",
      };
    }
    if (activeTab === "shipment") {
      return {
        headers: ["PO Number", "Buyer", "Style", "Order Qty", "Packed Qty", "Cartons", "Ship Date", "Mode", "Status", "Customs"],
        rows: filteredShipments.map((s) => ({
          "PO Number": s.poNumber,
          Buyer: s.buyerName,
          Style: s.style,
          "Order Qty": formatNumber(s.orderQty),
          "Packed Qty": formatNumber(s.packedQty),
          Cartons: formatNumber(s.cartons),
          "Ship Date": formatDate(s.shipDate),
          Mode: s.mode,
          Status: s.status,
          Customs: s.customsStatus,
        })),
        reportTitle: "Shipment Report",
        filenameSlug: "shipment-report",
      };
    }
    return {
      headers: ["Buyer", "PO Number", "Style", "Order Value", "Fabric Cost", "CM Cost", "Total Cost", "Profit", "Margin %"],
      rows: filteredPnl.map((p) => ({
        Buyer: p.buyerName,
        "PO Number": p.poNumber,
        Style: p.style,
        "Order Value": formatCurrency(p.orderValue),
        "Fabric Cost": formatCurrency(p.fabricCost),
        "CM Cost": formatCurrency(p.cmCost),
        "Total Cost": formatCurrency(p.totalCost),
        Profit: formatCurrency(p.profit),
        "Margin %": `${p.marginPercent.toFixed(1)}%`,
      })),
      reportTitle: "Accounts / P&L Report",
      filenameSlug: "accounts-pnl-report",
    };
  }, [activeTab, prodView, filteredOrders, filteredTaTasks, filteredCutting, filteredSewing, filteredFinishing, filteredQc, filteredInventory, filteredShipments, filteredPnl]);

  /* ------------------------------ KPIs ------------------------------ */

  const kpis = useMemo(() => {
    if (activeTab === "orders") {
      const totalValue = filteredOrders.reduce((s, o) => s + o.orderValue, 0);
      const onTrack = filteredOrders.filter((o) => o.taStatus === "On Track").length;
      const avgProgress = filteredOrders.length ? filteredOrders.reduce((s, o) => s + o.progressPercent, 0) / filteredOrders.length : 0;
      return [
        { label: "Total Orders", value: formatNumber(filteredOrders.length), icon: Package },
        { label: "Total Order Value", value: formatCurrency(totalValue), icon: Wallet },
        { label: "On Track", value: filteredOrders.length ? `${((onTrack / filteredOrders.length) * 100).toFixed(0)}%` : "0%", icon: CheckCircle2 },
        { label: "Avg Progress", value: `${avgProgress.toFixed(0)}%`, icon: TrendingUp },
      ];
    }
    if (activeTab === "ta_delay") {
      const delayed = filteredTaTasks.filter((t) => t.status === "Delayed").length;
      const critical = filteredTaTasks.filter((t) => t.riskLevel === "Critical").length;
      const delaySamples = filteredTaTasks.filter((t) => (t.delayDays ?? 0) > 0);
      const avgDelay = delaySamples.length ? delaySamples.reduce((s, t) => s + (t.delayDays ?? 0), 0) / delaySamples.length : 0;
      return [
        { label: "Total Tasks", value: formatNumber(filteredTaTasks.length), icon: ClipboardCheck },
        { label: "Delayed Tasks", value: formatNumber(delayed), icon: AlertTriangle, invert: true },
        { label: "Avg Delay (days)", value: avgDelay.toFixed(1), icon: CalendarClock, invert: true },
        { label: "Critical Risk", value: formatNumber(critical), icon: ShieldAlert, invert: true },
      ];
    }
    if (activeTab === "production") {
      if (prodView === "cutting") {
        return [
          { label: "Cutting Jobs", value: formatNumber(filteredCutting.length), icon: Scissors },
          { label: "Total Cut Qty", value: formatNumber(filteredCutting.reduce((s, c) => s + c.cutQty, 0)), icon: Layers },
          { label: "Total Reject", value: formatNumber(filteredCutting.reduce((s, c) => s + c.reject, 0)), icon: AlertTriangle, invert: true },
          { label: "Completed", value: formatNumber(filteredCutting.filter((c) => c.status === "Completed").length), icon: CheckCircle2 },
        ];
      }
      if (prodView === "sewing") {
        const avgEff = filteredSewing.length ? filteredSewing.reduce((s, l) => s + l.efficiencyPercent, 0) / filteredSewing.length : 0;
        return [
          { label: "Sewing Lines", value: formatNumber(filteredSewing.length), icon: Layers },
          { label: "Avg Efficiency", value: `${avgEff.toFixed(1)}%`, icon: TrendingUp },
          { label: "Total Output", value: formatNumber(filteredSewing.reduce((s, l) => s + l.output, 0)), icon: Package },
          { label: "Total Defect", value: formatNumber(filteredSewing.reduce((s, l) => s + l.defect, 0)), icon: AlertTriangle, invert: true },
        ];
      }
      return [
        { label: "Finishing Jobs", value: formatNumber(filteredFinishing.length), icon: Layers },
        { label: "Total Finish", value: formatNumber(filteredFinishing.reduce((s, f) => s + f.finish, 0)), icon: CheckCircle2 },
        { label: "Total Reject", value: formatNumber(filteredFinishing.reduce((s, f) => s + f.reject, 0)), icon: AlertTriangle, invert: true },
        { label: "Ready For Packing", value: formatNumber(filteredFinishing.reduce((s, f) => s + f.readyForPacking, 0)), icon: Boxes },
      ];
    }
    if (activeTab === "qc") {
      const totalChecked = filteredQc.reduce((s, r) => s + r.checked, 0);
      const totalPassed = filteredQc.reduce((s, r) => s + r.passed, 0);
      return [
        { label: "Total Inspections", value: formatNumber(filteredQc.length), icon: ClipboardCheck },
        { label: "Pass Rate", value: totalChecked ? `${((totalPassed / totalChecked) * 100).toFixed(1)}%` : "0%", icon: Percent },
        { label: "Total Rejected", value: formatNumber(filteredQc.reduce((s, r) => s + r.rejected, 0)), icon: AlertTriangle, invert: true },
        { label: "Total Defect Qty", value: formatNumber(filteredQc.reduce((s, r) => s + r.defectQty, 0)), icon: ShieldAlert, invert: true },
      ];
    }
    if (activeTab === "stock") {
      return [
        { label: "Items Tracked", value: formatNumber(filteredInventory.length), icon: Boxes },
        { label: "Total Received", value: formatNumber(filteredInventory.reduce((s, i) => s + i.received, 0)), icon: Package },
        { label: "Total Issued", value: formatNumber(filteredInventory.reduce((s, i) => s + i.issued, 0)), icon: TrendingUp },
        { label: "Low Balance (<50)", value: formatNumber(filteredInventory.filter((i) => i.balance < 50).length), icon: AlertTriangle, invert: true },
      ];
    }
    if (activeTab === "shipment") {
      return [
        { label: "Total Shipments", value: formatNumber(filteredShipments.length), icon: Ship },
        { label: "Shipped", value: formatNumber(filteredShipments.filter((s) => s.status === "shipped").length), icon: CheckCircle2 },
        { label: "Total Cartons", value: formatNumber(filteredShipments.reduce((s, x) => s + x.cartons, 0)), icon: Boxes },
        { label: "Customs Pending", value: formatNumber(filteredShipments.filter((s) => s.customsStatus === "Pending").length), icon: AlertTriangle, invert: true },
      ];
    }
    const revenue = filteredPnl.reduce((s, p) => s + p.orderValue, 0);
    const cost = filteredPnl.reduce((s, p) => s + p.totalCost, 0);
    const profit = filteredPnl.reduce((s, p) => s + p.profit, 0);
    const avgMargin = filteredPnl.length ? filteredPnl.reduce((s, p) => s + p.marginPercent, 0) / filteredPnl.length : 0;
    return [
      { label: "Total Revenue", value: formatCurrency(revenue), icon: TrendingUp },
      { label: "Total Cost", value: formatCurrency(cost), icon: Wallet, invert: true },
      { label: "Net Profit", value: formatCurrency(profit), icon: Wallet },
      { label: "Avg Margin", value: `${avgMargin.toFixed(1)}%`, icon: Percent },
    ];
  }, [activeTab, prodView, filteredOrders, filteredTaTasks, filteredCutting, filteredSewing, filteredFinishing, filteredQc, filteredInventory, filteredShipments, filteredPnl]);

  const showDateFilter = ["orders", "ta_delay", "stock", "shipment"].includes(activeTab) || (activeTab === "production" && prodView !== "sewing");

  /* ------------------------------ Export ------------------------------ */

  function handleExportCsv() {
    exportToCsv(filenameSlug, rows);
  }
  function handleExportExcel() {
    exportToExcel(filenameSlug, rows, reportTitle.slice(0, 31));
  }
  function handleExportPdf() {
    const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
    exportToPdf(reportTitle, columns, rows, filenameSlug, { subtitle: "Dawat RMG SOFT — Management Report" });
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        subtitle="Cross-module reporting with date & buyer filters — export CSV, Excel or PDF."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleExportCsv} leftIcon={<FileDown className="h-4 w-4" />}>
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportExcel} leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
              Excel
            </Button>
            <Button onClick={handleExportPdf} leftIcon={<FileText className="h-4 w-4" />}>
              PDF
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onChange={setTab} items={REPORT_TABS} />

      {activeTab === "production" && (
        <div className="flex flex-wrap items-center gap-2">
          {PRODUCTION_VIEWS.map((v) => (
            <ToggleChip key={v.value} active={prodView === v.value} onClick={() => setProdView(v.value)}>
              {v.label}
            </ToggleChip>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} invertTone={kpi.invert} accent={kpi.invert ? "accent" : "teal"} />
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="max-w-sm flex-1">
            <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="w-full sm:w-52">
            <Select value={buyerFilter} onChange={(e) => setBuyerFilter(e.target.value)} options={[{ value: "all", label: "All Buyers" }, ...buyerOptions.map((b) => ({ value: b, label: b }))]} />
          </div>
          {activeTab === "qc" && (
            <div className="w-full sm:w-40">
              <Select
                value={qcTypeFilter}
                onChange={(e) => setQcTypeFilter(e.target.value)}
                options={[{ value: "all", label: "All Types" }, { value: "inline", label: "Inline" }, { value: "endline", label: "Endline" }, { value: "final", label: "Final" }]}
              />
            </div>
          )}
          {activeTab === "stock" && (
            <div className="w-full sm:w-40">
              <Select
                value={stockCategoryFilter}
                onChange={(e) => setStockCategoryFilter(e.target.value)}
                options={[{ value: "all", label: "All Categories" }, { value: "fabric", label: "Fabric" }, { value: "trims", label: "Trims" }, { value: "finished", label: "Finished" }]}
              />
            </div>
          )}
          {activeTab === "shipment" && (
            <>
              <div className="w-full sm:w-32">
                <Select value={shipmentModeFilter} onChange={(e) => setShipmentModeFilter(e.target.value)} options={[{ value: "all", label: "All Modes" }, { value: "SEA", label: "SEA" }, { value: "AIR", label: "AIR" }]} />
              </div>
              <div className="w-full sm:w-40">
                <Select
                  value={shipmentStatusFilter}
                  onChange={(e) => setShipmentStatusFilter(e.target.value)}
                  options={[{ value: "all", label: "All Statuses" }, { value: "prepared", label: "Prepared" }, { value: "submitted", label: "Submitted" }, { value: "approved", label: "Approved" }, { value: "shipped", label: "Shipped" }]}
                />
              </div>
            </>
          )}
          {showDateFilter && (
            <>
              <div className="w-full sm:w-40">
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="w-full sm:w-40">
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState title="No records found" subtitle="Try adjusting the filters above." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  {headers.map((h) => (
                    <TableCell key={h} className={h === "Buyer" || h === "PO Number" ? "font-semibold text-slate-800" : undefined}>
                      {STATUS_KEYS.has(h) ? <Badge tone={badgeToneFor(String(row[h]))}>{row[h]}</Badge> : row[h]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
