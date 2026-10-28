import { NextResponse } from "next/server";
import { reseedFromSeed } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/seed
 * Rebuilds the normalized ERP collections from the seed dataset.
 */
export async function POST() {
  try {
    const data = await reseedFromSeed();
    return NextResponse.json({
      success: true,
      message: "ERP demo data has been reseeded successfully.",
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[POST /api/seed] failed:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to reseed ERP data." },
      { status: 500 }
    );
  }
}
