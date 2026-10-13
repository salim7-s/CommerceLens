"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Loader2,
  Send,
  Zap,
  Camera,
} from "lucide-react";
import { Product, HealthScoreResult, AISuggestionPayload } from "../../../../domain/schemas";
import { ImageVariant } from "../../../../ports/MediaPort";
import { ImageUploader } from "../../../../components/ImageUploader";

export default function ImprovePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [health, setHealth] = useState<HealthScoreResult | null>(null);
  const [variants, setVariants] = useState<ImageVariant[]>([]);

  const [aiSuggestion, setAiSuggestion] = useState<AISuggestionPayload | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isMarkingReady, setIsMarkingReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);

  const safeParse = async (res: Response) => {
    try {
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      return { success: false, error: `Server returned HTTP ${res.status}` };
    }
  };

  const loadProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await safeParse(res);
      if (data.success) {
        setProduct(data.product);
        setHealth(data.health);
        setVariants(data.variants || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const handlePhotoUpdated = async ({ url, publicId }: { url: string; publicId: string }) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: url, image_public_id: publicId }),
      });
      const data = await safeParse(res);
      if (data.success) {
        await loadProduct();
        setShowPhotoUploader(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProduct();
  }, [loadProduct]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      const data = await safeParse(res);
      if (data.success && data.suggestion) {
        setAiSuggestion(data.suggestion.payload);
      } else {
        alert("AI Analysis notice: " + (data.error || "Unable to generate suggestions"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAll = async () => {
    setIsAccepting(true);
    try {
      const res = await fetch(`/api/suggestions/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await safeParse(res);
      if (data.success) {
        await loadProduct();
        setAiSuggestion(null);
      } else {
        alert("Notice: " + (data.error || "Unable to accept suggestions"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleMarkReady = async () => {
    setIsMarkingReady(true);
    try {
      const res = await fetch(`/api/products/${id}/ready`, {
        method: "POST",
      });
      const data = await safeParse(res);
      if (data.success) {
        await loadProduct();
      } else {
        alert("Gate Check Failed: " + (data.message || data.error || "Health score below 80"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingReady(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch(`/api/sync/${id}`, {
        method: "POST",
      });
      const data = await safeParse(res);
      if (data.success && data.syncResult) {
        setSyncFeedback(`Successfully synchronized to WooCommerce! WC ID: ${data.syncResult.woo_id}`);
        await loadProduct();
      } else {
        setSyncFeedback(`Sync prevented by quality gate: ${data.error || data.message || "Quality requirements not met"}`);
      }
    } catch (err) {
      console.error(err);
      setSyncFeedback("Network error during WooCommerce sync");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!product || !health) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-stone-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading product intelligence...</span>
      </div>
    );
  }

  const score = health.score;
  const canMarkReady = score >= 80;
  const isReady = product.status === "ready";

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e7e1d7] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#f4efe6] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">{product.name}</h1>
              <span className="text-xs font-mono text-stone-400">[{product.sku}]</span>
            </div>
            <p className="text-xs text-stone-500">
              {product.category_name || "Footwear"} • ${product.price.toFixed(2)} • Status:{" "}
              <span className="capitalize font-semibold text-stone-900">{product.status}</span>
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-xs shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Listing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-stone-300" /> Run Quality Audit
              </>
            )}
          </button>

          <button
            onClick={handleMarkReady}
            disabled={!canMarkReady || isMarkingReady || isReady}
            title={canMarkReady ? "Approve product for WooCommerce" : "Health score must be at least 80"}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              isReady
                ? "bg-emerald-50 border border-emerald-200/80 text-emerald-800 cursor-default"
                : canMarkReady
                ? "bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm active:scale-95"
                : "bg-[#f4efe6] text-stone-400 border border-[#ded7cb] cursor-not-allowed opacity-60"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isReady ? "Marked Ready" : "Mark Ready (Gate ≥ 80)"}
          </button>

          <button
            onClick={handleSync}
            disabled={!canMarkReady || isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-[#faf7f2] text-stone-900 border border-[#ded7cb] font-semibold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-40"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-stone-500" /> Sync to WooCommerce
              </>
            )}
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3.5 rounded-xl bg-white border border-[#ded7cb] text-stone-800 text-xs flex items-center justify-between shadow-sm">
          <span>{syncFeedback}</span>
          <Link href="/sync-log" className="underline hover:text-stone-900 flex items-center gap-1">
            View Sync Log <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Main Grid: Left = Current State & Checklist, Right = AI Suggestions Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Current State + Checklist + Cloudinary Gallery) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Health Score Gauge & Checklist */}
          <div className="bg-white border border-[#e7e1d7] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Product Health Score</h2>
                <p className="text-xs text-stone-500">Deterministic quality checklist gating WooCommerce publication</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold border ${
                  score >= 80
                    ? "bg-emerald-50 border-emerald-200/80 text-emerald-800"
                    : score >= 50
                    ? "bg-amber-50 border-amber-200/80 text-amber-800"
                    : "bg-rose-50 border-rose-200/80 text-rose-800"
                }`}
              >
                {score} / 100
              </div>
            </div>

            <div className="w-full bg-[#f4efe6] h-2.5 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  score >= 80 ? "bg-emerald-600" : score >= 50 ? "bg-amber-600" : "bg-rose-600"
                }`}
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5 divide-y divide-[#f0eae1]">
              {health.checks.map((c) => (
                <div key={c.key} className="pt-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    {c.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-stone-900 capitalize">{c.key.replace("_", " ")}</span>
                      <p className="text-stone-500 text-[11px] mt-0.5">{c.hint}</p>
                    </div>
                  </div>
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                      c.pass ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60" : "bg-[#f4efe6] text-stone-500 border border-[#ded7cb]"
                    }`}
                  >
                    +{c.points}/{c.maxPoints} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cloudinary Media Engine Gallery */}
          <div className="bg-white border border-[#e7e1d7] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-stone-600" />
                  Cloudinary Media Engine (URL Transformations)
                </h3>
                <p className="text-[11px] text-stone-500">Zero-API-cost dynamic responsive variants generated on the fly</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoUploader(!showPhotoUploader)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#fbf9f5] hover:bg-[#f4efe6] text-stone-800 border border-[#ded7cb] transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-stone-600" />
                  {showPhotoUploader ? "Close Uploader" : "Update Photo / Click Camera"}
                </button>
                <span className="text-[11px] font-mono text-stone-700 bg-[#f4efe6] border border-[#ded7cb] px-2 py-0.5 rounded-md">
                  {variants.length} Variants Active
                </span>
              </div>
            </div>

            {showPhotoUploader && (
              <div className="p-4 rounded-xl border border-[#ded7cb] bg-[#fbf9f5] space-y-2">
                <span className="text-xs font-semibold text-stone-800 block">Choose New Photo or Click with Camera</span>
                <ImageUploader
                  sku={product.sku}
                  currentUrl={product.image_url}
                  onUploaded={handlePhotoUpdated}
                />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {variants.map((v) => (
                <div key={v.name} className="bg-[#fbf9f5] border border-[#ded7cb] rounded-xl p-3 flex flex-col justify-between">
                  <div className="aspect-square rounded-lg bg-white border border-[#ded7cb] overflow-hidden mb-2 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.url}
                      alt={v.label}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        if (product.image_url && (e.currentTarget as HTMLImageElement).src !== product.image_url) {
                          (e.currentTarget as HTMLImageElement).src = product.image_url;
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-900 block truncate">{v.label}</span>
                    <span className="text-[10px] text-stone-500 block truncate">{v.useCase}</span>
                    <code className="text-[9px] text-stone-600 bg-[#f4efe6] px-1 py-0.5 rounded block font-mono truncate">
                      {v.transformation || "original"}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Listing Raw Specs */}
          <div className="bg-white border border-[#e7e1d7] rounded-xl p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Current Product Specifications</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#ded7cb]">
                <span className="text-stone-400 block mb-1">Alt Text</span>
                <span className="text-stone-800">{product.alt_text || "None (Failed Check)"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#ded7cb]">
                <span className="text-stone-400 block mb-1">SEO Tags</span>
                <span className="text-stone-800">
                  {product.seo_tags && product.seo_tags.length > 0 ? product.seo_tags.join(", ") : "None (Failed Check)"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#ded7cb] text-xs">
              <span className="text-stone-400 block mb-1">Attributes</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.attributes && Object.keys(product.attributes).length > 0 ? (
                  Object.entries(product.attributes).map(([k, v]) => (
                    <span key={k} className="px-2 py-0.5 rounded bg-white text-stone-700 border border-[#ded7cb]">
                      <strong>{k}:</strong> {v}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-400">No attributes populated</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (AI Intelligence & Diff Review) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#e7e1d7] rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#e7e1d7] pb-3">
              <div>
                <h2 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-stone-600" />
                  Product Intelligence & Enrichment
                </h2>
                <p className="text-[11px] text-stone-500">Multimodal vision analysis & attribute extraction</p>
              </div>

              {aiSuggestion && (
                <button
                  onClick={handleAcceptAll}
                  disabled={isAccepting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs shadow-sm transition-all active:scale-95"
                >
                  {isAccepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Apply All Changes
                </button>
              )}
            </div>

            {!aiSuggestion ? (
              <div className="py-14 text-center text-stone-500 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#f4efe6] border border-[#ded7cb] text-stone-700 flex items-center justify-center mx-auto">
                  <Zap className="w-5 h-5" />
                </div>
                <p className="text-xs max-w-xs mx-auto text-stone-600">
                  Run a quality audit to synthesize an SEO-optimized title, complete description, accessibility alt-text, and category attributes.
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium shadow-sm active:scale-95"
                >
                  {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Run Audit Now
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Title Diff */}
                <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#ded7cb] space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Optimized Title ({aiSuggestion.improvedTitle.length} chars)
                  </span>
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 line-through">
                    {product.name}
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                    {aiSuggestion.improvedTitle}
                  </div>
                </div>

                {/* Description Diff */}
                <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#ded7cb] space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Rich Marketing Description ({aiSuggestion.description.length} chars)
                  </span>
                  <p className="text-stone-700 leading-relaxed bg-white p-2.5 rounded-lg border border-[#ded7cb]">
                    {aiSuggestion.description}
                  </p>
                </div>

                {/* SEO Keywords */}
                <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#ded7cb] space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    SEO Search Keywords ({aiSuggestion.seoKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiSuggestion.seoKeywords.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white text-stone-700 border border-[#ded7cb] text-[11px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Alt Text */}
                <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#ded7cb] space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Vision-Generated Alt Text
                  </span>
                  <p className="text-stone-700 italic bg-white p-2 rounded-lg border border-[#ded7cb]">
                    &quot;{aiSuggestion.altText}&quot;
                  </p>
                </div>

                {/* Attributes Extracted with Confidence & Source */}
                <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#ded7cb] space-y-2">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Inferred Attributes ({aiSuggestion.attributes.length})
                  </span>
                  <div className="space-y-1.5">
                    {aiSuggestion.attributes.map((attr) => (
                      <div key={attr.name} className="flex items-center justify-between p-2 rounded bg-white border border-[#ded7cb]">
                        <span className="text-stone-700 capitalize font-medium">{attr.name}: <strong className="text-stone-900">{attr.value}</strong></span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-[#f4efe6] text-stone-600 font-mono">
                            {attr.source}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                            {attr.confidence}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Attributes */}
                {aiSuggestion.missingAttributes.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 space-y-1.5">
                    <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                      Needs Merchant Input
                    </span>
                    <p className="text-stone-600 text-[11px]">
                      The AI refrained from hallucinating these mandatory specs:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {aiSuggestion.missingAttributes.map((m) => (
                        <span key={m} className="px-2 py-0.5 rounded bg-white text-amber-900 border border-amber-200 text-[11px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Accept Button */}
                <button
                  onClick={handleAcceptAll}
                  disabled={isAccepting}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Accept All Suggestions & Update Score
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
