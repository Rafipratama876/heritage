"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { useDebounce } from "@/hooks/useDebounce";
import { Product, Collection } from "@/types";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Batik", label: "Batik" },
  { value: "Songket and Tenun", label: "Songket and Tenun" },
  { value: "Kebaya", label: "Kebaya" },
  { value: "Accessories and Jewelry", label: "Accessories and Jewelry" },
  { value: "Bag", label: "Bag" },
  { value: "Jewelry", label: "Jewelry" },
  { value: "Plate", label: "Plate" },
  { value: "Other Accessories", label: "Other Accessories" },
];

export default function ProductsClient({
  initialProducts,
  collections,
}: {
  initialProducts: Product[];
  collections: Collection[];
}) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState("all");
  const [collection, setCollection] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 300);

  const collectionOptions = [
    { value: "all", label: "All Collections" },
    ...collections.map((c) => ({ value: c.slug, label: c.name })),
  ];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const min = minPrice.trim() ? Number(minPrice) : null;
    const max = maxPrice.trim() ? Number(maxPrice) : null;

    const result = initialProducts.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        collections.some(
          (c) => p.collections.includes(c.slug) && c.name.toLowerCase().includes(q)
        );
      const matchesCategory = category === "all" || p.categories.includes(category as any);
      const matchesCollection = collection === "all" || p.collections.includes(collection);
      // Products with no price are excluded once a price filter is set —
      // there's nothing to compare against.
      const matchesMin = min === null || Number.isNaN(min) || (p.price !== null && p.price >= min);
      const matchesMax = max === null || Number.isNaN(max) || (p.price !== null && p.price <= max);
      return matchesQuery && matchesCategory && matchesCollection && matchesMin && matchesMax;
    });

    const sorted = [...result];
    if (sortBy === "price-asc") {
      // No-price products sort to the end regardless of direction.
      sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    } else if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // "featured" (default): featured pieces first, otherwise keep
      // catalog order.
      sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }

    return sorted;
  }, [initialProducts, collections, debouncedQuery, category, collection, minPrice, maxPrice, sortBy]);

  return (
    <>
      <div className="mb-12 max-w-2xl">
        <p className="eyebrow mb-3">Full Catalog</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ivory">
          All Products
        </h1>
        <p className="text-muted mt-4">
          {initialProducts.length} pieces, made to order by our artisan workshops.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <SearchBar value={query} onChange={setQuery} />
          <FilterBar
            title="Category"
            options={CATEGORY_OPTIONS}
            active={category}
            onChange={setCategory}
          />
          <FilterBar
            title="Collection"
            options={collectionOptions}
            active={collection}
            onChange={setCollection}
          />
          <div>
            <p className="eyebrow mb-3">Price Range (IDR)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="input !py-2 text-xs"
              />
              <span className="text-muted text-xs">–</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="input !py-2 text-xs"
              />
            </div>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6 gap-4">
            <p className="text-sm text-muted">{filtered.length} products</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="input !py-2 !w-auto text-xs"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
            </select>
          </div>

          {loading ? (
            <ProductGridSkeleton />
          ) : filtered.length === 0 ? (
            <div className="border border-line py-24 text-center">
              <p className="text-muted">
                No products match your search. Try a different keyword or
                clear the filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-12">
              {filtered.map((p, i) => (
                <ProductCard product={p} key={p.id} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
