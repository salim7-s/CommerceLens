# Phase 2: Core PIM + Attributes + Cloudinary + Score Execution Plan

**Timebox:** 0:40 – 1:30 (50 Minutes)  
**Deliverables:** SQLite database, seed data, pure health score, Cloudinary adapter, Add Product, Product List, Dashboard.

---

## Task Checklist

- [ ] **1. SQLite Database & Repositories (`src/adapters/repo/sqlite/`):**
  - Create tables: `categories`, `attribute_templates`, `products`, `product_attributes`, `ai_suggestions`, `sync_log`, `agent_runs`, `agent_steps`.
  - Write seed script `scripts/seed.ts` (`npm run seed`):
    - Category: *Footwear* (size*, color*, material*, gender*, sole type)
    - Category: *Apparel* (size*, color*, fabric*, fit)
    - Category: *Electronics* (brand*, model*, warranty*, voltage)
    - Demo products: Weak "shoe" (score ~35), Medium "backpack" (score ~60), Strong "headphones" (score 85).
- [ ] **2. Pure Domain Logic (`src/domain/`):**
  - `health.ts`: `computeHealth(product, template)` checking title, description, category, required attributes, image, alt text, and SEO tags.
  - `attributes.ts`: `validateAttributes(values, template)` checking type and required rules.
  - Vitest unit tests: `tests/unit/health.test.ts` and `tests/unit/attributes.test.ts`.
- [ ] **3. Media Adapter (`src/adapters/media/`):**
  - `cloudinary.ts`: `uploadImage(file)` and URL generator `variants(publicId)` generating:
    - Optimized: `f_auto,q_auto`
    - Thumbnail: `c_fill,w_200,h_200,g_auto,f_auto,q_auto`
    - Product Card: `c_pad,w_600,h_600,b_white,f_auto,q_auto`
    - Marketplace Square: `c_pad,w_1000,h_1000,b_white,f_auto,q_auto`
    - WebP: `f_webp,q_auto`
  - `mock.ts`: Mock media adapter returning static placeholder image variants.
- [ ] **4. Core Pages & UI:**
  - `app/products/page.tsx`: Table listing thumbnail, title, category, health score badge, status chip, sync chip, Improve button, search/filter.
  - `app/products/new/page.tsx`: Add product form with dynamic attribute fields driven by category selection, and Cloudinary upload.
  - `app/page.tsx`: Dashboard with counts, average health score gauge, recent fixes.
- [ ] **Acceptance Gate:**
  - Create product "shoe", upload photo, verify 5 Cloudinary variants display, initial score is ~35-40 with status "Needs Work".
