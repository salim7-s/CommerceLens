import { productRepo, categoryRepo } from "./container";
import { computeHealth } from "../domain/health";
import { Product } from "../domain/schemas";
import { randomUUID } from "crypto";

export class ProductService {
  async listProducts(filter?: {
    status?: string;
    search?: string;
    category?: string;
    tag?: string;
    sort?: string;
  }): Promise<Product[]> {
    return productRepo.findAll(filter);
  }

  async getAllTags(): Promise<string[]> {
    const facets = await this.getTagFacets();
    return facets.map((f) => f.name);
  }

  async getTagFacets(): Promise<Array<{ name: string; count: number }>> {
    const products = await productRepo.findAll();
    const countMap = new Map<string, number>();

    for (const p of products) {
      const seen = new Set<string>();
      const tags = Array.isArray(p.seo_tags) ? p.seo_tags : [];

      for (let raw of tags) {
        if (!raw || typeof raw !== "string") continue;
        raw = raw.replace(/^#/, "").trim();

        let normalized = raw;
        const low = raw.toLowerCase();
        if (low.includes("sneaker") || low.includes("shoe")) normalized = "Sneakers";
        else if (low.includes("backpack") || low.includes("daypack") || low.includes("bag")) normalized = "Backpack";
        else if (low.includes("headphone") || low.includes("audio")) normalized = "Headphones";
        else if (low.includes("noise cancel")) normalized = "Noise-Canceling";
        else if (low.includes("wireless") || low.includes("bluetooth")) normalized = "Wireless";
        else if (low.includes("skate")) normalized = "Skate";
        else if (low.includes("recycled") || low.includes("eco")) normalized = "Eco-Friendly";
        else if (low.includes("water") || low.includes("weather")) normalized = "Water-Repellent";
        else if (low.includes("canvas")) normalized = "Canvas";
        else if (low.includes("athletic") || low.includes("sport")) normalized = "Athletic";
        else {
          normalized = raw
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
        }

        if (!seen.has(normalized)) {
          seen.add(normalized);
          countMap.set(normalized, (countMap.get(normalized) || 0) + 1);
        }
      }

      // Also infer primary catalog tags from title/category
      const nameLow = (p.name || "").toLowerCase();
      if ((nameLow.includes("shoe") || nameLow.includes("sneaker")) && !seen.has("Sneakers")) {
        seen.add("Sneakers");
        countMap.set("Sneakers", (countMap.get("Sneakers") || 0) + 1);
      }
      if ((nameLow.includes("backpack") || nameLow.includes("daypack")) && !seen.has("Backpack")) {
        seen.add("Backpack");
        countMap.set("Backpack", (countMap.get("Backpack") || 0) + 1);
      }
      if (nameLow.includes("headphone") && !seen.has("Headphones")) {
        seen.add("Headphones");
        countMap.set("Headphones", (countMap.get("Headphones") || 0) + 1);
      }
    }

    return Array.from(countMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getProduct(id: string): Promise<Product | null> {
    const product = await productRepo.findById(id);
    if (!product) return null;

    // Refresh health score against latest category templates
    let templates: import("../domain/schemas").AttributeTemplate[] = [];
    if (product.category_id) {
      templates = await categoryRepo.getTemplates(product.category_id);
    }
    const health = computeHealth(product, templates);
    product.health_score = health.score;
    product.status = product.status === "ready" && health.score >= 80 ? "ready" : health.status;

    return product;
  }

  async saveProduct(input: Partial<Product>): Promise<Product> {
    const id = input.id || "prod_" + randomUUID().slice(0, 8);
    const sku = input.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`;

    let templates: import("../domain/schemas").AttributeTemplate[] = [];
    if (input.category_id) {
      templates = await categoryRepo.getTemplates(input.category_id);
    }

    const health = computeHealth(input, templates);

    const product: Product = {
      id,
      sku,
      name: input.name?.trim() || "Untitled Product",
      category_id: input.category_id || null,
      category_name: input.category_name || null,
      price: Number(input.price) || 0,
      description: input.description || "",
      alt_text: input.alt_text || "",
      seo_tags: Array.isArray(input.seo_tags) ? input.seo_tags : [],
      image_public_id: input.image_public_id || "",
      image_url: input.image_url || "",
      health_score: health.score,
      status: input.status === "ready" && health.score >= 80 ? "ready" : health.status,
      woo_id: input.woo_id ?? null,
      sync_status: input.sync_status || "none",
      synced_at: input.synced_at ?? null,
      attributes: input.attributes || {},
    };

    return productRepo.save(product);
  }

  async markReady(id: string): Promise<{ success: boolean; message: string; product?: Product }> {
    const product = await this.getProduct(id);
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    if (product.health_score < 80) {
      return {
        success: false,
        message: `Quality gate not met: Health score is ${product.health_score}/100. Minimum 80 required to mark Ready for WooCommerce.`,
        product,
      };
    }

    product.status = "ready";
    const updated = await productRepo.save(product);
    return {
      success: true,
      message: "Product approved and marked Ready for WooCommerce!",
      product: updated,
    };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const existing = await this.getProduct(id);
    if (!existing) throw new Error("Product not found");
    return this.saveProduct({ ...existing, ...updates, id });
  }

  async deleteProduct(id: string): Promise<boolean> {
    return productRepo.delete(id);
  }
}

export const productService = new ProductService();
