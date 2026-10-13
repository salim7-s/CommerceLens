import { NextRequest, NextResponse } from "next/server";
import { syncService } from "../../../services/SyncService";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
    }

    const result = await syncService.syncProduct(productId);
    return NextResponse.json({
      success: result.status === "synced",
      syncResult: result,
      result,
      error: result.status !== "synced" ? result.message : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
