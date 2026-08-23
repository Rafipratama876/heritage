import Breadcrumb from '@/Components/Breadcrumb';
import FilterBar from '@/Components/FilterBar';
import ProductCard from '@/Components/ProductCard';
import SearchBar from '@/Components/SearchBar';
import { ProductGridSkeleton } from '@/Components/Skeletons';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { useDebounce } from '@/hooks/useDebounce';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function ProductsIndex({ products, collections, categories, initialSearch }) {
    const [query, setQuery] = useState(initialSearch ?? '');
    const [category, setCategory] = useState('all');
    const [collection, setCollection] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [loading, setLoading] = useState(true);
    const debouncedQuery = useDebounce(query, 300);

    const categoryOptions = [{ value: 'all', label: 'All Categories' }, ...categories];
    const collectionOptions = [
        { value: 'all', label: 'All Collections' },
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

        const result = products.filter((p) => {
            const collectionSlugs = p.collections.map((c) => c.slug);
            const matchesQuery =
                !q ||
                p.name.toLowerCase().includes(q) ||
                collections.some((c) => collectionSlugs.includes(c.slug) && c.name.toLowerCase().includes(q));
            const matchesCategory = category === 'all' || p.categories.some((c) => c.value === category);
            const matchesCollection = collection === 'all' || collectionSlugs.includes(collection);
            const matchesMin = min === null || Number.isNaN(min) || p.price >= min;
            const matchesMax = max === null || Number.isNaN(max) || p.price <= max;
            return matchesQuery && matchesCategory && matchesCollection && matchesMin && matchesMax;
        });

        const sorted = [...result];
        if (sortBy === 'price-asc') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name-asc') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
        }

        return sorted;
    }, [products, collections, debouncedQuery, category, collection, minPrice, maxPrice, sortBy]);

    return (
        <StorefrontLayout>
            <Head title="Products" />

            <div className="container-content pt-32 pb-24">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />

                <div className="mb-12 max-w-2xl">
                    <p className="eyebrow mb-3">Full Catalog</p>
                    <h1 className="font-display text-4xl sm:text-5xl text-ivory">All Products</h1>
                    <p className="text-muted mt-4">
                        {products.length} pieces, made to order by our artisan workshops.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
                    <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
                        <SearchBar value={query} onChange={setQuery} />
                        <FilterBar
                            title="Category"
                            options={categoryOptions}
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
                                    No products match your search. Try a different keyword or clear the
                                    filters.
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
            </div>
        </StorefrontLayout>
    );
}
