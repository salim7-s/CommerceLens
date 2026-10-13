import { NextRequest, NextResponse } from "next/server";
import { syncService } from "../../../../services/SyncService";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await syncService.syncProduct(id);

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
