"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Bell, ArrowLeft } from "lucide-react";
import { useErpStore, useAppStore } from "@/lib/store";
import { ROLES, PANEL_TO_SEED, getRoleById, getRoleHome, type RoleId } from "@/lib/roles";
import { formatDateBn, cn } from "@/lib/utils";

export interface AppTopbarProps {
  onMenuClick?: () => void;
}

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const router = useRouter();
  const role = useErpStore((state) => state.role);
  const setPanelRole = useErpStore((state) => state.setRole);
  const setAppRole = useAppStore((state) => state.setRole);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  void onMenuClick;

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const activeRole = getRoleById(role);

  const switchRole = (next: RoleId) => {
    setPanelRole(next);
    setAppRole(PANEL_TO_SEED[next]);
    setOpen(false);
    router.push(getRoleHome(next));
  };

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[#E2E8EA] bg-white/95 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-[#E2E8EA] bg-white px-2.5 text-[12px] font-semibold text-[#0F4C5C] hover:bg-[#F3F6F7]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-[#0F4C5C]">Dawat RMG SOFT</p>
        <p className="truncate text-[10px] text-[#6E8386]">
          {activeRole ? `${activeRole.title} Panel` : "ERP"}
          {now ? ` · ${formatDateBn(now, { withWeekday: true })}` : ""}
        </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => alert("No new notifications at this time.")}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-[#6E8386] hover:bg-[#F3F6F7]"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#E36414]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            className="flex h-8 items-center gap-2 rounded-md border border-[#E2E8EA] bg-white px-2.5 text-[12px] text-[#1A2628] hover:bg-[#F3F6F7]"
          >
            <span className="hidden text-left sm:block">
              <span className="block text-[9px] uppercase tracking-wide text-[#6E8386]">Panel</span>
              <span className="block font-semibold leading-none">{activeRole?.title ?? "Select"}</span>
            </span>
            <span className="font-semibold sm:hidden">{activeRole?.title ?? "Role"}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-[#6E8386] transition-transform", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute right-0 z-40 mt-1.5 w-80 overflow-hidden rounded-lg border border-[#E2E8EA] bg-white shadow-lg">
              <div className="border-b border-[#E2E8EA] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E8386]">
                  Switch role panel
                </p>
              </div>
              <ul className="max-h-80 overflow-y-auto py-1">
                {ROLES.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => switchRole(r.id)}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[12px] transition-colors hover:bg-[#F3F6F7]",
                        r.id === role && "bg-[#0F4C5C]/[0.04]"
                      )}
                    >
                      <span className="flex w-full items-center justify-between font-semibold text-[#1A2628]">
                        {r.title}
                        {r.id === role && <span className="text-[10px] text-[#0F4C5C]">●</span>}
                      </span>
                      <span className="text-[11px] text-[#6E8386]">
                        {r.title} — {r.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppTopbar;
