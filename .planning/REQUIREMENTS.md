# Requirements: CommerceLens

**Core Value:** No low-quality product listing reaches WooCommerce: every product is scored, enriched (data + images), reviewed, then marked ready and synced.

## v1 Requirements

### Catalog (pages: Add Product, Product List)

- [ ] **CAT-01**: User can add a product (SKU, name, category, price, description, dynamic attributes driven by category template, image).
- [ ] **CAT-02**: Product List shows thumbnail, name, category, health score badge, status chip (Draft / Needs Work / Improve / Ready), sync chip (None / Pending / Synced / Failed / Drift), and an Improve button.
- [ ] **CAT-03**: User can edit a product and its dynamic attributes.
- [ ] **CAT-04**: Category attribute templates (Footwear, Apparel, Electronics seeded via `npm run seed`) define typed attributes (`text`, `number`, `select`, `boolean`) with required flags and options.

### Media (Cloudinary)

- [ ] **MEDIA-01**: Image upload stores the original in Cloudinary (`CommerceLens/` folder, tagged with SKU and `pim`) and saves public ID and CDN URL.
- [ ] **MEDIA-02**: URL transformations generate variants without additional API calls:
  - Optimized: `f_auto,q_auto`
  - Thumbnail: `c_fill,w_200,h_200,g_auto,f_auto,q_auto`
  - Product card: `c_pad,w_600,h_600,b_white,f_auto,q_auto`
  - Marketplace square: `c_pad,w_1000,h_1000,b_white,f_auto,q_auto`
  - WebP: `f_webp,q_auto`
- [ ] **MEDIA-03**: UI shows Original / Optimized / Thumbnail / Marketplace-square in a side-by-side gallery with format/optimization indicators.
- [ ] **MEDIA-04**: Optional cutout variant (`e_background_removal` then pad `b_white`); mock media adapter available for offline/demo reliability.

### Health Score

- [ ] **HEALTH-01**: Pure function `computeHealth(product, template)` scores a product out of 100 per weighted checklist:
  - Title (15 pts): length 15-70 chars, not generic (single word fails).
  - Description (20 pts): length >= 120 chars.
  - Category (10 pts): category set.
  - Required attributes (20 pts): all required attributes of category template filled and valid.
  - Image (15 pts): `image_url` present.
  - Alt text (10 pts): length >= 10 chars.
  - SEO tags (10 pts): >= 3 tags present.
- [ ] **HEALTH-02**: Score maps deterministically to status: 0-49 `needs_work`, 50-79 `improve`, 80-100 `ready`. Returns `{score, status, checks:[{key, pass, points, hint}]}`.
- [ ] **HEALTH-03**: Improve page shows the checklist with passed/failed indicators and actionable hints. Ready-to-sync gate strictly enforces score >= 80 AND explicit "Mark ready" action.

### AI Improvement (page: Improve / Product Detail)

- [ ] **AI-01**: AI returns Zod-validated JSON conforming to schema:
  - `improvedTitle`: string (15-70 chars)
  - `description`: string (120-400 chars)
  - `seoKeywords`: string[] (3-8 items)
  - `altText`: string (10-125 chars)
  - `attributes`: `{ name: string, value: string, confidence: 'high'|'medium'|'low', source: 'text'|'image'|'inferred' }[]` (only when evidence exists)
  - `missingAttributes`: string[] (required template attributes needing human input)
- [ ] **AI-02**: System prompt enforces factual claims, low temperature, and optionally consumes Cloudinary image URL for vision-based tagging/color/alt-text. Model-supplied scores are never trusted; recomputed locally with `computeHealth`.
- [ ] **AI-03**: Improve page displays current data on left and AI suggestions on right (diff-style per-field highlights); user can Accept all or individual fields; nothing applied without approval.
- [ ] **AI-04**: Resilient AI handling: on invalid JSON, automatically retries once with Zod error appended, then falls back to mock/previous suggestion with clear error UI. Mock AI adapter provided.

### Readiness and Sync

- [ ] **SYNC-01**: User can mark a product Ready for WooCommerce (gated: score >= 80).
- [ ] **SYNC-02**: `StorePort` adapter maps PIM products to WooCommerce REST v3 schema:
  - `sku` -> `sku`
  - `name` -> `name`
  - `price` -> `regular_price` (string)
  - `description` -> `description` (and first sentence to `short_description`)
  - `category` -> `categories: [{id}]` (lookup or create)
  - `image_url` (card variant) -> `images: [{src, alt}]`
  - `attributes` -> `attributes: [{name, options:[value], visible:true, variation:false}]`
  - `seo_tags` -> `tags`
  - `status` -> `status: "publish"` when ready, else `"draft"`
  - `pim_id` -> `meta_data: [{key:"pim_id", value}]`
- [ ] **SYNC-03**: Idempotent sync algorithm: checks stored `woo_id` -> PUT; else searches `GET /products?sku={sku}`; if found, stores `woo_id` and PUT; else POST and stores returned id. Bulk sync supported. Bonus drift detection flags external changes (PIM wins policy).
- [ ] **SYNC-04**: Sync Log page (`/sync-log`) tracks all sync actions with product ID, action (`create`|`update`), status, message, timestamp, and Retry button.

