import { getDatabase } from "./database";
import { CategoryRepository } from "../../../ports/Repositories";
import { Category, AttributeTemplate } from "../../../domain/schemas";

export class SqliteCategoryRepository implements CategoryRepository {
  async findAll(): Promise<Category[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM categories ORDER BY name ASC").all() as {
      id: string;
      name: string;
      woo_id: number | null;
    }[];

    const categories: Category[] = [];
    for (const r of rows) {
      const templates = await this.getTemplates(r.id);
      categories.push({
        id: r.id,
        name: r.name,
        woo_id: r.woo_id,
        templates,
      });
    }
    return categories;
  }

  async findById(id: string): Promise<Category | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as {
      id: string;
      name: string;
      woo_id: number | null;
    } | undefined;

    if (!row) return null;
    const templates = await this.getTemplates(row.id);
    return {
      id: row.id,
      name: row.name,
      woo_id: row.woo_id,
      templates,
    };
  }

  async getTemplates(categoryId: string): Promise<AttributeTemplate[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM attribute_templates WHERE category_id = ?").all(categoryId) as {
      id: string;
      category_id: string;
      name: string;
      type: "text" | "number" | "select" | "boolean";
      required: number;
      options_json: string;
    }[];

    return rows.map((r) => ({
      id: r.id,
      category_id: r.category_id,
      name: r.name,
      type: r.type,
      required: Boolean(r.required),
      options: JSON.parse(r.options_json || "[]"),
    }));
  }

  async saveCategory(category: Category): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO categories (id, name, woo_id)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name, woo_id = excluded.woo_id
    `).run(category.id, category.name, category.woo_id ?? null);
  }

  async saveTemplate(template: AttributeTemplate): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO attribute_templates (id, category_id, name, type, required, options_json)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        category_id = excluded.category_id,
        name = excluded.name,
        type = excluded.type,
        required = excluded.required,
        options_json = excluded.options_json
    `).run(
      template.id,
      template.category_id,
      template.name,
      template.type,
      template.required ? 1 : 0,
      JSON.stringify(template.options || [])
    );
  }
}
