# CommerceLens: What's Missing, What's Unverified, and How to Make It Better

Honest companion to PROJECT / REQUIREMENTS / ROADMAP / STATE / BUILD-PLAN. Sections 1-3 are things not done or not confirmed. Sections 4-8 are improvements, ordered by value.

---

## 1. What has NOT been done

**Nothing is built yet.** All of the above are planning documents. Specifically missing:

- No code, repo, scaffold, database, seed data, `.env.example`, Dockerfile, or CI config.
- No UI wireframes or visual design. Pages are only described in text.
- No demo dataset: you still need 8-10 sample products (3 weak, 3 medium, 2-3 strong) and matching product photos (some good, some poor) for a convincing before/after.
- The AI prompts are specified as rules and a JSON contract, but the actual prompt text is not written or tested.
- No architecture diagram image (only a described layout). Mermaid in the README would do.
- The GSD scaffolding folders (`phases/`, `research/`) from your earlier project were not recreated for this one, and the leftover MedTranslate files are unused.
- No security pass: API secrets must stay server-side, uploads need type and size limits, routes have no auth (acceptable for a demo, but say so in the docs).
- No real time estimates validated. The time boxes are my estimates, not measured.

## 2. What is UNVERIFIED (check before relying on it)

| Item | Why it matters | How to verify (5 min each) |
|------|----------------|----------------------------|
| WooCommerce `tags` payload on your Woo version | Some versions need tag IDs, not names | Try a POST to `/products` with `tags:[{name:"x"}]`; else create via `/products/tags` first |
| WooCommerce image from Cloudinary URL | Woo downloads `images[].src` itself; needs internet access from the Woo host | Create one product with a Cloudinary URL and check the media library |
| Docker WooCommerce commands | Written from general knowledge, not run | Run them once; if they fight you beyond 30 min, switch to LocalWP |
| `e_background_removal` speed and credit cost | First request may be slow; cost per transformation not confirmed | Request one image, time it, check the Cloudinary usage dashboard |
| What happens if you exceed Cloudinary's free limit | Sources conflicted (soft limit vs suspension) | Stay under; check the dashboard before the demo |
| Your AI provider supports JSON output and image input | The vision shortcut (alt text/color from image) depends on it | One test call with an image URL |
| SQLite on Vercel | Serverless filesystems are typically not persistent, so data may vanish (my understanding, not verified this session) | If deploying, use a hosted DB (Turso, Supabase, Neon) or a host with a disk (Railway, Render, Docker) |
| Product attribute handling in Woo | Product-level attributes by name are the simplest route; global attributes need extra calls | Test one product with 3 attributes and view it in the storefront |

## 3. Hackathon rules I could not confirm

I only saw four slides, and the last slide (form link) was not in your photos. Ask or check:

1. Can you set up accounts and the Woo store before the 4 hours start?
2. Are the plan and process videos the scored 2-minute explanation, or is that a third video? Any length or format rules?
3. Must the code be in a public repo, or is zip/private fine? What does the form ask for?
4. Is deployment required, or only "deployment quality" as a scoring bonus?
5. Are specific AI tools expected or restricted?
6. Solo or team? Are pre-written boilerplates/templates allowed?
7. Is WooCommerce provided by the organizers (a test store or credentials)?

## 4. Reality check on scope (read this)

Four hours including two videos and the form leaves roughly 2.5-3 hours of real building. The plan is ambitious. If you are behind at the checkpoints below, drop to the **Minimum Winning Slice**:

| Checkpoint | Must be true | If not |
|------------|--------------|--------|
| 1:30 | Add product, Cloudinary upload, variants, health score working | Cut dashboard and attribute templates to a fixed list |
| 2:10 | AI suggestions + accept working (mock fallback ready) | Use mock AI only for the demo, keep real AI as a toggle |
| 3:00 | Sync works (real or mock), agent dry-run works | Drop real sync to mock; make the agent a simple "fix all" loop with a log |
| 3:30 | Tests + README done | Cut every remaining feature; this is where scoring points are |

