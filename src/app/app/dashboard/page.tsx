"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Factory,
  Ship,
  CalendarClock,
  ClipboardCheck,
  Wallet,
  Scissors,
  Shirt,
  PackageCheck,
  Box,
  CheckCircle2,
  XCircle,
  Star,
  Users,
  Warehouse,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { ExportBar } from "@/components/ui/ExportBar";
import {
  useErpData,
  type RunningOrder,
  type ProductionLineEfficiency,
  type BuyerPerformance,
  type TnaRiskItem,
  type RiskLevel,
} from "@/hooks/useErpData";
import { useErpStore } from "@/lib/store";
import { getRoleById, type DashboardVariant } from "@/lib/roles";
import { bnDate, formatCurrencyBDT, formatNumber, cn } from "@/lib/utils";

const RISK_META: Record<RiskLevel, { label: string; tone: StatusTone }> = {
  "on-track": { label: "On Track", tone: "success" },
  "at-risk": { label: "At Risk", tone: "warning" },
  delayed: { label: "Delayed", tone: "danger" },
};

const STAGE_ICON = {
  Cutting: Scissors,
  Sewing: Shirt,
  Finishing: PackageCheck,
  Packing: Box,
  "QC Passed": CheckCircle2,
  Rejected: XCircle,
} as const;

const DASHBOARD_COPY: Record<
  DashboardVariant,
  { title: string; titleBn: string; subtitle: string }
> = {
  super: {
    title: "Super Admin Dashboard",
    titleBn: "Super Admin",
    subtitle: "Full ERP overview — orders, production, QC, shipment and accounts",
  },
  owner: {
    title: "Executive Dashboard",
    titleBn: "Owner / Director",
    subtitle: "KPI, shipment readiness and profit status for management decisions",
  },
  merchandiser: {
    title: "Merchandising Dashboard",
    titleBn: "Merchandising",
    subtitle: "Running orders, T&A delays, samples and material readiness",
  },
  production: {
    title: "Production Dashboard",
    titleBn: "Production",
    subtitle: "Cutting, sewing, finishing output and line efficiency",
  },
  qc: {
    title: "Quality Control Dashboard",
    titleBn: "Quality Control",
    subtitle: "Inline / endline / final inspection, fail rate and defects",
  },
  store: {
    title: "Store & Inventory Dashboard",
    titleBn: "Store Manager",
    subtitle: "Fabric, trims, in-house status and stock movement",
  },
  accounts: {
    title: "Accounts Dashboard",
    titleBn: "Accounts",
    subtitle: "Buyer/supplier ledgers, collections and profit & loss",
  },
};

