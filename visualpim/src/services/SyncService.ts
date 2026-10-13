import { productRepo, storeAdapter, syncLogRepo, mediaAdapter } from "./container";
import { SyncResult } from "../ports/StorePort";


export class SyncService {
  async syncProduct(productId: string): Promise<SyncResult> {
    const product = await productRepo.findById(productId);
    if (!product) throw new Error("Product not found");

    if (product.health_score < 80) {
      const msg = `Sync blocked by Quality Gate: Product score is ${product.health_score}/100. Must be at least 80.`;
      await syncLogRepo.create({
        product_id: productId,
        action: product.woo_id ? "update" : "create",
        status: "failed",
        message: msg,
      });
      product.sync_status = "failed";
      await productRepo.save(product);
      return {
        wooId: product.woo_id || 0,
        status: "failed",
        action: product.woo_id ? "update" : "create",
        message: msg,
      };
    }

    // Determine card image URL
    let cardImageUrl = product.image_url;
    if (product.image_url) {
      const variants = mediaAdapter.getVariants(product.image_public_id || product.image_url);
      const cardVariant = variants.find((v) => v.name === "card")?.url;
      if (cardVariant) cardImageUrl = cardVariant;
    }

    // Call store adapter
    const result = await storeAdapter.syncProduct(product, { cardImageUrl });

    // Update product state
    if (result.status === "synced") {
      product.woo_id = result.wooId;
      product.sync_status = "synced";
      product.synced_at = new Date().toISOString();
    } else {
      product.sync_status = "failed";
    }
    await productRepo.save(product);

    // Audit log
    await syncLogRepo.create({
      product_id: productId,
      action: result.action,
      status: result.status,
      message: result.message,
    });

    return result;
  }

  async getSyncLogs(limit = 100) {
    return syncLogRepo.findAll(limit);
  }

  async detectDrift(productId: string): Promise<{ hasDrift: boolean; differences: string[] }> {
    const product = await productRepo.findById(productId);
    if (!product || !product.woo_id) return { hasDrift: false, differences: [] };

    const wooProduct = await storeAdapter.getProduct(product.woo_id);
    if (!wooProduct) return { hasDrift: false, differences: ["Product not found in store"] };

    const differences: string[] = [];
    if (wooProduct.name !== product.name) {
      differences.push(`Title drift: Store has "${wooProduct.name}", PIM has "${product.name}"`);
    }
    if (wooProduct.regular_price && Number(wooProduct.regular_price) !== product.price) {
      differences.push(`Price drift: Store has "${wooProduct.regular_price}", PIM has "${product.price}"`);
    }

    if (differences.length > 0) {
      product.sync_status = "drift";
      await productRepo.save(product);
    }

    return {
      hasDrift: differences.length > 0,
      differences,
    };
  }
}

export const syncService = new SyncService();
