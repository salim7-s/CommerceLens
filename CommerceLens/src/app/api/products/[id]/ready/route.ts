import { NextRequest, NextResponse } from "next/server";
import { productService } from "../../../../../services/ProductService";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await productService.markReady(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message, product: result.product },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: result.message, product: result.product });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