function ProgressBar({
  value,
  tone = "teal",
}: {
  value: number;
  tone?: "teal" | "accent" | "danger";
}) {
  const barColor =
    tone === "danger" ? "bg-rose-500" : tone === "accent" ? "bg-accent-500" : "bg-teal-700";
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-ink-100">
      <div
        className={cn("h-full rounded-full transition-all duration-500", barColor)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function orderStatusTone(status: RunningOrder["status"]): StatusTone {
  if (status === "Shipped" || status === "On Track") return "success";
  if (status === "At Risk") return "warning";
  return "danger";
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  warn,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#E2E8EA] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,40,45,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md",
            warn ? "bg-accent-50 text-accent-600" : "bg-teal-50 text-teal-700"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-1 text-[17px] font-bold leading-none text-ink-900">{value}</p>
      <p className="mt-1 text-[10px] text-ink-400">{hint}</p>
    </div>
  );
}

function QuickLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="inline-flex items-center gap-1 rounded-md border border-[#E2E8EA] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-teal-800 hover:border-teal-300 hover:bg-teal-50"
        >
          {l.label}
          <ArrowRight className="h-3 w-3" />
        </Link>
      ))}
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  const data = useErpData();
  const roleId = useErpStore((state) => state.role);
  const roleDef = getRoleById(roleId);
  const variant: DashboardVariant = roleDef?.dashboard ?? "super";
  const copy = DASHBOARD_COPY[variant];
  const today = bnDate();

  const { kpis, factoryStatus, tnaRisks, runningOrders, buyerPerformance, productionLines } = data;
  const productionAchievementPct = Math.round(
    (kpis.todaysProduction / Math.max(1, kpis.todaysProductionTarget)) * 100
  );

  const exportRows = [
    { metric: "Running Orders", value: formatNumber(kpis.runningOrders) },
    { metric: "Today's Production", value: `${formatNumber(kpis.todaysProduction)} pcs` },
    { metric: "Delayed T&A", value: String(kpis.delayedTna) },
    { metric: "QC Fail Rate", value: `${kpis.qcFailRate}%` },
    { metric: "Profit / Loss", value: formatCurrencyBDT(kpis.profitLoss) },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E36414]">
            {copy.title} · Panel
          </p>
          <h1 className="font-sans text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
            {copy.title}
          </h1>
          <p className="text-[12px] text-ink-500">
            {copy.subtitle} · Today, {today}
          </p>
        </div>
        <ExportBar
          filename={`same-dawat-${variant}-dashboard`}
          title={`Dawat RMG SOFT — ${copy.title}`}
          columns={[
            { key: "metric", header: "Metric" },
            { key: "value", header: "Value" },
          ]}
          rows={exportRows}
        />
      </div>

      {variant === "super" && <SuperView {...{ kpis, factoryStatus, tnaRisks, runningOrders, buyerPerformance, productionLines, productionAchievementPct }} />}
      {variant === "owner" && <OwnerView {...{ kpis, factoryStatus, tnaRisks, runningOrders, buyerPerformance, productionAchievementPct }} />}
      {variant === "merchandiser" && <MerchandiserView {...{ kpis, tnaRisks, runningOrders }} />}
      {variant === "production" && <ProductionView {...{ kpis, factoryStatus, productionLines, productionAchievementPct }} />}
      {variant === "qc" && <QcView {...{ kpis, factoryStatus, runningOrders }} />}
      {variant === "store" && <StoreView {...{ kpis, tnaRisks, runningOrders }} />}
      {variant === "accounts" && <AccountsView {...{ kpis, buyerPerformance, runningOrders }} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Role views                                                         */
/* ------------------------------------------------------------------ */

type Shared = {
  kpis: ReturnType<typeof useErpData>["kpis"];
  factoryStatus: ReturnType<typeof useErpData>["factoryStatus"];
  tnaRisks: TnaRiskItem[];
  runningOrders: RunningOrder[];
  buyerPerformance: BuyerPerformance[];
  productionLines: ProductionLineEfficiency[];
  productionAchievementPct: number;
};

function SuperView(p: Shared) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Running Orders" value={formatNumber(p.kpis.runningOrders)} hint="Active PO styles" icon={ShoppingCart} />
        <Kpi label="Today's Production" value={formatNumber(p.kpis.todaysProduction)} hint={`${p.productionAchievementPct}% of target`} icon={Factory} />
        <Kpi label="Shipment This Week" value={String(p.kpis.shipmentsThisWeek)} hint={`${formatNumber(p.kpis.shipmentsThisWeekQty)} pcs`} icon={Ship} />
        <Kpi label="Delayed T&A" value={formatNumber(p.kpis.delayedTna)} hint="Needs attention" icon={CalendarClock} warn />
        <Kpi label="QC Fail Rate" value={`${p.kpis.qcFailRate}%`} hint="Rejected vs checked" icon={ClipboardCheck} />
        <Kpi label="Profit / Loss" value={formatCurrencyBDT(p.kpis.profitLoss)} hint={`${p.kpis.profitLossMarginPct}% margin`} icon={Wallet} />
      </div>
      <FactoryStrip stages={p.factoryStatus} />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <TnaPanel risks={p.tnaRisks} className="xl:col-span-3" />
        <OrdersPanel orders={p.runningOrders} className="xl:col-span-5" />
        <BuyersPanel buyers={p.buyerPerformance} className="xl:col-span-4" />
      </div>
      <LinesPanel lines={p.productionLines} />
    </>
  );
}

