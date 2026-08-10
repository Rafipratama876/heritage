import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import GalleryMasonry from "@/components/GalleryMasonry";
import { getGalleryItems } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Exhibitions, workshop visits, and events from Rizal Heritage's artisan workshops across Indonesia.",
};

// Rendered per-request (not pre-rendered at build time) — the backend
// isn't reachable during `docker compose build`.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const galleryItems = await getGalleryItems();

  return (
    <div className="container-content pt-32 pb-24">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Gallery" }]} />

      <div className="mb-16 max-w-2xl">
        <p className="eyebrow mb-3">Moments &amp; Memories</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ivory">
          Gallery
        </h1>
        <p className="text-muted mt-4">
          Exhibitions, workshop visits, and events from our artisan
          community. Tap any photo to view it full size.
        </p>
      </div>

      <GalleryMasonry items={galleryItems} />
    </div>
  );
}