**Minimum Winning Slice:** add product, upload to Cloudinary, show variants, health score, AI improve with approval, sync (mock acceptable if documented), a basic agent log, 5 unit tests plus 1 e2e, README, AI usage log, videos, submitted form. This still hits every scoring criterion.

## 5. Improvements by area

Effort: S = under 20 min, M = 20-45 min, L = over 45 min. Impact is for the judging criteria.

### 5.1 Scoring-critical (do these first; they cost little)

| Improvement | Effort | Why |
|-------------|--------|-----|
| Keep the AI usage log live from minute one, including "where AI was wrong" | S | Top criterion; also your best video material |
| Commit small and often with clear messages (and tag AI-assisted ones) | S | Visible process evidence |
| Write the README as you go, not at the end | S | Documentation criterion; avoids a rushed finish |
| Add `/api/health` and `.env.example` early | S | Operational detail judges look for |
| Mock adapters for AI, media and store behind env flags | M | Demo cannot fail; also enables fast e2e tests |
| Name the design patterns in the README with file paths | S | Makes the Codebase Quality story explicit |

### 5.2 Product and demo impact

| Improvement | Effort | Why |
|-------------|--------|-----|
| Big before/after score animation on the Improve page | S | The single most memorable demo moment |
| Before/after "storefront card" preview | M | Judges see the benefit without reading JSON |
| Image-vs-data mismatch warning via the vision model | M | Genuinely novel; uses the same call as alt text |
| Per-category attribute templates with required flags | M | Covers "attribute handling" properly (already planned) |
| Google search-result preview + simple SEO score | M | Makes "SEO-ready" visible |
| Channel image pack (Amazon square, Instagram 4:5) | S | Cheap, all Cloudinary URLs, visually strong |
| Hindi/regional description option | M | Real-world value for Indian stores; reuses the suggestion flow |
| Duplicate product detector (fuzzy name + image) | M | Real PIM problem; easy to demo |
| Bulk import (CSV) then "Run agent on all" | M | Shows scale: 20 products fixed in one click |

### 5.3 AI and agentic quality

| Improvement | Effort | Why |
|-------------|--------|-----|
| Confidence + source on every AI-filled attribute (text/image/inferred) | S | Already in the contract; surface it in the UI as badges |
| "Needs human input" list instead of guessing specs | S | Trust story: the AI refuses to invent size/material |
| Agent shows its plan first, then executes after approval | M | Clear human-in-the-loop agentic design |
| Agent run summary: "fixed 7, needs you 3, skipped 2, reasons" | S | Shows useful reporting, not just actions |
| Evaluation set: 5 products with expected outputs; score the AI against it | M | Strong AI-quality evidence; great for the video |
| Prompt versioning (store prompt version with each suggestion) | S | Reproducibility; easy to explain |
| Rate-limit and timeout handling around AI calls | S | Prevents hung demos |

### 5.4 WooCommerce sync

| Improvement | Effort | Why |
|-------------|--------|-----|
| Drift detection (Woo-side edits flagged) | M | Strengthens the "data synchronization" topic |
| Pull from Woo into PIM (import existing store products) | M | Makes the PIM useful on day one for a real store |
| Dry-run sync preview ("these 5 products will be created, 2 updated") | M | Safe and impressive |
| Use `/products/batch` for bulk sync | S | Faster and shows API knowledge |
| Sync history with per-field diffs | M | Good audit story |
| Variable products with variations (size/color) | L | Realistic but expensive; skip unless way ahead |

### 5.5 Cloudinary use

| Improvement | Effort | Why |
|-------------|--------|-----|
| Show file size / format saved for Original vs Optimized | S | Quantifies the benefit ("62% smaller") |
| Responsive image set (`srcset`) generated for Woo | M | Real performance win |
| Optional cutout on white (background removal) toggled per product | S | Wow factor if it works; keep optional |
| Naming and foldering convention for assets, tagged with SKU | S | Clean media library; mention in docs |
| Auto-tagging via AI Vision add-on | M | Optional; main LLM vision is simpler |

