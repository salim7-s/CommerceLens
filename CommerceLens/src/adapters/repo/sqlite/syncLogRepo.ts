import { getDatabase } from "./database";
import { SyncLogRepository } from "../../../ports/Repositories";
import { SyncLogRecord } from "../../../domain/schemas";
import { randomUUID } from "crypto";

export class SqliteSyncLogRepository implements SyncLogRepository {
  async create(log: Omit<SyncLogRecord, "id" | "created_at">): Promise<SyncLogRecord> {
    const db = getDatabase();
    const id = "sync_" + randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO sync_log (id, product_id, action, status, message, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(id, log.product_id, log.action, log.status, log.message);

    const created = db.prepare(`
      SELECT sl.*, p.sku, p.name as product_name
      FROM sync_log sl
      LEFT JOIN products p ON sl.product_id = p.id
      WHERE sl.id = ?
    `).get(id) as SyncLogRecord;

    return created;
  }

  async findAll(limit = 100): Promise<SyncLogRecord[]> {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT sl.*, p.sku, p.name as product_name
      FROM sync_log sl
      LEFT JOIN products p ON sl.product_id = p.id
      ORDER BY sl.created_at DESC
      LIMIT ?
    `).all(limit) as SyncLogRecord[];

    return rows;
  }
}
