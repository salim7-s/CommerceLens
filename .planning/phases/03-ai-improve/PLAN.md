# Phase 3: AI Improve Flow Execution Plan

**Timebox:** 1:30 – 2:10 (40 Minutes)  
**Deliverables:** AI adapter, AnalyzeService with Zod validation, Improve page with diff preview, Accept flow, Score recomputation.

---

## Task Checklist

- [ ] **1. AI Port & Adapters (`src/adapters/ai/`):**
  - Define `AIPort` interface: `analyzeProduct(product, template, imageUrl?) -> Promise<AISuggestion>`.
  - Implement real adapter (`anthropic.ts` / `gemini.ts` / `openai.ts`) supporting text + image vision URL.
  - Implement deterministic `mock.ts` returning canned enriched response for the demo "shoe" product.
- [ ] **2. Zod Contract & AnalyzeService (`src/services/AnalyzeService.ts`):**
  - Zod schema: `improvedTitle` (15-70), `description` (120-400), `seoKeywords` (3-8), `altText` (10-125), `attributes` ({ name, value, confidence, source }), `missingAttributes` (string[]).
  - Robust self-healing: validate response; on parse error, trigger 1 automatic retry appending Zod validation errors to prompt.
  - On second failure, fall back to mock suggestions without throwing an unhandled exception.
  - Model-supplied score is discarded; `computeHealth` recalculates local score.
- [ ] **3. Improve View (`app/products/[id]/improve/page.tsx`):**
  - Left Column: Current product values, health checklist with pass/fail badges, Cloudinary 5-variant gallery.
  - Right Column: AI suggestions formatted with diff highlights.
  - Actions:
    - **Analyze Product:** Triggers `/api/analyze`.
    - **Accept All / Accept Field:** Updates product record, triggers immediate re-score animation.
    - **Mark Ready for WooCommerce:** Unlocked only when score $\ge$ 80.
- [ ] **Acceptance Gate:**
  - Weak "shoe" product score jumps from ~35 to 85+ after clicking "Accept All". Status flips to "Ready".
