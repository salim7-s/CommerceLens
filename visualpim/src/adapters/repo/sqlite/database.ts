import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

interface GlobalDatabaseHolder {
  __commerceLensDb?: Database.Database;
  __commerceLensSchemaInit?: boolean;
}

const globalForDb = globalThis as unknown as GlobalDatabaseHolder;

export function getDatabase(): Database.Database {
  if (globalForDb.__commerceLensDb) {
    return globalForDb.__commerceLensDb;
  }

  // Store database file in data/CommerceLens.db or /tmp for serverless (Vercel)
  let dataDir = path.join(process.cwd(), "data");
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    dataDir = path.join("/tmp", "data");
  }

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch {
    dataDir = path.join("/tmp", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  const dbPath = path.join(dataDir, "CommerceLens.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  if (!globalForDb.__commerceLensSchemaInit) {
    const tableExists = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'")
      .get();
    if (!tableExists) {
      initSchema(db);
    }
    globalForDb.__commerceLensSchemaInit = true;
  }

  globalForDb.__commerceLensDb = db;
  return db;
}

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      woo_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS attribute_templates (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      required INTEGER NOT NULL DEFAULT 0,
      options_json TEXT DEFAULT '[]',
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category_id TEXT,
      price REAL DEFAULT 0,
      description TEXT DEFAULT '',
      alt_text TEXT DEFAULT '',
      seo_tags_json TEXT DEFAULT '[]',
      image_public_id TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      health_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'needs_work',
      woo_id INTEGER,
      sync_status TEXT DEFAULT 'none',
      synced_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_attributes (
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (product_id, name),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_suggestions (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      goal TEXT NOT NULL,
      mode TEXT DEFAULT 'dry_run',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_steps (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      step_no INTEGER NOT NULL,
      tool TEXT NOT NULL,
      input_json TEXT NOT NULL,
      output_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE CASCADE
    );

    INSERT OR IGNORE INTO categories (id, name, woo_id) VALUES
      ('cat_footwear', 'Footwear', 11),
      ('cat_apparel', 'Apparel', 12),
      ('cat_electronics', 'Electronics', 13);

    INSERT OR IGNORE INTO attribute_templates (id, category_id, name, type, required, options_json) VALUES
      ('tmpl_fw_size', 'cat_footwear', 'size', 'text', 1, '[]'),
      ('tmpl_fw_color', 'cat_footwear', 'color', 'text', 1, '[]'),
      ('tmpl_fw_material', 'cat_footwear', 'material', 'text', 1, '[]'),
      ('tmpl_fw_gender', 'cat_footwear', 'gender', 'select', 1, '["Men","Women","Unisex"]'),
      ('tmpl_fw_sole', 'cat_footwear', 'sole_type', 'text', 0, '[]'),
      ('tmpl_ap_size', 'cat_apparel', 'size', 'select', 1, '["XS","S","M","L","XL","XXL"]'),
      ('tmpl_ap_color', 'cat_apparel', 'color', 'text', 1, '[]'),
      ('tmpl_ap_fabric', 'cat_apparel', 'fabric', 'text', 1, '[]'),
      ('tmpl_ap_fit', 'cat_apparel', 'fit', 'select', 0, '["Slim","Regular","Relaxed"]'),
      ('tmpl_el_brand', 'cat_electronics', 'brand', 'text', 1, '[]'),
      ('tmpl_el_model', 'cat_electronics', 'model', 'text', 1, '[]'),
      ('tmpl_el_warranty', 'cat_electronics', 'warranty', 'text', 1, '[]'),
      ('tmpl_el_voltage', 'cat_electronics', 'voltage', 'text', 0, '[]');
  `);
}
