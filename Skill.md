# CommerceLens Enterprise UI & Design System Specification

## 1. Core Aesthetic Principles (No AI-Generated Look)
- **Zero Emojis**: Never use emoji characters (e.g., 🌱, ✨, 🤖, 🚀, 🛡️, ✅, ❌, 🔥) in headers, navigation, buttons, status pills, or table cells. Always use crisp SVG icons from `lucide-react` with consistent 14px–18px stroke geometry.
- **Enterprise SaaS Feel**: Designed to match enterprise platforms like Linear, Shopify Polaris, and Stripe Dashboard.
- **Surface Palette**:
  - Background: Deep Obsidian Slate (`bg-slate-950` / `#020617`)
  - Elevated Cards: Slate 900 / 70 (`bg-slate-900/70 border border-slate-800`)
  - Sub-surfaces & Insets: Slate 950 / 60 (`bg-slate-950/60 border border-slate-800/80`)
  - Text Primary: Pure White / Slate 100 (`text-slate-100`)
  - Text Secondary: Muted Slate 400 (`text-slate-400`)
  - Text Dimmed: Slate 500 (`text-slate-500`)
  - Accent Primary: Electric Indigo/Blue (`bg-blue-600 hover:bg-blue-500`)
  - Status Success: Emerald (`bg-emerald-500/10 text-emerald-400 border-emerald-500/20`)
  - Status Warning: Amber (`bg-amber-500/10 text-amber-400 border-amber-500/20`)
  - Status Danger: Rose (`bg-rose-500/10 text-rose-400 border-rose-500/20`)

## 2. Typography & Micro-Layout
- Section Headers: `text-xs font-semibold text-slate-400 uppercase tracking-wider`
- Numbers & Scores: `font-semibold tabular-nums tracking-tight`
- Badges & Pills: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium` with a 6px status dot (`w-1.5 h-1.5 rounded-full`)
- Clean Copy: No LaTeX remnants (`$\ge$`), no generic buzzwords. Use concise domain language: "Health Score", "Store Quality Gate", "WooCommerce Syndication", "Vision Attribute Extraction".

## 3. Product Media & Photography
- All catalog items must render authentic e-commerce photography with `aspect-square object-cover rounded-lg ring-1 ring-white/10`.
- Footwear: High-res sneakers on neutral backgrounds.
- Apparel: Clean product flats or pack shots.
- Tech: Studio product photography.
- Never use uncontextual demo placeholders (e.g. flowers for footwear).
