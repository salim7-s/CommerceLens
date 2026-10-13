# BUILD PLAN: CommerceLens (Kilowott Hack-AI-thon, PIM challenge)

This is the "open it and start building" document. It complements PROJECT / REQUIREMENTS / ROADMAP / STATE. Assumed stack: **Next.js (App Router) + TypeScript**, **SQLite**, **Cloudinary**, **WooCommerce REST v3**, any LLM with JSON output. Change anything in section 1 if your preferences differ.

---

## 0. Start here (first 30 minutes)

1. **Ask organizers (1 min):** Can accounts/Woo store be set up before the clock? Are plan + process videos the scored 2-minute explanation, or is that a third video?
2. **Cloudinary:** sign up (free), copy cloud name, API key, API secret from the console dashboard. Optional: enable the AI Vision add-on (free quota) in Settings > Add-ons.
3. **WooCommerce store** (timebox 30 min, else mock-only): LocalWP (GUI, easiest) or Docker (section 2.3). Install WooCommerce, set permalinks to "Post name", create REST keys: WooCommerce > Settings > Advanced > REST API > Add key (Read/Write).
4. **AI key:** whichever provider you can use fastest; confirm it returns JSON.
5. **Scaffold:**
```bash
npx create-next-app@latest CommerceLens --ts --tailwind --app --eslint
cd CommerceLens
npm i cloudinary @woocommerce/woocommerce-rest-api zod better-sqlite3
npm i -D vitest @playwright/test @types/better-sqlite3
npx playwright install chromium
```
6. **.env.local**
```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
WOO_URL=http://localhost:8080
WOO_KEY=ck_xxx
WOO_SECRET=cs_xxx
AI_PROVIDER=anthropic   # or openai | gemini | mock
AI_API_KEY=
SYNC_MODE=real          # real | mock
```
7. **Create `AI_USAGE_LOG.md`** and log everything from now on (template in section 9). Start screen recording for the process video.
8. Smoke tests: upload one image to Cloudinary, call `GET {WOO_URL}/wp-json/wc/v3/products`, call the AI with a tiny prompt. All three must work before Phase 2.

---

## 1. Tools and services (what to use, and why)

| Need | Choice | Notes |
|------|--------|-------|
| Media | **Cloudinary** (free plan) | Free plan = 25 credits/month; 1 credit ~ 1,000 transformations or 1 GB storage or 1 GB bandwidth. Plenty for a hackathon. Sources disagree on what happens past the limit (soft vs suspension), so stay well under: use ~10 demo images. |
| Background removal | `e_background_removal` URL transformation | Now a core transformation. The old add-on is being deprecated and accounts created after 1 Feb 2026 cannot subscribe to it. Treat as optional; first request for an image can be slow. |
| Image tagging / checks | Your main LLM with vision (pass the Cloudinary URL) | Cheaper and simpler than Cloudinary AI Vision. Cloudinary AI Vision (beta add-on, Analyze API: tagging, moderation, open questions) is an optional extra. Captioning needs a different add-on (AI Content Analysis), so skip it. |
| Store integration | **WooCommerce REST API v3** | `/wp-json/wc/v3/`. Products, attributes, categories, tags, variations all exposed, plus `/batch` (max 100 objects per call). Auth: consumer key/secret. Use the official Node client `@woocommerce/woocommerce-rest-api`, which handles auth for http and https. |
| Local Woo | LocalWP or Docker (WordPress + WooCommerce plugin) | Pretty permalinks required for `/wp-json/...` paths. |
| Validation | **zod** | Validate AI JSON, env, API inputs. |
| DB | **SQLite (better-sqlite3)** | Zero setup. Hide behind repository interfaces. |
| Unit tests | **Vitest** | Fast, TS-native. |
| E2E | **Playwright** | One solid happy-path test. |
| AI coding tools | Claude Code / Cursor / Copilot, whichever you use | Log prompts; name them in videos. GSD parallel agents + verifier counts as agentic development. |
| Deploy (stretch) | Vercel (app) | Needs a Woo store reachable from the internet; otherwise skip and demo locally. |

