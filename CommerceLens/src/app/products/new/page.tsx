"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, Loader2, Sparkles, Tag, CheckCircle2, RefreshCw, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Category, AttributeTemplate } from "../../../domain/schemas";
import { ImageUploader } from "../../../components/ImageUploader";

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentTemplates, setCurrentTemplates] = useState<AttributeTemplate[]>([]);

  // Form Fields
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("49.99");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [altText, setAltText] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Media State
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Multimodal Vision AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiBanner, setAiBanner] = useState<{
    show: boolean;
    title?: string;
    tagCount?: number;
    source?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories.length > 0) {
          setCategories(data.categories);
          const first = data.categories[0];
          setSelectedCategory(first.id);
          setCurrentTemplates(first.templates || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const cat = categories.find((c) => c.id === catId);
    setCurrentTemplates(cat?.templates || []);
  };

  const handleAttributeChange = (attrName: string, val: string) => {
    setAttributes((prev) => ({ ...prev, [attrName]: val }));
  };

  // Multimodal Vision AI Auto-Fill Logic
  const runAIAutoFill = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || imageUrl;
    if (!targetUrl) {
      alert("Please upload or choose a product photo first to let Multimodal AI analyze it.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/auto-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: targetUrl,
          nameHint: name,
          categoryHint: selectedCategory,
        }),
      });

      const data = await res.json();
      if (data.success && data.detected) {
        const d = data.detected;

        // Auto-fill Title
        if (d.title) setName(d.title);

        // Auto-fill Description
        if (d.description) setDescription(d.description);

        // Auto-fill Price
        if (d.price) setPrice(String(d.price));

        // Auto-fill SEO Tags
        if (Array.isArray(d.seoTags) && d.seoTags.length > 0) {
          setSeoTags(d.seoTags);
        }

        // Auto-fill Alt Text
        if (d.altText) setAltText(d.altText);

        // Auto-select Category
        if (d.categoryId) {
          setSelectedCategory(d.categoryId);
          const cat = categories.find((c) => c.id === d.categoryId);
          if (cat?.templates) {
            setCurrentTemplates(cat.templates);
          }
        }

        // Auto-fill Dynamic Attributes
        if (d.attributes && typeof d.attributes === "object") {
          setAttributes((prev) => ({ ...prev, ...d.attributes }));
        }

        setAiBanner({
          show: true,
          title: d.title,
          tagCount: d.seoTags?.length || 5,
          source: data.source || "Multimodal Vision AI",
        });
      }
    } catch (err) {
      console.error("AI Auto-Detect failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Triggered automatically whenever an image is uploaded or snapped
  const handlePhotoUploaded = (data: { url: string; publicId: string }) => {
    setImageUrl(data.url);
    setImagePublicId(data.publicId);
    void runAIAutoFill(data.url);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, "");
    if (!seoTags.includes(clean)) {
      setSeoTags([...seoTags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSeoTags(seoTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter a product title");

    setIsSaving(true);
    try {
      const cat = categories.find((c) => c.id === selectedCategory);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: sku.trim() || undefined,
          name: name.trim(),
          category_id: selectedCategory || null,
          category_name: cat?.name || null,
          price: Number(price) || 0,
          description: description.trim(),
          seo_tags: seoTags,
          alt_text: altText.trim(),
          image_url: imageUrl,
          image_public_id: imagePublicId,
          attributes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/products/${data.product.id}/improve`);
      } else {
        alert("Failed to save product: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors font-semibold">
          Home
        </Link>
        <span className="text-stone-300">/</span>
        <Link href="/products" className="hover:text-stone-900 transition-colors font-semibold">
          Products
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-800 font-semibold">New Listing</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e2d6] pb-5">
        <div className="flex items-center gap-3">
          <Link href="/products" className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#f4efe6] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              AI Visual Product Studio
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Upload photography or click with camera. Multimodal Vision AI automatically detects title, category, tags, and specifications.
            </p>
          </div>
        </div>

        {imageUrl && (
          <button
            type="button"
            onClick={() => runAIAutoFill()}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 self-start sm:self-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Vision AI Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Re-Analyze with AI
              </>
            )}
          </button>
        )}
      </div>

      {/* AI Success Banner */}
      {aiBanner?.show && (
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs flex-1">
            <div className="font-bold text-emerald-900 flex items-center gap-2">
              <span>Multimodal Vision AI Analysis Complete!</span>
              <span className="font-mono text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-800">
                Zero Manual Entry Needed
              </span>
            </div>
            <p className="text-emerald-800">
              Auto-detected product title, category, marketing description, {aiBanner.tagCount} SEO discovery tags, and technical specifications directly from your photo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAiBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#e8e2d6] rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
          {/* 1. PHOTOGRAPHY FIRST (THE CORE OF VISUAL PIM) */}
          <div className="space-y-3 pb-6 border-b border-[#f0eae1]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Product Photography (Triggers Instant AI Auto-Fill)
                </label>
                <p className="text-xs text-stone-500">
                  Snap with device camera or choose a photo. Gemini Multimodal Vision will inspect the image and auto-fill the whole form!
                </p>
              </div>
              {imageUrl && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit">
                  Photo Analyzed
                </span>
              )}
            </div>

            <ImageUploader
              sku={sku}
              currentUrl={imageUrl}
              onUploaded={handlePhotoUploaded}
            />

            {isAnalyzing && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#f8f6f0] border border-[#ded7cb] text-xs text-stone-700 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                <span>Multimodal Vision AI is scanning visual attributes, category specs, and SEO keywords...</span>
              </div>
            )}
          </div>

          {/* 2. AUTO-FILLED TITLE & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Product Title *
                </label>
                {name && <span className="text-[10px] text-stone-400 font-mono">{name.length} chars</span>}
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Upload photo above to auto-detect title, or enter here..."
                className="w-full bg-[#f8f6f0] border border-[#ded7cb] rounded-lg px-4 py-2.5 text-sm text-stone-900 font-semibold focus:outline-none focus:border-stone-600"
              />
              <span className="text-[11px] text-stone-400">High-converting title evaluated by 7-point quality gate.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                SKU (Identity)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Auto-generated if blank"
                className="w-full bg-[#f8f6f0] border border-[#ded7cb] rounded-lg px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-stone-600 font-mono"
              />
            </div>
          </div>

          {/* 3. CATEGORY & PRICE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-[#f8f6f0] border border-[#ded7cb] rounded-lg px-4 py-2.5 text-sm text-stone-900 font-medium focus:outline-none focus:border-stone-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#f8f6f0] border border-[#ded7cb] rounded-lg px-4 py-2.5 text-sm text-stone-900 font-semibold focus:outline-none focus:border-stone-600 tabular-nums"
              />
            </div>
          </div>

          {/* 4. COMMERCIAL MARKETING DESCRIPTION */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Commercial Description *
              </label>
              <span className={`text-[10px] font-mono ${description.length >= 100 ? "text-emerald-700" : "text-stone-400"}`}>
                {description.length} chars (Target: ≥ 100)
              </span>
            </div>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Commercial description auto-filled by Vision AI..."
              className="w-full bg-[#f8f6f0] border border-[#ded7cb] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-stone-900 leading-relaxed focus:outline-none focus:border-stone-600"
            />
          </div>

          {/* 5. INTERACTIVE SEO SEARCH TAGS RIBBON */}
          <div className="space-y-2 pt-2 border-t border-[#f0eae1]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-stone-500" />
                SEO Search &amp; Discovery Tags ({seoTags.length})
              </label>
              <span className="text-[10px] text-stone-400">Essential for WooCommerce store search ranking</span>
            </div>

            <div className="p-3 rounded-xl bg-[#fcfaf7] border border-[#ded7cb] space-y-2.5">
              {seoTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {seoTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#f4efe6] text-stone-800 text-xs font-medium border border-[#ded7cb]"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-stone-400 hover:text-stone-700 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  No SEO tags yet. Upload or snap a photo above to auto-generate discovery tags with AI!
                </p>
              )}

              {/* Add custom tag */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add custom keyword (e.g. streetwear, trail)..."
                  className="flex-1 bg-white border border-[#ded7cb] rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-600"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* 6. CATEGORY-DRIVEN ATTRIBUTES (AUTO-DETECTED BY AI) */}
          {currentTemplates.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#f0eae1]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Category Attributes ({categories.find((c) => c.id === selectedCategory)?.name})
                </h3>
                <span className="text-[10px] text-stone-400">Auto-filled from image visual cues</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentTemplates.map((t) => (
                  <div key={t.id} className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-700 capitalize flex items-center justify-between">
                      <span>
                        {t.name} {t.required && <span className="text-rose-600">*</span>}
                      </span>
                      {attributes[t.name] && (
                        <span className="text-[10px] text-emerald-700 font-semibold">AI Inferred</span>
                      )}
                    </label>

                    {t.type === "select" ? (
                      <select
                        value={attributes[t.name] || ""}
                        onChange={(e) => handleAttributeChange(t.name, e.target.value)}
                        className="w-full bg-[#f8f6f0] border border-[#ded7cb] rounded-lg px-3 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:border-stone-600"
                      >
                        <option value="">-- Select {t.name} --</option>
                        {t.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={t.type === "number" ? "number" : "text"}
                        value={attributes[t.name] || ""}
                        onChange={(e) => handleAttributeChange(t.name, e.target.value)}
                        placeholder={`e.g. ${t.name}...`}
                        className="w-full bg-[#f8f6f0] border border-[#ded7cb] rounded-lg px-3 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:border-stone-600"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl border border-[#ded7cb] text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 hover:bg-[#f4efe6] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving to Catalog...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Save &amp; Run Health Gate
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
