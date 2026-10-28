"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ROLES, PANEL_TO_SEED, getRoleHome, type RoleId } from "@/lib/roles";
import { useErpStore, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function EnterPage() {
  const router = useRouter();
  const setRole = useErpStore((state) => state.setRole);
  const setAppRole = useAppStore((state) => state.setRole);
  const [selected, setSelected] = useState<RoleId | null>("super-admin");
  const [loadingRole, setLoadingRole] = useState<RoleId | null>(null);

  const handleContinue = (roleId: RoleId) => {
    setSelected(roleId);
    setLoadingRole(roleId);
    setRole(roleId);
    setAppRole(PANEL_TO_SEED[roleId]);
    router.push(getRoleHome(roleId));
  };

  const active = ROLES.find((r) => r.id === selected) ?? ROLES[0];

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#071A1F] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#06262C_0%,#0A363F_42%,#0F4C5C_78%,#123D48_100%)]" />
        <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-[#E36414]/15 blur-[100px]" />
        <div className="absolute -right-16 bottom-0 h-[380px] w-[380px] rounded-full bg-[#2E7C8A]/25 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-teal-100/70 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E36414] text-[11px] font-bold shadow-[0_8px_24px_-8px_rgba(227,100,20,0.8)]">
              DR
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-wide">Dawat</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-teal-200/60">RMG SOFT</p>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-6 max-w-2xl text-center sm:mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E36414]">
            Role-based panel access
          </p>
          <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Choose your panel
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-teal-100/65">
            Each role shows only that department's modules and dashboard. Click a role to open its panel.
          </p>
        </div>

        <div className="mx-auto mt-7 grid w-full max-w-5xl flex-1 grid-cols-1 content-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            const isLoading = loadingRole === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelected(role.id)}
                onDoubleClick={() => handleContinue(role.id)}
                className={cn(
                  "group relative flex min-h-[188px] flex-col rounded-xl border p-4 text-left transition-all duration-200",
                  isSelected
                    ? "border-[#E36414]/70 bg-white/[0.09] shadow-[0_0_0_1px_rgba(227,100,20,0.25),0_12px_40px_-16px_rgba(227,100,20,0.45)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                )}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#E36414]">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                )}

                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                    isSelected ? "bg-[#E36414]/20 text-[#F19F50]" : "bg-teal-500/15 text-teal-100"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>

                <h3 className="mt-3 text-[14px] font-semibold text-white">{role.title}</h3>
                <p className="text-[11px] font-medium text-teal-200/70">{role.title}</p>
                <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-teal-100/55">
                  {role.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {role.scope.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-teal-100/55"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <span
                  className={cn(
                    "mt-auto inline-flex items-center gap-1 pt-3 text-[11px] font-semibold transition-colors",
                    isSelected ? "text-[#F19F50]" : "text-teal-200/50 group-hover:text-teal-100"
                  )}
                >
                  Enter this panel
                  <ArrowRight className="h-3 w-3" />
                  {isLoading && <span className="ml-1 animate-pulse">…</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-5 flex w-full max-w-5xl flex-col items-stretch justify-between gap-3 rounded-xl border border-white/10 bg-[#06262C]/80 px-4 py-3 backdrop-blur sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-teal-200/45">Selected panel</p>
            <p className="truncate text-sm font-semibold text-white">
              {active.title}{" "}
              <span className="font-normal text-teal-200/55">· {active.title}</span>
            </p>
            <p className="mt-0.5 truncate text-[11px] text-teal-200/45">
              Modules: {active.modules === "*" ? "All ERP modules" : active.scope.join(" · ")}
            </p>
          </div>
          <button
            type="button"
            disabled={!selected || loadingRole !== null}
            onClick={() => selected && handleContinue(selected)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#E36414] px-5 text-sm font-semibold text-white shadow-[0_10px_28px_-10px_rgba(227,100,20,0.85)] transition hover:bg-[#C2530E] disabled:opacity-60"
          >
            {loadingRole ? "Opening panel…" : "Enter ERP System"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-teal-300/40">
          Dawat RMG SOFT · Role-based factory control tower
        </p>
      </div>
    </div>
  );
}
