"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CollectionForm from "@/components/admin/CollectionForm";
import { adminFetchCollections } from "@/lib/api";
import type { Collection } from "@/types";

export default function EditCollectionPage() {
  const params = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetchCollections()
      .then((all) => {
        const found = all.find((c) => c.slug === params.slug);
        if (!found) {
          setError("Collection not found");
        } else {
          setCollection(found);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load collection"));
  }, [params.slug]);

  return (
    <div>
      <p className="eyebrow mb-2">Catalog</p>
      <h1 className="font-display text-3xl text-ivory mb-8">Edit Collection</h1>
      {error && <p className="text-clay text-sm">{error}</p>}
      {!error && !collection && <p className="text-muted text-sm">Loading…</p>}
      {collection && <CollectionForm mode="edit" initialCollection={collection} />}
    </div>
  );
}
