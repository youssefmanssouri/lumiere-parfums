"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard, { Product } from "@/components/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<{
    categories: string[];
    genders: string[];
    notes: string[];
  }>({
    categories: [],
    genders: [],
    notes: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [note, setNote] = useState(searchParams.get("note") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFeatured(searchParams.get("featured") === "true");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (gender) params.set("gender", gender);
    if (note) params.set("note", note);
    if (sort) params.set("sort", sort);
    if (featured) params.set("featured", "true");

    setLoading(true);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data.products);
          setFilters({
            categories: data.data.filters?.categories || [],
            genders: data.data.filters?.genders || [],
            notes: data.data.filters?.notes || [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, [search, category, gender, note, sort, featured]);

  const hasActiveFilters = Boolean(category || gender || note || search || featured);

  const clearAllFilters = () => {
    setSearch("");
    setCategory("");
    setGender("");
    setNote("");
    setFeatured(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="text-center mb-12">
        <p className="text-gold tracking-[0.3em] uppercase text-xs font-semibold mb-3">
          Curated Perfumery
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-light text-charcoal">
          {featured ? "Bestsellers" : "All Fragrances"}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search fragrances, brands, notes (e.g. Vanilla, Bergamot)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-charcoal/10 bg-white focus:border-gold focus:outline-none text-sm rounded-sm"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 border border-charcoal/10 bg-white text-sm focus:border-gold focus:outline-none rounded-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A-Z</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 border border-charcoal/10 bg-white text-sm rounded-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && "•"}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside
          className={`${
            showFilters ? "block" : "hidden"
          } lg:block w-full lg:w-60 shrink-0 space-y-7 bg-white p-5 lg:p-0 rounded-sm border lg:border-none border-charcoal/10`}
        >
          {hasActiveFilters && (
            <div className="pb-4 border-b border-charcoal/10 flex items-center justify-between">
              <span className="text-xs text-muted">Active Filters</span>
              <button
                onClick={clearAllFilters}
                className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            </div>
          )}

          {/* Category */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-muted font-medium mb-3">
              Category
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setCategory("")}
                className={`block text-xs w-full text-left py-1 transition-colors ${
                  !category ? "text-gold font-semibold" : "text-charcoal/70 hover:text-gold"
                }`}
              >
                All Categories
              </button>
              {filters.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`block text-xs w-full text-left py-1 transition-colors ${
                    category === cat ? "text-gold font-semibold" : "text-charcoal/70 hover:text-gold"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-muted font-medium mb-3">
              Gender
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setGender("")}
                className={`block text-xs w-full text-left py-1 transition-colors ${
                  !gender ? "text-gold font-semibold" : "text-charcoal/70 hover:text-gold"
                }`}
              >
                All Genders
              </button>
              {filters.genders.map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(gender === g ? "" : g)}
                  className={`block text-xs w-full text-left py-1 transition-colors ${
                    gender === g ? "text-gold font-semibold" : "text-charcoal/70 hover:text-gold"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Fragrance Notes Filter */}
          {filters.notes && filters.notes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs tracking-widest uppercase text-muted font-medium">
                  Fragrance Notes
                </h3>
                {note && (
                  <button
                    onClick={() => setNote("")}
                    className="text-[11px] text-gold hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {filters.notes.map((n) => {
                  const isActive = note.toLowerCase() === n.toLowerCase();
                  return (
                    <button
                      key={n}
                      onClick={() => setNote(isActive ? "" : n)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                        isActive
                          ? "bg-gold text-white border-gold font-medium shadow-xs"
                          : "bg-ivory/80 text-charcoal/80 border-charcoal/15 hover:border-gold/50"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured only checkbox */}
          <div className="pt-2 border-t border-charcoal/10">
            <label className="flex items-center gap-2 text-xs cursor-pointer text-charcoal/80 font-medium">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-gold w-4 h-4 rounded"
              />
              Bestsellers only
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-cream animate-pulse rounded-sm" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-charcoal/5 rounded-sm p-8">
              <p className="font-display text-2xl text-charcoal mb-2">No Fragrances Found</p>
              <p className="text-xs text-muted mb-6">
                Try adjusting or clearing your search and filter criteria.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-block bg-charcoal text-white px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-gold transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
