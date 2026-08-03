"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";
import { GalleryItem } from "@/types";

export default function GalleryMasonry({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const images = items.map((i) => i.image);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={(i % 6) * 0.05} className="break-inside-avoid">
            <button
              onClick={() => setOpenIndex(i)}
              className="relative block w-full overflow-hidden label-frame group text-left"
              style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/5" }}
              aria-label={`Enlarge ${item.title}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                <span className="eyebrow">{item.tag} · {item.date}</span>
                <h3 className="font-display text-lg text-ivory mt-1">{item.title}</h3>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          alt={items[openIndex].title}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
}
