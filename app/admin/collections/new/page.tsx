"use client";

import CollectionForm from "@/components/admin/CollectionForm";

export default function NewCollectionPage() {
  return (
    <div>
      <p className="eyebrow mb-2">Catalog</p>
      <h1 className="font-display text-3xl text-ivory mb-8">New Collection</h1>
      <CollectionForm mode="create" />
    </div>
  );
}
