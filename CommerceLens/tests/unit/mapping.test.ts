import { describe, it, expect } from "vitest";
import { toWooProduct, extractFirstSentence } from "../../src/domain/mapping";
import { Product } from "../../src/domain/schemas";

describe("toWooProduct mapping logic", () => {
  it("extracts the first sentence correctly", () => {
    const text = "Engineered for daily casual wear. Features reinforced stitching. Breathable uppers.";
    expect(extractFirstSentence(text)).toBe("Engineered for daily casual wear.");
  });

  it("maps PIM product to WooCommerce REST v3 payload", () => {
    const product: Product = {
      id: "prod_123",
      sku: "SHOE-RED-01",
      name: "Classic Red Canvas Low-Top Sneakers",
      category_id: "cat_footwear",
      price: 49.99,
      description: "Engineered for daily casual wear. Features reinforced stitching.",
      alt_text: "Red canvas sneaker side view",
      seo_tags: ["canvas shoes", "red sneakers"],
      image_public_id: "CommerceLens/shoe_red",
      image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      health_score: 85,
      status: "ready",
      sync_status: "none",
      attributes: {
        color: "Red",
        size: "10",
      },
    };

    const payload = toWooProduct(product, { wooCategoryId: 42 });

    expect(payload.name).toBe("Classic Red Canvas Low-Top Sneakers");
    expect(payload.sku).toBe("SHOE-RED-01");
    expect(payload.regular_price).toBe("49.99");
    expect(payload.status).toBe("publish");
    expect(payload.short_description).toBe("Engineered for daily casual wear.");
    expect(payload.categories).toEqual([{ id: 42 }]);
    expect(payload.images).toEqual([
      { src: "https://res.cloudinary.com/demo/image/upload/sample.jpg", alt: "Red canvas sneaker side view" },
    ]);
    expect(payload.attributes).toEqual([
      { name: "color", options: ["Red"], visible: true, variation: false },
      { name: "size", options: ["10"], visible: true, variation: false },
    ]);
    expect(payload.tags).toEqual([
      { name: "canvas shoes" },
      { name: "red sneakers" },
    ]);
    expect(payload.meta_data).toEqual([
      { key: "pim_id", value: "prod_123" },
      { key: "pim_health_score", value: "85" },
    ]);
  });
});