---

## 2. Architecture

### 2.1 Layers and patterns (this is your "design patterns" story)

```
app/                     Next.js pages + route handlers (thin)
  (ui) dashboard, products, products/new, products/[id]/improve, agent, sync-log
  api/ products, upload, analyze, suggestions/[id]/accept, products/[id]/ready,
       sync, agent/run, health
src/
  domain/                pure logic, no I/O
    health.ts            computeHealth(product, template) -> {score, status, checks[]}
    attributes.ts        validateAttributes(values, template)
    mapping.ts           toWooProduct(product) / fromWooProduct(wooProduct)
    schemas.ts           zod schemas (Product, AISuggestion, AgentPlan)
  ports/                 interfaces
    MediaPort, AIPort, StorePort (Woo), ProductRepo, TemplateRepo, SyncLogRepo
  adapters/              implementations (Strategy/Adapter pattern)
    media/cloudinary.ts  + media/mock.ts
    ai/anthropic.ts | openai.ts | gemini.ts + ai/mock.ts
    store/woo.ts        + store/mock.ts
    repo/sqlite/*.ts
  services/              orchestration (use cases)
    ProductService, AnalyzeService, SyncService, AgentService
  agent/                 tools.ts, loop.ts, prompts.ts
tests/unit, tests/e2e
```
Patterns to name in docs: **Ports and Adapters (hexagonal)**, **Repository**, **Strategy** (AI/Media/Store providers swapped by env), **Pure domain module** (health score), **Service layer**. Dependency injection through a small `container.ts` that reads `SYNC_MODE` / `AI_PROVIDER`.

### 2.2 Data model (SQLite)

```
categories(id, name, woo_id)
attribute_templates(id, category_id, name, type[text|number|select|boolean], required, options_json)
products(id, sku UNIQUE, name, category_id, price, description, alt_text, seo_tags_json,
         image_public_id, image_url, health_score, status[draft|needs_work|improve|ready],
         woo_id, sync_status[none|pending|synced|failed|drift], synced_at, created_at, updated_at)
product_attributes(product_id, name, value)
ai_suggestions(id, product_id, payload_json, status[pending|accepted|rejected], created_at)
sync_log(id, product_id, action[create|update], status, message, created_at)
agent_runs(id, goal, mode[dry_run|apply], status, created_at)
agent_steps(id, run_id, step_no, tool, input_json, output_json, created_at)
```
Seed categories and templates with a script (`npm run seed`): Footwear (size*, color*, material*, gender*, sole type), Apparel (size*, color*, fabric*, fit), Electronics (brand*, model*, warranty*, voltage). `*` = required.

### 2.3 Docker WooCommerce (if not using LocalWP)

```yaml
# docker-compose.woo.yml
services:
  db:
    image: mysql:8.0
    environment: {MYSQL_DATABASE: wp, MYSQL_USER: wp, MYSQL_PASSWORD: wp, MYSQL_ROOT_PASSWORD: root}
    volumes: [db:/var/lib/mysql]
  wordpress:
    image: wordpress:latest
    ports: ["8080:80"]
    environment: {WORDPRESS_DB_HOST: db, WORDPRESS_DB_USER: wp, WORDPRESS_DB_PASSWORD: wp, WORDPRESS_DB_NAME: wp}
    volumes: [wp:/var/www/html]
    depends_on: [db]
  wpcli:
    image: wordpress:cli
    user: "33:33"
    environment: {WORDPRESS_DB_HOST: db, WORDPRESS_DB_USER: wp, WORDPRESS_DB_PASSWORD: wp, WORDPRESS_DB_NAME: wp}
    volumes: [wp:/var/www/html]
    depends_on: [db, wordpress]
volumes: {db: {}, wp: {}}
```
```bash
docker compose -f docker-compose.woo.yml up -d
docker compose -f docker-compose.woo.yml run --rm wpcli wp core install --url=http://localhost:8080 --title=Shop --admin_user=admin --admin_password=admin --admin_email=a@b.co --skip-email
docker compose -f docker-compose.woo.yml run --rm wpcli wp plugin install woocommerce --activate
docker compose -f docker-compose.woo.yml run --rm wpcli wp rewrite structure '/%postname%/'
```
Then create REST keys in the admin UI. (Commands may need small tweaks; if it fights you for more than 30 min, switch to LocalWP or mock.)

