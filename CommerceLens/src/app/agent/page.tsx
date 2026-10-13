"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  CheckCircle2,
  ShieldAlert,
  Terminal,
  Loader2,
  Sparkles,
  Layers,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Code2,
  Package,
  ExternalLink,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Tag,
  SlidersHorizontal,
  Clock,
  CheckCircle,
} from "lucide-react";
import { AgentRunSummary } from "../../services/AgentService";
import { AgentStepRecord, Product } from "../../domain/schemas";

interface ProductDossier {
  id: string;
  name: string;
  sku: string;
  categoryName: string;
  imageUrl: string;
  price: number;
  currentScore: number;
  targetScore: number;
  status: string;
  failedChecks: Array<{ key: string; hint: string }>;
  proposedTitle?: string;
  proposedSeo?: string[];
  proposedAlt?: string;
  proposedAttributes?: Record<string, string>;
  missingAttributes?: string[];
  applied: boolean;
  appliedMessage?: string;
  synced: boolean;
  wooId?: number | string;
  syncMessage?: string;
  steps: AgentStepRecord[];
}

export default function AgentPage() {
  const [goal, setGoal] = useState("Audit footwear catalog, enrich low-scoring products, and prepare WooCommerce listing plan");
  const [mode, setMode] = useState<"dry_run" | "apply">("dry_run");
  const [approved, setApproved] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<AgentRunSummary | null>(null);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [activeView, setActiveView] = useState<"dossiers" | "timeline">("dossiers");
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  // Fetch catalog products for fast lookup & thumbnail mapping
  const loadProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          const map: Record<string, Product> = {};
          data.products.forEach((p: Product) => {
            map[p.id] = p;
          });
          setProductsMap(map);
        }
      })
      .catch((err) => console.error("Failed to load products map:", err));
  };

  useEffect(() => {
    loadProducts();
    // Fetch latest run if exists
    fetch("/api/agent/run")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.latest) {
          setRunResult(data.latest);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRun = async (overrideMode?: "dry_run" | "apply", overrideApproved?: boolean) => {
    setIsRunning(true);
    const executionMode = overrideMode || mode;
    const isExecutionApproved = overrideApproved !== undefined ? overrideApproved : approved;

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          mode: executionMode,
          approved: isExecutionApproved,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRunResult(data.summary);
        loadProducts(); // refresh catalog state after run
      } else {
        alert("Agent execution failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApproveAndApply = () => {
    setApproved(true);
    handleRun("apply", true);
  };

  // Group steps by product into clear Product Dossiers
  const productDossiers: ProductDossier[] = useMemo(() => {
    if (!runResult || !runResult.steps) return [];

    const order: string[] = [];
    const stepsByProd: Record<string, AgentStepRecord[]> = {};
    const infoByProd: Record<string, any> = {};

    // 1. Seed with list_products output if present
    const listStep = runResult.steps.find((s) => s.tool === "list_products");
    if (listStep && Array.isArray(listStep.output)) {
      listStep.output.forEach((p: any) => {
        if (p && p.id) {
          infoByProd[p.id] = { ...p };
        }
      });
    }

    // 2. Iterate through all steps to collect product actions
    runResult.steps.forEach((step) => {
      const input = (step.input || {}) as Record<string, any>;
      const output = (step.output || {}) as Record<string, any>;
      const prodId = input.id || output.productId || (typeof output.id === "string" ? output.id : undefined);

      if (prodId && typeof prodId === "string") {
        if (!stepsByProd[prodId]) {
          stepsByProd[prodId] = [];
          order.push(prodId);
        }
        stepsByProd[prodId].push(step);

        if (step.tool === "get_health" && output) {
          infoByProd[prodId] = {
            ...infoByProd[prodId],
            name: output.name || infoByProd[prodId]?.name,
            sku: output.sku || infoByProd[prodId]?.sku,
            score: output.score !== undefined ? output.score : infoByProd[prodId]?.score,
            status: output.status || infoByProd[prodId]?.status,
            failedChecks: output.failedChecks,
            imageUrl: output.image_url || infoByProd[prodId]?.imageUrl,
            categoryName: output.category_name || infoByProd[prodId]?.categoryName,
          };
        }

        if (step.tool === "suggest_improvements" && output) {
          infoByProd[prodId] = {
            ...infoByProd[prodId],
            name: output.productName || infoByProd[prodId]?.name,
            sku: output.productSku || infoByProd[prodId]?.sku,
            imageUrl: output.productImageUrl || infoByProd[prodId]?.imageUrl,
            categoryName: output.productCategory || infoByProd[prodId]?.categoryName,
            proposedTitle: output.proposedTitle,
            proposedSeo: output.proposedSeo,
            proposedAlt: output.proposedAlt,
            proposedAttributes: output.proposedAttributes,
            missingAttributes: output.missingAttributes,
          };
        }

        if (step.tool === "apply_suggestion" && output) {
          infoByProd[prodId] = {
            ...infoByProd[prodId],
            applied: true,
            appliedMessage: output.message || "Improvements applied to catalog",
            newScore: output.newScore || 100,
            newStatus: output.newStatus,
          };
        }

        if (step.tool === "sync_product" && output) {
          infoByProd[prodId] = {
            ...infoByProd[prodId],
            synced: true,
            wooId: output.wooId,
            syncMessage: output.message || "Synced to WooCommerce REST API",
          };
        }
      }
    });

    // If no specific product steps were recorded yet, show from list_products
    if (order.length === 0 && listStep && Array.isArray(listStep.output)) {
      listStep.output.forEach((p: any) => {
        if (p && p.id && !order.includes(p.id)) {
          order.push(p.id);
        }
      });
    }

    return order.map((id) => {
      const dbProd = productsMap[id];
      const collected = infoByProd[id] || {};
      const steps = stepsByProd[id] || [];

      return {
        id,
        name: collected.name || dbProd?.name || `Product ${id}`,
        sku: collected.sku || dbProd?.sku || id,
        categoryName: collected.categoryName || dbProd?.category_name || "Catalog Item",
        imageUrl: collected.imageUrl || dbProd?.image_url || "",
        price: dbProd?.price !== undefined ? dbProd.price : collected.price || 0,
        currentScore: collected.score !== undefined ? collected.score : dbProd?.health_score || 0,
        targetScore: collected.newScore || 100,
        status: collected.status || dbProd?.status || "needs_work",
        failedChecks: collected.failedChecks || [],
        proposedTitle: collected.proposedTitle,
        proposedSeo: collected.proposedSeo || [],
        proposedAlt: collected.proposedAlt,
        proposedAttributes: collected.proposedAttributes,
        missingAttributes: collected.missingAttributes || [],
        applied: collected.applied || false,
        appliedMessage: collected.appliedMessage,
        synced: collected.synced || false,
        wooId: collected.wooId,
        syncMessage: collected.syncMessage,
        steps,
      };
    });
  }, [runResult, productsMap]);

  // Standard 7 checkpoints for visualization
  const standardCheckpoints = [
    { key: "title_length", label: "Title Quality" },
    { key: "description_length", label: "Description Depth" },
    { key: "price_valid", label: "Pricing Valid" },
    { key: "has_image", label: "Cloudinary Asset" },
    { key: "seo_tags_count", label: "SEO Keywords" },
    { key: "required_attributes", label: "Required Attributes" },
    { key: "has_category", label: "Category Assignment" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors font-semibold flex items-center gap-1">
          Home
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-800 font-semibold">Autonomous Quality Agent</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e2d6] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-stone-700" />
            Autonomous Catalog Quality Agent
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Evaluates catalog listing health, generates multimodal Vision AI enhancements, and formulates WooCommerce syndication dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#f4efe6] border border-[#ded7cb] text-stone-700">
            Safety Guardrail: Max 25 Steps
          </span>
        </div>
      </div>

      {/* Directive Execution Panel */}
      <div className="bg-white border border-[#e8e2d6] rounded-xl p-5 shadow-[0_1px_3px_rgba(28,25,23,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-stone-600" />
            Automation Directive
          </label>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setMode("dry_run")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                mode === "dry_run"
                  ? "bg-stone-900 text-stone-50 font-semibold"
                  : "bg-[#f4efe6] text-stone-600 hover:text-stone-900"
              }`}
            >
              Dry-Run (Proposal Only)
            </button>
            <button
              onClick={() => setMode("apply")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                mode === "apply"
                  ? "bg-stone-900 text-stone-50 font-semibold"
                  : "bg-[#f4efe6] text-stone-600 hover:text-stone-900"
              }`}
            >
              Apply Mode
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="flex-1 bg-[#f8f6f0] border border-[#ded7cb] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-600"
            placeholder="Describe your quality audit goal..."
          />
          <button
            onClick={() => handleRun()}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Executing Policy...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Execute Directive
              </>
            )}
          </button>
        </div>

        {/* Quick Goal Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-500">
          <span className="text-[11px] font-medium text-stone-400">Quick directives:</span>
          <button
            onClick={() => setGoal("Audit footwear catalog, enrich low-scoring products, and prepare WooCommerce listing plan")}
            className="px-2.5 py-1 rounded-md bg-[#f4efe6] hover:bg-[#eae3d5] text-stone-700 border border-[#ded7cb] text-[11px] transition-colors"
          >
            Footwear & Apparel Audit
          </button>
          <button
            onClick={() => setGoal("Scan all products with Health Score under 80 and formulate multimodal title & SEO proposals")}
            className="px-2.5 py-1 rounded-md bg-[#f4efe6] hover:bg-[#eae3d5] text-stone-700 border border-[#ded7cb] text-[11px] transition-colors"
          >
            Enrich Deficient Listings (&lt; 80)
          </button>
          <button
            onClick={() => setGoal("Execute full catalog health verification and sync ready products to WooCommerce store")}
            className="px-2.5 py-1 rounded-md bg-[#f4efe6] hover:bg-[#eae3d5] text-stone-700 border border-[#ded7cb] text-[11px] transition-colors"
          >
            Sync Ready Items to WooCommerce
          </button>
        </div>

        {mode === "dry_run" && (
          <p className="text-xs text-stone-500 flex items-center gap-1.5 pt-1">
            <ShieldAlert className="w-3.5 h-3.5 text-stone-600" />
            Dry-Run is active. The agent creates proposals without modifying live catalog records.
          </p>
        )}
      </div>

      {/* Execution Results Section */}
      {runResult && (
        <div className="space-y-6">
          {/* Run Summary Banner */}
          <div className="bg-white border border-[#e8e2d6] rounded-xl p-5 shadow-[0_1px_3px_rgba(28,25,23,0.03)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e2d6] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                    runResult.run.mode === "dry_run"
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-emerald-50 text-emerald-900 border-emerald-200"
                  }`}>
                    {runResult.run.mode === "dry_run" ? "Safe Plan Formulated" : "Applied Live"}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Run ID: {runResult.run.id}</span>
                </div>
                <h3 className="text-base font-bold text-stone-900 mt-1">Directive: &quot;{runResult.run.goal}&quot;</h3>
              </div>

              {runResult.run.mode === "dry_run" && (
                <button
                  onClick={handleApproveAndApply}
                  disabled={isRunning}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm active:scale-[0.98] transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve & Apply Plan
                </button>
              )}
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="p-3 sm:p-4 bg-[#f8f6f0] rounded-xl border border-[#ded7cb]">
                <span className="text-xs text-stone-500 block">Products Audited</span>
                <span className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5 block font-mono">{productDossiers.length || runResult.summary.scanned}</span>
              </div>
              <div className="p-3 sm:p-4 bg-[#f8f6f0] rounded-xl border border-[#ded7cb]">
                <span className="text-xs text-stone-500 block">AI Improvements Formulated</span>
                <span className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5 block font-mono">{runResult.summary.improved}</span>
              </div>
              <div className="p-3 sm:p-4 bg-[#f8f6f0] rounded-xl border border-[#ded7cb]">
                <span className="text-xs text-stone-500 block">WooCommerce Actions</span>
                <span className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5 block font-mono">{runResult.summary.synced}</span>
              </div>
            </div>

            {/* View Switcher: Product Dossiers vs Chronological Trace */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#e8e2d6]">
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Audit Findings &amp; Enrichment Breakdown
                </h4>
                <p className="text-xs text-stone-500">Structured analysis organized by individual catalog item</p>
              </div>

              <div className="inline-flex p-1 rounded-lg bg-[#f4efe6] border border-[#ded7cb] self-start sm:self-auto text-xs">
                <button
                  onClick={() => setActiveView("dossiers")}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    activeView === "dossiers"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Product Dossiers ({productDossiers.length})
                </button>
                <button
                  onClick={() => setActiveView("timeline")}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    activeView === "timeline"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Execution Trace ({runResult.steps.length} Steps)
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: STRUCTURED PRODUCT DOSSIERS (ORGANIZED BY PRODUCT) */}
          {activeView === "dossiers" && (
            <div className="space-y-5">
              {productDossiers.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-[#e8e2d6] text-stone-500 text-sm">
                  No products matched the current directive criteria. Try running with &quot;Footwear &amp; Apparel Audit&quot;.
                </div>
              ) : (
                productDossiers.map((dossier) => {
                  const isExpanded = expandedTraceId === dossier.id;
                  const isOptimal = dossier.currentScore >= 80;

                  return (
                    <div
                      key={dossier.id}
                      className="bg-white border border-[#e8e2d6] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-5 hover:border-stone-400 transition-all"
                    >
                      {/* Product Header Row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e8e2d6] pb-4">
                        <div className="flex items-start gap-4">
                          {/* Thumbnail */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#f8f6f0] border border-[#ded7cb] flex-shrink-0 overflow-hidden flex items-center justify-center relative shadow-inner">
                            {dossier.imageUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={dossier.imageUrl}
                                alt={dossier.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-stone-400" />
                            )}
                          </div>

                          {/* Identity & Badges */}
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#f4efe6] text-stone-700 border border-[#ded7cb]">
                                SKU: {dossier.sku}
                              </span>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                                {dossier.categoryName}
                              </span>
                              {dossier.price > 0 && (
                                <span className="text-[11px] font-semibold text-stone-700">
                                  ${dossier.price.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                              {dossier.name}
                            </h3>

                            {/* Status Pill */}
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                                dossier.status === "ready"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}>
                                Status: {dossier.status.replace("_", " ")}
                              </span>
                              {dossier.synced && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                                  <RefreshCw className="w-2.5 h-2.5" /> WooCommerce Synced
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Health Score Evolution & Action Button */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 flex-shrink-0">
                          <div className="text-left md:text-right">
                            <div className="flex items-center gap-1.5 md:justify-end">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums border ${
                                isOptimal
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                  : "bg-rose-50 border-rose-200 text-rose-800"
                              }`}>
                                Health: {dossier.currentScore}/100
                              </span>
                              {dossier.proposedTitle && (
                                <>
                                  <ArrowRight className="w-3 h-3 text-stone-400" />
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums bg-emerald-50 border border-emerald-200 text-emerald-800">
                                    Target: {dossier.targetScore}/100
                                  </span>
                                </>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 block mt-1">
                              {isOptimal ? "Passes quality policy" : "Action items recommended"}
                            </span>
                          </div>

                          <Link
                            href={`/products/${dossier.id}/improve`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#f4efe6] hover:bg-[#eae3d5] text-stone-800 font-semibold text-xs border border-[#ded7cb] transition-colors"
                          >
                            <span>Open in Studio</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* SECTION 1: DETERMINISTIC 7-POINT HEALTH AUDIT */}
                      <div className="p-4 rounded-xl bg-[#fcfaf7] border border-[#ded7cb] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-stone-800 text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-stone-600" />
                            <span>Deterministic 7-Point Quality Audit</span>
                          </div>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            dossier.failedChecks.length === 0
                              ? "bg-emerald-100/70 text-emerald-800"
                              : "bg-amber-100/70 text-amber-800"
                          }`}>
                            {dossier.failedChecks.length === 0
                              ? "All 7 Checkpoints Validated"
                              : `${dossier.failedChecks.length} Issue${dossier.failedChecks.length > 1 ? "s" : ""} Flagged`}
                          </span>
                        </div>

                        {/* Visual 7-Checkpoint Pill Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
                          {standardCheckpoints.map((cp) => {
                            const isFailed = dossier.failedChecks.some((f) => f.key === cp.key);
                            return (
                              <div
                                key={cp.key}
                                className={`p-2 rounded-lg border text-center transition-all ${
                                  isFailed
                                    ? "bg-rose-50/60 border-rose-200 text-rose-900"
                                    : "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                  {isFailed ? (
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  ) : (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  )}
                                  <span className="text-[10px] font-bold">
                                    {isFailed ? "Deficient" : "Pass"}
                                  </span>
                                </div>
                                <span className="text-[10px] text-stone-600 block truncate">
                                  {cp.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed Action Items if any failed */}
                        {dossier.failedChecks.length > 0 ? (
                          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                            <span className="font-bold text-[11px] uppercase tracking-wider block text-amber-800">
                              Identified Improvement Opportunities:
                            </span>
                            <ul className="space-y-1 list-disc list-inside text-stone-700">
                              {dossier.failedChecks.map((f, i) => (
                                <li key={i} className="text-xs">
                                  <span className="font-semibold text-stone-900 capitalize">
                                    {f.key.replace(/_/g, " ")}:
                                  </span>{" "}
                                  {f.hint}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>This listing satisfies commercial completeness criteria. No compliance deficiencies detected.</span>
                          </div>
                        )}
                      </div>

                      {/* SECTION 2: AI MULTIMODAL VISION ENRICHMENT PROPOSAL */}
                      {dossier.proposedTitle && (
                        <div className="p-4 rounded-xl bg-white border border-[#ded7cb] space-y-3.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <span>Multimodal Vision AI Catalog Enrichment</span>
                            </div>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#f4efe6] text-stone-700 border border-[#ded7cb]">
                              Generated Proposal
                            </span>
                          </div>

                          {/* Commercial Title Comparison */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                              Optimized Title Proposal
                            </span>
                            <div className="p-3 rounded-lg bg-[#f8f6f0] border border-[#ded7cb] space-y-1">
                              <div className="text-xs text-stone-400 line-through">
                                Original: {dossier.name}
                              </div>
                              <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                <span>{dossier.proposedTitle}</span>
                              </div>
                            </div>
                          </div>

                          {/* SEO Search Tags */}
                          {dossier.proposedSeo && dossier.proposedSeo.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                                Generated Search &amp; Discovery Tags
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {dossier.proposedSeo.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2.5 py-1 rounded-md bg-[#f4efe6] text-stone-700 border border-[#ded7cb] text-[11px] font-medium flex items-center gap-1"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-stone-400" />
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Missing Attributes Identified */}
                          {dossier.missingAttributes && dossier.missingAttributes.length > 0 && (
                            <div className="text-xs text-stone-600">
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                                Category Attributes Enriched
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {dossier.missingAttributes.map((attr) => (
                                  <span
                                    key={attr}
                                    className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] border border-stone-200 font-mono"
                                  >
                                    {attr}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Cloudinary Visual Asset Status */}
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1 border-t border-[#ded7cb]/50">
                            <span className="font-semibold text-stone-700">Cloudinary Asset:</span>
                            <span>Smart focal crop (c_pad, ar_1:1) and sharpening transform prepared.</span>
                          </div>
                        </div>
                      )}

                      {/* SECTION 3: SYNDICATION & PUBLICATION STATUS */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                        <div className="flex items-center gap-2">
                          {dossier.applied ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {dossier.appliedMessage || "Database updated and Health Score set to 100/100."}
                            </span>
                          ) : dossier.proposedTitle ? (
                            <span className="inline-flex items-center gap-1.5 text-amber-800 font-medium bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                              Dry-Run Formulation: Ready for approval and live application.
                            </span>
                          ) : (
                            <span className="text-stone-500">
                              Product audited against active catalog standards.
                            </span>
                          )}
                        </div>

                        {dossier.synced && (
                          <div className="text-stone-700 font-mono text-[11px] flex items-center gap-1">
                            <span>WooCommerce REST:</span>
                            <span className="font-bold text-stone-900">ID #{dossier.wooId || "Synced"}</span>
                          </div>
                        )}
                      </div>

                      {/* SECTION 4: COLLAPSIBLE TECHNICAL AUDIT TRACE */}
                      {dossier.steps.length > 0 && (
                        <div className="border-t border-[#e8e2d6] pt-3">
                          <button
                            onClick={() => setExpandedTraceId(isExpanded ? null : dossier.id)}
                            className="w-full flex items-center justify-between text-xs text-stone-500 hover:text-stone-900 transition-colors py-1"
                          >
                            <span className="font-mono text-[11px] flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5 text-stone-500" />
                              Technical Execution Trace ({dossier.steps.length} Steps for this product)
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-3 space-y-2.5">
                              {dossier.steps.map((st) => (
                                <div
                                  key={st.id || st.step_no}
                                  className="p-3 rounded-lg bg-[#f8f6f0] border border-[#ded7cb] text-xs space-y-2"
                                >
                                  <div className="flex items-center justify-between border-b border-[#ded7cb]/60 pb-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="px-1.5 py-0.5 rounded bg-stone-900 text-stone-50 text-[10px] font-mono font-bold">
                                        Step #{st.step_no}
                                      </span>
                                      <span className="font-semibold text-stone-800 font-mono text-[11px]">
                                        {st.tool}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-stone-400 font-mono">
                                      {st.created_at || "just now"}
                                    </span>
                                  </div>

                                  <div className="p-2 rounded bg-white border border-[#ded7cb] font-mono text-[10px] text-stone-600 space-y-1 overflow-x-auto">
                                    <div><strong className="text-stone-800">Input:</strong> {JSON.stringify(st.input)}</div>
                                    <div><strong className="text-stone-800">Output:</strong> {JSON.stringify(st.output)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW 2: CHRONOLOGICAL STEP-BY-STEP TIMELINE */}
          {activeView === "timeline" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                  Chronological Step Timeline ({runResult.steps.length} Actions)
                </h4>
                <span className="text-xs text-stone-400">Sequential order of operations</span>
              </div>

              <div className="space-y-3">
                {runResult.steps.map((step) => {
                  const input = step.input as Record<string, unknown>;
                  const output = step.output as Record<string, unknown> | Array<Record<string, unknown>>;
                  const targetId = (input.id as string) || (typeof output === "object" && !Array.isArray(output) && (output.productId as string));
                  const targetProd = targetId ? productsMap[targetId] : null;

                  return (
                    <div
                      key={step.id || step.step_no}
                      className="p-4 rounded-xl bg-white border border-[#ded7cb] space-y-3 transition-colors hover:border-stone-400 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-[#e8e2d6] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-stone-900 text-stone-50 text-[11px] font-semibold font-mono">
                            Step #{step.step_no}
                          </span>
                          <span className="text-xs font-bold text-stone-800 capitalize">
                            {step.tool.replace(/_/g, " ")}
                          </span>
                          {targetProd && (
                            <span className="text-xs text-stone-500 font-medium">
                              — {targetProd.name}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono">{step.created_at || "just now"}</span>
                      </div>

                      {/* Tool description */}
                      <div className="text-xs text-stone-700">
                        {step.tool === "list_products" && Array.isArray(output) && (
                          <div className="space-y-2">
                            <span className="font-medium text-stone-800">Scanned catalog: {output.length} total products loaded.</span>
                          </div>
                        )}

                        {step.tool === "get_health" && typeof output === "object" && !Array.isArray(output) && (
                          <div className="flex items-center justify-between">
                            <span>Audited health score for <strong>{String(output.name || input.id)}</strong></span>
                            <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#f4efe6] text-stone-800 border border-[#ded7cb]">
                              Score: {Number(output.score)}/100
                            </span>
                          </div>
                        )}

                        {step.tool === "suggest_improvements" && typeof output === "object" && !Array.isArray(output) && (
                          <div className="space-y-1">
                            <span className="font-semibold text-stone-900">AI Proposed Title:</span>
                            <p className="text-xs text-stone-800 font-medium bg-[#f8f6f0] p-2 rounded border border-[#ded7cb]">
                              {String(output.proposedTitle)}
                            </p>
                          </div>
                        )}

                        {step.tool === "apply_suggestion" && typeof output === "object" && !Array.isArray(output) && (
                          <div className="text-emerald-800 font-medium">
                            {String(output.message || "Improvements applied to catalog.")}
                          </div>
                        )}

                        {step.tool === "sync_product" && typeof output === "object" && !Array.isArray(output) && (
                          <div className="text-stone-800 font-medium">
                            {String(output.message || "Syndicated product to WooCommerce.")}
                          </div>
                        )}
                      </div>

                      {/* Collapsible Raw JSON */}
                      <details className="text-[11px] text-stone-400 pt-2 border-t border-[#ded7cb]/60 cursor-pointer group">
                        <summary className="hover:text-stone-700 flex items-center gap-1 font-mono text-[10px]">
                          <Code2 className="w-3 h-3" /> Technical Payload (JSON)
                        </summary>
                        <div className="mt-2 p-2.5 rounded bg-[#f8f6f0] border border-[#ded7cb] text-[10px] font-mono text-stone-600 space-y-1 overflow-x-auto">
                          <div><strong className="text-stone-800">Input:</strong> {JSON.stringify(step.input)}</div>
                          <div><strong className="text-stone-800">Output:</strong> {JSON.stringify(step.output)}</div>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
