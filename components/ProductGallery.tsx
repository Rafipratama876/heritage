"use client";

import { useState } from "react";
import Image from "next/image";
import { HiOutlineArrowsExpand } from "react-icons/hi";
import Lightbox from "./Lightbox";
import { cn } from "@/lib/utils";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setLightboxOpen(true)}
        className="relative w-full aspect-square label-frame overflow-hidden group block"
        aria-label="Enlarge image"
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-3 right-3 flex items-center gap-2 bg-canvas/80 text-ivory text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <HiOutlineArrowsExpand /> Enlarge
        </span>
      </button>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={active === i}
              className={cn(
                "relative aspect-square overflow-hidden border transition-colors",
                active === i ? "border-brass" : "border-line hover:border-muted",
              )}
            >
              <Image src={img} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={images}
          index={active}
          alt={alt}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActive}
        />
      )}
    </div>
  );
}
