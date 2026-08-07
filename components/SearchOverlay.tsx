"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HiX, HiOutlineSearch } from "react-icons/hi";
import { searchProducts, trackSearch } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { formatIDR } from "@/lib/utils";
import type { Product } from "@/types";

export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Live results as the user types, debounced for UX — this does NOT
  // record search insight, since a partial/in-progress query isn't a
  // meaningful "search" yet (see handleSubmit below).
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    searchProducts(debouncedQuery)
      .then((products) => {
        if (!cancelled) setResults(products);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Search Insight (keyword tracking) only fires here, on explicit submit
  // (Enter key or "View all results" click) — not on every keystroke.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    trackSearch(trimmed, results.length);
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    onClose();
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
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 inset-x-0 z-[95] bg-canvas border-b border-line"
            role="dialog"
            aria-label="Search products"
          >
            <div className="container-content py-6">
              <form onSubmit={handleSubmit} className="flex items-center gap-4">
                <HiOutlineSearch className="text-xl text-muted shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search batik, songket, kebaya, jewelry…"
                  className="flex-1 bg-transparent font-display text-xl sm:text-2xl text-ivory placeholder:text-muted/70 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={onClose}
                  className="text-ivory/70 hover:text-ivory text-2xl p-1 shrink-0"
                >
                  <HiX />
                </button>
              </form>

              {query.trim() && (
                <div className="mt-6 max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <p className="text-sm text-muted py-4">Searching…</p>
                  ) : results.length === 0 ? (
                    <p className="text-sm text-muted py-4">
                      No products found for &ldquo;{query}&rdquo;.
                    </p>
                  ) : (
                    <ul className="divide-y divide-line">
                      {results.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-4 py-3 group"
                          >
                            <div className="relative w-14 h-16 shrink-0 bg-surface border border-line overflow-hidden">
                              {product.images[0] && (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-base text-ivory group-hover:text-brass transition-colors truncate">
                                {product.name}
                              </p>
                              <p className="font-mono text-xs text-muted mt-0.5">
                                {formatIDR(product.price)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {results.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="text-xs text-brass hover:text-ivory transition-colors mt-2 mb-1"
                    >
                      View all results for &ldquo;{query}&rdquo; →
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
