# Phase 1: Planning + Research Execution Plan

**Timebox:** 0:00 – 0:40 (40 Minutes)  
**Deliverables:** Stack lock, scope/research docs, scaffold, smoke tests, plan video.

---

## Task Checklist

- [ ] **1. Lock Architectural Decisions & Dependencies:**
  - Framework: Next.js (App Router) + TypeScript
  - Styling: Tailwind CSS
  - Database: SQLite via `better-sqlite3`
  - Integration: WooCommerce REST v3 (`@woocommerce/woocommerce-rest-api`)
  - Media: Cloudinary SDK
  - Validation: Zod
  - Testing: Vitest + Playwright
- [ ] **2. Documentation Completed:**
  - `.planning/research/integration-decision.md` (REST push/pull vs webhooks vs CSV)
  - `.planning/research/scope-and-assumptions.md` (single-user, SKU identity, Cloudinary URLs)
  - Mermaid architecture diagram in README
- [ ] **3. Project Scaffolding:**
  ```bash
  npx create-next-app@latest CommerceLens --ts --tailwind --app --eslint
  cd CommerceLens
  npm i cloudinary @woocommerce/woocommerce-rest-api zod better-sqlite3
  npm i -D vitest @playwright/test @types/better-sqlite3
  npx playwright install chromium
  ```
- [ ] **4. Configuration (`.env.local` & `.env.example`):**
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `WOO_URL`, `WOO_KEY`, `WOO_SECRET`
  - `AI_PROVIDER` (`anthropic` | `openai` | `gemini` | `mock`), `AI_API_KEY`
  - `SYNC_MODE` (`real` | `mock`)
- [ ] **5. Smoke Tests:**
  - Verify Cloudinary image upload returns CDN URL.
  - Verify WooCommerce REST endpoint responds (`GET /wp-json/wc/v3/products`).
  - Verify AI test prompt returns structured JSON.
- [ ] **6. Phase 1 Deliverables:**
  - Initialize `AI_USAGE_LOG.md`.
  - Record Phase 1 Plan Video ($\le$ 2 minutes using `.planning/scripts/video-scripts.md#1`).
