import { agentRepo } from "./container";
import { agentTools, AgentContext } from "../agent/tools";
import { AgentRunRecord, AgentStepRecord } from "../domain/schemas";

export interface AgentRunSummary {
  run: AgentRunRecord;
  steps: AgentStepRecord[];
  summary: {
    scanned: number;
    improved: number;
    synced: number;
    proposals: string[];
  };
}

export class AgentService {
  async runGoal(
    goal: string,
    mode: "dry_run" | "apply" = "dry_run",
    approved = false
  ): Promise<AgentRunSummary> {
    const run = await agentRepo.createRun(goal, mode);
    const ctx: AgentContext = { mode, approved };
    const executedSteps: AgentStepRecord[] = [];
    let stepNo = 1;

    const proposals: string[] = [];
    let scanned = 0;
    let improved = 0;
    let synced = 0;

    try {
      // Step 1: List products needing improvement or not yet synced
      const listStep = await agentRepo.addStep({
        run_id: run.id,
        step_no: stepNo++,
        tool: "list_products",
        input: { status: "all" },
        output: await agentTools.list_products({}, ctx),
      });
      executedSteps.push(listStep);

      const products = listStep.output as {
        id: string;
        name: string;
        health_score: number;
        status: string;
        sync_status: string;
      }[];
      scanned = products.length;

      // Filter products needing work or improve
      const targetProducts = products.filter((p) => p.status !== "ready" || p.sync_status !== "synced").slice(0, 5);

      for (const prod of targetProducts) {
        if (stepNo > 25) break; // Hard safety cap

        // Step: get_health
        const healthStep = await agentRepo.addStep({
          run_id: run.id,
          step_no: stepNo++,
          tool: "get_health",
          input: { id: prod.id },
          output: await agentTools.get_health({ id: prod.id }, ctx),
        });
        executedSteps.push(healthStep);

        // Step: suggest_improvements
        const suggestStep = await agentRepo.addStep({
          run_id: run.id,
          step_no: stepNo++,
          tool: "suggest_improvements",
          input: { id: prod.id },
          output: await agentTools.suggest_improvements({ id: prod.id }, ctx),
        });
        executedSteps.push(suggestStep);
        improved++;

        const titleProposal = (suggestStep.output as { proposedTitle?: string })?.proposedTitle || prod.name;
        proposals.push(`Enrich '${prod.name}' -> '${titleProposal}' (adds SEO tags & Cloudinary card variant)`);

        // Step: apply_suggestion (only in apply mode if approved)
        if (mode === "apply" && approved) {
          const applyStep = await agentRepo.addStep({
            run_id: run.id,
            step_no: stepNo++,
            tool: "apply_suggestion",
            input: { id: prod.id },
            output: await agentTools.apply_suggestion({ id: prod.id }, ctx),
          });
          executedSteps.push(applyStep);

          // Step: sync_product
          const syncStep = await agentRepo.addStep({
            run_id: run.id,
            step_no: stepNo++,
            tool: "sync_product",
            input: { id: prod.id },
            output: await agentTools.sync_product({ id: prod.id }, ctx),
          });
          executedSteps.push(syncStep);
          synced++;
        }
      }

      await agentRepo.updateRunStatus(run.id, "completed");
      run.status = "completed";

      return {
        run,
        steps: executedSteps,
        summary: {
          scanned,
          improved,
          synced,
          proposals,
        },
      };
    } catch (err) {
      await agentRepo.updateRunStatus(run.id, "failed");
      run.status = "failed";
      throw err;
    }
  }

  async getLatestRun(): Promise<AgentRunSummary | null> {
    const db = (await import("../adapters/repo/sqlite/database")).getDatabase();
    const latest = db.prepare("SELECT * FROM agent_runs ORDER BY created_at DESC LIMIT 1").get() as AgentRunRecord | undefined;
    if (!latest) return null;

    const steps = await agentRepo.getSteps(latest.id);
    return {
      run: latest,
      steps,
      summary: {
        scanned: steps.filter((s) => s.tool === "list_products").length,
        improved: steps.filter((s) => s.tool === "suggest_improvements").length,
        synced: steps.filter((s) => s.tool === "sync_product").length,
        proposals: steps
          .filter((s) => s.tool === "suggest_improvements")
          .map((s) => `Proposed fix for ${(s.input as { id: string }).id}`),
      },
    };
  }
}

export const agentService = new AgentService();
