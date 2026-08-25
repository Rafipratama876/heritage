import { formatPrice } from '@/lib/format';
import { trackSearch } from '@/lib/track';
import { Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { HiOutlineSearch, HiX } from 'react-icons/hi';

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function SearchOverlay({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const inputRef = useRef(null);
    const debounced = useDebounce(query, 300);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
        else setQuery('');
    }, [isOpen]);

    useEffect(() => {
        if (!debounced.trim()) {
            setResults([]);
            return;
        }
        let cancelled = false;
        axios
            .get('/api/products/search', { params: { search: debounced, limit: 5 } })
            .then(({ data }) => {
                if (!cancelled) setResults(data?.products ?? []);
            })
            .catch(() => {
                if (!cancelled) setResults([]);
            });
        return () => {
            cancelled = true;
        };
    }, [debounced]);

    function submitSearch(e) {
        e?.preventDefault();
        if (!query.trim()) return;
        trackSearch(query.trim(), results.length);
        onClose();
        router.visit(`/products?search=${encodeURIComponent(query.trim())}`);
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[90] bg-black/60"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed top-0 inset-x-0 z-[95] bg-canvas border-b border-line"
                    >
                        <div className="container-content py-6">
                            <form onSubmit={submitSearch} className="flex items-center gap-4">
                                <HiOutlineSearch className="text-2xl text-muted shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search products…"
                                    className="flex-1 bg-transparent font-display text-xl sm:text-2xl text-ivory placeholder:text-muted/70 focus:outline-none text-center"
                                />
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close search"
                                    className="text-ivory/70 hover:text-brass text-2xl shrink-0"
                                >
                                    <HiX />
                                </button>
                            </form>

                            {results.length > 0 && (
                                <div className="mt-4">
                                    <ul className="divide-y divide-line">
                                        {results.map((product) => (
                                            <li key={product.slug}>
                                                <Link
                                                    href={`/products/${product.slug}`}
                                                    onClick={onClose}
                                                    className="flex items-center gap-4 py-3 group"
                                                >
                                                    <div className="relative w-14 h-16 shrink-0 bg-surface border border-line overflow-hidden">
                                                        {product.images?.[0] && (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-display text-base text-ivory group-hover:text-brass transition-colors truncate">
                                                            {product.name}
                                                        </p>
                                                        <p className="font-mono text-xs text-muted mt-0.5">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        type="button"
                                        onClick={submitSearch}
                                        className="text-xs text-brass hover:text-ivory transition-colors mt-2 mb-1"
                                    >
                                        View all results
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
