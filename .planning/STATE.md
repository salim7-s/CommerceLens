---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: kilowott-hack-ai-thon
current_phase: 01
status: planning
progress:
  total_phases: 6
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# State: CommerceLens

**Challenge:** PIM System Integration with WooCommerce (Visual Product Intelligence angle)  
**Current phase:** 01 - Planning + Research  
**Status:** Planning  

**Hackathon Evaluation Priorities (Official Briefing):**
1. **AI Tool Usage (Priority 1 - Highest Weight):** Effective and correct use of AI tools throughout development.
2. **Codebase Quality (Priority 2):** Design patterns, unit tests, e2e tests.
3. **Documentation (Priority 3):** Scope, assumptions, operational setup.
4. **Video Presentation (Priority 4):** Clarity, structure in 2-minute explanation.
5. **Agentic AI (Priority 5):** Autonomous agents for productivity and problem-solving.
6. **Execution Quality (Priority 6):** Design, deployment, implementation excellence.

**Core value:** No low-quality product listing reaches WooCommerce: scored, enriched, reviewed, then synced.

## Roadmap Progress

| Phase | Status | Time box |
|-------|--------|----------|
| 1 Planning + Research | Completed | 0:00-0:40 |
| 2 Core PIM + Attributes + Cloudinary + Score | Completed | 0:40-1:30 |
| 3 AI Improve Flow | Completed | 1:30-2:10 |
| 4 Real Woo Sync + Agent | Completed | 2:10-3:00 |
| 5 Tests, Docs, Polish | In progress | 3:00-3:30 |
| 6 Videos + Submission | Pending | 3:30-4:00 |

## Locked Decisions (from BUILD-PLAN.md)

- **Framework & Language:** Next.js (App Router) + TypeScript.
- **Database:** SQLite via `better-sqlite3` with 8 tables (`categories`, `attribute_templates`, `products`, `product_attributes`, `ai_suggestions`, `sync_log`, `agent_runs`, `agent_steps`) and seed script.
- **Media Engine:** Cloudinary with URL transformation variants (Optimized, Thumbnail, Card, Marketplace Square, WebP, optional Cutout).
- **Store Integration:** WooCommerce REST v3 via official `@woocommerce/woocommerce-rest-api` client with in-memory mock store behind `StorePort`.
- **AI Engine:** Structured output with vision support, Zod validation, 1-retry with schema error, mock fallback. Deterministic local score recalculation.
- **Agentic Loop:** 5 explicit tools, max 25 steps, dry-run by default, human approval required to apply changes, full step logging to `agent_steps`.

## Active Risks & Mitigations

- **4-Hour Time Constraint:** Feature freeze at 2:50; begin submission form at 3:30 to submit by 3:50.
- **External API Outages or Quotas:** Swappable mock adapters (`AI_PROVIDER=mock`, `SYNC_MODE=mock`) guarantee that live demos and e2e tests never hang or fail.
- **AI Model Hallucinations / Invalid JSON:** Strict Zod validation, automatic single retry with error feedback, fallback to mock, and zero trust in model scores.
- **Judging Criteria Alignment:** AI usage log maintained live from minute one; unit and e2e tests given dedicated Phase 5 timebox.

## Next Actions (Phase 1 Checklist)

1. Write `docs/integration-decision.md` (REST push/pull chosen vs webhooks vs CSV).
2. Write `docs/scope-and-assumptions.md` (single-user, SKU unique, PIM source of truth, Cloudinary image pipeline).
3. Scaffold application: `npx create-next-app@latest CommerceLens --ts --tailwind --app --eslint` and install dependencies.
4. Execute smoke tests (Cloudinary upload, WooCommerce REST reachability, AI JSON response).
5. Record plan video (<= 2 min) and initialize `AI_USAGE_LOG.md`.

---
*Last updated: Aligned with BUILD-PLAN.md (Phases, Locked Decisions, and Phase 1 Next Actions)*
