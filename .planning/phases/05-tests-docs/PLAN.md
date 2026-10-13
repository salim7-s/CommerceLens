# Phase 5: Tests, Docs, Operations Execution Plan

**Timebox:** 3:00 – 3:30 (30 Minutes)  
**Deliverables:** Green Vitest unit tests, Playwright e2e test, comprehensive README with Mermaid, `/api/health` endpoint, `.env.example`.

---

## Task Checklist

- [ ] **1. Unit Test Suite (Vitest):**
  - Run: `npm test`
  - `tests/unit/health.test.ts`:
    - Each check isolated (Title length 15-70, Description $\ge$ 120, Category, Attrs, Image, Alt, SEO).
    - Boundary tests: 49/50 (needs_work vs improve), 79/80 (improve vs ready).
  - `tests/unit/attributes.test.ts`:
    - Validation of text, number, select, boolean; required attribute missing fails.
  - `tests/unit/cloudinary.test.ts`:
    - Exact URL transformation strings match specification.
  - `tests/unit/ai-parser.test.ts`:
    - Valid JSON passes; invalid triggers retry; low confidence attributes omitted from auto-apply.
  - `tests/unit/sync.test.ts`:
    - Idempotency verified: 2 sync calls create only 1 product in mock store.
- [ ] **2. End-to-End Test (Playwright):**
  - Run: `npx playwright test`
  - `tests/e2e/happy-path.spec.ts` (with `SYNC_MODE=mock AI_PROVIDER=mock`):
    - Add product "shoe" with image $\rightarrow$ Open Improve $\rightarrow$ Click Analyze $\rightarrow$ Click Accept All $\rightarrow$ Verify score $\ge$ 80 $\rightarrow$ Mark Ready $\rightarrow$ Click Sync $\rightarrow$ Assert mock store contains 1 product.
- [ ] **3. Operational Readiness & Health Check:**
  - Route: `app/api/health/route.ts` checking:
    - App status: `ok`
    - SQLite database reachability: `ok`
    - Cloudinary credentials configured: `ok`
    - WooCommerce connectivity: `ok`
  - Verify `.env.example` is complete and committed.
- [ ] **4. README.md Finalization:**
  - 3-sentence pitch + GIF/screenshot.
  - Scope and assumptions summary.
  - Architecture diagram (Mermaid).
  - Design patterns articulated (Ports & Adapters, Strategy, Repository, Pure Domain).
  - Quickstart guide with 1-command setup.
  - Link to `AI_USAGE_LOG.md`.
- [ ] **Acceptance Gate:**
  - Fresh clone test: `npm install && npm run seed && npm test` all green.
