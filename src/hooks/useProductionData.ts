"use client";

/**
 * Dedicated client-side data hook for the Production module
 * (Cutting, Sewing, Finishing, Packing).
 *
 * Kept self-contained (like `useCommercialData`) so this module's CRUD data
 * model never collides with other in-flight ERP modules, but the record
 * shape is the canonical `CuttingJob` / `SewingLine` / `FinishingJob` /
 * `PackingJob` types from `@/lib/types` and is seeded from `@/lib/seed-data`
 * so figures stay consistent with the rest of the app (and with the
 * Inventory > Cutting Issue tab, which reads the same cutting jobs).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchSharedErp } from "@/lib/clientErp";
import type { CuttingJob, CuttingStatus, FinishingJob, PackingJob, SewingLine, SewingStatus } from "@/lib/types";
import {
  cuttingJobs as seedCuttingJobs,
  finishingJobs as seedFinishingJobs,
  packingJobs as seedPackingJobs,
  sewingLines as seedSewingLines,
} from "@/lib/seed-data";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cuttingBalance(fabricIssued: number, cutQty: number, reject: number): number {
  return Math.max(fabricIssued - cutQty - reject, 0);
}

export function sewingEfficiencyPct(target: number, output: number): number {
  if (!target) return 0;
  return Math.round((output / target) * 1000) / 10;
}

export function sewingStatusFromEfficiency(efficiencyPercent: number): SewingStatus {
  if (efficiencyPercent >= 95) return "Above Target";
  if (efficiencyPercent >= 80) return "On Target";
  return "Below Target";
}

interface ProductionState {
  cuttingJobs: CuttingJob[];
  sewingLines: SewingLine[];
  finishingJobs: FinishingJob[];
  packingJobs: PackingJob[];

  addCuttingJob: (input: Omit<CuttingJob, "id" | "balance">) => CuttingJob;
  updateCuttingJob: (id: string, patch: Partial<Omit<CuttingJob, "id">>) => void;

  addSewingLine: (input: Omit<SewingLine, "id" | "efficiencyPercent" | "status">) => SewingLine;
  updateSewingLine: (id: string, patch: Partial<Omit<SewingLine, "id" | "efficiencyPercent" | "status">>) => void;

  addFinishingJob: (input: Omit<FinishingJob, "id">) => FinishingJob;
  updateFinishingJob: (id: string, patch: Partial<Omit<FinishingJob, "id">>) => void;

  addPackingJob: (input: Omit<PackingJob, "id">) => PackingJob;
  updatePackingJob: (id: string, patch: Partial<Omit<PackingJob, "id">>) => void;

  refresh: () => Promise<void>;
}

let productionServerReady = false;

function persistToServer(state: Omit<ProductionState, "addCuttingJob" | "updateCuttingJob" | "addSewingLine" | "updateSewingLine" | "addFinishingJob" | "updateFinishingJob" | "addPackingJob" | "updatePackingJob" | "refresh">) {
  if (!productionServerReady || typeof window === "undefined") return;
  fetch("/api/data?store=production", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: state }),
  }).catch(() => {});
}

export const useProductionData = create<ProductionState>()(
  persist(
    (set, get) => {
      const apply = (updater: (state: ProductionState) => Partial<ProductionState>) => {
        const next = updater(get());
        set(next);
        const { addCuttingJob, updateCuttingJob, addSewingLine, updateSewingLine, addFinishingJob, updateFinishingJob, addPackingJob, updatePackingJob, refresh, ...dataToPersist } = { ...get(), ...next };
        persistToServer(dataToPersist);
      };

      return {
        cuttingJobs: seedCuttingJobs,
        sewingLines: seedSewingLines,
        finishingJobs: seedFinishingJobs,
        packingJobs: seedPackingJobs,

        refresh: async () => {
          try {
            const data = await fetchSharedErp();
            set({
              cuttingJobs: data.cuttingJobs,
              sewingLines: data.sewingLines,
              finishingJobs: data.finishingJobs,
              packingJobs: data.packingJobs,
            });
            productionServerReady = true;
          } catch {
            /* keep the last local copy if the server is unreachable */
          }
        },

        addCuttingJob: (input) => {
          const record: CuttingJob = {
            ...input,
            id: uid("cut"),
            balance: cuttingBalance(input.fabricIssued, input.cutQty, input.reject),
          };
          apply((state) => ({ cuttingJobs: [record, ...state.cuttingJobs] }));
          return record;
        },

        updateCuttingJob: (id, patch) => {
          apply((state) => ({
            cuttingJobs: state.cuttingJobs.map((job) => {
              if (job.id !== id) return job;
              const merged: CuttingJob = { ...job, ...patch };
              merged.balance = cuttingBalance(merged.fabricIssued, merged.cutQty, merged.reject);
              return merged;
            }),
          }));
        },

        addSewingLine: (input) => {
          const efficiencyPercent = sewingEfficiencyPct(input.target, input.output);
          const record: SewingLine = {
            ...input,
            id: uid("sew"),
            efficiencyPercent,
            status: sewingStatusFromEfficiency(efficiencyPercent),
          };
          apply((state) => ({ sewingLines: [record, ...state.sewingLines] }));
          return record;
        },

        updateSewingLine: (id, patch) => {
          apply((state) => ({
            sewingLines: state.sewingLines.map((line) => {
              if (line.id !== id) return line;
              const merged: SewingLine = { ...line, ...patch };
              merged.efficiencyPercent = sewingEfficiencyPct(merged.target, merged.output);
              merged.status = sewingStatusFromEfficiency(merged.efficiencyPercent);
              return merged;
            }),
          }));
        },

        addFinishingJob: (input) => {
          const record: FinishingJob = { ...input, id: uid("fin") };
          apply((state) => ({ finishingJobs: [record, ...state.finishingJobs] }));
          return record;
        },

        updateFinishingJob: (id, patch) => {
          apply((state) => ({
            finishingJobs: state.finishingJobs.map((job) => (job.id === id ? { ...job, ...patch } : job)),
          }));
        },

        addPackingJob: (input) => {
          const record: PackingJob = { ...input, id: uid("pack") };
          apply((state) => ({ packingJobs: [record, ...state.packingJobs] }));
          return record;
        },

        updatePackingJob: (id, patch) => {
          apply((state) => ({
            packingJobs: state.packingJobs.map((job) => (job.id === id ? { ...job, ...patch } : job)),
          }));
        },
      };
    },
    { name: "same-dawat-erp-production", version: 1 }
  )
);

export type { CuttingJob, CuttingStatus, FinishingJob, PackingJob, SewingLine, SewingStatus };
