# Scope and Assumptions: CommerceLens

**Project:** CommerceLens (Visual Product Intelligence for WooCommerce)  
**Hackathon:** Kilowott Hack-AI-thon (4-Hour Timed Assessment)

---

## 1. Project Scope

### In-Scope (v1 Minimum Winning Slice)
- **Product Catalog Management:** Add, list, view, and edit products with structured, category-driven attribute templates (Footwear, Apparel, Electronics).
- **Cloudinary Visual Pipeline:** Upload original images to Cloudinary (`CommerceLens/` folder, tagged with SKU), and render 5 URL-based transformation variants side by side:
  - Optimized: `f_auto,q_auto`
  - Thumbnail: `c_fill,w_200,h_200,g_auto,f_auto,q_auto`
  - Product Card: `c_pad,w_600,h_600,b_white,f_auto,q_auto`
  - Marketplace Square: `c_pad,w_1000,h_1000,b_white,f_auto,q_auto`
  - WebP: `f_webp,q_auto`
  - *(Optional)* Cutout on white background: `e_background_removal` with `b_white`.
- **Deterministic Product Health Score:** Pure TypeScript function (`computeHealth`) checking 7 rules totaling 100 points: Title (15), Description (20), Category (10), Required Attributes (20), Image (15), Alt Text (10), SEO Tags (10). Thresholds: 0-49 Needs Work, 50-79 Improve, 80-100 Ready.
- **AI Catalog Enrichment:** Vision-assisted attribute inference, SEO keyword generation, alt-text authoring, title/description optimization, and `missingAttributes` detection, enforced with Zod schemas and automatic single-retry self-healing.
- **Human-in-the-Loop Review:** Full diff preview of suggestions before applying; model-supplied scores are discarded; ready gate requires score $\ge$ 80 and explicit mark-ready confirmation.
- **Idempotent WooCommerce Synchronization:** Pushes validated products to WooCommerce via REST API v3 using official client (`@woocommerce/woocommerce-rest-api`), with swappable in-memory mock store.
- **Sync Audit Log:** Dedicated `/sync-log` tracking operations, status, error messages, and retry actions.
- **Catalog Quality Agent:** Autonomous agent with 5 tools (`list_products`, `get_health`, `suggest_improvements`, `apply_suggestion`, `sync_product`), 25-step cap, dry-run by default, streaming step logging to `/agent`.
- **Engineering Excellence:** Hexagonal architecture (domain, ports, adapters, services), Vitest unit test suite, Playwright happy-path e2e test, and `/api/health` monitoring endpoint.
- **Live AI Usage Documentation:** Transparent logging in `AI_USAGE_LOG.md` tracking prompts, corrections, and AI errors.

### Out of Scope (Deferred to v2)
- Multi-tenant organizations, granular user role permissions, and authentication.
- Real-time bi-directional webhooks and automated background sync daemon.
- Inventory management, supplier order tracking, warehouse logistics, and ERP integrations.
- Multi-currency pricing algorithms and complex variable product matrices (hundreds of SKU variants).
- Paid Cloudinary AI add-on dependencies (moderation, auto-captioning).

---

## 2. Core Assumptions

1. **Single User / Merchant Admin:** The application operates as an internal merchant management tool with no client-facing storefront login required.
2. **SKU Uniqueness:** The product SKU serves as the primary natural key across both the PIM database and WooCommerce. No two products share an identical SKU.
3. **PIM is the Single Source of Truth:** In any data conflict between PIM and WooCommerce, the PIM catalog overrides external WooCommerce changes.
4. **Cloudinary Hosted CDN URLs:** WooCommerce retrieves product images by downloading the public Cloudinary CDN URL delivered in the REST payload.
5. **Permalinks Enabled in WooCommerce:** WooCommerce operates with pretty permalinks enabled (`/%postname%/`) to support standard `/wp-json/wc/v3/` REST routes.
6. **Zero-Trust AI Gating:** LLM outputs are treated as untrusted suggestions until validated by Zod and confirmed by a human; health scores are never computed by the model.
7. **Offline Demo Resilience:** If local WooCommerce or external AI endpoints experience latency or failure during presentation, mock adapters (`SYNC_MODE=mock`, `AI_PROVIDER=mock`) seamlessly maintain full functional parity.
