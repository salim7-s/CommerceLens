# CommerceLens (working name)

## What This Is

A **Visual Product Intelligence PIM** for WooCommerce catalogs, built for the Kilowott Hack-AI-thon (PIM System Integration challenge, 4-hour timed assessment).

Instead of only storing product data, it improves product images and product information *before* publishing to WooCommerce. Cloudinary handles product media optimization; AI handles catalog quality improvement; a deterministic Product Health Score gates what is "Ready for WooCommerce".

**Pitch:** "AI-assisted visual PIM quality control for WooCommerce catalogs."
**One-liner:** "Our PIM uses Cloudinary for product media optimization and AI for catalog quality improvement, helping stores publish cleaner, faster, SEO-ready products."
(Avoid saying only "PIM system integration".)

## Core Value

No low-quality product listing reaches WooCommerce: every product is scored, enriched (data + images), reviewed by a human, then marked ready and synced.

## Main Flow

1. User adds a product with category-driven dynamic attributes.
2. User uploads a product image; original is stored in Cloudinary (`CommerceLens/` folder, tagged with SKU and `pim`).
3. App delivers optimized image variants via URL transformations (Optimized `f_auto,q_auto`, Thumbnail `c_fill,w_200,h_200,g_auto`, Product Card `c_pad,w_600,h_600,b_white`, Marketplace Square `c_pad,w_1000,h_1000,b_white`, WebP `f_webp,q_auto`, optional cutout `e_background_removal`).
4. AI analyzes product data quality (using text + Cloudinary image vision); app computes a deterministic Product Health Score (0-100).
5. AI suggests improved title (15-70 chars), description (120-400 chars), SEO keywords (3-8), alt text (10-125 chars), confidence-scored attributes (with sources), and flags missing required attributes for human input.
6. User approves changes (accept all or per-field).
7. When score >= 80 and marked ready, product syncs idempotently to WooCommerce (REST API v3, or mock store adapter).
8. Autonomous Catalog Quality Agent can scan, score, plan, and propose/apply improvements across the catalog with a dry-run safety gate.

## Hackathon Rules & Briefing (Official Slides)

- **The Challenge:** "A timed assessment designed to evaluate your creativity, technical skill, and ability to leverage AI tools effectively."
- **What We're Looking For:** "Resourcefulness, adaptability, and genuine problem-solving."
- **4-Hour Timeline:**
  - **Phase 1: Planning (0:00–0:40):** Research integration methods, define scope, outline assumptions. Sets the foundation for successful execution. *Record a video describing your plan.*
  - **Phase 2: Execution (0:40–3:30):** Develop the codebase and prepare documentation. Bring implementation plan to life with quality code. *Record a video describing your process.*
  - **Phase 3: Submission (3:30–4:00):** Fill the form (link at end of deck) with all your hard work done (submit by 3:50).
- **Official Scoring Criteria (Strict Priority Order):**
  1. **AI Tool Usage (Priority 1 - Highest Weight):** Effective and correct use of AI tools throughout the development process.
  2. **Codebase Quality (Priority 2):** Design patterns, unit tests, and end-to-end tests demonstrating software engineering best practices.
  3. **Documentation (Priority 3):** Clear scope definition, assumptions, and operational details that make your solution accessible.
  4. **Video Presentation (Priority 4):** Clarity, structure, and communication quality in your 2-minute explanation.
  5. **Agentic AI (Priority 5):** Innovative use of AI agents to enhance productivity and problem-solving.
  6. **Execution Quality (Priority 6):** Design, deployment, and overall implementation excellence.

## AI Mandates & Strategy (Hack-AI-thon Core)

Because **AI Tool Usage** is the #1 scoring criterion and **Agentic AI** is criterion #5, AI is embedded at every level of this project:

### 1. AI in the Development Process (Scoring Criterion #1)
- **Active AI Pair Programming:** AI tools (Claude Code, Antigravity, Cursor, Copilot) are utilized throughout scaffolding, architecture implementation (hexagonal ports/adapters), unit test creation (Vitest), and documentation.
- **Mandatory Live Logging (`AI_USAGE_LOG.md`):** Every significant prompt, response, failure, and human correction must be logged in real time. Demonstrating *where AI was wrong* and how it was steered is primary evidence of engineering competence.
- **Process Video Evidence:** Screen recordings capture real-time AI prompts, iterative diff reviews, and test generation.