---

## 3. Core specs (copy these into your AI coding tool as context)

### 3.1 Health score (pure function)

| Check | Pts | Pass rule |
|-------|-----|-----------|
| title | 15 | length 15-70 chars, not generic (single word fails) |
| description | 20 | >= 120 chars |
| category | 10 | set |
| required attributes | 20 | all required attrs of the category's template filled and valid |
| image | 15 | image_url present |
| alt text | 10 | >= 10 chars |
| SEO tags | 10 | >= 3 tags |

Return `{score, status, checks:[{key, pass, points, hint}]}`. Status: 0-49 needs_work, 50-79 improve, 80-100 ready. Ready-to-sync gate: score >= 80 AND user clicked "Mark ready".

### 3.2 Cloudinary variants (build URLs with the SDK; no API call needed)

| Variant | Transformation | Use |
|---------|---------------|-----|
| Original | none | compare |
| Optimized | `f_auto,q_auto` | web delivery |
| Thumbnail | `c_fill,w_200,h_200,g_auto,f_auto,q_auto` | lists |
| Product card | `c_pad,w_600,h_600,b_white,f_auto,q_auto` | storefront |
| Marketplace square | `c_pad,w_1000,h_1000,b_white,f_auto,q_auto` | marketplaces |
| WebP | `f_webp,q_auto` | show format win |
| Optional cutout | `e_background_removal` then pad with `b_white` | wow factor; never a blocker |

Show file size or "format auto-selected" next to each preview if you can fetch headers; otherwise just label them. Upload with a folder (`CommerceLens/`) and tags (`pim`, sku).

### 3.3 AI suggestion contract (zod)

```ts
AISuggestion = {
  improvedTitle: string,            // 15-70 chars
  description: string,              // 120-400 chars
  seoKeywords: string[],            // 3-8
  altText: string,                  // 10-125 chars
  attributes: { name: string, value: string,
                confidence: "high"|"medium"|"low",
                source: "text"|"image"|"inferred" }[],   // only fill when evidence exists
  missingAttributes: string[]       // required attrs needing human input (size, etc.)
}
```
Rules in the system prompt: JSON only; never invent specs (material, size, warranty) without evidence in text or image; list those in `missingAttributes` instead; keep claims factual; match store language. Pass: product fields, the category template (required attrs), and optionally the Cloudinary image URL for vision (colour, product type, alt text). Temperature low. On invalid JSON: one retry with the zod error message appended, then fall back to the mock/previous suggestion and show a clear error. **Never trust a model-supplied score**; recompute with `computeHealth`.

### 3.4 PIM to WooCommerce mapping

| PIM | Woo field |
|-----|-----------|
| sku | `sku` (identity key) |
| name | `name` |
| price | `regular_price` (string) |
| description | `description` (and first sentence to `short_description`) |
| category | `categories: [{id}]` (look up or create via `/products/categories`) |
| image_url (card variant) | `images: [{src, alt}]` (Woo fetches the public Cloudinary URL) |
| attributes | `attributes: [{name, options:[value], visible:true, variation:false}]` (use product-level attributes by name to avoid creating global attributes) |
| seo tags | `tags` (create via `/products/tags` first if names are not accepted; verify on your Woo version) |
| status | `status: "publish"` when ready, else `"draft"` |
| pim id | `meta_data: [{key:"pim_id", value}]` |

