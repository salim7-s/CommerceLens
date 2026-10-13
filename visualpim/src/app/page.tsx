import Link from "next/link";
import { productService } from "../services/ProductService";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Sparkles,
  Camera,
  Layers,
  Check,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const products = await productService.listProducts();

  const total = products.length;
  const ready = products.filter((p) => p.status === "ready").length;
  const needsWork = products.filter((p) => p.status === "needs_work").length;
  const improve = products.filter((p) => p.status === "improve").length;
  const synced = products.filter((p) => p.sync_status === "synced").length;

  const avgScore = total > 0 ? Math.round(products.reduce((acc, p) => acc + p.health_score, 0) / total) : 0;

  return (
    <div className="space-y-12 pb-10">
      {/* 1. EDITORIAL HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-[#e8e2d6] p-8 sm:p-12 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
        {/* Subtle Warm Aesthetic Accents */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[#f7f2e7] rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#f4efe6] border border-[#ded7cb] text-stone-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Deterministic PIM Quality Gate • WooCommerce Enterprise
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
            Audit catalog quality <span className="underline decoration-[#d8d1c5] underline-offset-8">before</span> publishing to WooCommerce.
          </h1>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Every product is verified against a 7-point deterministic Health Score, optimized visually via Cloudinary URL transformations, enriched with Vision AI, and gated so only approved listings (score ≥ 80) reach your storefront.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98]"
            >
              <Layers className="w-4 h-4" />
              Explore Catalog ({total} Items)
            </Link>
            <Link
              href="/agent"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f8f6f0] hover:bg-[#f2ece0] text-stone-800 font-semibold text-xs sm:text-sm border border-[#ded7cb] transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-stone-600" />
              Run Quality Agent
            </Link>
            <Link
              href="/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 text-xs sm:text-sm font-medium transition-colors"
            >
              <Camera className="w-4 h-4" />
              Snap New Photo
            </Link>
          </div>
        </div>
      </div>

      {/* 2. LIVE METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Score */}
        <div className="bg-white border border-[#e8e2d6] rounded-2xl p-5 shadow-[0_1px_3px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span>Catalog Health Score</span>
              <ShieldCheck className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tabular-nums">{avgScore}</span>
              <span className="text-xs text-stone-400 font-mono">/ 100</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-[#f4efe6] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  avgScore >= 80 ? "bg-emerald-600" : avgScore >= 50 ? "bg-amber-600" : "bg-rose-600"
                }`}
                style={{ width: `${Math.min(avgScore, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-stone-400 mt-2 block font-medium">7-point deterministic verification</span>
          </div>
        </div>

        {/* Ready for Store */}
        <div className="bg-white border border-[#e8e2d6] rounded-2xl p-5 shadow-[0_1px_3px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span>Approved for Store</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-800 tabular-nums">{ready}</span>
              <span className="text-xs text-stone-400 font-mono">of {total} SKUs</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-4 font-medium">Health score ≥ 80 gate passed</p>
        </div>

        {/* Action Required */}
        <div className="bg-white border border-[#e8e2d6] rounded-2xl p-5 shadow-[0_1px_3px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span>Action Required</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-800 tabular-nums">{needsWork + improve}</span>
              <span className="text-xs text-stone-400 font-mono">SKUs flagged</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-4 font-medium">Incomplete attributes or media</p>
        </div>

        {/* WooCommerce Live */}
        <div className="bg-white border border-[#e8e2d6] rounded-2xl p-5 shadow-[0_1px_3px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span>WooCommerce Live</span>
              <RefreshCw className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tabular-nums">{synced}</span>
              <span className="text-xs text-stone-400 font-mono">published</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-4 font-medium">REST v3 live storefront</p>
        </div>
      </div>

      {/* 3. AMAZON / FLIPKART STYLE PRODUCT CARDS SHOWCASE */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8e2d6] pb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">Active Catalog Showcase</h2>
            <p className="text-xs text-stone-500 mt-0.5">Commercial catalog items with real photography, health scoring, and sync status</p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 group"
          >
            All {total} products in Catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#e8e2d6] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(28,25,23,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Product Photo Showcase */}
              <div className="aspect-square bg-[#faf8f4] relative overflow-hidden flex items-center justify-center p-6 border-b border-[#f0eae1]">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-16 h-16 bg-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-xs">
                    No Image
                  </div>
                )}

                {/* Floating Category Pill */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/90 backdrop-blur-sm text-stone-700 px-2 py-0.5 rounded-md border border-[#e8e2d6] shadow-sm">
                    {p.category_name || "Catalog"}
                  </span>
                </div>

                {/* Health Score Pill */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums shadow-sm border ${
                      p.health_score >= 80
                        ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                        : p.health_score >= 50
                        ? "bg-amber-50/95 border-amber-200 text-amber-800"
                        : "bg-rose-50/95 border-rose-200 text-rose-800"
                    }`}
                  >
                    Score: {p.health_score}/100
                  </span>
                </div>
              </div>

              {/* Product Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-400 text-[11px]">SKU: {p.sku}</span>
                    <span className="text-lg font-bold text-stone-900 tabular-nums">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href={`/products/${p.id}/improve`}
                    className="font-bold text-sm text-stone-900 hover:text-stone-700 transition-colors line-clamp-2 leading-snug block"
                  >
                    {p.name}
                  </Link>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {p.description || "Listing requires description and attribute enrichment."}
                  </p>
                </div>

                {/* Status & CTA Action Button */}
                <div className="pt-3 border-t border-[#f0eae1] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    {p.status === "ready" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Ready for Store
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        Needs Work
                      </span>
                    )}

                    <span className="text-[11px] text-stone-400 font-medium">
                      {p.sync_status === "synced" ? "WooCommerce Live" : "Unsynced"}
                    </span>
                  </div>

                  <Link
                    href={`/products/${p.id}/improve`}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#f8f6f0] hover:bg-stone-900 hover:text-stone-50 text-stone-800 border border-[#ded7cb] transition-colors flex items-center justify-center gap-1.5 shadow-sm group-hover:border-stone-900"
                  >
                    Inspect & Enrich <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. THREE PILLARS ARCHITECTURE SHOWCASE */}
      <div className="space-y-5 pt-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">The Quality Engine Behind Your Catalog</h2>
          <p className="text-xs text-stone-500 mt-0.5">Automated quality assurance protecting your WooCommerce storefront</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white border border-[#e8e2d6] rounded-2xl p-6 shadow-[0_1px_3px_rgba(28,25,23,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#f4efe6] border border-[#ded7cb] flex items-center justify-center text-stone-800">
              <ShieldCheck className="w-5 h-5 text-stone-700" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">Deterministic 7-Point Gate</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every listing is evaluated against deterministic e-commerce standards: title character bounds (15–70), rich description (≥ 120), photography, accessibility alt-text, positive pricing, category assignment, and mandatory specs.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Score ≥ 80 gate blocks bad listings
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white border border-[#e8e2d6] rounded-2xl p-6 shadow-[0_1px_3px_rgba(28,25,23,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#f4efe6] border border-[#ded7cb] flex items-center justify-center text-stone-800">
              <Zap className="w-5 h-5 text-stone-700" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">Cloudinary Dynamic Media</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Transforms photography on the fly at zero extra API cost: automated 1:1 square white framing, 16:9 hero banners, 200x200 thumbnails, retina zoom, and instant WebP compression. Supports webcam camera snapshots directly.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-stone-700 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> 6 Responsive variants generated per SKU
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white border border-[#e8e2d6] rounded-2xl p-6 shadow-[0_1px_3px_rgba(28,25,23,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#f4efe6] border border-[#ded7cb] flex items-center justify-center text-stone-800">
              <Sparkles className="w-5 h-5 text-stone-700" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">Multimodal Vision AI</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Powered by Google Gemini 1.5 Flash. Audits product photography to infer color, material, gender, and category specs without hallucinating. Synthesizes high-converting marketing descriptions and 3–8 SEO search tags.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-stone-700 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Refrains from guessing missing specs
            </div>
          </div>
        </div>
      </div>

      {/* 5. QUICK STUDIO CALL TO ACTION BANNER */}
      <div className="rounded-3xl bg-[#f4efe6] border border-[#ded7cb] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-stone-900">Ready to audit or expand your catalog?</h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
            Upload new photography with live webcam snapshots, run the autonomous quality agent, or inspect individual products in the Inspection Studio.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <Link
            href="/products/new"
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs shadow-sm transition-all"
          >
            Create New Listing
          </Link>
          <Link
            href="/sync-log"
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#faf7f2] text-stone-800 font-semibold text-xs border border-[#ded7cb] transition-all"
          >
            View Sync History
          </Link>
        </div>
      </div>
    </div>
  );
}