### Dashboard

- [ ] **DASH-01**: Dashboard (`/`) displays total products, ready count, needs improvement count, average catalog health score gauge, recent AI fixes list, and shortcut to run agent.

### Agentic AI (page: Agent)

- [ ] **AGNT-01**: "Catalog Quality Agent": given a goal (e.g., "Get all products ready for WooCommerce"), autonomously plans and executes steps via LLM function calling or deterministic loop (max 25 steps).
- [ ] **AGNT-02**: Agent toolset: `list_products({status?})`, `get_health({id})`, `suggest_improvements({id})`, `apply_suggestion({id})`, `sync_product({id})`.
- [ ] **AGNT-03**: Agent safety: default **dry-run** mode produces a visible plan without modifying DB; agent cannot delete, cannot sync unless score >= 80, cannot apply without approval flag; all steps logged to `agent_steps` and rendered on `/agent`.

### Codebase Quality

- [ ] **QUAL-01**: Ports and Adapters (hexagonal architecture): pure `domain/`, `ports/` interfaces, `adapters/` (Cloudinary, AI [Anthropic/OpenAI/Gemini/Mock], WooCommerce [REST v3/Mock], SQLite repositories), `services/` orchestration, and `agent/` loop.
- [ ] **QUAL-02**: SQLite data model (`better-sqlite3`) with tables: `categories`, `attribute_templates`, `products`, `product_attributes`, `ai_suggestions`, `sync_log`, `agent_runs`, `agent_steps`. Seed script (`npm run seed`).
- [ ] **QUAL-03**: Unit tests (Vitest): health score rules and boundaries, attribute validation, Cloudinary URL transformations, AI Zod parsing/retries, WooCommerce payload mapping, sync idempotency with mock store.
- [ ] **QUAL-04**: End-to-end test (Playwright): happy-path run with mock externals (add product, upload, improve, accept, mark ready, sync, verify single store item).
- [ ] **QUAL-05**: Operational readiness: `/api/health` checks app, db, cloudinary, and woo reachability; `.env.example` provided.

### AI Tooling & Methodology (Priority 1 Scoring Criterion)

- [ ] **AI-TOOL-01**: Active and effective AI tool usage (Claude Code / Antigravity / Cursor / Copilot) across all development phases: architecture planning, scaffolding, pure domain logic, test generation, and documentation.
- [ ] **AI-TOOL-02**: Live maintenance of `AI_USAGE_LOG.md` recording timestamped prompts, tools, outcomes, and explicit documentation of "where AI was wrong and how it was fixed".
- [ ] **AI-TOOL-03**: Continuous screen recording during Phase 2 execution providing visual evidence of real-time AI prompting, diff reviews, and test runs for the process video.

### Documentation and Submission

- [ ] **DOC-01**: Architecture & research docs: `docs/integration-decision.md` (REST vs webhooks vs CSV) and `docs/scope-and-assumptions.md`.
- [ ] **DOC-02**: Comprehensive README with Mermaid architecture diagram, design patterns, setup guide (LocalWP/Docker/Cloudinary), demo script, mock modes, and operational notes.
- [ ] **DOC-03**: `AI_USAGE_LOG.md` finalized and committed.
- [ ] **VID-01**: Plan video recorded at end of Phase 1 (<= 2 min) outlining scope, research decisions, and planned AI tool usage.
- [ ] **VID-02**: Process video (<= 2 min) demonstrating AI prompts, corrections, and agentic workflows, plus 2-minute live demo explainer.
- [ ] **SUB-01**: Submission form completed with repo, docs, and video links by 3:50.

## v2 / Deferred

- Real-time Woo webhooks, multi-language content, bulk CSV import, variable products with complex variations, versioning/audit history, paid Cloudinary AI add-ons.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-tenant, full auth/roles | Single-user demo |
| Pricing/inventory/ERP | Beyond PIM scope |
| Paid Cloudinary add-ons as dependencies | Risk to demo reliability |
| Unbounded agent autonomy | Safety: dry-run default, approval required |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| VID-01, DOC-01, AI-TOOL-01 (init) | Phase 1 (0:00-0:40) | Pending |
| CAT-01..04, MEDIA-01..04, HEALTH-01..03, DASH-01, QUAL-01..02, AI-TOOL-02, AI-TOOL-03 | Phase 2 (0:40-1:30) | Pending |
| AI-01..04 | Phase 3 (1:30-2:10) | Pending |
| SYNC-01..04, AGNT-01..03 | Phase 4 (2:10-3:00) | Pending |
| QUAL-03..05, DOC-02, DOC-03 | Phase 5 (3:00-3:30) | Pending |
| VID-02, SUB-01 | Phase 6 (3:30-4:00) | Pending |

**Coverage:** 35 requirements, fully mapped to the 6 phases.

---
*Requirements updated: Aligned with BUILD-PLAN.md (Zod contract, URL transformations, WooCommerce REST v3 mapping, Agent tools, and SQLite schema)*
