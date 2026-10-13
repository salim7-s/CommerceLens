import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { StorePort, SyncResult } from "../../ports/StorePort";
import { Product } from "../../domain/schemas";
import { toWooProduct } from "../../domain/mapping";
import { MockStoreAdapter } from "./mock";

export class WooStoreAdapter implements StorePort {
  private api: WooCommerceRestApi | null = null;
  private mockFallback: MockStoreAdapter;

  constructor() {
    this.mockFallback = new MockStoreAdapter();
    const url = process.env.WOO_URL;
    const consumerKey = process.env.WOO_KEY;
    const consumerSecret = process.env.WOO_SECRET;

    if (url && consumerKey && consumerSecret && !consumerKey.startsWith("ck_test")) {
      try {
        // @ts-expect-error official module default export format
        const Client = WooCommerceRestApi.default || WooCommerceRestApi;
        this.api = new Client({
          url,
          consumerKey,
          consumerSecret,
          version: "wc/v3",
          queryStringAuth: true,
        });
      } catch (e) {
        console.warn("Failed to initialize WooCommerce client, using fallback:", e);
      }
    }
  }

  async syncProduct(product: Product, options?: { cardImageUrl?: string }): Promise<SyncResult> {
    if (!this.api) {
      return this.mockFallback.syncProduct(product, options);
    }

    const payload = toWooProduct(product, { cardImageUrl: options?.cardImageUrl });

    try {
      // 1. If stored woo_id exists, attempt PUT
      if (product.woo_id) {
        try {
          const res = await this.api.put(`products/${product.woo_id}`, payload);
          if (res.status === 200) {
            return {
              wooId: product.woo_id,
              status: "synced",
              action: "update",
              message: `Updated product #${product.woo_id} via WooCommerce REST v3`,
            };
          }
        } catch {
          // If 404 or failed, proceed to search by SKU
        }
      }

      // 2. Search by SKU
      const searchRes = await this.api.get(`products?sku=${encodeURIComponent(product.sku)}`);
      if (Array.isArray(searchRes.data) && searchRes.data.length > 0) {
        const existingId = searchRes.data[0].id;
        await this.api.put(`products/${existingId}`, payload);
        return {
          wooId: existingId,
          status: "synced",
          action: "update",
          message: `Matched existing SKU #${product.sku} -> updated product #${existingId}`,
        };
      }

      // 3. Create new product via POST
      const createRes = await this.api.post("products", payload);
      const newId = createRes.data?.id;
      return {
        wooId: newId,
        status: "synced",
        action: "create",
        message: `Created new product #${newId} (SKU: ${product.sku}) in WooCommerce`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        wooId: product.woo_id || 0,
        status: "failed",
        action: product.woo_id ? "update" : "create",
        message: `WooCommerce API Error: ${msg}`,
      };
    }
  }

  async getProduct(wooId: number): Promise<Record<string, unknown> | null> {
    if (!this.api) return this.mockFallback.getProduct(wooId);
    try {
      const res = await this.api.get(`products/${wooId}`);
      return res.data;
    } catch {
      return null;
    }
  }

  async checkConnection(): Promise<boolean> {
    if (!this.api) return false;
    try {
      const res = await this.api.get("products", { per_page: 1 });
      return res.status === 200;
    } catch {
      return false;
    }
  }
}
