# Integration Decision: WooCommerce Synchronization Architecture

**Challenge:** PIM System Integration with WooCommerce  
**Author:** CommerceLens Engineering  
**Decision:** WooCommerce REST API v3 (Direct Push/Pull via Official Node Client)

---

## 1. Options Evaluated

| Method | Mechanism | Pros | Cons | Decision |
|---|---|---|---|---|
| **REST API v3** | Direct HTTP Push/Pull via `@woocommerce/woocommerce-rest-api` | Standardized, transactional, supports full CRUD on products/attributes/categories/tags, immediate feedback, batch endpoint (`/batch` up to 100 items), built-in consumer key/secret authentication. | Network round-trip per sync request. | **CHOSEN (Primary)** |
| **Webhooks** | Event-driven HTTP POST callbacks from WooCommerce to PIM | Real-time notification of external changes in WooCommerce (live drift detection). | Requires public internet-reachable URL (ngrok/tunneling) during local development; complex event deduplication and retry queue overhead. | **DEFERRED (v2)** |
| **CSV / Batch File Import** | Flat-file file upload and export | Simple bulk transfer format compatible with native WooCommerce CSV importer. | Non-interactive, non-transactional, no real-time status feedback, difficult programmatic error recovery, fragile schema mapping. | **SKIPPED** |

---

## 2. Rationale for REST API v3

1. **Deterministic Idempotency:** The PIM controls sync state. Using `woo_id` and SKU lookups (`GET /products?sku={sku}`), we guarantee zero duplicate listings even across repeated sync attempts.
2. **Atomic Error Handling:** Each REST call returns immediate HTTP status codes and detailed validation errors, enabling instantaneous user alerts and retry actions in the PIM UI (`/sync-log`).
3. **Product-Level Attribute Support:** WooCommerce REST API allows attaching product-level attributes directly (`attributes: [{ name, options: [val], visible: true }]`), eliminating the requirement to provision global attributes first.
4. **Cloudinary Asset Embedding:** WooCommerce natively fetches product images from public URLs specified in `images: [{ src, alt }]`, aligning seamlessly with our Cloudinary CDN pipeline without uploading raw binary blobs across the wire.
5. **Architectural Testability:** The REST API easily maps to our `StorePort` interface, allowing us to swap in an in-memory mock store (`SYNC_MODE=mock`) for lightning-fast unit tests and offline hackathon demos.