function OwnerView(p: Pick<Shared, "kpis" | "factoryStatus" | "tnaRisks" | "runningOrders" | "buyerPerformance" | "productionAchievementPct">) {
  return (
    <>
      <QuickLinks
        links={[
          { href: "/app/shipment?tab=plan", label: "Shipment Plan" },
          { href: "/app/accounts?tab=pnl", label: "Profit / Loss" },
          { href: "/app/accounts?tab=buyer", label: "Buyer Ledger" },
          { href: "/app/reports?tab=orders", label: "Order Reports" },
        ]}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Running Orders" value={formatNumber(p.kpis.runningOrders)} hint="Pipeline" icon={ShoppingCart} />
        <Kpi label="Shipment This Week" value={String(p.kpis.shipmentsThisWeek)} hint="Export bookings" icon={Ship} />
        <Kpi label="Delayed T&A" value={formatNumber(p.kpis.delayedTna)} hint="Risk" icon={CalendarClock} warn />
        <Kpi label="QC Fail Rate" value={`${p.kpis.qcFailRate}%`} hint="Quality" icon={ClipboardCheck} />
        <Kpi label="Est. Profit" value={formatCurrencyBDT(p.kpis.profitLoss)} hint={`${p.kpis.profitLossMarginPct}% margin`} icon={Wallet} />
      </div>
      <FactoryStrip stages={p.factoryStatus} />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BuyersPanel buyers={p.buyerPerformance} />
        <OrdersPanel orders={p.runningOrders} />
      </div>
    </>
  );
}

function MerchandiserView(p: Pick<Shared, "kpis" | "tnaRisks" | "runningOrders">) {
  return (
    <>
      <QuickLinks
        links={[
          { href: "/app/buyers", label: "Buyers" },
          { href: "/app/orders", label: "Orders" },
          { href: "/app/ta-calendar", label: "T&A Calendar" },
          { href: "/app/merchandising?tab=samples", label: "Samples" },
          { href: "/app/costing", label: "Costing" },
        ]}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi label="Running Orders" value={formatNumber(p.kpis.runningOrders)} hint="Active PO styles" icon={ShoppingCart} />
        <Kpi label="Delayed T&A" value={formatNumber(p.kpis.delayedTna)} hint="Needs attention" icon={CalendarClock} warn />
        <Kpi label="Sample Approval" value="5" hint="Pending samples" icon={Users} warn />
        <Kpi label="Fabric/Trims Status" value="12" hint="Pending in-house" icon={Warehouse} />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <TnaPanel risks={p.tnaRisks} className="lg:col-span-2" />
        <OrdersPanel orders={p.runningOrders} className="lg:col-span-3" />
      </div>
    </>
  );
}

function ProductionView(p: Pick<Shared, "kpis" | "factoryStatus" | "productionLines" | "productionAchievementPct">) {
  const cutting = p.factoryStatus.find((s) => s.stage === "Cutting");
  const sewing = p.factoryStatus.find((s) => s.stage === "Sewing");
  const finishing = p.factoryStatus.find((s) => s.stage === "Finishing");
  const packing = p.factoryStatus.find((s) => s.stage === "Packing");

  return (
    <>
      <QuickLinks
        links={[
          { href: "/app/production/cutting", label: "Cutting" },
          { href: "/app/production/sewing", label: "Sewing Lines" },
          { href: "/app/production/finishing", label: "Finishing" },
          { href: "/app/production/packing", label: "Packing" },
        ]}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi label="Cutting Output" value={formatNumber(cutting?.value ?? 0)} hint="Today" icon={Scissors} />
        <Kpi label="Sewing Output" value={formatNumber(p.kpis.todaysProduction)} hint={`${p.productionAchievementPct}% of target`} icon={Shirt} />
        <Kpi label="Finishing Output" value={formatNumber(finishing?.value ?? 0)} hint="Today" icon={PackageCheck} />
        <Kpi label="Factory Efficiency" value={`${sewing?.value ?? 92}%`} hint="Avg sewing lines" icon={Factory} />
      </div>
      <FactoryStrip stages={p.factoryStatus} />
      <LinesPanel lines={p.productionLines} />
      {packing && (
        <p className="text-[11px] text-ink-400">
          Packing output today: <span className="font-semibold text-ink-700">{formatNumber(packing.value)}</span> pcs
        </p>
      )}
    </>
  );
}

