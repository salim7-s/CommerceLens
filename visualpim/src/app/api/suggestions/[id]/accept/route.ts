import { NextRequest, NextResponse } from "next/server";
import { analyzeService } from "../../../../../services/AnalyzeService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await req.json().catch(() => ({}));

    const result = await analyzeService.acceptSuggestion(productId, body);
    return NextResponse.json({ success: true, product: result.product });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
