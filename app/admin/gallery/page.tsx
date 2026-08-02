"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiPlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { adminFetchGalleryItems, adminDeleteGalleryItem } from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import type { GalleryItem } from "@/types";

export default function AdminGalleryPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    adminFetchGalleryItems()
      .then(setItems)
      .catch((e) => {
        const message = e instanceof Error ? e.message : "Failed to load gallery items";
        setError(message);
        showToast(message, "error");
      });
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    const token = readToken();
    if (!token) return;
    setDeletingSlug(slug);
    try {
      await adminDeleteGalleryItem(token, slug);
      setItems((prev) => (prev ? prev.filter((i) => i.slug !== slug) : prev));
      showToast(`"${title}" was deleted.`, "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete gallery item";
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
          <p className="eyebrow mb-2">Content</p>
          <h1 className="font-display text-3xl text-ivory">Gallery</h1>
        </div>
        <Link href="/admin/gallery/new" className="btn-primary !py-2.5 !px-5 text-sm">
          <HiPlus /> New Item
        </Link>
      </div>

      {error && <p className="text-clay text-sm mb-4">{error}</p>}

      {!items ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.slug} className="border border-line flex gap-4 p-4">
              <div className="relative w-20 h-20 bg-surface shrink-0">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-brass border border-brass px-1.5 py-0.5">
                  {item.tag}
                </span>
                <p className="font-display text-lg text-ivory mt-1">{item.title}</p>
                <p className="text-sm text-muted">{item.date}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Link
                    href={`/admin/gallery/${item.slug}/edit`}
                    className="text-xs text-ivory/70 hover:text-brass transition-colors flex items-center gap-1"
                  >
                    <HiOutlinePencil /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.slug, item.title)}
                    disabled={deletingSlug === item.slug}
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
