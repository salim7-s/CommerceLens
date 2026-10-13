# CommerceLens — 2-Minute Video Presentation Scripts

> **Submission Repository:** [https://github.com/salim7-s/-CommerceLens](https://github.com/salim7-s/-CommerceLens)  
> This document contains two complete, professionally timed **2-minute video scripts** matching the hackathon submission criteria.

---

# Part 1: Video Presentation (Planning Video)
**Duration:** 2 Minutes (~260 words, spoken at ~130 WPM)  
**Goal:** Clearly explain the project's core concept, technical stack, key planned features, and potential real-world impact.  
**Framing:** Presenter on camera (or split-screen with architecture slides/diagram).

| Timestamp | Section | Narration & Speaking Cues |
|---|---|---|
| **0:00 – 0:25** | **Core Concept & The Problem** | *"Hello everyone! I'm excited to present **CommerceLens** — an AI-powered Visual Product Information Management platform and deterministic quality gate for WooCommerce.<br><br>The problem we are addressing is critical: e-commerce merchants lose thousands of dollars because raw catalog uploads are full of blurry or uncompressed images, thin one-line descriptions, missing attributes, and zero SEO tags. In WooCommerce, publishing unverified listings leads to slow load speeds, poor Google rankings, and high cart abandonment. CommerceLens solves this by acting as an intelligent quality gate before products ever touch the live storefront."* |
| **0:25 – 0:55** | **Technical Stack** | *"To build a robust, enterprise-grade solution, our technical architecture is founded on six core pillars:<br>1. **Next.js 16 with App Router & Turbopack** for high-performance server rendering and client interactivity.<br>2. **Hexagonal Architecture** with TypeScript interfaces to keep business logic completely decoupled from external adapters.<br>3. **Cloudinary Media Engine** for on-the-fly dynamic URL transformations without server compute costs.<br>4. **Google Gemini 1.5 Flash** for multimodal vision AI analysis of product photography.<br>5. **Better-SQLite3** for low-latency, zero-config embedded persistence.<br>6. **WooCommerce REST API v3** for idempotent catalog syndication."* |
| **0:55 – 1:35** | **Key Planned Features** | *"Our development roadmap centers around four major features:<br>• **Deterministic 7-Point Health Gate:** A mathematical scoring engine (0 to 100) that verifies title length, copy richness, pricing, image assets, alt-text, tags, and category templates. Only listings scoring 80 or above can be syndicated.<br>• **Cloudinary Responsive Variant Engine:** Automated generation of 6 distinct variants per SKU, including 1:1 marketplace squares, web-optimized WebP, and high-DPI zoom frames.<br>• **Multimodal Vision AI Auto-Fill:** Instead of manual data entry, merchants snap a photo or upload an image, and Gemini Vision automatically infers title, category, description, SEO tags, and physical specs.<br>• **Autonomous Quality Agent:** A directive-based agent that scans catalogs, flags deficiencies, and prepares safe dry-run syndication dossiers."* |
| **1:35 – 2:00** | **Potential Real-World Impact** | *"CommerceLens bridges the gap between chaotic vendor media and high-converting storefronts. It eliminates hours of repetitive data entry, prevents broken or non-compliant listings from going live, and directly increases organic search visibility and conversion rates for digital merchants.<br><br>Thank you, and I look forward to demonstrating our working solution in the results video!"* |

---

# Part 2: Video Presentation (Result Video)
**Duration:** 2 Minutes (~270 words, spoken at ~135 WPM)  
**Goal:** Demonstrate what was built during the hackathon, show how the solution works, highlight key results/benefits, discuss challenges solved, and reinforce the impact.  
**Framing:** Presenter introduction -> Screen share walkthrough of `localhost:3000` -> Presenter conclusion.

| Timestamp | Section | Visual Screen Action & Narration |
|---|---|---|
| **0:00 – 0:20** | **Introduction & What Was Built** | *(Camera on presenter, then switch to screen showing CommerceLens Home)* <br> *"Welcome back! During this hackathon, we built and deployed **CommerceLens** — a complete visual catalog quality gate and AI enrichment suite. Everything you see here is fully operational: from our warm editorial dashboard to automated vision enrichment and WooCommerce sync."* |
| **0:20 – 0:45** | **Feature 1: Zero Manual Entry & AI Auto-Fill** | *(Navigate to `/products/new` and click a sample photo or upload)* <br> *"The first major result is **zero manual data entry**. On our Create Product page, the merchant simply uploads a photo or snaps with their device camera. Instantly, our Multimodal Vision AI analyzes the visual cues and auto-populates the product title, category, price, marketing copy, 5 SEO discovery tags, and technical specs. No manual typing required."* |
| **0:45 – 1:10** | **Feature 2: Cloudinary Media Engine & Studio Diff** | *(Navigate to `/products/[id]/improve`)* <br> *"Next, in our Inspection Studio, Cloudinary's URL transformation engine dynamically serves 6 responsive variants on the fly: marketplace squares, web-optimized WebP, and storefront card frames at zero extra storage cost.<br><br>Here, our **7-Point Health Gate** audits the listing. When we click 'Analyze Product with Vision AI' and accept the recommendations, our deterministic score recalculates in real-time from 40 up to 100!"* |
| **1:10 – 1:30** | **Feature 3: Gated WooCommerce Syndication & Agent** | *(Click 'Sync to Store', then navigate to `/agent`)* <br> *"Because our score exceeds 80, the WooCommerce sync button unlocks. Clicking it triggers an idempotent REST v3 sync, safely published to the store without duplicate SKUs.<br><br>Furthermore, on our **Quality Agent** page, merchants can execute high-level directives. The agent scans the catalog, audits health, and groups findings into structured **Product Dossier Cards** with full technical traces."* |
| **1:30 – 1:50** | **Challenges Faced & How We Solved Them** | *(Camera on presenter)* <br> *"A key challenge we conquered was preventing AI hallucinations: we designed a strict category template system where unverified attributes are safely flagged as 'missing' for human review rather than invented. We also implemented reliable local storage fallbacks so image uploads and camera snapshots never fail even in offline environments, backed by 21 passing automated unit tests."* |
| **1:50 – 2:00** | **Conclusion & Submission** | *"CommerceLens guarantees that only market-ready, visually stunning products reach your storefront. All code, architecture docs, and tests are available on our GitHub repository. Thank you!"* |

---

## Recording Tips for Your Video Submission

1. **Camera & Framing:** Record in 1080p. Keep yourself centered, at eye level, in a well-lit room.
2. **Audio:** Use a headset or dedicated microphone to eliminate room echo.
3. **Pacing:** Aim for a steady, confident pace (~130 words per minute). 
4. **Result Video Screen Share:** Keep your browser open to `http://localhost:3000` with the dev server running:
   - Tab 1: `http://localhost:3000/` (Home Overview)
   - Tab 2: `http://localhost:3000/products/new` (Upload photo & watch Vision AI auto-fill)
   - Tab 3: `http://localhost:3000/products/prod_shoe_001/improve` (Inspection Studio & Sync)
   - Tab 4: `http://localhost:3000/agent` (Product Dossier Quality Agent)

---

## Official GitHub Submission Link
- **GitHub Repository:** [https://github.com/salim7-s/-CommerceLens.git](https://github.com/salim7-s/-CommerceLens.git)
- **Demo URL:** [http://localhost:3000](http://localhost:3000)