### 2. Agentic AI in the Application (Scoring Criterion #5)
- **Autonomous Catalog Quality Agent:** Accessible at `/agent`. The user enters a high-level goal (e.g., *"Audit all products and prepare ready listings for WooCommerce"*).
- **Autonomous Function-Calling Loop:** The agent decomposes goals, inspects product health, generates AI enrichment proposals, and plans executions (up to 25 steps).
- **Safety & Oversight Architecture:** Default **dry-run** mode produces a visible plan without touching data; requires explicit human approval before applying; hard safety constraints prevent deletions or unauthorized syncs.
- **Observable Execution:** Every agent action and tool invocation streams in real time to the UI and persists to `agent_steps`.

### 3. AI in the PIM Pipeline (Application Feature)
- **Multimodal Vision Analysis:** Cloudinary image URLs are supplied to vision models to extract factual attributes (color, silhouette, category) and generate descriptive alt-text without manual typing.
- **Strict Factual Constraints:** System prompts prohibit fabricating specs (dimensions, materials, warranty). Missing specifications are flagged in `missingAttributes` for human input.
- **Schema Validation & Self-Healing:** All AI outputs adhere to a strict Zod contract; invalid JSON triggers an automated retry containing the specific validation error before falling back gracefully.
- **Zero-Trust Score Validation:** Model hallucinated health scores are discarded; health is calculated strictly through deterministic pure functions (`computeHealth`).

## Requirements

### Validated

(None yet - ship to validate)

### Active

- [ ] Product catalog management (add, list, view, edit products with category attribute templates).
- [ ] Category-driven dynamic attributes (Footwear, Apparel, Electronics seeded with required/optional typed attributes).
- [ ] Cloudinary media: upload, CDN URLs, optimized variants (Optimized, Thumbnail, Card, Marketplace Square, WebP, optional Cutout).
- [ ] Deterministic Product Health Score (0-100) with Needs Work (0-49) / Improve (50-79) / Ready (80-100) status.
- [ ] AI improvement suggestions (title, description, SEO tags, vision-assisted alt text, confident attributes, missing attribute detection) with Zod validation, retry, and mock fallback.
- [ ] "Ready for WooCommerce" gating (score >= 80 + explicit user approval) and idempotent sync via StorePort (REST API v3 + mock adapter).
- [ ] 6 UI Pages: Dashboard, Products, Add Product, Improve, Agent, Sync Log.
- [ ] Catalog Quality Agent: goal-driven catalog scanning, dry-run by default, 25-step safety cap, step logging to `agent_steps`, human approval required to apply.
- [ ] Code quality: Ports and Adapters (hexagonal), Repository pattern, Strategy pattern, pure domain modules, Vitest unit tests, Playwright e2e test, health endpoint (`/api/health`).
- [ ] Documentation & Deliverables: README, AI usage log (`AI_USAGE_LOG.md`), `.env.example`, plan video, process video, 2-minute demo video, form submission.

### Out of Scope

- Multi-store / multi-tenant, full auth and roles (single-user demo).
- Pricing, inventory, ERP integrations.
- Dependence on Cloudinary paid add-ons (background removal, moderation: only if free and working, never a blocker).
- Real-time/webhook sync at scale (push + pull REST chosen; webhooks deferred).

## Context

Time is the dominant constraint. AI tool usage is the top-weighted criterion, so the build process must visibly use AI tools and that usage is documented in the repo and shown in the videos.

The concept doc only covered features, so this plan adds the scored items it lacked: tests, documentation, an agentic element, videos, and submission.

### Health Score (deterministic, pure function, unit-tested)

