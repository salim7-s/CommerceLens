import { NextRequest, NextResponse } from "next/server";
import { analyzeService } from "../../../services/AnalyzeService";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
    }

    const suggestion = await analyzeService.analyzeProduct(productId);
    return NextResponse.json({ success: true, suggestion });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
