import { productRepo, categoryRepo, aiAdapter, mediaAdapter } from "./container";
import { productService } from "./ProductService";
import { AISuggestionRecord, AISuggestionPayload } from "../domain/schemas";
import { randomUUID } from "crypto";

export class AnalyzeService {
  async analyzeProduct(productId: string): Promise<AISuggestionRecord> {
    const product = await productRepo.findById(productId);
    if (!product) throw new Error("Product not found");

    const templates = product.category_id ? await categoryRepo.getTemplates(product.category_id) : [];

    // Get product card or optimized image variant if available
    let imageUrl = product.image_url;
    if (imageUrl) {
      const variants = mediaAdapter.getVariants(product.image_public_id || imageUrl);
      const cardVariant = variants.find((v) => v.name === "card")?.url;
      if (cardVariant) imageUrl = cardVariant;
    }

    // Call AIPort
    const payload = await aiAdapter.analyzeProduct(product, templates, imageUrl);

    const suggestion: AISuggestionRecord = {
      id: "sug_" + randomUUID().slice(0, 8),
      product_id: productId,
      payload,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    await productRepo.saveSuggestion(suggestion);
    return suggestion;
  }

  async getPendingSuggestion(productId: string): Promise<AISuggestionRecord | null> {
    return productRepo.getPendingSuggestion(productId);
  }

  async acceptSuggestion(
    productId: string,
    options?: {
      applyTitle?: boolean;
      applyDescription?: boolean;
      applySeo?: boolean;
      applyAltText?: boolean;
      applyAttributes?: boolean;
    }
  ): Promise<{ success: boolean; product: import("../domain/schemas").Product }> {
    const product = await productRepo.findById(productId);
    if (!product) throw new Error("Product not found");

    const suggestion = await productRepo.getPendingSuggestion(productId);
    if (!suggestion) throw new Error("No pending AI suggestions to apply");

    const payload: AISuggestionPayload = suggestion.payload;
    const flags = {
      applyTitle: options?.applyTitle ?? true,
      applyDescription: options?.applyDescription ?? true,
      applySeo: options?.applySeo ?? true,
      applyAltText: options?.applyAltText ?? true,
      applyAttributes: options?.applyAttributes ?? true,
    };

    if (flags.applyTitle && payload.improvedTitle) {
      product.name = payload.improvedTitle;
    }
    if (flags.applyDescription && payload.description) {
      product.description = payload.description;
    }
    if (flags.applySeo && payload.seoKeywords) {
      product.seo_tags = payload.seoKeywords;
    }
    if (flags.applyAltText && payload.altText) {
      product.alt_text = payload.altText;
    }
    if (flags.applyAttributes && payload.attributes) {
      const mergedAttributes = { ...(product.attributes || {}) };
      for (const attr of payload.attributes) {
        // High & medium confidence attributes are applied
        if (attr.confidence === "high" || attr.confidence === "medium") {
          mergedAttributes[attr.name] = attr.value;
        }
      }
      product.attributes = mergedAttributes;
    }

    // Mark suggestion accepted
    await productRepo.updateSuggestionStatus(suggestion.id, "accepted");

    // Save and recompute health score
    const updated = await productService.saveProduct(product);

    return {
      success: true,
      product: updated,
    };
  }
}

export const analyzeService = new AnalyzeService();
