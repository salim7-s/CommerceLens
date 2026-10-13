import { NextResponse } from "next/server";
import { syncService } from "../../../../services/SyncService";

export async function GET() {
  try {
    const logs = await syncService.getSyncLogs(100);
    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
