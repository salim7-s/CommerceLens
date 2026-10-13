import { SqliteProductRepository } from "../adapters/repo/sqlite/productRepo";
import { SqliteCategoryRepository } from "../adapters/repo/sqlite/categoryRepo";
import { SqliteSyncLogRepository } from "../adapters/repo/sqlite/syncLogRepo";
import { SqliteAgentRepository } from "../adapters/repo/sqlite/agentRepo";
import { CloudinaryMediaAdapter } from "../adapters/media/cloudinary";
import { MockMediaAdapter } from "../adapters/media/mock";
import { GeminiAIAdapter } from "../adapters/ai/gemini";
import { MockAIAdapter } from "../adapters/ai/mock";
import { WooStoreAdapter } from "../adapters/store/woo";
import { MockStoreAdapter } from "../adapters/store/mock";
import { MediaPort } from "../ports/MediaPort";
import { AIPort } from "../ports/AIPort";
import { StorePort } from "../ports/StorePort";

// Singletons
export const productRepo = new SqliteProductRepository();
export const categoryRepo = new SqliteCategoryRepository();
export const syncLogRepo = new SqliteSyncLogRepository();
export const agentRepo = new SqliteAgentRepository();

// Strategy/Adapter selection based on env flags
const syncMode = process.env.SYNC_MODE || "mock";
const aiProvider = process.env.AI_PROVIDER || "mock";

export const mediaAdapter: MediaPort = process.env.CLOUDINARY_API_KEY && !process.env.CLOUDINARY_API_KEY.includes("123456")
  ? new CloudinaryMediaAdapter()
  : new MockMediaAdapter();

export const aiAdapter: AIPort = aiProvider === "gemini" && process.env.AI_API_KEY
  ? new GeminiAIAdapter()
  : new MockAIAdapter();

export const storeAdapter: StorePort = syncMode === "real" && process.env.WOO_KEY && !process.env.WOO_KEY.startsWith("ck_test")
  ? new WooStoreAdapter()
  : new MockStoreAdapter();
