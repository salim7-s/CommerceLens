# Video Presentation Scripts: CommerceLens

> **Hackathon Scoring Priority #4:**  
> *"Video Presentation: Clarity, structure, and communication quality in your 2-minute explanation."*

---

## 1. Plan Video Script (Phase 1 Deliverable, $\le$ 2 Minutes)

*Record at the end of Phase 1 (around 0:35–0:40).*

- **0:00 - 0:25 | Problem Definition:**  
  "Hi everyone, bad product listings destroy conversion rates on ecommerce stores. Unoptimized, massive images slow down page loads, while incomplete descriptions, missing alt text, and lacking SEO tags kill search ranking. In this hackathon, we chose the **PIM System Integration challenge**, but with a visual-first angle: **CommerceLens**."
- **0:25 - 0:50 | Solution & Architecture:**  
  "CommerceLens is an AI-assisted visual product intelligence gateway for WooCommerce catalogs. Instead of publishing raw data, every product is scored against a 7-point deterministic Health Score, optimized visually via Cloudinary URL transformations, enriched with vision AI, and reviewed by a merchant before syncing. Architecturally, we're using Next.js App Router, SQLite, and a strict Hexagonal Ports-and-Adapters pattern so our media, AI, and store layers are swappable."
- **0:50 - 1:15 | Scope & Integration Research:**  
  "For WooCommerce, we researched REST v3, Webhooks, and CSV import. We locked in REST API v3 using the official client because it offers deterministic idempotency via SKU mapping and atomic transactional error handling. Out of scope is multi-tenant auth and complex ERP syncing, keeping our 4 hours focused on listing quality."
- **1:15 - 1:45 | Phase Plan & AI Tooling:**  
  "Our 4-hour roadmap is divided into 6 phases: Phase 2 for Core PIM & Cloudinary, Phase 3 for AI enrichment, Phase 4 for WooCommerce sync & our Catalog Quality Agent, Phase 5 for Vitest and Playwright tests, and Phase 6 for submission. We are pair-programming with AI tools throughout scaffolding, testing, and documentation, tracking all prompts and corrections live in `AI_USAGE_LOG.md`. Let's build!"

---

## 2. Process Video Script (Phase 2 Deliverable, $\le$ 2 Minutes)

*Narrate directly over your screen recording showing code diffs, prompts, and tests.*

- **0:00 - 0:30 | AI Tooling Methodology:**  
  "Welcome to the development process behind CommerceLens. To maximize our engineering velocity, we leveraged AI tools across every tier of our stack—from architecture scaffolding to pure domain logic, unit tests, and documentation."
- **0:30 - 0:55 | Engineering Oversight & Corrections ("Where AI was Wrong"):**  
  "Crucially, we didn't blindly accept AI outputs. For example, when testing the AI enrichment flow, language models frequently hallucinated high quality scores and invented technical specs like shoe sole materials. We stepped in with strict engineering guardrails: we discarded model-generated scores, built a pure deterministic TypeScript function `computeHealth` with 100% test coverage, and forced the AI to flag unknown fields in a `missingAttributes` array instead of guessing."
- **0:55 - 1:25 | Agentic Workflows & Design Patterns:**  
  "We followed Hexagonal Architecture with clean ports and adapters. Our Catalog Quality Agent operates as an autonomous agent using function calling across 5 specific tools, with a mandatory dry-run default to ensure human oversight before any state changes."
- **1:25 - 1:50 | Test Verification & Reliability:**  
  "Here you can see our Vitest test suite running green across our domain logic, Zod parsers, and WooCommerce mapping, followed by our Playwright end-to-end test validating the complete happy path under mocked external adapters. Every step of this journey is transparently logged in `AI_USAGE_LOG.md`."

---

## 3. The 2-Minute Explainer & Demo Video (Scored Final Submission)

*Strict 2-minute timer breakdown.*

- **0:00 - 0:15 | Problem (15s):**  
  "Ecommerce merchants lose millions because product listings reach storefronts unoptimized—heavy images that ruin page speed, missing attributes, and zero SEO tags."
- **0:15 - 0:30 | Solution & Architecture (15s):**  
  "CommerceLens solves this with a visual quality gate. Built on Next.js, SQLite, Cloudinary, and WooCommerce REST v3, it scores catalog health, enriches listings with vision AI, generates optimized media variants, and syncs idempotently."
- **0:30 - 1:30 | Live Product Demo (60s):**  
  1. *(Show Product List)*: "Here is a weak product—'shoe' with a 3-word description, uploaded image, and an initial health score of only 35 out of 100, marked 'Needs Work'."
  2. *(Click Improve)*: "In the Improve view, our Cloudinary adapter instantly delivers 5 responsive variants: Web delivery, Thumbnail, Card, and Marketplace Square without any API latency."
  3. *(Click Analyze Product)*: "Our vision AI analyzes the image and text, generating an SEO-optimized title, detailed description, search tags, descriptive alt text, and identifying missing attributes."
  4. *(Click Accept all)*: "Notice our deterministic health score immediately jumps from 35 to 85. The status flips to 'Ready for WooCommerce'."
  5. *(Click Mark Ready & Sync)*: "We click Sync to WooCommerce. It executes an idempotent REST v3 push. Switching to our WooCommerce storefront—the product is live with full attributes, tags, and optimized Cloudinary images!"
- **1:30 - 1:45 | Catalog Quality Agent (15s):**  
  "For larger catalogs, our autonomous Catalog Quality Agent inspects the entire catalog against high-level goals. It runs in dry-run mode first, formulating an approvable execution plan with full audit logging in `agent_steps`."
- **1:45 - 2:00 | Tests, Docs & Close (15s):**  
  "With a green Vitest suite, Playwright e2e coverage, comprehensive docs, and our live `AI_USAGE_LOG.md`, CommerceLens ensures no poor-quality listing ever reaches your store. Thank you!"
