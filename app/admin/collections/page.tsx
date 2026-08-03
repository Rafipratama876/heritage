"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiPlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { adminFetchCollections, adminDeleteCollection } from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types";

export default function AdminCollectionsPage() {
  const { showToast } = useToast();
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [error, setError] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    function load() {
      adminFetchCollections()
        .then(setCollections)
        .catch((e) => {
          const message = e instanceof Error ? e.message : "Failed to load collections";
          setError(message);
          showToast(message, "error");
        });
    }
    
    load();
  }, []);

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Delete "${name}"? Products in this collection will need reassigning first.`)) return;
    const token = readToken();
    if (!token) return;
    setDeletingSlug(slug);
    try {
      await adminDeleteCollection(token, slug);
      setCollections((prev) => (prev ? prev.filter((c) => c.slug !== slug) : prev));
      showToast(`"${name}" was deleted.`, "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete collection";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="eyebrow mb-2">Catalog</p>
          <h1 className="font-display text-3xl text-ivory">Collections</h1>
        </div>
        <Link href="/admin/collections/new" className="btn-primary !py-2.5 !px-5 text-sm">
          <HiPlus /> New Collection
        </Link>
      </div>

      {error && <p className="text-clay text-sm mb-4">{error}</p>}

      {!collections ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortHierarchy(collections).map((c) => (
            <div
              key={c.slug}
              className={cn("border border-line flex gap-4 p-4", c.parent && "ml-6 border-dashed")}
            >
              <div className="relative w-20 h-20 bg-surface shrink-0">
                <Image src={c.image} alt={c.name} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 min-w-0">
                {c.parent && (
                  <p className="text-[10px] font-mono text-brass mb-1">↳ Sub-collection of {c.parent.name}</p>
                )}
                <p className="font-display text-lg text-ivory">{c.name}</p>
                <p className="text-sm text-muted truncate">{c.tagline}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Link
                    href={`/admin/collections/${c.slug}/edit`}
                    className="text-xs text-ivory/70 hover:text-brass transition-colors flex items-center gap-1"
                  >
                    <HiOutlinePencil /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.slug, c.name)}
                    disabled={deletingSlug === c.slug}
                    className="text-xs text-ivory/70 hover:text-clay transition-colors flex items-center gap-1 disabled:opacity-40"
                  >
                    <HiOutlineTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Flattens the list so each top-level collection is immediately
// followed by its own children, for a simple indented "tree" look
// without needing real recursive UI.
function sortHierarchy(collections: Collection[]): Collection[] {
  const topLevel = collections.filter((c) => !c.parent);
  const result: Collection[] = [];
  for (const top of topLevel) {
    result.push(top);
    collections
      .filter((c) => c.parent?.slug === top.slug)
      .forEach((child) => result.push(child));
  }
  // Any orphaned/unmatched rows (shouldn't normally happen) go last.
  const seen = new Set(result.map((c) => c.slug));
  collections.forEach((c) => {
    if (!seen.has(c.slug)) result.push(c);
  });
  return result;
}
