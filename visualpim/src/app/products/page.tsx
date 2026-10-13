import Link from "next/link";
import { productService } from "../../services/ProductService";
import { categoryRepo } from "../../services/container";
import {
  Plus,
  ArrowUpRight,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Tag,
  Filter,
  Layers,
  ShieldCheck,
  Check,
  RotateCcw,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
    category?: string;
    tag?: string;
    sort?: string;
    view?: string;
  }>;
}) {
  const { status, search, category, tag, sort, view } = await searchParams;
  const isTableView = view === "table";

  const allProducts = await productService.listProducts();
  const products = await productService.listProducts({ status, search, category, tag, sort });
  const tagFacets = await productService.getTagFacets();
  const categories = await categoryRepo.findAll();

  const totalCount = allProducts.length;
  const needsWorkCount = allProducts.filter((p) => p.status === "needs_work").length;
  const improveCount = allProducts.filter((p) => p.status === "improve").length;
  const readyCount = allProducts.filter((p) => p.status === "ready").length;

  // Compute live category product counts
  const categoryCounts: Record<string, number> = {};
  allProducts.forEach((p) => {
    const catName = p.category_name || "Uncategorized";
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
  });

  const hasActiveFilters = Boolean(
    search ||
    (category && category !== "all") ||
    tag ||
    (status && status !== "all") ||
    (sort && sort !== "newest")
  );

  // Helper to construct query params preserving active state
  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (search) params.set("search", search);
    if (category && category !== "all") params.set("category", category);
    if (tag) params.set("tag", tag);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (isTableView) params.set("view", "table");

    Object.entries(overrides).forEach(([k, v]) => {
      if (!v || v === "all") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });

    const str = params.toString();
    return str ? `/products?${str}` : "/products";
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors font-semibold flex items-center gap-1">
          Home
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-800 font-semibold">Product Catalog</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e2d6] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Commercial product listings evaluated with 7-point health scoring, Cloudinary media variants, and WooCommerce readiness.
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs shadow-sm transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Product
        </Link>
      </div>

      {/* MODERN FACETED FILTER SUITE */}
      <div className="bg-white p-5 rounded-2xl border border-[#e8e2d6] shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-4">
        {/* ROW 1: SEARCH, SORT & VIEW CONTROLS */}
        <form action="/products" method="GET" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {status && <input type="hidden" name="status" value={status} />}
          {category && category !== "all" && <input type="hidden" name="category" value={category} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
          {isTableView && <input type="hidden" name="view" value="table" />}

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search by title, SKU, specs, tags..."
              className="w-full bg-[#f8f6f0] border border-[#ded7cb] rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-600 transition-colors"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            {search && (
              <Link
                href={buildQuery({ search: undefined })}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Sort & View Mode Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sort Select */}
            <select
              name="sort"
              defaultValue={sort || "newest"}
              className="bg-[#f8f6f0] border border-[#ded7cb] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:border-stone-600 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="score_desc">Sort: Highest Health Score</option>
              <option value="score_asc">Sort: Lowest Health Score</option>
              <option value="price_asc">Sort: Price: Low to High</option>
              <option value="price_desc">Sort: Price: High to Low</option>
              <option value="name_asc">Sort: Title A-Z</option>
            </select>

            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 shadow-sm transition-colors"
            >
              Apply
            </button>

            {/* View Switcher (Grid vs Table) */}
            <div className="flex items-center p-1 rounded-xl bg-[#f4efe6] border border-[#ded7cb]">
              <Link
                href={buildQuery({ view: undefined })}
                title="Amazon / Flipkart Cards Grid"
                className={`p-1.5 rounded-lg transition-colors ${
                  !isTableView ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Link>
              <Link
                href={buildQuery({ view: "table" })}
                title="PIM Table View"
                className={`p-1.5 rounded-lg transition-colors ${
                  isTableView ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <List className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </form>

        {/* ROW 2: CATEGORY FACETS (INSTANT FILTER CHIPS) */}
        <div className="pt-2 border-t border-[#f0eae1] flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <Layers className="w-3.5 h-3.5 text-stone-400" /> Categories:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <Link
              href={buildQuery({ category: undefined })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                !category || category === "all"
                  ? "bg-stone-900 text-stone-50 shadow-sm"
                  : "bg-[#f8f6f0] text-stone-700 hover:bg-[#ede7db] border border-[#ded7cb]"
              }`}
            >
              All Categories <span className="text-[10px] opacity-75 font-mono">({totalCount})</span>
            </Link>

            {categories.map((c) => {
              const isSelected = category?.toLowerCase() === c.name.toLowerCase();
              const count = categoryCounts[c.name] || 0;
              return (
                <Link
                  key={c.id}
                  href={buildQuery({ category: isSelected ? undefined : c.name })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-stone-900 text-stone-50 shadow-sm"
                      : "bg-[#f8f6f0] text-stone-700 hover:bg-[#ede7db] border border-[#ded7cb]"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  {isSelected && <X className="w-3 h-3 ml-0.5" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ROW 3: HEALTH GATE STATUS TABS */}
        <div className="pt-2 border-t border-[#f0eae1] flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" /> Health Gate:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <Link
              href={buildQuery({ status: undefined })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                !status || status === "all"
                  ? "bg-stone-900 text-stone-50 font-semibold"
                  : "bg-[#f8f6f0] text-stone-700 hover:bg-[#ede7db] border border-[#ded7cb]"
              }`}
            >
              All Listings ({totalCount})
            </Link>
            <Link
              href={buildQuery({ status: "ready" })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                status === "ready"
                  ? "bg-emerald-800 text-white font-semibold"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Ready for Store</span>
              <span className="text-[10px] font-mono">({readyCount})</span>
            </Link>
            <Link
              href={buildQuery({ status: "needs_work" })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                status === "needs_work"
                  ? "bg-rose-800 text-white font-semibold"
                  : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              <span>Needs Work</span>
              <span className="text-[10px] font-mono">({needsWorkCount})</span>
            </Link>
            {improveCount > 0 && (
              <Link
                href={buildQuery({ status: "improve" })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  status === "improve"
                    ? "bg-amber-800 text-white font-semibold"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <span>Improve</span>
                <span className="text-[10px] font-mono">({improveCount})</span>
              </Link>
            )}
          </div>
        </div>

        {/* ROW 4: DYNAMIC DISCOVERY KEYWORD TAGS (TOKENIZED WITH COUNTS) */}
        {tagFacets.length > 0 && (
          <div className="pt-2 border-t border-[#f0eae1] flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
              <Tag className="w-3.5 h-3.5 text-stone-400" /> Keyword Tags:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {tagFacets.slice(0, 10).map((facet) => {
                const isSelected = tag?.toLowerCase() === facet.name.toLowerCase();
                return (
                  <Link
                    key={facet.name}
                    href={buildQuery({ tag: isSelected ? undefined : facet.name })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-stone-900 text-stone-50 font-semibold shadow-sm"
                        : "bg-[#f8f6f0] hover:bg-[#ede7db] text-stone-700 border border-[#ded7cb]"
                    }`}
                  >
                    <span>#{facet.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? "text-stone-300" : "text-stone-400"}`}>
                      ({facet.count})
                    </span>
                    {isSelected && <X className="w-3 h-3 ml-0.5" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ROW 5: ACTIVE FILTERS BREADCRUMB BAR */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-[#f0eae1] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-stone-400 uppercase mr-1">Active Filters:</span>

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#f4efe6] text-stone-800 text-[11px] font-medium border border-[#ded7cb]">
                  Search: &quot;{search}&quot;
                  <Link href={buildQuery({ search: undefined })} className="hover:text-stone-950">
                    <X className="w-3 h-3" />
                  </Link>
                </span>
              )}

              {category && category !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#f4efe6] text-stone-800 text-[11px] font-medium border border-[#ded7cb]">
                  Category: {category}
                  <Link href={buildQuery({ category: undefined })} className="hover:text-stone-950">
                    <X className="w-3 h-3" />
                  </Link>
                </span>
              )}

              {tag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#f4efe6] text-stone-800 text-[11px] font-medium border border-[#ded7cb]">
                  Tag: #{tag}
                  <Link href={buildQuery({ tag: undefined })} className="hover:text-stone-950">
                    <X className="w-3 h-3" />
                  </Link>
                </span>
              )}

              {status && status !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#f4efe6] text-stone-800 text-[11px] font-medium border border-[#ded7cb]">
                  Status: {status.replace("_", " ")}
                  <Link href={buildQuery({ status: undefined })} className="hover:text-stone-950">
                    <X className="w-3 h-3" />
                  </Link>
                </span>
              )}

              <span className="text-[11px] text-stone-500 font-medium ml-1">
                ({products.length} matching)
              </span>
            </div>

            <Link
              href="/products"
              className="text-[11px] font-bold text-stone-700 hover:text-stone-950 hover:underline flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" /> Clear All Filters
            </Link>
          </div>
        )}
      </div>

      {/* PRODUCTS DISPLAY (CARDS GRID OR TABLE) */}
      {products.length === 0 ? (
        <div className="bg-white border border-[#e8e2d6] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#f8f6f0] border border-[#ded7cb] flex items-center justify-center mx-auto text-stone-400">
            <Filter className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900">No products match your active filter criteria</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting search terms, selecting a different category, or resetting all filters.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </Link>
        </div>
      ) : isTableView ? (
        /* TABLE VIEW */
        <div className="bg-white border border-[#e8e2d6] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#faf8f4] text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-[#e8e2d6]">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Product</th>
                  <th scope="col" className="px-4 py-3.5">Category</th>
                  <th scope="col" className="px-4 py-3.5">Price</th>
                  <th scope="col" className="px-4 py-3.5">Health Score</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">WooCommerce</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eae1]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fbf9f5] transition-colors">
                    <td className="px-5 py-4 font-medium text-stone-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f8f6f0] border border-[#ded7cb] overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-stone-400">None</span>
                          )}
                        </div>
                        <div>
                          <Link href={`/products/${p.id}/improve`} className="font-bold hover:underline block truncate max-w-xs">
                            {p.name}
                          </Link>
                          <span className="font-mono text-stone-400 text-[10px]">SKU: {p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-stone-600 font-medium">
                      {p.category_name || "Uncategorized"}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-stone-900">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold tabular-nums border ${
                        p.health_score >= 80
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}>
                        {p.health_score}/100
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        p.status === "ready"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-stone-500 font-mono text-[11px]">
                      {p.sync_status === "synced" ? "Synced (REST)" : "Unsynced"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/products/${p.id}/improve`}
                        className="inline-flex items-center gap-1 font-semibold text-stone-900 hover:underline"
                      >
                        Enrich <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* AMAZON / FLIPKART STYLE CARDS GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#e8e2d6] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(28,25,23,0.03)] hover:shadow-xl hover:border-stone-400 transition-all duration-300 flex flex-col group"
            >
              {/* Product Visual Showcase */}
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

                {/* Category Pill */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/95 backdrop-blur-sm text-stone-700 px-2.5 py-0.5 rounded-md border border-[#e8e2d6] shadow-sm">
                    {p.category_name || "Catalog"}
                  </span>
                </div>

                {/* Health Score Pill */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums shadow-sm border ${
                      p.health_score >= 80
                        ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                        : "bg-amber-50/95 border-amber-200 text-amber-800"
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
                    <span className="text-base font-extrabold text-stone-900 tabular-nums">
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

                {/* Status & CTA Button */}
                <div className="pt-3 border-t border-[#f0eae1] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    {p.status === "ready" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Ready for Store
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
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
                    Inspect &amp; Enrich <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