function QcView(p: Pick<Shared, "kpis" | "factoryStatus" | "runningOrders">) {
  const passed = p.factoryStatus.find((s) => s.stage === "QC Passed");
  const rejected = p.factoryStatus.find((s) => s.stage === "Rejected");

  return (
    <>
      <QuickLinks
        links={[
          { href: "/app/quality-control?tab=inline", label: "Inline QC" },
          { href: "/app/quality-control?tab=endline", label: "Endline QC" },
          { href: "/app/quality-control?tab=final", label: "Final Inspection" },
          { href: "/app/quality-control?tab=defects", label: "Defect Analysis" },
        ]}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi label="QC Fail Rate" value={`${p.kpis.qcFailRate}%`} hint="Rejected vs checked" icon={ClipboardCheck} warn />
        <Kpi label="QC Passed" value={`${passed?.value ?? 98}%`} hint="Pass ratio" icon={CheckCircle2} />
        <Kpi label="Rejected" value={`${rejected?.value ?? 2}%`} hint="Needs rework" icon={XCircle} warn />
        <Kpi label="Orders in QC" value={formatNumber(p.runningOrders.filter((o) => o.status !== "Shipped").length)} hint="Active styles" icon={AlertTriangle} />
      </div>
      <OrdersPanel orders={p.runningOrders} />
    </>
  );
}

function StoreView(p: Pick<Shared, "kpis" | "tnaRisks" | "runningOrders">) {
  return (
    <>
      <QuickLinks
        links={[
          { href: "/app/procurement?tab=fabric", label: "Fabric Booking" },
          { href: "/app/procurement?tab=inhouse", label: "In-house Status" },
          { href: "/app/inventory?tab=fabric", label: "Fabric Stock" },
          { href: "/app/inventory?tab=trims", label: "Trims Stock" },
          { href: "/app/inventory?tab=ledger", label: "Stock Ledger" },
        ]}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi label="Running Styles" value={formatNumber(p.kpis.runningOrders)} hint="Need materials" icon={ShoppingCart} />
        <Kpi label="In-house Pending" value="12" hint="Fabric / trims" icon={Warehouse} warn />
        <Kpi label="Delayed T&A Material" value={formatNumber(p.kpis.delayedTna)} hint="Booking risk" icon={CalendarClock} warn />
        <Kpi label="Stock Moves Today" value="18" hint="GRN / Issue" icon={Box} />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <TnaPanel risks={p.tnaRisks} />
        <OrdersPanel orders={p.runningOrders} />
      </div>
    </>
  );
}

