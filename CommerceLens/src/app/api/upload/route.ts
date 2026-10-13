import { NextRequest, NextResponse } from "next/server";
import { mediaAdapter } from "../../../services/container";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sku = (formData.get("sku") as string) || undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await mediaAdapter.uploadImage(buffer, file.name, sku);
    const variants = mediaAdapter.getVariants(uploadRes.publicId);

    return NextResponse.json({
      success: true,
      publicId: uploadRes.publicId,
      url: uploadRes.url,
      variants,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