### 3.5 Idempotent sync algorithm

1. If `woo_id` stored: `PUT /products/{woo_id}`.
2. Else search `GET /products?sku={sku}`; if found, store `woo_id` and `PUT`; else `POST`, store the returned `id`.
3. Write `sync_log` row (action, status, message) and set `sync_status`.
4. On error: `failed` plus message; never leave partial state; surface in UI with a Retry button.
5. Bulk sync: loop with small concurrency, or use `/products/batch` (max 100 objects per call).
6. Bonus drift detection: `GET` the Woo product, compare name/price/description with the last synced snapshot; if different, `sync_status = drift`. Policy: **PIM wins**, user chooses "Overwrite Woo" or "Pull into PIM".

### 3.6 Catalog Quality Agent

- **Goal input** (text): e.g. "Get all products ready for WooCommerce".
- **Tools:** `list_products({status?})`, `get_health({id})`, `suggest_improvements({id})` (calls AnalyzeService, saves a pending suggestion), `apply_suggestion({id})` (only in apply mode and only after approval), `sync_product({id})` (apply mode only).
- **Loop:** LLM with function calling; max 25 steps; default **dry-run** (produces a plan and proposed changes, changes nothing). User reviews the plan in the UI and clicks "Approve and apply", which re-runs in apply mode (or applies stored proposals).
- **Log:** every step and tool call is saved to `agent_steps` and streamed to an "Agent run" page. This is your visible agentic AI evidence.
- **Safety:** agent cannot delete, cannot sync unless score >= 80, cannot apply without approval flag.
- If time is tight: implement as a deterministic loop with LLM planning only for the summary; function calling is nicer but not required.

---

## 4. Build sequence (detailed tasks)

Time boxes match ROADMAP.md. Tick each box. Commit after every box.

### Phase 1 (0:00-0:40) Planning + research
- [ ] Section 0 steps 1-8 done
- [ ] Write `docs/integration-decision.md` (10 lines): REST API (chosen, push + pull), webhooks (deferred, real-time drift), CSV (skipped), with reasons
- [ ] Write `docs/scope-and-assumptions.md` (copy from PROJECT.md, add assumptions: single user, SKU unique, PIM is source of truth, images via Cloudinary URLs)
- [ ] Draw architecture diagram (Mermaid in README is fine)
- [ ] **Record plan video** (script in section 8)

### Phase 2 (0:40-1:30) Core PIM + attributes + Cloudinary + score
- [ ] DB init + repositories + seed script (categories, templates)
- [ ] `domain/health.ts` + `domain/attributes.ts` with unit tests written first (ask your AI tool to generate test cases, then review)
- [ ] `adapters/media/cloudinary.ts` (`uploadImage(file) -> {publicId, url}`, `variants(publicId)`) + mock adapter
- [ ] Pages: Add Product (category select drives dynamic attribute fields from the template), Product List (image, name, category, score badge, status, Improve button)
- [ ] Upload route handler (multipart to Cloudinary, store public_id + url)
- [ ] Improve page skeleton: variants gallery, health checklist
- [ ] Dashboard: totals, ready, needs improvement, average score
- Acceptance: create "shoe" product, upload image, see 4+ variants and a score near 35-40, status Needs Work.

### Phase 3 (1:30-2:10) AI improve flow
- [ ] `AIPort` + one real adapter + mock adapter (deterministic canned response for the demo product)
- [ ] `AnalyzeService`: build prompt, call AI, zod-validate, retry once, save `ai_suggestions` row
- [ ] Improve page: left = current data, right = suggestions with Accept all / Reject; accepting updates product + recomputes score
- [ ] "Mark ready" button (disabled below 80)
- Acceptance: weak product goes from ~35 to 80+ after accept; invalid AI JSON triggers retry then fallback message.

