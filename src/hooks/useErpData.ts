"use client";

import { useMemo } from "react";

export type OrderStatus = "On Track" | "At Risk" | "Delayed" | "Shipped";
export type RiskLevel = "on-track" | "at-risk" | "delayed";

export interface KpiSummary {
  runningOrders: number;
  runningOrdersDelta: number;
  todaysProduction: number;
  todaysProductionTarget: number;
  shipmentsThisWeek: number;
  shipmentsThisWeekQty: number;
  delayedTna: number;
  delayedTnaDelta: number;
  qcFailRate: number;
  qcFailRateDelta: number;
  profitLoss: number;
  profitLossMarginPct: number;
}

export interface FactoryStageStatus {
  stage: "Cutting" | "Sewing" | "Finishing" | "Packing" | "QC Passed" | "Rejected";
  value: number;
  unit: "pcs" | "%";
  changePct: number;
}

export interface TnaRiskItem {
  id: string;
  poNumber: string;
  buyer: string;
  style: string;
  milestone: string;
  dueDate: string;
  daysLeft: number;
  risk: RiskLevel;
}

export interface RunningOrder {
  id: string;
  poNumber: string;
  buyer: string;
  style: string;
  qty: number;
  shipDate: string;
  progressPct: number;
  status: OrderStatus;
}

export interface BuyerPerformance {
  id: string;
  buyer: string;
  orders: number;
  onTimePct: number;
  defectPct: number;
  rating: number;
}

export interface ProductionLineEfficiency {
  id: string;
  line: string;
  style: string;
  target: number;
  output: number;
  efficiencyPct: number;
  operators: number;
}

export interface ErpDashboardData {
  kpis: KpiSummary;
  factoryStatus: FactoryStageStatus[];
  tnaRisks: TnaRiskItem[];
  runningOrders: RunningOrder[];
  buyerPerformance: BuyerPerformance[];
  productionLines: ProductionLineEfficiency[];
}

/**
 * Executive-dashboard summary hook. Returns the aggregated KPIs, factory
 * floor status, T&A risk board and tabular breakdowns consumed by
 * `/app/dashboard`. Replace the static payload below with a real
 * fetch/aggregation once the underlying ERP data endpoints are wired up —
 * the shape of `ErpDashboardData` is the contract the dashboard depends on.
 */
