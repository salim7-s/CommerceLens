import { z } from "zod";

// --- Category & Attribute Template ---
export const AttributeTemplateSchema = z.object({
  id: z.string(),
  category_id: z.string(),
  name: z.string(),
  type: z.enum(["text", "number", "select", "boolean"]),
  required: z.boolean(),
  options: z.array(z.string()).default([]),
});
export type AttributeTemplate = z.infer<typeof AttributeTemplateSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  woo_id: z.number().nullable().optional(),
  templates: z.array(AttributeTemplateSchema).optional(),
});
export type Category = z.infer<typeof CategorySchema>;

// --- Product & Product Attribute ---
export const ProductAttributeSchema = z.object({
  product_id: z.string(),
  name: z.string(),
  value: z.string(),
});
export type ProductAttribute = z.infer<typeof ProductAttributeSchema>;

export const ProductStatusSchema = z.enum(["draft", "needs_work", "improve", "ready"]);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const SyncStatusSchema = z.enum(["none", "pending", "synced", "failed", "drift"]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  category_id: z.string().nullable().optional(),
  category_name: z.string().nullable().optional(),
  price: z.number().default(0),
  description: z.string().default(""),
  alt_text: z.string().default(""),
  seo_tags: z.array(z.string()).default([]),
  image_public_id: z.string().default(""),
  image_url: z.string().default(""),
  health_score: z.number().default(0),
  status: ProductStatusSchema.default("needs_work"),
  woo_id: z.number().nullable().optional(),
  sync_status: SyncStatusSchema.default("none"),
  synced_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
});
export type Product = z.infer<typeof ProductSchema>;

// --- Health Check Result ---
export interface HealthCheckItem {
  key: "title" | "description" | "category" | "required_attributes" | "image" | "alt_text" | "seo_tags";
  pass: boolean;
  points: number;
  maxPoints: number;
  hint: string;
}

export interface HealthScoreResult {
  score: number;
  status: ProductStatus;
  checks: HealthCheckItem[];
}

// --- AI Suggestion Contract ---
export const AISuggestionAttributeSchema = z.object({
  name: z.string(),
  value: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  source: z.enum(["text", "image", "inferred"]),
});
export type AISuggestionAttribute = z.infer<typeof AISuggestionAttributeSchema>;

export const AISuggestionPayloadSchema = z.object({
  improvedTitle: z.string().min(15).max(70),
  description: z.string().min(120).max(400),
  seoKeywords: z.array(z.string()).min(3).max(8),
  altText: z.string().min(10).max(125),
  attributes: z.array(AISuggestionAttributeSchema),
  missingAttributes: z.array(z.string()),
});
export type AISuggestionPayload = z.infer<typeof AISuggestionPayloadSchema>;

export interface AISuggestionRecord {
  id: string;
  product_id: string;
  payload: AISuggestionPayload;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

// --- Sync Log ---
export interface SyncLogRecord {
  id: string;
  product_id: string;
  sku?: string;
  product_name?: string;
  action: "create" | "update";
  status: "synced" | "failed";
  message: string;
  created_at: string;
}

// --- Agent Run & Step ---
export interface AgentRunRecord {
  id: string;
  goal: string;
  mode: "dry_run" | "apply";
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
}

export interface AgentStepRecord {
  id: string;
  run_id: string;
  step_no: number;
  tool: string;
  input: Record<string, unknown>;
  output: unknown;
  created_at: string;
}