function AccountsView(p: Pick<Shared, "kpis" | "buyerPerformance" | "runningOrders">) {
  return (
    <>
      <QuickLinks
        links={[
          { href: "/app/accounts?tab=buyer", label: "Buyer Ledger" },
          { href: "/app/accounts?tab=supplier", label: "Supplier Ledger" },
          { href: "/app/accounts?tab=payment", label: "Collections" },
          { href: "/app/accounts?tab=pnl", label: "Profit / Loss" },
          { href: "/app/reports?tab=accounts", label: "Accounts Reports" },
        ]}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi label="Est. Profit" value={formatCurrencyBDT(p.kpis.profitLoss)} hint={`${p.kpis.profitLossMarginPct}% margin`} icon={Wallet} />
        <Kpi label="Running Orders" value={formatNumber(p.kpis.runningOrders)} hint="Invoice pipeline" icon={ShoppingCart} />
        <Kpi label="Shipment This Week" value={String(p.kpis.shipmentsThisWeek)} hint="Billing trigger" icon={Ship} />
        <Kpi label="Buyer Due Focus" value={formatNumber(p.buyerPerformance.length)} hint="Active buyers" icon={Users} warn />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BuyersPanel buyers={p.buyerPerformance} />
        <OrdersPanel orders={p.runningOrders} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Shared panels                                                      */
/* ------------------------------------------------------------------ */

function FactoryStrip({ stages }: { stages: Shared["factoryStatus"] }) {
  return (
    <section className="rounded-lg border border-[#E2E8EA] bg-white p-2.5 shadow-[0_1px_2px_rgba(15,40,45,0.04)]">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <h2 className="text-[12px] font-semibold text-ink-800">Today&apos;s Factory Status</h2>
        <span className="text-[10px] text-ink-400">Production by section</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {stages.map((stage) => {
          const Icon = STAGE_ICON[stage.stage];
          const isRejected = stage.stage === "Rejected";
          return (
            <div key={stage.stage} className="rounded-md bg-[#F7FAFA] px-2.5 py-2">
              <div className="flex items-center justify-between gap-1">
                <Icon className={cn("h-3.5 w-3.5", isRejected ? "text-rose-500" : "text-teal-700")} />
                <span
                  className={cn(
                    "text-[9px] font-semibold",
                    stage.changePct >= 0
                      ? isRejected
                        ? "text-rose-600"
                        : "text-emerald-600"
                      : isRejected
                        ? "text-emerald-600"
                        : "text-rose-600"
                  )}
                >
                  {stage.changePct >= 0 ? "+" : ""}
                  {stage.changePct}%
                </span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-ink-900">
                {formatNumber(stage.value)}
                {stage.unit === "%" ? "%" : ""}
              </p>
              <p className="text-[10px] text-ink-500">{stage.stage}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TnaPanel({ risks, className }: { risks: TnaRiskItem[]; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-[#E2E8EA] bg-white shadow-[0_1px_2px_rgba(15,40,45,0.04)]", className)}>
      <div className="flex items-center justify-between border-b border-[#E2E8EA] px-3 py-2">
        <h2 className="text-[12px] font-semibold text-ink-800">T&amp;A Risk Board</h2>
        <span className="rounded bg-accent-50 px-1.5 py-0.5 text-[10px] font-semibold text-accent-700">
          {risks.filter((r) => r.risk !== "on-track").length} risk
        </span>
      </div>
      <div className="max-h-[220px] divide-y divide-[#EEF2F3] overflow-y-auto">
        {risks.slice(0, 6).map((item) => {
          const meta = RISK_META[item.risk];
          return (
            <div key={item.id} className="flex items-start gap-2 px-3 py-2">
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  item.risk === "delayed" ? "bg-rose-500" : item.risk === "at-risk" ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-[11px] font-semibold text-ink-900">{item.poNumber}</p>
                  <StatusBadge status={meta.label} tone={meta.tone} dot={false} className="!px-1.5 !py-0 !text-[9px]" />
                </div>
                <p className="truncate text-[10px] text-ink-500">
                  {item.buyer} · {item.milestone}
                </p>
                <p className="text-[10px] font-medium text-ink-600">{item.daysLeft}d left</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OrdersPanel({ orders, className }: { orders: RunningOrder[]; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-[#E2E8EA] bg-white shadow-[0_1px_2px_rgba(15,40,45,0.04)]", className)}>
      <div className="flex items-center justify-between border-b border-[#E2E8EA] px-3 py-2">
        <h2 className="text-[12px] font-semibold text-ink-800">Running Orders</h2>
        <span className="text-[10px] text-ink-400">{orders.length} active</span>
      </div>
      <div className="max-h-[220px] overflow-auto">
        <table className="w-full min-w-[480px] text-left text-[11px]">
          <thead className="sticky top-0 bg-[#F7FAFA] text-[10px] uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-3 py-1.5 font-semibold">Buyer / PO</th>
              <th className="px-2 py-1.5 font-semibold">Qty</th>
              <th className="px-2 py-1.5 font-semibold">Progress</th>
              <th className="px-3 py-1.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2F3]">
            {orders.slice(0, 8).map((r) => (
              <tr key={r.id} className="hover:bg-[#F7FAFA]/80">
                <td className="px-3 py-1.5">
                  <p className="font-semibold text-ink-900">{r.buyer}</p>
                  <p className="text-[10px] text-ink-400">
                    {r.poNumber} · {r.style}
                  </p>
                </td>
                <td className="px-2 py-1.5 tabular-nums text-ink-700">{formatNumber(r.qty)}</td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-14">
                      <ProgressBar value={r.progressPct} tone={r.status === "Delayed" ? "danger" : "teal"} />
                    </div>
                    <span className="tabular-nums text-ink-500">{r.progressPct}%</span>
                  </div>
                </td>
                <td className="px-3 py-1.5">
                  <StatusBadge status={r.status} tone={orderStatusTone(r.status)} className="!px-1.5 !py-0 !text-[9px]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BuyersPanel({ buyers, className }: { buyers: BuyerPerformance[]; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-[#E2E8EA] bg-white shadow-[0_1px_2px_rgba(15,40,45,0.04)]", className)}>
      <div className="flex items-center justify-between border-b border-[#E2E8EA] px-3 py-2">
        <h2 className="text-[12px] font-semibold text-ink-800">Buyer Performance</h2>
        <span className="text-[10px] text-ink-400">OTIF &amp; rating</span>
      </div>
      <div className="max-h-[220px] overflow-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="sticky top-0 bg-[#F7FAFA] text-[10px] uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-3 py-1.5 font-semibold">Buyer</th>
              <th className="px-2 py-1.5 font-semibold">Orders</th>
              <th className="px-2 py-1.5 font-semibold">On-time</th>
              <th className="px-3 py-1.5 font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2F3]">
            {buyers.map((b) => (
              <tr key={b.id} className="hover:bg-[#F7FAFA]/80">
                <td className="px-3 py-1.5 font-semibold text-ink-900">{b.buyer}</td>
                <td className="px-2 py-1.5 tabular-nums text-ink-700">{b.orders}</td>
                <td className="px-2 py-1.5 tabular-nums text-ink-700">{b.onTimePct}%</td>
                <td className="px-3 py-1.5">
                  <span className="inline-flex items-center gap-1 font-medium text-ink-700">
                    <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                    {b.rating.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LinesPanel({ lines }: { lines: ProductionLineEfficiency[] }) {
  return (
    <section className="rounded-lg border border-[#E2E8EA] bg-white shadow-[0_1px_2px_rgba(15,40,45,0.04)]">
      <div className="flex items-center justify-between border-b border-[#E2E8EA] px-3 py-2">
        <h2 className="text-[12px] font-semibold text-ink-800">Production Line Efficiency</h2>
        <span className="text-[10px] text-ink-400">Target vs output</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[11px]">
          <thead className="bg-[#F7FAFA] text-[10px] uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-3 py-1.5 font-semibold">Line</th>
              <th className="px-2 py-1.5 font-semibold">Style</th>
              <th className="px-2 py-1.5 font-semibold">Target</th>
              <th className="px-2 py-1.5 font-semibold">Output</th>
              <th className="px-2 py-1.5 font-semibold">Efficiency</th>
              <th className="px-3 py-1.5 font-semibold">Operators</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2F3]">
            {lines.map((line) => (
              <tr key={line.id} className="hover:bg-[#F7FAFA]/80">
                <td className="px-3 py-1.5 font-semibold text-ink-900">{line.line}</td>
                <td className="px-2 py-1.5 text-ink-600">{line.style}</td>
                <td className="px-2 py-1.5 tabular-nums">{formatNumber(line.target)}</td>
                <td className="px-2 py-1.5 tabular-nums">{formatNumber(line.output)}</td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16">
                      <ProgressBar
                        value={line.efficiencyPct}
                        tone={line.efficiencyPct >= 90 ? "teal" : line.efficiencyPct >= 75 ? "accent" : "danger"}
                      />
                    </div>
                    <span className="tabular-nums text-ink-600">{line.efficiencyPct}%</span>
                  </div>
                </td>
                <td className="px-3 py-1.5 tabular-nums text-ink-700">{line.operators}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
