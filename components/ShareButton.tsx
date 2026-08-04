"use client";

import { useState } from "react";
import { HiOutlineShare, HiOutlineLink, HiCheck } from "react-icons/hi";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import { trackProductEvent } from "@/lib/api";

export default function ShareButton({
  productId,
  title,
  text,
}: {
  productId?: string;
  title: string;
  text?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function track() {
    if (productId) trackProductEvent(productId, "SHARE");
  }

  async function handleShareClick() {
    const url = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        track();
      } catch {
        // Person cancelled the native share sheet — nothing to do.
      }
      return;
    }
    setOpen((v) => !v);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      track();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — link is still visible in the address bar.
    }
  }

  function shareUrls() {
    const url = window.location.href;
    return {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShareClick}
        className="flex items-center gap-2 text-sm text-ivory/70 hover:text-brass transition-colors border border-line px-4 py-2.5"
      >
        <HiOutlineShare /> Share
      </button>

      {open && (
        <>
          {/* Click-outside overlay to close the fallback dropdown */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-full left-0 mt-2 w-52 bg-canvas border border-line shadow-lg py-1.5">
            <a
              href={shareUrls().whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={track}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ivory/80 hover:bg-surface hover:text-brass transition-colors"
            >
              <FaWhatsapp /> WhatsApp
            </a>
            <a
              href={shareUrls().facebook}
              target="_blank"
              rel="noopener noreferrer"
              onClick={track}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ivory/80 hover:bg-surface hover:text-brass transition-colors"
            >
              <FaFacebook /> Facebook
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ivory/80 hover:bg-surface hover:text-brass transition-colors text-left"
            >
              {copied ? <HiCheck /> : <HiOutlineLink />}
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