| Check | Points | Pass Rule |
|-------|--------|-----------|
| Title | 15 | Length 15-70 chars, not generic (single word fails) |
| Description | 20 | Length >= 120 chars |
| Category | 10 | Category set |
| Required attributes | 20 | All required attrs of the category's template filled and valid |
| Image | 15 | `image_url` present |
| Alt text | 10 | Length >= 10 chars |
| SEO tags | 10 | >= 3 tags present |

Return shape: `{ score: number, status: 'needs_work' | 'improve' | 'ready', checks: [{ key: string, pass: boolean, points: number, hint: string }] }`.
Status thresholds: 0-49 `needs_work`, 50-79 `improve`, 80-100 `ready`.
Ready-to-sync gate: score >= 80 AND user clicked "Mark ready".

### Demo Script

Weak product: name "shoe", description "nice red shoe", category Footwear, attribute color=red, shoe image uploaded.
1. Initial health score is ~35-40, status "Needs Work".
2. Click **Analyze Product**: AI enriches title (e.g., "Classic Red Canvas Low-Top Sneakers"), description (120+ chars), SEO tags (>= 3), vision-derived alt text, and infers confidence-tagged attributes while asking for missing size.
3. Review Cloudinary variants gallery: Original vs. Optimized (`f_auto,q_auto`), Thumbnail (`c_fill,w_200,h_200,g_auto`), Product Card (`c_pad,w_600,h_600,b_white`), Marketplace Square (`c_pad,w_1000,h_1000,b_white`).
4. Click **Accept all**: product updates, local health score recomputes to 85+, status becomes "Ready".
5. Click **Mark ready**, then **Sync to WooCommerce**: product syncs via REST v3 (or mock), `sync_status` updates, appears in WooCommerce admin/storefront.
6. Closing line: "This helps ecommerce teams avoid publishing low-quality product listings by combining PIM, AI enrichment, and Cloudinary media optimization in one workflow."

## Constraints

- **Timeline**: 4 hours hard cap (0:00-0:40 Plan, 0:40-1:30 Core PIM, 1:30-2:10 AI Flow, 2:10-3:00 Woo Sync + Agent [freeze at 2:50], 3:00-3:30 Tests & Docs, 3:30-4:00 Videos & Submit by 3:50).
- **Stack**: Next.js (App Router) + TypeScript, SQLite (`better-sqlite3`), Cloudinary SDK, WooCommerce REST API v3 (`@woocommerce/woocommerce-rest-api`), Zod validation, Vitest, Playwright.
- **WooCommerce**: REST API v3 with official client; in-memory mock store behind `StorePort` adapter for deterministic testing and demo safety (`SYNC_MODE=real|mock`).
- **Quality**: Hexagonal architecture (domain, ports, adapters, services), Repository pattern, Strategy pattern, pure domain functions, Vitest unit tests, Playwright e2e test.
- **AI Safety**: Zod schema validation on AI JSON; 1-retry with zod error on parse failure; mock fallback; model-supplied score never trusted (recomputed locally); human approval required before applying changes.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PIM challenge, "Visual Product Intelligence" angle | Cloudinary makes demo visual; unique vs. generic PIM sync | - Locked |
| Next.js App Router + SQLite (`better-sqlite3`) | Fast zero-setup fullstack TS framework with robust local DB | - Locked |
| Deterministic health score + AI suggestions | Testable, explainable, great demo moment | - Locked |
| Ports & Adapters (Media, AI, Store, Repos) | Swappable real/mock implementations (`AI_PROVIDER`, `SYNC_MODE`) | - Locked |
| Category-driven attribute templates | Enforces schema per category (Footwear, Apparel, Electronics) | - Locked |
| Human approval before applying AI changes | Safety and clean agentic-with-oversight story | - Locked |
| Idempotent Woo sync (woo_id + SKU lookup) | Prevents duplicate listings; PIM is source of truth | - Locked |
| Autonomous Agent with dry-run default | 25-step limit, explicit tool set, inspectable plan before apply | - Locked |

## Evolution

After each phase: update validated/active requirements, log decisions, and re-check that "What This Is" still matches.

---
*Last updated: Aligned with BUILD-PLAN.md (Next.js, SQLite, Hexagonal Ports/Adapters, 6 Pages, Agent Specs)*