### Phase 4 (2:10-3:00) Real Woo sync + agent
- [ ] `StorePort` + `adapters/store/woo.ts` using the official client, plus mock store (in-memory) with the same interface
- [ ] Category lookup/create, attribute mapping, tags handling, image src + alt
- [ ] `SyncService` implementing 3.5; sync_log UI page with status badges + Retry
- [ ] "Sync to WooCommerce" button on ready products; verify product appears in Woo admin and storefront
- [ ] `AgentService` + `/agent` page: goal box, run log, dry-run result, Approve and apply
- [ ] Feature freeze at 2:50 (fixes only after)
- Acceptance: re-clicking Sync updates the same Woo product (no duplicates); agent dry-run lists proposed fixes for 3+ products; apply works.

### Phase 5 (3:00-3:30) Tests, docs, deploy
- [ ] Unit tests (section 6) all green; `npm test`
- [ ] Playwright e2e (section 6) green with `SYNC_MODE=mock AI_PROVIDER=mock`
- [ ] README (section 7), AI usage log finished, `.env.example` committed
- [ ] `/api/health` returns app, db, cloudinary, woo reachability
- [ ] Stretch in order: drift detection, deploy to Vercel
- [ ] Clean-clone test: fresh clone, install, run, demo works

### Phase 6 (3:30-4:00) Videos + submission
- [ ] Process video: narrate over the screen recording (script section 8)
- [ ] 2-minute explainer: live demo (script section 8)
- [ ] Fill the submission form (repo URL, docs, videos). Submit with 10 minutes to spare.

---

## 5. Pages (UI checklist)

1. **Dashboard:** counts, average score gauge, recent AI fixes list, "Run agent" shortcut.
2. **Products:** table with thumbnail, name, category, score badge, status chip, sync chip, Improve button, search/filter by status.
3. **Add Product:** name, SKU, category, price, description, dynamic attributes, image upload, Save.
4. **Improve:** left current data + checklist; right AI suggestions (diff style, per-field highlights); Cloudinary gallery (Original / Optimized / Thumbnail / Marketplace square); buttons: Analyze, Accept all, Mark ready, Sync.
5. **Agent:** goal input, dry-run toggle, live step log, proposed changes, Approve and apply.
6. **Sync log:** product, action, status, message, time, Retry.

Design tip: simple Tailwind cards, clear status colours (red/amber/green), big before/after score. The demo must read well on a projector.

---

## 6. Test plan

**Unit (Vitest)**
- health: each check on/off; boundaries (79/80, 49/50); category-specific required attributes
- attributes: type validation (number/select/boolean), required missing, invalid select option
- Cloudinary URL builder: each variant string exactly matches the table
- AI parsing: valid JSON passes; missing fields, wrong types, extra text around JSON all handled; low-confidence attributes not auto-applied
- mapping: PIM to Woo payload (price as string, attributes shape, images with alt)
- sync idempotency (mock store): sync twice creates one product; stored woo_id used; sku lookup path when woo_id missing; failure leaves status failed with message
- agent: dry-run changes nothing; apply requires approval flag; respects score gate and step limit

**E2E (Playwright, mock providers):** add product with image, open Improve, Analyze, Accept, score >= 80, Mark ready, Sync, assert sync chip "synced" and mock store contains one product. Add a second run that syncs again and asserts still one product.

**Manual real-integration checklist:** upload real image, see Cloudinary variants load; sync to real Woo and open the storefront product; edit price in Woo and see drift (if built).

---

## 7. README outline (documentation is scored)

1. What it is (3 sentences + screenshot/GIF)
2. Challenge chosen and scope (in/out)
3. Assumptions
4. Architecture diagram + patterns used
5. Integration research decision (REST vs webhooks vs CSV)
6. Setup: prerequisites, `.env.example` explained, Cloudinary setup, WooCommerce setup (LocalWP/Docker), seed, run, test
7. How to demo (the weak-product script)
8. Operations: env vars, health endpoint, mock modes, troubleshooting (permalinks, REST keys, Cloudinary limits)
9. AI usage (link to `AI_USAGE_LOG.md`), agentic features
10. Known limitations and next steps

