import { productService } from "../services/ProductService";
import { analyzeService } from "../services/AnalyzeService";
import { syncService } from "../services/SyncService";
import { computeHealth } from "../domain/health";
import { categoryRepo } from "../services/container";

export interface AgentContext {
  mode: "dry_run" | "apply";
  approved: boolean;
}

export const agentTools = {
  list_products: async (args: { status?: string }, _ctx?: AgentContext) => {
    void _ctx;
    const products = await productService.listProducts(args.status ? { status: args.status } : undefined);
    return products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category_id: p.category_id,
      category_name: p.category_name,
      image_url: p.image_url,
      price: p.price,
      health_score: p.health_score,
      status: p.status,
      sync_status: p.sync_status,
    }));
  },

  get_health: async (args: { id: string }, _ctx?: AgentContext) => {
    void _ctx;
    const product = await productService.getProduct(args.id);
    if (!product) return { error: "Product not found" };

    const templates = product.category_id ? await categoryRepo.getTemplates(product.category_id) : [];
    const health = computeHealth(product, templates);

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      image_url: product.image_url,
      category_name: product.category_name,
      price: product.price,
      score: health.score,
      status: health.status,
      checks: health.checks,
      failedChecks: health.checks.filter((c) => !c.pass).map((c) => ({ key: c.key, hint: c.hint })),
    };
  },

  suggest_improvements: async (args: { id: string }, _ctx?: AgentContext) => {
    void _ctx;
    const product = await productService.getProduct(args.id);
    const suggestion = await analyzeService.analyzeProduct(args.id);
    return {
      productId: args.id,
      productName: product?.name || "",
      productSku: product?.sku || "",
      productImageUrl: product?.image_url || "",
      productCategory: product?.category_name || "",
      suggestionId: suggestion.id,
      proposedTitle: suggestion.payload.improvedTitle,
      proposedSeo: suggestion.payload.seoKeywords,
      proposedAlt: suggestion.payload.altText,
      proposedAttributes: suggestion.payload.attributes,
      missingAttributes: suggestion.payload.missingAttributes,
    };
  },

  apply_suggestion: async (args: { id: string }, ctx: AgentContext) => {
    if (ctx.mode !== "apply" || !ctx.approved) {
      return {
        action: "PROPOSAL_ONLY (Dry-Run)",
        message: `Plan prepared: Would apply AI improvements to product ${args.id}. Awaiting merchant approval.`,
      };
    }

    const res = await analyzeService.acceptSuggestion(args.id);
    return {
      action: "APPLIED",
      id: res.product.id,
      newScore: res.product.health_score,
      newStatus: res.product.status,
    };
  },

  sync_product: async (args: { id: string }, ctx: AgentContext) => {
    if (ctx.mode !== "apply" || !ctx.approved) {
      return {
        action: "PROPOSAL_ONLY (Dry-Run)",
        message: `Plan prepared: Would sync product ${args.id} to WooCommerce once marked ready.`,
      };
    }

    const res = await syncService.syncProduct(args.id);
    return {
      action: "SYNCED",
      wooId: res.wooId,
      status: res.status,
      message: res.message,
    };
  },
};
