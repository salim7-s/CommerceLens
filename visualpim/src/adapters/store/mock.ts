import { StorePort, SyncResult } from "../../ports/StorePort";
import { Product } from "../../domain/schemas";
import { toWooProduct } from "../../domain/mapping";

export class MockStoreAdapter implements StorePort {
  private store: Map<number, Record<string, unknown>> = new Map();
  private skuToId: Map<string, number> = new Map();
  private nextId = 1001;

  async syncProduct(product: Product, options?: { cardImageUrl?: string }): Promise<SyncResult> {
    const payload = toWooProduct(product, { cardImageUrl: options?.cardImageUrl });

    // 1. Check if product already exists by stored woo_id
    if (product.woo_id && this.store.has(product.woo_id)) {
      this.store.set(product.woo_id, { id: product.woo_id, ...payload });
      return {
        wooId: product.woo_id,
        status: "synced",
        action: "update",
        message: `Successfully updated product #${product.woo_id} (SKU: ${product.sku}) in store`,
      };
    }

    // 2. Check if product exists by SKU
    if (this.skuToId.has(product.sku)) {
      const existingId = this.skuToId.get(product.sku)!;
      this.store.set(existingId, { id: existingId, ...payload });
      return {
        wooId: existingId,
        status: "synced",
        action: "update",
        message: `Found existing SKU ${product.sku} -> updated product #${existingId}`,
      };
    }

    // 3. Create new product
    const newId = this.nextId++;
    this.store.set(newId, { id: newId, ...payload });
    this.skuToId.set(product.sku, newId);

    return {
      wooId: newId,
      status: "synced",
      action: "create",
      message: `Created new product #${newId} (SKU: ${product.sku}) in store`,
    };
  }

  async getProduct(wooId: number): Promise<Record<string, unknown> | null> {
    return this.store.get(wooId) || null;
  }

  async checkConnection(): Promise<boolean> {
    return true;
  }

  getAllProducts(): Record<string, unknown>[] {
    return Array.from(this.store.values());
  }
}