export function useErpData(): ErpDashboardData {
  return useMemo(
    () => ({
      kpis: {
        runningOrders: 128,
        runningOrdersDelta: 6,
        todaysProduction: 18420,
        todaysProductionTarget: 20000,
        shipmentsThisWeek: 9,
        shipmentsThisWeekQty: 86400,
        delayedTna: 7,
        delayedTnaDelta: -2,
        qcFailRate: 2.4,
        qcFailRateDelta: -0.6,
        profitLoss: 4820000,
        profitLossMarginPct: 14.2,
      },
      factoryStatus: [
        { stage: "Cutting", value: 92, unit: "%", changePct: 3 },
        { stage: "Sewing", value: 78, unit: "%", changePct: 1.5 },
        { stage: "Finishing", value: 64, unit: "%", changePct: -2 },
        { stage: "Packing", value: 51, unit: "%", changePct: 4 },
        { stage: "QC Passed", value: 97.6, unit: "%", changePct: 0.6 },
        { stage: "Rejected", value: 2.4, unit: "%", changePct: -0.6 },
      ],
      tnaRisks: [
        {
          id: "tna-1",
          poNumber: "PO-8821",
          buyer: "H&M",
          style: "Denim Jacket – DJ204",
          milestone: "Fabric In-house",
          dueDate: "2026-07-30",
          daysLeft: 2,
          risk: "delayed",
        },
        {
          id: "tna-2",
          poNumber: "PO-8834",
          buyer: "Zara",
          style: "Polo Shirt – PL118",
          milestone: "PP Sample Approval",
          dueDate: "2026-08-01",
          daysLeft: 4,
          risk: "at-risk",
        },
        {
          id: "tna-3",
          poNumber: "PO-8809",
          buyer: "Marks & Spencer",
          style: "Chino Trouser – CH311",
          milestone: "Trims In-house",
          dueDate: "2026-07-29",
          daysLeft: 1,
          risk: "delayed",
        },
        {
          id: "tna-4",
          poNumber: "PO-8850",
          buyer: "Uniqlo",
          style: "Fleece Hoodie – FH072",
          milestone: "Cutting Start",
          dueDate: "2026-08-03",
          daysLeft: 6,
          risk: "on-track",
        },
        {
          id: "tna-5",
          poNumber: "PO-8842",
          buyer: "Primark",
          style: "Basic Tee – BT501",
          milestone: "Ex-factory",
          dueDate: "2026-08-02",
          daysLeft: 5,
          risk: "at-risk",
        },
      ],
      runningOrders: [
        {
          id: "ro-1",
          poNumber: "PO-8821",
          buyer: "H&M",
          style: "Denim Jacket – DJ204",
          qty: 24000,
          shipDate: "2026-08-12",
          progressPct: 62,
          status: "At Risk",
        },
        {
          id: "ro-2",
          poNumber: "PO-8834",
          buyer: "Zara",
          style: "Polo Shirt – PL118",
          qty: 36000,
          shipDate: "2026-08-05",
          progressPct: 81,
          status: "On Track",
        },
        {
          id: "ro-3",
          poNumber: "PO-8809",
          buyer: "Marks & Spencer",
          style: "Chino Trouser – CH311",
          qty: 18000,
          shipDate: "2026-07-31",
          progressPct: 44,
          status: "Delayed",
        },
        {
          id: "ro-4",
          poNumber: "PO-8850",
          buyer: "Uniqlo",
          style: "Fleece Hoodie – FH072",
          qty: 42000,
          shipDate: "2026-08-20",
          progressPct: 28,
          status: "On Track",
        },
        {
          id: "ro-5",
          poNumber: "PO-8842",
          buyer: "Primark",
          style: "Basic Tee – BT501",
          qty: 60000,
          shipDate: "2026-08-02",
          progressPct: 93,
          status: "On Track",
        },
        {
          id: "ro-6",
          poNumber: "PO-8790",
          buyer: "Next",
          style: "Cargo Short – CS229",
          qty: 15000,
          shipDate: "2026-07-29",
          progressPct: 97,
          status: "Shipped",
        },
      ],
      buyerPerformance: [
        { id: "b-1", buyer: "H&M", orders: 18, onTimePct: 92, defectPct: 1.8, rating: 4.6 },
        { id: "b-2", buyer: "Zara", orders: 14, onTimePct: 96, defectPct: 1.2, rating: 4.8 },
        { id: "b-3", buyer: "Marks & Spencer", orders: 11, onTimePct: 84, defectPct: 2.6, rating: 4.1 },
        { id: "b-4", buyer: "Uniqlo", orders: 9, onTimePct: 90, defectPct: 1.5, rating: 4.5 },
        { id: "b-5", buyer: "Primark", orders: 22, onTimePct: 88, defectPct: 2.1, rating: 4.3 },
      ],
      productionLines: [
        { id: "l-1", line: "Line 01", style: "DJ204", target: 1200, output: 1104, efficiencyPct: 92, operators: 38 },
        { id: "l-2", line: "Line 02", style: "PL118", target: 1500, output: 1290, efficiencyPct: 86, operators: 42 },
        { id: "l-3", line: "Line 03", style: "CH311", target: 1000, output: 690, efficiencyPct: 69, operators: 34 },
        { id: "l-4", line: "Line 04", style: "FH072", target: 900, output: 828, efficiencyPct: 92, operators: 30 },
        { id: "l-5", line: "Line 05", style: "BT501", target: 1800, output: 1710, efficiencyPct: 95, operators: 45 },
        { id: "l-6", line: "Line 06", style: "CS229", target: 1100, output: 803, efficiencyPct: 73, operators: 32 },
      ],
    }),
    []
  );
}

export default useErpData;
