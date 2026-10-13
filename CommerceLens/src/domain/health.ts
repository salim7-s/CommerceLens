import { Product, AttributeTemplate, HealthScoreResult, HealthCheckItem, ProductStatus } from "./schemas";

/**
 * Pure function to compute the deterministic Product Health Score (0 - 100).
 * No I/O, no database dependencies.
 */
export function computeHealth(
  product: Partial<Product>,
  templates: AttributeTemplate[] = []
): HealthScoreResult {
  const checks: HealthCheckItem[] = [];

  // 1. Title (15 pts): length 15-70 chars, not generic (single word fails)
  const trimmedTitle = (product.name || "").trim();
  const titleWords = trimmedTitle.split(/\s+/).filter(Boolean);
  const titlePass = trimmedTitle.length >= 15 && trimmedTitle.length <= 70 && titleWords.length > 1;
  checks.push({
    key: "title",
    pass: titlePass,
    points: titlePass ? 15 : 0,
    maxPoints: 15,
    hint: titlePass
      ? "Title length and specificity are optimal"
      : "Must be 15-70 characters and not a generic single word",
  });

  // 2. Description (20 pts): length >= 120 chars
  const trimmedDesc = (product.description || "").trim();
  const descPass = trimmedDesc.length >= 120;
  checks.push({
    key: "description",
    pass: descPass,
    points: descPass ? 20 : 0,
    maxPoints: 20,
    hint: descPass
      ? "Description provides thorough product details"
      : "Description must be at least 120 characters for good conversion",
  });

  // 3. Category (10 pts): category set
  const categoryPass = Boolean(product.category_id && product.category_id.trim().length > 0);
  checks.push({
    key: "category",
    pass: categoryPass,
    points: categoryPass ? 10 : 0,
    maxPoints: 10,
    hint: categoryPass
      ? "Category assigned"
      : "Assign a product category to enable attribute templates",
  });

  // 4. Required Attributes (20 pts): all required attrs of category template filled and valid
  const requiredTemplates = templates.filter((t) => t.required);
  let requiredAttrsPass = true;
  const missingAttrs: string[] = [];

  if (requiredTemplates.length === 0) {
    // If no templates configured or category unset, check if at least 3 custom attributes exist
    const attrCount = Object.keys(product.attributes || {}).length;
    requiredAttrsPass = categoryPass && attrCount >= 3;
    if (!requiredAttrsPass) missingAttrs.push("general attributes");
  } else {
    const productAttrs = product.attributes || {};
    for (const req of requiredTemplates) {
      const val = productAttrs[req.name];
      if (val === undefined || val === null || String(val).trim().length === 0) {
        requiredAttrsPass = false;
        missingAttrs.push(req.name);
      }
    }
  }

  checks.push({
    key: "required_attributes",
    pass: requiredAttrsPass,
    points: requiredAttrsPass ? 20 : 0,
    maxPoints: 20,
    hint: requiredAttrsPass
      ? "All mandatory category attributes filled"
      : `Missing required attributes: ${missingAttrs.join(", ") || "none specified"}`,
  });

  // 5. Image (15 pts): image_url present
  const imagePass = Boolean(product.image_url && product.image_url.trim().length > 0);
  checks.push({
    key: "image",
    pass: imagePass,
    points: imagePass ? 15 : 0,
    maxPoints: 15,
    hint: imagePass
      ? "Product image present"
      : "Upload at least one product photo",
  });

  // 6. Alt Text (10 pts): length >= 10 chars
  const trimmedAlt = (product.alt_text || "").trim();
  const altPass = trimmedAlt.length >= 10;
  checks.push({
    key: "alt_text",
    pass: altPass,
    points: altPass ? 10 : 0,
    maxPoints: 10,
    hint: altPass
      ? "Descriptive alt text provides accessibility and image SEO"
      : "Alt text must be at least 10 characters",
  });

  // 7. SEO Tags (10 pts): >= 3 tags
  const tags = Array.isArray(product.seo_tags) ? product.seo_tags.filter((t) => t.trim().length > 0) : [];
  const tagsPass = tags.length >= 3;
  checks.push({
    key: "seo_tags",
    pass: tagsPass,
    points: tagsPass ? 10 : 0,
    maxPoints: 10,
    hint: tagsPass
      ? `${tags.length} SEO tags configured`
      : "Provide at least 3 SEO keywords/tags for search discovery",
  });

  const totalScore = checks.reduce((sum, item) => sum + item.points, 0);

  let status: ProductStatus = "needs_work";
  if (totalScore >= 80) {
    status = "ready";
  } else if (totalScore >= 50) {
    status = "improve";
  }

  return {
    score: totalScore,
    status,
    checks,
  };
}
