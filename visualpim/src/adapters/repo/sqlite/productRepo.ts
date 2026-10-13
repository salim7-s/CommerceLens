import { getDatabase } from "./database";
import { ProductRepository } from "../../../ports/Repositories";
import { Product, AISuggestionRecord, ProductStatus, SyncStatus } from "../../../domain/schemas";

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  category_id: string | null;
  category_name: string | null;
  price: number;
  description: string;
  alt_text: string;
  seo_tags_json: string;
  image_public_id: string;
  image_url: string;
  health_score: number;
  status: ProductStatus;
  woo_id: number | null;
  sync_status: SyncStatus;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export class SqliteProductRepository implements ProductRepository {
  private mapRowToProduct(row: ProductRow, attributes: Record<string, string> = {}): Product {
    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      category_id: row.category_id,
      category_name: row.category_name,
      price: row.price,
      description: row.description || "",
      alt_text: row.alt_text || "",
      seo_tags: JSON.parse(row.seo_tags_json || "[]"),
      image_public_id: row.image_public_id || "",
      image_url: row.image_url || "",
      health_score: row.health_score,
      status: row.status,
      woo_id: row.woo_id,
      sync_status: row.sync_status,
      synced_at: row.synced_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      attributes,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id) as ProductRow | undefined;

    if (!row) return null;
    const attributes = await this.getAttributes(row.id);
    return this.mapRowToProduct(row, attributes);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.sku = ?
    `).get(sku) as ProductRow | undefined;

    if (!row) return null;
    const attributes = await this.getAttributes(row.id);
    return this.mapRowToProduct(row, attributes);
  }

  async findAll(filter?: {
    status?: string;
    search?: string;
    category?: string;
    tag?: string;
    sort?: string;
  }): Promise<Product[]> {
    const db = getDatabase();
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (filter?.status && filter.status !== "all") {
      query += " AND p.status = ?";
      params.push(filter.status);
    }

    if (filter?.category && filter.category !== "all") {
      query += " AND (p.category_id = ? OR c.name = ?)";
      params.push(filter.category, filter.category);
    }

    if (filter?.tag && filter.tag.trim().length > 0) {
      const tagTerm = `%${filter.tag.trim().toLowerCase()}%`;
      query += " AND (LOWER(p.seo_tags_json) LIKE ? OR LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(c.name) LIKE ?)";
      params.push(tagTerm, tagTerm, tagTerm, tagTerm);
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const term = `%${filter.search.trim()}%`;
      query += ` AND (
        p.name LIKE ?
        OR p.sku LIKE ?
        OR p.description LIKE ?
        OR p.alt_text LIKE ?
        OR p.seo_tags_json LIKE ?
        OR c.name LIKE ?
      )`;
      params.push(term, term, term, term, term, term);
    }

    if (filter?.sort === "score_desc") {
      query += " ORDER BY p.health_score DESC";
    } else if (filter?.sort === "score_asc") {
      query += " ORDER BY p.health_score ASC";
    } else if (filter?.sort === "price_asc") {
      query += " ORDER BY p.price ASC";
    } else if (filter?.sort === "price_desc") {
      query += " ORDER BY p.price DESC";
    } else if (filter?.sort === "name_asc") {
      query += " ORDER BY p.name ASC";
    } else {
      query += " ORDER BY p.created_at DESC";
    }

    const rows = db.prepare(query).all(...params) as ProductRow[];
    const products: Product[] = [];
    for (const row of rows) {
      const attributes = await this.getAttributes(row.id);
      products.push(this.mapRowToProduct(row, attributes));
    }
    return products;
  }

  async getAllTags(): Promise<string[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT seo_tags_json FROM products").all() as { seo_tags_json: string }[];
    const tagSet = new Set<string>();
    for (const row of rows) {
      try {
        const tags = JSON.parse(row.seo_tags_json || "[]") as string[];
        for (const t of tags) {
          if (t && typeof t === "string") tagSet.add(t.trim().toLowerCase());
        }
      } catch {
        // ignore malformed json
      }
    }
    return Array.from(tagSet);
  }

  async save(product: Product): Promise<Product> {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO products (
        id, sku, name, category_id, price, description, alt_text,
        seo_tags_json, image_public_id, image_url, health_score,
        status, woo_id, sync_status, synced_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, datetime('now')
      )
      ON CONFLICT(id) DO UPDATE SET
        sku = excluded.sku,
        name = excluded.name,
        category_id = excluded.category_id,
        price = excluded.price,
        description = excluded.description,
        alt_text = excluded.alt_text,
        seo_tags_json = excluded.seo_tags_json,
        image_public_id = excluded.image_public_id,
        image_url = excluded.image_url,
        health_score = excluded.health_score,
        status = excluded.status,
        woo_id = excluded.woo_id,
        sync_status = excluded.sync_status,
        synced_at = excluded.synced_at,
        updated_at = datetime('now')
    `).run(
      product.id,
      product.sku,
      product.name,
      product.category_id ?? null,
      product.price,
      product.description || "",
      product.alt_text || "",
      JSON.stringify(product.seo_tags || []),
      product.image_public_id || "",
      product.image_url || "",
      product.health_score,
      product.status,
      product.woo_id ?? null,
      product.sync_status,
      product.synced_at ?? null
    );

    if (product.attributes) {
      await this.setAttributes(product.id, product.attributes);
    }

    const saved = await this.findById(product.id);
    return saved!;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return info.changes > 0;
  }

  async getAttributes(productId: string): Promise<Record<string, string>> {
    const db = getDatabase();
    const rows = db.prepare("SELECT name, value FROM product_attributes WHERE product_id = ?").all(productId) as {
      name: string;
      value: string;
    }[];
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.name] = r.value;
    }
    return map;
  }

  async setAttributes(productId: string, attributes: Record<string, string>): Promise<void> {
    const db = getDatabase();
    const deleteStmt = db.prepare("DELETE FROM product_attributes WHERE product_id = ?");
    const insertStmt = db.prepare("INSERT INTO product_attributes (product_id, name, value) VALUES (?, ?, ?)");

    const tx = db.transaction(() => {
      deleteStmt.run(productId);
      for (const [name, value] of Object.entries(attributes)) {
        insertStmt.run(productId, name, String(value));
      }
    });

    tx();
  }

  async saveSuggestion(suggestion: AISuggestionRecord): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO ai_suggestions (id, product_id, payload_json, status, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        payload_json = excluded.payload_json,
        status = excluded.status
    `).run(suggestion.id, suggestion.product_id, JSON.stringify(suggestion.payload), suggestion.status);
  }

  async getPendingSuggestion(productId: string): Promise<AISuggestionRecord | null> {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT * FROM ai_suggestions
      WHERE product_id = ? AND status = 'pending'
      ORDER BY created_at DESC LIMIT 1
    `).get(productId) as {
      id: string;
      product_id: string;
      payload_json: string;
      status: "pending" | "accepted" | "rejected";
      created_at: string;
    } | undefined;

    if (!row) return null;
    return {
      id: row.id,
      product_id: row.product_id,
      payload: JSON.parse(row.payload_json),
      status: row.status,
      created_at: row.created_at,
    };
  }

  async updateSuggestionStatus(id: string, status: "accepted" | "rejected"): Promise<void> {
    const db = getDatabase();
    db.prepare("UPDATE ai_suggestions SET status = ? WHERE id = ?").run(status, id);
  }
}
