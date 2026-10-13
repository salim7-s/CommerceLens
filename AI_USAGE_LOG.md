# CommerceLens: AI Tool Usage Log (`AI_USAGE_LOG.md`)

> **Kilowott Hack-AI-thon Priority #1 Scoring Criterion:**  
> *"Effective and correct use of AI tools throughout the development process."*

---

## 1. Live AI Interaction Log

| Time | AI Tool / Model | Task / Domain | Prompt Summary | Result / Output | Human Review & Corrections (What I changed/fixed) |
|:----:|:---------------:|:-------------:|:---------------|:---------------|:---------------------------------------------------|
| 0:05 | Antigravity (Gemini) | Planning / Architecture | "Audit slides and align all planning documents with BUILD-PLAN.md" | Aligned PROJECT, REQUIREMENTS, ROADMAP, STATE | Verified timeboxes, hexagonal ports, and Zod schemas |
| 0:15 | Antigravity (Gemini) | Requirements & Criteria | "Incorporate official Hack-AI-thon scoring criteria with AI Tool Usage as Priority 1" | Added AI strategy, AI-TOOL requirements, agentic loop specs | Structured evaluation matrix and traceability table |
| 0:25 | Antigravity (Gemini) | Project Scaffolding | "Scaffold Next.js App Router with TypeScript, Tailwind, ESLint, and SQLite" | Created `CommerceLens` application | Resolved Vitest peer dependency with `--legacy-peer-deps` |
| 0:40 | Antigravity (Gemini) | Pure Domain Logic & TDD | "Implement computeHealth(product, template) with Vitest unit tests for all 7 rules" | Generated `health.ts`, `attributes.ts`, and 15 tests | Verified 49/50 and 79/80 boundary condition tests |
| 0:55 | Antigravity (Gemini) | Database & Seed Script | "Create SQLite schema (8 tables) and seed script for Footwear, Apparel, Electronics" | Generated `database.ts`, repos, and `seed.ts` | Successfully seeded 3 demo products (weak "shoe", backpack, headphones) |
| 1:15 | Antigravity (Gemini) | Cloudinary Media Adapter | "Build Cloudinary URL transformation generators for Optimized, Thumbnail, Card, Square, WebP" | Created `cloudinary.ts`, `mock.ts`, and unit tests | Tested URL segment injection for full Cloudinary URLs |
| 1:35 | Antigravity (Gemini) | AI & Store Adapters | "Implement Gemini/Mock AIPort and WooCommerce REST v3 StorePort with idempotent sync" | Created `gemini.ts`, `woo.ts`, and `sync.test.ts` | Verified PUT/GET/POST sync idempotency; 21 unit tests green |
| 1:55 | Antigravity (Gemini) | Fullstack Next.js UI & Agent | "Build Dashboard, Catalog, Add Product, Improve, Agent, and Sync Log views + API routes" | Implemented all 6 pages and API endpoints | Fixed Turbopack `dynamic` route segment config and strict TS types |
| 2:10 | Antigravity (Gemini) | Health & Verification | "Verify production build (`next build`) and launch dev server with `/api/health` monitoring" | Zero-error build across 17 routes, live on localhost:3000 | Verified all 4 system health checks returning `ok` |

---

## 2. Where AI Was Wrong (Key Evidence of Engineering Oversight)

*Documenting where the AI generated incorrect, incomplete, or hallucinated code, and how human guidance corrected it. This is primary evidence of engineering competence.*

1. **Model-Supplied Health Scores:**  
   - *AI Mistake:* LLMs frequently hallucinate or overestimate quality scores in their own JSON outputs (e.g., claiming a product with missing attributes has a score of 95).  
   - *Fix / Guardrail:* Discarded model-generated scores entirely. Built a deterministic, pure TypeScript function (`computeHealth`) to compute the score locally with unit tests.
2. **Fabricating Technical Specs:**  
   - *AI Mistake:* Generative models tend to invent product specifications (e.g., guessing shoe sole material or laptop voltages) when not provided.  
   - *Fix / Guardrail:* Constrained system prompt with strict factual rules and created a dedicated `missingAttributes` field so the AI flags unknown fields for human input instead of guessing.
3. **Next.js 16 Route Segment Configurations:**  
   - *AI Mistake:* Initial page templates included `export const dynamic = "force-dynamic"`, which collided with the Next.js 16 default Turbopack cache configuration.  
   - *Fix / Guardrail:* Cleaned up route segment exports and updated `next.config.ts` to allow standard dynamic server-side rendering without build failures.
4. **Agent Step Output Typing:**  
   - *AI Mistake:* TypeScript compiler threw TS2322 when tool outputs returned an array (from `list_products`) while the repository expected an object record.  
   - *Fix / Guardrail:* Generalized the `AgentStepRecord.output` contract to `unknown`, allowing structured arrays and dictionaries without runtime or type failures.

---

## 3. Prompts That Worked Exceptionally Well

1. **Pure Health Score Function:**  
   > *"Implement computeHealth(product, template) per this exact scoring table as a pure TypeScript function with no I/O, returning `{score, status, checks:[{key, pass, points, hint}]}`. Write Vitest tests covering every check on/off and boundary cases (49/50, 79/80)."*
2. **Cloudinary URL Builder Without API Roundtrips:**  
   > *"Implement CloudinaryMedia adapter generating URL transformations (Optimized: f_auto,q_auto; Thumbnail: c_fill,w_200,h_200,g_auto; Product Card: c_pad,w_600,h_600,b_white; Marketplace Square: c_pad,w_1000,h_1000,b_white; WebP: f_webp,q_auto). If the input is already a Cloudinary URL, inject the transformation segment after /upload/."*
3. **Idempotent Sync Algorithm:**  
   > *"Implement an idempotent syncProduct function against StorePort: check stored woo_id -> PUT; else search by SKU -> store woo_id and PUT; else POST and store woo_id. Ensure failure writes a failed sync_log entry without corrupting state."*

---

## 4. Agentic AI Implementation Notes (Priority #5 Criterion)

- **In-App Agent Architecture:**  
  - Location: `src/agent/` (`loop.ts`, `tools.ts`).  
  - Tools provided: `list_products`, `get_health`, `suggest_improvements`, `apply_suggestion`, `sync_product`.  
  - Safety boundary: Runs in **dry-run** by default, proposing a batch plan with no state modification until human approval. Max 25 iterations. Steps streamed to UI and logged to `agent_steps`.
- **In-Development Agentic Workflow:**  
  - Utilized autonomous coding agents for scaffold generation, hexagonal adapter wiring, and test-driven development (TDD).
