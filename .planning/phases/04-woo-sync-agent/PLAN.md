# Phase 4: WooCommerce Sync + Agent Execution Plan

**Timebox:** 2:10 – 3:00 (50 Minutes)  
**Deliverables:** WooCommerce REST v3 adapter, Idempotent sync, Sync log UI, Catalog Quality Agent with dry-run default.  
**Critical Milestone:** Feature Freeze strictly at 2:50.

---

## Task Checklist

- [ ] **1. WooCommerce Store Adapter (`src/adapters/store/`):**
  - `StorePort` interface: `syncProduct(product) -> Promise<{ wooId, status, message }>`.
  - `woo.ts`: Official client (`@woocommerce/woocommerce-rest-api`).
    - Maps SKU, name, price (string), description + short description (1st sentence), categories (lookup/create), attributes (product-level), tags, image URL (card variant), `meta_data: [{ key: 'pim_id', value }]`.
  - `mock.ts`: In-memory mock store maintaining array of synced products with IDs.
- [ ] **2. Idempotent Sync Service (`src/services/SyncService.ts`):**
  - Algorithm:
    1. If `woo_id` stored: `PUT /products/{woo_id}`.
    2. Else search `GET /products?sku={sku}`; if found, store `woo_id` and `PUT`; else `POST` and store returned `id`.
    3. Record audit entry in `sync_log` (`create` or `update`, status, message).
  - Bulk sync: concurrency control or `/products/batch`.
- [ ] **3. Sync Log Page (`app/sync-log/page.tsx`):**
  - Displays table of all sync attempts: Product SKU, Action, Status (Synced/Failed), Error message, Timestamp, and Retry button.
- [ ] **4. Catalog Quality Agent (`src/agent/` & `app/agent/page.tsx`):**
  - Loop capped at 25 steps with tools:
    - `list_products({ status? })`
    - `get_health({ id })`
    - `suggest_improvements({ id })`
    - `apply_suggestion({ id })` (requires approved flag)
    - `sync_product({ id })` (requires score $\ge$ 80)
  - Default **dry-run** mode creates plan and proposals without writing to DB.
  - Streaming execution UI on `/agent` with live step logs from `agent_steps`.
- [ ] **Acceptance Gate (Feature Freeze at 2:50):**
  - Clicking "Sync" twice updates the same WooCommerce product (no duplicates).
  - Agent dry-run scans catalog and presents an approvable plan.
