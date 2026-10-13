import { NextResponse } from "next/server";
import { getDatabase } from "../../../adapters/repo/sqlite/database";
import { storeAdapter } from "../../../services/container";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    database: "unknown",
    cloudinary: "unknown",
    woocommerce: "unknown",
  };

  try {
    const db = getDatabase();
    const row = db.prepare("SELECT 1 as alive").get() as { alive: number };
    checks.database = row.alive === 1 ? "ok" : "error";
  } catch {
    checks.database = "error";
  }

  // Cloudinary configuration status
  checks.cloudinary = process.env.CLOUDINARY_CLOUD_NAME ? "configured" : "demo_fallback";

  // WooCommerce reachability check
  try {
    const isConnected = await storeAdapter.checkConnection();
    checks.woocommerce = isConnected ? "connected" : "mock_mode";
  } catch {
    checks.woocommerce = "error";
  }

  const allHealthy = checks.database === "ok";

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      sync_mode: process.env.SYNC_MODE || "mock",
      ai_provider: process.env.AI_PROVIDER || "mock",
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
