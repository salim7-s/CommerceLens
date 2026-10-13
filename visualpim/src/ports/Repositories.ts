import {
  Product,
  Category,
  AttributeTemplate,
  AISuggestionRecord,
  SyncLogRecord,
  AgentRunRecord,
  AgentStepRecord,
} from "../domain/schemas";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(filter?: {
    status?: string;
    search?: string;
    category?: string;
    tag?: string;
    sort?: string;
  }): Promise<Product[]>;
  getAllTags?(): Promise<string[]>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<boolean>;
  getAttributes(productId: string): Promise<Record<string, string>>;
  setAttributes(productId: string, attributes: Record<string, string>): Promise<void>;
  saveSuggestion(suggestion: AISuggestionRecord): Promise<void>;
  getPendingSuggestion(productId: string): Promise<AISuggestionRecord | null>;
  updateSuggestionStatus(id: string, status: "accepted" | "rejected"): Promise<void>;
}

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  getTemplates(categoryId: string): Promise<AttributeTemplate[]>;
  saveCategory(category: Category): Promise<void>;
  saveTemplate(template: AttributeTemplate): Promise<void>;
}

export interface SyncLogRepository {
  create(log: Omit<SyncLogRecord, "id" | "created_at">): Promise<SyncLogRecord>;
  findAll(limit?: number): Promise<SyncLogRecord[]>;
}

export interface AgentRepository {
  createRun(goal: string, mode: "dry_run" | "apply"): Promise<AgentRunRecord>;
  updateRunStatus(id: string, status: AgentRunRecord["status"]): Promise<void>;
  getRun(id: string): Promise<AgentRunRecord | null>;
  addStep(step: Omit<AgentStepRecord, "id" | "created_at">): Promise<AgentStepRecord>;
  getSteps(runId: string): Promise<AgentStepRecord[]>;
}
