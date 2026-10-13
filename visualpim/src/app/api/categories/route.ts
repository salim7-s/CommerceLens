import { NextResponse } from "next/server";
import { categoryRepo } from "../../../services/container";

export async function GET() {
  try {
    const categories = await categoryRepo.findAll();
    return NextResponse.json({ success: true, categories });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