### 5.6 Code quality and tests

| Improvement | Effort | Why |
|-------------|--------|-----|
| Contract tests: the mock store and the real Woo adapter pass the same test suite | M | Proves the adapter pattern is real |
| Property/boundary tests for the health score | S | Cheap, looks rigorous |
| Snapshot test for the Woo payload mapping | S | Catches accidental changes |
| ESLint + Prettier + `npm run check` (lint, type-check, test) | S | Quality signal |
| GitHub Actions running lint + unit tests | M | Nice touch if repo is on GitHub |
| Error boundary and consistent API error shape | S | Execution quality |

### 5.7 Documentation and videos

| Improvement | Effort | Why |
|-------------|--------|-----|
| One-page architecture diagram (Mermaid) in the README | S | Clear at a glance |
| "Decisions and trade-offs" section (why REST, why PIM wins conflicts) | S | Shows engineering judgment |
| Screenshots/GIF of the demo flow in the README | S | Accessible for judges who skim |
| Rehearse the 2-minute video twice with a timer | S | Communication quality is scored |
| Show your AI tools and a real prompt on screen in the process video | S | Direct evidence for the top criterion |

### 5.8 Security and robustness (mention even if basic)

| Improvement | Effort | Why |
|-------------|--------|-----|
| Server-side only secrets; never in client bundles | S | Basic but judges check |
| Upload validation (image types, max size) | S | Prevents breakage |
| Input validation with zod on every route | S | Consistent with the schema story |
| Basic API key or password gate if deployed | S | Avoids an open admin on the internet |

## 6. Plan inconsistencies to tidy (10 minutes, optional)

BUILD-PLAN contains details not yet reflected in the earlier files:

- AI attributes carry confidence + source, and "missing attributes" means required fields needing human input.
- The health-score rules for title and description length (15-70 chars, 120+ chars) are only in BUILD-PLAN.
- The agent's exact tool list, 25-step limit, and dry-run default are only in BUILD-PLAN.
- PROJECT.md says "last ~30 minutes for final video and submission", ROADMAP uses 3:30-4:00, which agree; but BUILD-PLAN also suggests submitting by 3:50.
- REQUIREMENTS.md does not list the vision-based alt text, evaluation set, or any extras (intentional, since they are optional).

Simplest fix: treat BUILD-PLAN as the source of truth for details, and the other four files as the summary.

## 7. Open decisions (answer these before coding)

| Decision | Default I assumed | Alternative |
|----------|-------------------|-------------|
| Framework | Next.js + TypeScript | Express + React, or Python FastAPI if you prefer |
| Database | SQLite | JSON file (faster to start), hosted Postgres (if deploying) |
| AI provider | Any with JSON + vision | Mock only for the demo |
| WooCommerce | Real store via LocalWP | Docker, hosted test site, or mock only |
| Deployment | Local demo, deploy if time | Deploy early with hosted DB if the rules reward it |
| Extras to include | None until Phase 4 passes | Pick at most two from section 5.2 |

## 8. Pre-demo checklist (the last 15 minutes)

- [ ] Fresh clone installs and runs with the README steps only
- [ ] Demo dataset loaded; the "shoe" product resets in one click
- [ ] Real and mock modes both tested; env flag switch documented
- [ ] Cloudinary dashboard shows usage well under the free limit
- [ ] Woo store reachable; one product visible on the storefront
- [ ] `npm test` and the e2e test green
- [ ] AI usage log complete; README has screenshots and the diagram
- [ ] Videos exported, playable, and within any length limit
- [ ] Form submitted; confirmation saved

---
*Written alongside BUILD-PLAN. Update as you verify items in section 2.*
