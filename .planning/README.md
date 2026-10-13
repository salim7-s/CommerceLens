# CommerceLens: Planning & Execution Directory (`.planning/`)

This directory is the single source of truth for planning, architecture, research, testing, demo scripts, and timeboxed execution for the **CommerceLens** project in the Kilowott Hack-AI-thon.

---

## 📁 Directory Structure & Sitemap

```text
.planning/
├── README.md                          <-- This directory guide
├── PROJECT.md                         <-- High-level project definition, core pitch & rules
├── REQUIREMENTS.md                    <-- 35 verifiable requirements mapped across phases
├── ROADMAP.md                         <-- 4-hour timeline & phase breakdown
├── STATE.md                           <-- Current project state & locked decisions
├── BUILD-PLAN.md                      <-- Master technical specification & tasks
├── AI_USAGE_LOG.md                    <-- Live AI interaction log & engineering corrections
├── GAPS-AND-IMPROVEMENTS.md           <-- Gap analysis & risk mitigation guide
│
├── research/                          <-- Architecture & integration research
│   ├── integration-decision.md        <-- REST v3 vs Webhooks vs CSV trade-off analysis
│   └── scope-and-assumptions.md       <-- System boundaries & operational assumptions
│
├── scripts/                           <-- Presentation & video execution scripts
│   ├── video-scripts.md               <-- Plan video, Process video, 2-minute demo scripts
│   └── demo-script.md                 <-- Step-by-step click-through walkthrough for live demo
│
└── phases/                            <-- Actionable phase-by-phase execution checklists
    ├── 01-planning/PLAN.md            <-- 0:00-0:40: Scaffold, smoke tests, plan video
    ├── 02-core-pim/PLAN.md            <-- 0:40-1:30: SQLite, Cloudinary, Health score, UI
    ├── 03-ai-improve/PLAN.md          <-- 1:30-2:10: Vision AI enrichment, Zod, Diff UI
    ├── 04-woo-sync-agent/PLAN.md      <-- 2:10-3:00: WooCommerce sync, Agent, Freeze at 2:50
    ├── 05-tests-docs/PLAN.md          <-- 3:00-3:30: Vitest, Playwright, Health API, README
    └── 06-submission/PLAN.md          <-- 3:30-4:00: Videos & Form submission by 3:50
```

---

## ⏱️ Quick Execution Timeline

| Phase | Timebox | Focus | Primary Deliverable |
|:---:|:---:|:---|:---|
| **[Phase 1](phases/01-planning/PLAN.md)** | 0:00–0:40 | Planning & Research | Scaffold + Smoke Tests + Plan Video |
| **[Phase 2](phases/02-core-pim/PLAN.md)** | 0:40–1:30 | Core PIM & Media | SQLite + Cloudinary 5-Variant Gallery + Health Score |
| **[Phase 3](phases/03-ai-improve/PLAN.md)** | 1:30–2:10 | AI Quality Enrichment | Vision AI + Zod Schema + Diff Review UI |
| **[Phase 4](phases/04-woo-sync-agent/PLAN.md)** | 2:10–3:00 | WooCommerce Sync & Agent | REST v3 Sync + Catalog Quality Agent *(Freeze at 2:50)* |
| **[Phase 5](phases/05-tests-docs/PLAN.md)** | 3:00–3:30 | Tests & Documentation | Vitest Unit Tests + Playwright e2e + `/api/health` |
| **[Phase 6](phases/06-submission/PLAN.md)** | 3:30–4:00 | Videos & Form Submission | Process Video + 2-Min Explainer + Form by 3:50 |

---

## 🏆 Scoring Priorities Checklist

1. **AI Tool Usage (Priority 1):** Actively log in `AI_USAGE_LOG.md` and record screen prompts for the process video.
2. **Codebase Quality (Priority 2):** Hexagonal Ports & Adapters (`domain/`, `ports/`, `adapters/`, `services/`) + Vitest + Playwright.
3. **Documentation (Priority 3):** `README.md` with Mermaid diagram, `.planning/research/` docs, `.env.example`.
4. **Video Presentation (Priority 4):** Strictly adhere to `.planning/scripts/video-scripts.md`.
5. **Agentic AI (Priority 5):** Deploy `/agent` with 5 tools, 25-step cap, dry-run default, and streaming step logs.
6. **Execution Quality (Priority 6):** Clean Next.js App Router UI, zero-crash mock fallback modes, `/api/health`.
