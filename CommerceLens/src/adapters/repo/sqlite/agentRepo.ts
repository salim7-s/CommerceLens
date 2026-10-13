import { getDatabase } from "./database";
import { AgentRepository } from "../../../ports/Repositories";
import { AgentRunRecord, AgentStepRecord } from "../../../domain/schemas";
import { randomUUID } from "crypto";

export class SqliteAgentRepository implements AgentRepository {
  async createRun(goal: string, mode: "dry_run" | "apply"): Promise<AgentRunRecord> {
    const db = getDatabase();
    const id = "run_" + randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO agent_runs (id, goal, mode, status, created_at)
      VALUES (?, ?, ?, 'running', datetime('now'))
    `).run(id, goal, mode);

    return (await this.getRun(id))!;
  }

  async updateRunStatus(id: string, status: AgentRunRecord["status"]): Promise<void> {
    const db = getDatabase();
    db.prepare("UPDATE agent_runs SET status = ? WHERE id = ?").run(status, id);
  }

  async getRun(id: string): Promise<AgentRunRecord | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM agent_runs WHERE id = ?").get(id) as AgentRunRecord | undefined;
    return row || null;
  }

  async addStep(step: Omit<AgentStepRecord, "id" | "created_at">): Promise<AgentStepRecord> {
    const db = getDatabase();
    const id = "step_" + randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO agent_steps (id, run_id, step_no, tool, input_json, output_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, step.run_id, step.step_no, step.tool, JSON.stringify(step.input), JSON.stringify(step.output));

    const row = db.prepare("SELECT * FROM agent_steps WHERE id = ?").get(id) as {
      id: string;
      run_id: string;
      step_no: number;
      tool: string;
      input_json: string;
      output_json: string;
      created_at: string;
    };

    return {
      id: row.id,
      run_id: row.run_id,
      step_no: row.step_no,
      tool: row.tool,
      input: JSON.parse(row.input_json),
      output: JSON.parse(row.output_json),
      created_at: row.created_at,
    };
  }

  async getSteps(runId: string): Promise<AgentStepRecord[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM agent_steps WHERE run_id = ? ORDER BY step_no ASC").all(runId) as {
      id: string;
      run_id: string;
      step_no: number;
      tool: string;
      input_json: string;
      output_json: string;
      created_at: string;
    }[];

    return rows.map((r) => ({
      id: r.id,
      run_id: r.run_id,
      step_no: r.step_no,
      tool: r.tool,
      input: JSON.parse(r.input_json),
      output: JSON.parse(r.output_json),
      created_at: r.created_at,
    }));
  }
}
