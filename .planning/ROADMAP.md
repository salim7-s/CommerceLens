# Roadmap: CommerceLens

**Granularity:** Coarse | **Mode:** YOLO | **Budget:** 4 hours hard cap

## Overview

| # | Phase | Time box | Goal | Requirements |
|---|-------|----------|------|--------------|
| 1 | Planning + Research | 0:00-0:40 | Lock scope and stack; write integration and scope docs; scaffold Next.js App Router + SQLite; smoke test Cloudinary/Woo/AI; record plan video; initialize AI usage logging | VID-01, DOC-01, AI-TOOL-01 |
| 2 | Core PIM + Attributes + Cloudinary + Score | 0:40-1:30 | SQLite schema + seed script; pure health & attribute domain modules; Cloudinary media adapter (5 variants); Add Product with dynamic attributes; Product List; Dashboard; record AI process screen | CAT-01..04, MEDIA-01..04, HEALTH-01..03, DASH-01, QUAL-01..02, AI-TOOL-02, AI-TOOL-03 |
| 3 | AI Improve Flow | 1:30-2:10 | AIPort + adapters (real & mock); AnalyzeService with Zod validation + 1 retry; Improve page diff suggestions; accept flow; score recomputation; Mark ready gate | AI-01..04 |
| 4 | Real Woo Sync + Agent | 2:10-3:00 | StorePort + Woo REST v3 client + mock store; idempotent sync; Sync Log page (`/sync-log`); AgentService with 5 tools & dry-run default; `/agent` page; feature freeze at 2:50 | SYNC-01..04, AGNT-01..03 |
| 5 | Tests, Docs, Polish | 3:00-3:30 | Vitest unit test suite; Playwright e2e test; comprehensive README; `AI_USAGE_LOG.md`; `/api/health` endpoint; clean-clone validation | QUAL-03..05, DOC-02, DOC-03, AI-TOOL-01..02 |
| 6 | Videos + Submission | 3:30-4:00 | Process video (<= 2 min); 2-minute live demo explainer; start form at 3:30, submit by 3:50 | VID-02, SUB-01 |

Phases 1 and 6 align with the official Planning and Submission phases; 2-5 constitute Execution.

## Phase Details

### Phase 1: Planning + Research (0:00-0:40)
**Success Criteria:**
1. Decisions locked: Next.js (App Router) + TS, SQLite (`better-sqlite3`), Cloudinary, WooCommerce REST v3 (`@woocommerce/woocommerce-rest-api`), Zod.
2. Written `docs/integration-decision.md` (REST chosen vs webhooks vs CSV) and `docs/scope-and-assumptions.md`.
3. Repo scaffolded (`npx create-next-app@latest CommerceLens --ts --tailwind --app --eslint`).
4. Smoke tests pass: Cloudinary upload, Woo API reachability (`GET /wp-json/wc/v3/products`), AI provider JSON output.
5. Plan video recorded (<= 2 min) before 0:40 and `AI_USAGE_LOG.md` initialized.

### Phase 2: Core PIM + Attributes + Cloudinary + Score (0:40-1:30)
**Success Criteria:**
1. SQLite database initialized with 8 tables and seeded (`npm run seed` with Footwear, Apparel, Electronics templates).
2. Pure domain modules `health.ts` and `attributes.ts` implemented with unit tests.
3. `CloudinaryMedia` adapter implements `uploadImage` and URL variant generators (Optimized, Thumbnail, Card, Marketplace Square, WebP), with mock media adapter.
4. Pages: Add Product (dynamic template-driven attributes), Products table (thumbnail, status, sync status, score badge), Dashboard (counts, average score).
5. Acceptance: create "shoe" product, upload image, view 4+ variants, initial score near 35-40 with "Needs Work" status.

### Phase 3: AI Improve Flow (1:30-2:10)
**Success Criteria:**
1. `AIPort` with real adapter + deterministic mock adapter.
2. `AnalyzeService`: low-temperature prompt, Zod schema validation, automatic 1-retry with Zod error on failure, mock fallback; model score recomputed via `computeHealth`.
3. Improve page: left side current data + health checklist; right side suggestions with diff highlights; Accept all and per-field actions.
4. "Mark ready" action gated strictly to products with health score >= 80.
5. Acceptance: weak product score improves from ~35 to 80+ upon accepting suggestions; malformed JSON handles retry and fallback gracefully.

### Phase 4: Real Woo Sync + Agent (2:10-3:00)
**Success Criteria:**
1. `StorePort` with real WooCommerce REST v3 adapter and in-memory mock store.
2. Idempotent sync algorithm: checks stored `woo_id` -> PUT; else searches by SKU -> stores `woo_id` and PUT; else POST and stores returned id.
3. Sync Log page (`/sync-log`) with status badges and Retry button.
4. "Catalog Quality Agent": text goal input, 5 tools (`list_products`, `get_health`, `suggest_improvements`, `apply_suggestion`, `sync_product`), 25-step cap, dry-run by default, logs to `agent_steps`, streamed on `/agent`.
5. Feature freeze at 2:50 (bug fixes only thereafter).
6. Acceptance: sync idempotency verified (re-syncing updates, never duplicates); agent dry-run produces approvable plan.

### Phase 5: Tests, Docs, Polish (3:00-3:30)
**Success Criteria:**
1. Vitest unit tests all green (`npm test`): health score boundaries, attribute validation, Cloudinary URL transforms, AI parsing, mapping, sync idempotency.
2. Playwright e2e happy-path green with `SYNC_MODE=mock AI_PROVIDER=mock`.
3. Comprehensive README with Mermaid architecture diagram, decisions, setup, demo script, and troubleshooting.
4. `AI_USAGE_LOG.md` completed; `.env.example` committed.
5. `/api/health` returns app, db, cloudinary, and woo reachability.
6. Stretch (in order): drift detection, deployment to Vercel.

### Phase 6: Videos + Submission (3:30-4:00)
**Success Criteria:**
1. Process video recorded (<= 2 min): narrates over screen recording, AI prompts used, AI errors caught, architecture choices.
2. 2-minute explainer/demo recorded: 15s problem > 15s solution + architecture > 60s weak product live demo ("shoe" -> 35 to 85 -> variants -> sync to storefront) > 15s agent run > 15s tests/docs.
3. Submission form started at 3:30 and submitted by 3:50 with repo URL, documentation, and video links.

## Build Notes

- Cut order if behind: deployment, drift detection, optional Cloudinary cutout, per-field accept. Never cut tests, README, videos, or the agent (all scored).
- Feature freeze strictly at 2:50.
- Keep swappable mock adapters (`AI_PROVIDER=mock`, `SYNC_MODE=mock`) so live demos and e2e tests never depend on external API latency or quotas.
- Commit frequently with descriptive messages documenting AI-assisted work.
- Start filling the submission form at 3:30 to guarantee submission before the 4:00 cutoff.

---
*Roadmap updated: Aligned with BUILD-PLAN.md phase checkpoints, tasks, and acceptance gates*
