import { NextRequest, NextResponse } from "next/server";
import { productService } from "../../../../services/ProductService";
import { categoryRepo, mediaAdapter } from "../../../../services/container";
import { computeHealth } from "../../../../domain/health";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productService.getProduct(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const templates = product.category_id ? await categoryRepo.getTemplates(product.category_id) : [];
    const health = computeHealth(product, templates);

    // Variants from Cloudinary
    const variants = product.image_url
      ? mediaAdapter.getVariants(product.image_url)
      : [];

    return NextResponse.json({
      success: true,
      product,
      templates,
      health,
      variants,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const product = await productService.updateProduct(id, body);
    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await productService.deleteProduct(id);
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
