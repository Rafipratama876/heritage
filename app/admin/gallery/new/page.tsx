"use client";

import GalleryForm from "@/components/admin/GalleryForm";

export default function NewGalleryItemPage() {
  return (
    <div>
      <p className="eyebrow mb-2">Content</p>
      <h1 className="font-display text-3xl text-ivory mb-8">New Gallery Item</h1>
      <GalleryForm mode="create" />
    </div>
  );
}
