"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GalleryForm from "@/components/admin/GalleryForm";
import { adminFetchGalleryItems } from "@/lib/api";
import type { GalleryItem } from "@/types";

export default function EditGalleryItemPage() {
  const params = useParams<{ slug: string }>();
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetchGalleryItems()
      .then((all) => {
        const found = all.find((i) => i.slug === params.slug);
        if (!found) {
          setError("Gallery item not found");
        } else {
          setItem(found);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load gallery item"));
  }, [params.slug]);

  return (
    <div>
      <p className="eyebrow mb-2">Content</p>
      <h1 className="font-display text-3xl text-ivory mb-8">Edit Gallery Item</h1>
      {error && <p className="text-clay text-sm">{error}</p>}
      {!error && !item && <p className="text-muted text-sm">Loading…</p>}
      {item && <GalleryForm mode="edit" initialItem={item} />}
    </div>
  );
}