---

## 8. Video scripts

**Plan video (<= 2 min, end of Phase 1):** problem (bad listings hurt sales) > the challenge chosen and why > solution in one line > architecture sketch > what is in scope/out of scope > research decision (REST) > phase plan and cut order > which AI tools I will use and for what.

**Process video (<= 2 min, narrate over the screen recording):** how I used AI tools (planning, scaffolding, tests, docs) > one prompt that worked well > one thing the AI got wrong and how I fixed it > design decisions (ports/adapters, deterministic score, human approval) > the agent > what I'd do next.

**2-minute explainer / demo:** 15s problem > 15s solution + architecture > 60s live demo (weak product "shoe" > upload > score 35 > Analyze > accept > score 85, variants visible > Mark ready > Sync > open Woo storefront) > 15s agent run > 15s tests/docs + AI tools used. Final line: "This helps ecommerce teams avoid publishing low-quality listings by combining PIM, AI enrichment and Cloudinary media optimization in one workflow."

---

## 9. AI usage log template (`AI_USAGE_LOG.md`)

```
| Time | Tool | Task | Prompt (short) | Result | What I changed/fixed |
|------|------|------|----------------|--------|----------------------|
| 0:25 | Claude Code | scaffold | "Create ports/adapters structure for ..." | good | renamed folders |
```
Also keep a short "Where AI was wrong" list (best evidence of correct use) and a "Prompts that worked" list. Reference it in both videos and the README.

**Starter prompts per phase** (paste into your coding tool, then review the diff):
- P2: "Implement `computeHealth(product, template)` per this table [paste 3.1] as a pure TS function with Vitest tests for every check and boundary."
- P2: "Implement a CloudinaryMedia adapter implementing MediaPort with `uploadImage` and `variants(publicId)` returning exactly these URL transformations [paste 3.2]. Add a mock adapter."
- P3: "Implement AnalyzeService calling AIPort, validating with this zod schema [paste 3.3], one retry with the error appended, and a mock fallback."
- P4: "Implement SyncService per this algorithm [paste 3.5] against StorePort, with a Woo adapter using @woocommerce/woocommerce-rest-api and an in-memory mock. Write idempotency tests."
- P4: "Implement an agent loop with these tools [paste 3.6], dry-run by default, step logging to agent_steps, max 25 steps."
- P5: "Write the Playwright happy-path e2e per this description [paste section 6]. Use mock providers."
- P5: "Draft README from this outline [paste section 7] using the actual code."

---

## 10. Risks and fallbacks

| Risk | Fallback |
|------|----------|
| Woo setup takes > 30 min | Mock store only; document honestly; demo real sync later if time |
| Woo rejects image URL or tags format | Sync without tags/images first, add incrementally; check Woo response body |
| Cloudinary quota/outage | Mock media adapter returning stored sample URLs; stay under free credits |
| AI slow/invalid JSON | Mock AI adapter with canned demo response; retry once; always recompute score |
| Background removal slow/unavailable | Skip; it is optional |
| Scope creep | Feature freeze 2:50; cut order: deploy, drift, optional Cloudinary extras, per-field accept |
| Running out of time for submission | Start form at 3:30; submit by 3:50 |

---

## 11. Optional "wow" extras (only after the must-haves)

1. Image-vs-data mismatch check: ask the vision model "does this image match title/category/color?"; show a warning chip.
2. Attribute auto-fill from the image (same vision call as alt text).
3. Before/after storefront card preview.
4. Google search preview with SEO score.
5. Duplicate detector (fuzzy name + same image hash).
6. Channel export pack (Amazon square, Instagram 4:5 via Cloudinary URLs).
7. Hindi description generation.
8. Change history with one-click undo.

Pick at most two, and only if Phase 4 acceptance passes by 2:50.
