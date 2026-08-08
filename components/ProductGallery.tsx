"use client";

import { useState } from "react";
import Image from "next/image";
import { HiOutlineArrowsExpand, HiOutlinePlay } from "react-icons/hi";
import Lightbox from "./Lightbox";
import { cn } from "@/lib/utils";

export default function ProductGallery({
  images,
  videoUrl,
  alt,
}: {
  images: string[];
  videoUrl?: string | null;
  alt: string;
}) {
  // "image" shows `images[active]` in the main frame; "video" shows
  // `videoUrl` instead. Kept as a separate mode (rather than treating
  // the video as one more numeric index) so the image-only Lightbox
  // below doesn't need to know videos exist at all.
  const [mode, setMode] = useState<"image" | "video">("image");
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const showThumbnails = images.length > 1 || Boolean(videoUrl);

  return (
    <div>
      {mode === "video" && videoUrl ? (
        <div className="relative w-full aspect-square label-frame overflow-hidden bg-canvas">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- product showcase clips are silent/source-provided, no captions available */}
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
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
      )}

      {showThumbnails && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => {
                setMode("image");
                setActive(i);
              }}
              aria-label={`View image ${i + 1}`}
              aria-pressed={mode === "image" && active === i}
              className={cn(
                "relative aspect-square overflow-hidden border transition-colors",
                mode === "image" && active === i ? "border-brass" : "border-line hover:border-muted",
              )}
            >
              <Image src={img} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}

          {videoUrl && (
            <button
              onClick={() => setMode("video")}
              aria-label="Play product video"
              aria-pressed={mode === "video"}
              className={cn(
                "relative aspect-square overflow-hidden border bg-canvas flex items-center justify-center transition-colors",
                mode === "video" ? "border-brass" : "border-line hover:border-muted",
              )}
            >
              <HiOutlinePlay className="text-2xl text-ivory/80" />
            </button>
          )}
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
