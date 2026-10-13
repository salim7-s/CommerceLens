import { Product } from "./schemas";

export interface WooProductPayload {
  name: string;
  sku: string;
  regular_price: string;
  description: string;
  short_description: string;
  status: "publish" | "draft";
  categories?: { id: number }[];
  images?: { src: string; alt: string }[];
  attributes?: {
    name: string;
    options: string[];
    visible: boolean;
    variation: boolean;
  }[];
  tags?: { name: string }[];
  meta_data: { key: string; value: string }[];
}

/**
 * Extracts the first sentence of a description for WooCommerce short_description.
 */
export function extractFirstSentence(text: string): string {
  if (!text) return "";
  const match = text.match(/^([^.!?]+[.!?])/);
  return match ? match[1].trim() : text.slice(0, 120).trim();
}

/**
 * Maps a CommerceLens Product domain object to a WooCommerce REST v3 product payload.
 */
export function toWooProduct(
  product: Product,
  options?: {
    wooCategoryId?: number;
    cardImageUrl?: string;
  }
): WooProductPayload {
  const shortDescription = extractFirstSentence(product.description);

  // Map product-level attributes
  const mappedAttributes = Object.entries(product.attributes || {}).map(([name, value]) => ({
    name,
    options: [String(value)],
    visible: true,
    variation: false,
  }));

  // Build images array
  const imageUrl = options?.cardImageUrl || product.image_url;
  const images = imageUrl && imageUrl.trim().length > 0
    ? [{ src: imageUrl.trim(), alt: product.alt_text || product.name }]
    : [];

  // Build tags
  const tags = (product.seo_tags || [])
    .filter((t) => t.trim().length > 0)
    .map((tag) => ({ name: tag.trim() }));

  const payload: WooProductPayload = {
    name: product.name,
    sku: product.sku,
    regular_price: String(product.price || "0"),
    description: product.description,
    short_description: shortDescription,
    status: product.status === "ready" ? "publish" : "draft",
    attributes: mappedAttributes,
    images,
    tags,
    meta_data: [
      { key: "pim_id", value: product.id },
      { key: "pim_health_score", value: String(product.health_score) },
    ],
  };

  if (options?.wooCategoryId) {
    payload.categories = [{ id: options.wooCategoryId }];
  }

  return payload;
}
