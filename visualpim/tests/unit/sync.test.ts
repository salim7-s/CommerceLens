import { describe, it, expect } from "vitest";
import { MockStoreAdapter } from "../../src/adapters/store/mock";
import { Product } from "../../src/domain/schemas";

describe("Sync idempotency with MockStoreAdapter", () => {
  const mockStore = new MockStoreAdapter();

  const product: Product = {
    id: "prod_sync_1",
    sku: "SHOE-RED-TEST",
    name: "Classic Red Canvas Low-Top Sneakers",
    category_id: "cat_footwear",
    price: 49.99,
    description: "Engineered for daily casual wear with reinforced stitching and flexible rubber soles.",
    alt_text: "Red canvas sneaker product photo",
    seo_tags: ["red sneakers", "canvas shoes"],
    image_public_id: "shoe_sample",
    image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    health_score: 85,
    status: "ready",
    sync_status: "none",
    attributes: { color: "Red", size: "10" },
  };

  it("creates a new product on first sync", async () => {
    const res = await mockStore.syncProduct(product);
    expect(res.status).toBe("synced");
    expect(res.action).toBe("create");
    expect(res.wooId).toBeGreaterThan(0);
    expect(mockStore.getAllProducts().length).toBe(1);
  });

  it("updates the same product when re-synced with woo_id (idempotency)", async () => {
    const res1 = await mockStore.syncProduct(product);
    const wooId = res1.wooId;

    // Second sync with woo_id attached
    const productWithId: Product = {
      ...product,
      woo_id: wooId,
      name: "Updated Red Canvas Low-Top Sneakers",
    };

    const res2 = await mockStore.syncProduct(productWithId);
    expect(res2.status).toBe("synced");
    expect(res2.action).toBe("update");
    expect(res2.wooId).toBe(wooId);

    // Assert only 1 product remains in store (no duplicates!)
    const all = mockStore.getAllProducts();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe("Updated Red Canvas Low-Top Sneakers");
  });

  it("finds existing product by SKU when woo_id is omitted (idempotency)", async () => {
    // Sync again without woo_id, but with the same SKU
    const productWithoutWooId: Product = {
      ...product,
      woo_id: undefined,
      name: "Third Update Via SKU Lookup",
    };

    const res = await mockStore.syncProduct(productWithoutWooId);
    expect(res.status).toBe("synced");
    expect(res.action).toBe("update");

    // Still only 1 product in store
    expect(mockStore.getAllProducts().length).toBe(1);
  });
});
