import Link from "next/link";
import { BackButton } from "@/components/layout/BackButton";
import {
  ShoppingCart,
  CalendarClock,
  Users,
  Calculator,
  Truck,
  Boxes,
  Scissors,
  Shirt,
  ClipboardCheck,
  Ship,
  Wallet,
  BarChart3,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Gauge,
  Factory,
  LineChart,
} from "lucide-react";

const WORKFLOW_STEPS = [
  { label: "Order", icon: ShoppingCart },
  { label: "T&A", icon: CalendarClock },
  { label: "Merchandising", icon: Users },
  { label: "Costing", icon: Calculator },
  { label: "Procurement", icon: Truck },
  { label: "Inventory", icon: Boxes },
  { label: "Cutting", icon: Scissors },
  { label: "Sewing", icon: Shirt },
  { label: "QC", icon: ClipboardCheck },
  { label: "Shipment", icon: Ship },
  { label: "Accounts", icon: Wallet },
  { label: "Reports", icon: BarChart3 },
];

const STATS = [
  { value: "128+", label: "Running Orders Tracked" },
  { value: "৳48+ Cr", label: "Annual Order Value Managed" },
  { value: "12", label: "Modules — One Platform" },
  { value: "99.4%", label: "On-time Shipment Rate" },
];

const FEATURES = [
  {
    icon: Gauge,
    title: "Real-time Factory Pulse",
    desc: "Live production status for every line, from cutting to packing, on one screen.",
  },
  {
    icon: CalendarClock,
    title: "T&A Risk Alerts",
    desc: "Flags risky milestones before they slip — from sample to ex-factory.",
  },
  {
    icon: ClipboardCheck,
    title: "Inline / Endline / Final QC",
    desc: "Defect rate, AQL and rejection tracking for every buyer and style.",
  },
  {
    icon: Wallet,
    title: "Costing & P/L Visibility",
    desc: "CM, cost breakdown and actual profit or loss for every order, in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based Access",
    desc: "A separate panel for Owner, Merchandiser, Production, QC, Store and Accounts.",
  },
  {
    icon: LineChart,
    title: "Executive Reporting",
    desc: "Buyer performance, line efficiency and shipment analytics, with PDF and Excel export.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-ink-950 text-white">
      {/* Top navigation */}
      <header className="relative z-30 border-b border-white/10">
        <div className="container-erp flex h-16 items-center justify-between gap-3 sm:h-20">
          <div className="flex items-center gap-2.5">
            <BackButton />
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-sm font-bold shadow-glow sm:h-10 sm:w-10">
              DR
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold tracking-wide sm:text-base">Dawat</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-teal-200 sm:text-[11px]">
                RMG SOFT
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-teal-100/80 md:flex">
            <a href="#workflow" className="transition-colors hover:text-white">
              Workflow
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Modules
            </a>
            <a href="#contact" className="transition-colors hover:text-white">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/enter" className="btn-outline h-9 px-3.5 text-xs sm:h-10 sm:px-4 sm:text-sm">
              Login ERP
            </Link>
            <Link href="/enter" className="btn-primary h-9 px-3.5 text-xs sm:h-10 sm:px-4 sm:text-sm">
              Enter ERP System
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-teal-gradient" />
        <div className="absolute inset-0 bg-hero-radial" />
        <div className="bg-industrial-grid absolute inset-0 [background-size:42px_42px] opacity-60" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />

        <div className="container-erp relative z-10 flex flex-col items-center py-20 text-center sm:py-28 lg:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-teal-100 backdrop-blur-sm">
            <Factory className="h-3.5 w-3.5 text-accent-400" />
            One ERP for a garment factory
          </div>

          <h1 className="font-display mt-8 max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Dawat
            <span className="block bg-gradient-to-r from-accent-400 via-accent-500 to-orange-300 bg-clip-text text-transparent">
              RMG SOFT
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base text-teal-100/90 sm:text-lg">
            From order booking to shipment — control every step of the factory from one platform.
          </p>
          <p className="mt-2 max-w-2xl text-balance text-sm text-teal-200/70 sm:text-base">
            Full control over your factory&apos;s order-to-shipment lifecycle — Merchandising, T&amp;A, Production,
            QC, Inventory and Accounts, unified in real time.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/enter" className="btn-primary h-12 w-full px-7 text-sm sm:w-auto sm:text-base">
              Enter ERP System
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/enter" className="btn-outline h-12 w-full px-7 text-sm sm:w-auto sm:text-base">
              Login ERP
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] text-teal-200/70 sm:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative bg-ink-950 py-20 sm:py-24">
        <div className="container-erp relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-400">
              End-to-End Workflow
            </p>
            <h2 className="font-display mt-3 text-balance text-3xl font-bold sm:text-4xl">
              From order to reports — one clear flow
            </h2>
            <p className="mt-3 text-sm text-teal-200/70 sm:text-base">
              Every step stays linked. Nothing is lost, and delays stay visible.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-y-6">
            {WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center">
                  <div className="group flex w-[104px] flex-col items-center gap-2.5 sm:w-[124px]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-teal-100 shadow-inner transition-all duration-200 group-hover:-translate-y-1 group-hover:border-accent-400/40 group-hover:bg-accent-500/10 group-hover:text-accent-300 sm:h-16 sm:w-16">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                    <span className="text-center text-[11px] font-semibold text-teal-100/90 sm:text-xs">
                      {step.label}
                    </span>
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <ChevronRight className="mx-1 h-4 w-4 shrink-0 text-teal-500/40 sm:mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative bg-ink-900/60 py-20 sm:py-24">
        <div className="container-erp">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-400">
              Platform Modules
            </p>
            <h2 className="font-display mt-3 text-balance text-3xl font-bold sm:text-4xl">
              The right tools for every department
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors duration-200 hover:border-accent-400/30 hover:bg-white/[0.05]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-200">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-teal-200/70">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative py-20 sm:py-24">
        <div className="container-erp">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-teal-gradient px-6 py-14 text-center sm:px-14">
            <div className="bg-hero-radial absolute inset-0" />
            <div className="relative z-10">
              <h2 className="font-display text-balance text-2xl font-bold sm:text-3xl">
                Start controlling the factory today
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-balance text-sm text-teal-100/80 sm:text-base">
                Take command of your production floor — from the first PO to the final invoice.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/enter" className="btn-primary h-12 w-full px-7 text-sm sm:w-auto">
                  Enter ERP System
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/enter" className="btn-outline h-12 w-full px-7 text-sm sm:w-auto">
                  Login ERP
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative border-t border-white/10 bg-ink-950 py-12">
        <div className="container-erp flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-sm font-bold">
              DR
            </span>
            <div>
              <p className="font-display text-sm font-bold">Dawat RMG SOFT</p>
              <p className="text-xs text-teal-200/60">
                Factory control on one platform — order to shipment, fully controlled.
              </p>
            </div>
          </div>
          <p className="text-xs text-teal-200/50">
            © {new Date().getFullYear()} Dawat Group. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
