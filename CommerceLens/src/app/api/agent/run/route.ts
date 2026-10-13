import { NextRequest, NextResponse } from "next/server";
import { agentService } from "../../../../services/AgentService";

export async function GET() {
  try {
    const latest = await agentService.getLatestRun();
    return NextResponse.json({ success: true, latest });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { goal, mode, approved } = await req.json();
    if (!goal) {
      return NextResponse.json({ success: false, error: "Goal is required" }, { status: 400 });
    }

    const summary = await agentService.runGoal(goal, mode || "dry_run", Boolean(approved));
    return NextResponse.json({ success: true, summary });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
