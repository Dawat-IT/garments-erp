"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { Toaster } from "@/components/ui/Toast";
import { useErpRecords } from "@/hooks/useErpRecords";
import { useCommercialData } from "@/hooks/useCommercialData";
import { useProductionData } from "@/hooks/useProductionData";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useProcurementData } from "@/hooks/useProcurementData";
import { useHrData } from "@/hooks/useHrData";
import { cn } from "@/lib/utils";

const SIDEBAR_W = "w-[248px]";
const MAIN_OFFSET = "lg:pl-[248px]";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const ensureLoadedErp = useErpRecords((state) => state.ensureLoaded);
  const refreshCommercial = useCommercialData((state) => state.refresh);
  const refreshProduction = useProductionData((state) => state.refresh);
  const refreshInventory = useInventoryData((state) => state.refresh);
  const refreshProcurement = useProcurementData((state) => state.refresh);
  const refreshHr = useHrData((state) => state.refresh);

  useEffect(() => {
    ensureLoadedErp();
    void refreshCommercial();
    void refreshProduction();
    void refreshInventory();
    void refreshProcurement();
    void refreshHr();
  }, [ensureLoadedErp, refreshCommercial, refreshProduction, refreshInventory, refreshProcurement, refreshHr]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pathname = usePathname();
  const isMerchandisingPage = pathname?.startsWith("/app/merchandising");

  return (
    <div className={cn("bg-[#F4F6F7] text-[#1A1A1A]", isMerchandisingPage ? "h-dvh max-h-dvh overflow-hidden" : "min-h-dvh")}>
      {/* Fixed left rail — always full viewport height, never collapses mid-page */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex",
          SIDEBAR_W,
          "transition-transform duration-200 ease-out",
          "max-lg:-translate-x-full",
          mobileOpen && "max-lg:translate-x-0"
        )}
      >
        <Suspense fallback={<div className="h-dvh w-full bg-[#08323C]" />}>
          <AppSidebar onNavigate={() => setMobileOpen(false)} />
        </Suspense>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-[#06262C]/45 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Main column offset by sidebar width on desktop */}
      <div className={cn(
        "flex flex-col",
        isMerchandisingPage ? "h-dvh max-h-dvh overflow-hidden" : "min-h-dvh",
        MAIN_OFFSET
      )}>
        <div className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between border-b border-[#E2E8EA] bg-white/95 px-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E2E8EA] px-2 text-[12px] font-semibold text-[#0F4C5C]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0F4C5C] text-[11px] font-bold text-white">
              DR
            </span>
            <span className="text-sm font-semibold text-[#0F4C5C]">Dawat RMG SOFT</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8EA] text-[#1A1A1A]"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <div className="hidden lg:block shrink-0">
          <AppTopbar />
        </div>

        <main className={cn(
          "flex-1 min-h-0",
          isMerchandisingPage ? "flex flex-col overflow-hidden p-1.5" : "overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-4"
        )}>
          <RoleGuard>{children}</RoleGuard>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

export default AppShell;
