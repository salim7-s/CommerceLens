import { Product } from "../domain/schemas";

export interface SyncResult {
  wooId: number;
  status: "synced" | "failed";
  action: "create" | "update";
  message: string;
}

export interface StorePort {
  syncProduct(product: Product, options?: { cardImageUrl?: string }): Promise<SyncResult>;
  getProduct(wooId: number): Promise<Record<string, unknown> | null>;
  checkConnection(): Promise<boolean>;
}
