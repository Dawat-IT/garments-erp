import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ErpData } from "@/lib/types";
import { RelationError } from "@/lib/db/repair";
import {
  ensureReady,
  loadCommercialView,
  loadErp,
  saveCommercial,
  saveErp,
  saveSlice,
  touchUpdatedAt,
} from "@/lib/db/repository";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  if (error instanceof RelationError) {
    return NextResponse.json({ success: false, error: error.message, issues: error.issues }, { status: 400 });
  }
  const message = error instanceof Error ? error.message : "Failed to process ERP data.";
  console.error("[/api/data]", error);
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    await ensureReady();
    const store = request.nextUrl.searchParams.get("store") || "main";
    const updatedAt = new Date().toISOString();

    if (store === "commercial") {
      return NextResponse.json({ success: true, data: await loadCommercialView(), updatedAt });
    }

    const data = await loadErp();
    if (store === "procurement") return NextResponse.json({ success: true, data: { procurements: data.procurements }, updatedAt });
    if (store === "inventory") return NextResponse.json({ success: true, data: { inventory: data.inventory, stockLedger: data.stockLedger }, updatedAt });
    if (store === "production") {
      return NextResponse.json({
        success: true,
        data: {
          cuttingJobs: data.cuttingJobs,
          sewingLines: data.sewingLines,
          finishingJobs: data.finishingJobs,
          packingJobs: data.packingJobs,
        },
        updatedAt,
      });
    }
    if (store === "hr") {
      return NextResponse.json({
        success: true,
        data: { employees: data.employees, attendance: data.attendance, payroll: data.payroll },
        updatedAt,
      });
    }
    if (store === "merchandising") {
      return NextResponse.json({
        success: true,
        data: {
          quotations: data.quotations,
          confirmOrders: data.confirmOrders,
          orderStatuses: data.orderStatuses,
          accRmBookings: data.accRmBookings,
          fabricBookings: data.fabricBookings,
          accessoriesBookings: data.accessoriesBookings,
          piRegisters: data.piRegisters,
          accEstimations: data.accEstimations,
        },
        updatedAt,
      });
    }

    return NextResponse.json({ success: true, data, updatedAt });
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureReady();
    const store = request.nextUrl.searchParams.get("store") || "main";
    const body = await request.json();
    const nextData = body?.data;
    if (!nextData || typeof nextData !== "object") {
      return NextResponse.json({ success: false, error: "Request body must include a `data` object." }, { status: 400 });
    }

    if (store === "commercial") {
      const data = await saveCommercial(nextData);
      return NextResponse.json({ success: true, data, updatedAt: await touchUpdatedAt() });
    }

    if (store === "main") {
      const data = await saveErp(nextData as ErpData);
      return NextResponse.json({ success: true, data, updatedAt: await touchUpdatedAt() });
    }

    const data = await saveSlice(nextData as Partial<ErpData>);
    const updatedAt = await touchUpdatedAt();
    if (store === "procurement") return NextResponse.json({ success: true, data: { procurements: data.procurements }, updatedAt });
    if (store === "inventory") return NextResponse.json({ success: true, data: { inventory: data.inventory, stockLedger: data.stockLedger }, updatedAt });
    if (store === "production") {
      return NextResponse.json({
        success: true,
        data: {
          cuttingJobs: data.cuttingJobs,
          sewingLines: data.sewingLines,
          finishingJobs: data.finishingJobs,
          packingJobs: data.packingJobs,
        },
        updatedAt,
      });
    }
    if (store === "hr") {
      return NextResponse.json({
        success: true,
        data: { employees: data.employees, attendance: data.attendance, payroll: data.payroll },
        updatedAt,
      });
    }
    if (store === "merchandising") {
      return NextResponse.json({
        success: true,
        data: {
          quotations: data.quotations,
          confirmOrders: data.confirmOrders,
          orderStatuses: data.orderStatuses,
          accRmBookings: data.accRmBookings,
          fabricBookings: data.fabricBookings,
          accessoriesBookings: data.accessoriesBookings,
          piRegisters: data.piRegisters,
          accEstimations: data.accEstimations,
        },
        updatedAt,
      });
    }
    return NextResponse.json({ success: true, data: nextData, updatedAt });
  } catch (error) {
    return fail(error);
  }
}
