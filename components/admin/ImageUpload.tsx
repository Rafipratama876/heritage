"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { HiOutlineUpload, HiOutlineTrash, HiPlus } from "react-icons/hi";
import { adminUploadImages } from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";

export default function ImageUpload({
  value,
  onChange,
  multiple = true,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [manualUrl, setManualUrl] = useState("");

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const token = readToken();
    if (!token) {
      setError("You're not logged in.");
      showToast("You're not logged in.", "error");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const urls = await adminUploadImages(token, Array.from(fileList));
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(message);
      showToast(message, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    onChange(multiple ? [...value, url] : [url]);
    setManualUrl("");
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {value.map((url, i) => (
            <div key={i} className="relative w-20 h-20 bg-surface border border-line group">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove image"
                className="absolute inset-0 bg-canvas/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-clay"
              >
                <HiOutlineTrash />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-clay text-xs mb-2">{error}</p>}

      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn("btn-outline !py-2 !px-4 text-xs", uploading && "opacity-60 pointer-events-none")}
        >
          <HiOutlineUpload /> {uploading ? "Uploading…" : "Upload image" + (multiple ? "s" : "")}
        </button>

        <span className="text-xs text-muted">or</span>

        <div className="flex items-center gap-2">
          <input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste an image URL"
            className="input !py-2 text-xs w-56"
          />
          <button
            type="button"
            onClick={addManualUrl}
            className="text-xs text-brass hover:text-ivory transition-colors flex items-center gap-1"
          >
            <HiPlus /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
