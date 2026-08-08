"use client";

import { useRef, useState } from "react";
import { HiOutlineUpload, HiOutlineTrash } from "react-icons/hi";
import { adminUploadVideo } from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";

export default function VideoUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [manualUrl, setManualUrl] = useState("");

  async function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const token = readToken();
    if (!token) {
      setError("You're not logged in.");
      showToast("You're not logged in.", "error");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const url = await adminUploadVideo(token, file);
      onChange(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(message);
      showToast(message, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    onChange(url);
    setManualUrl("");
  }

  return (
    <div>
      {value && (
        <div className="relative w-48 mb-3 bg-surface border border-line group">
          <video src={value} controls className="w-full aspect-video bg-black" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove video"
            className="absolute top-1 right-1 bg-canvas/80 p-1.5 text-clay opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <HiOutlineTrash />
          </button>
        </div>
      )}

      {error && <p className="text-clay text-xs mb-2">{error}</p>}

      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          onChange={(e) => handleFile(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn("btn-outline !py-2 !px-4 text-xs", uploading && "opacity-60 pointer-events-none")}
        >
          <HiOutlineUpload /> {uploading ? "Uploading…" : value ? "Replace video" : "Upload video"}
        </button>

        <span className="text-xs text-muted">or</span>

        <div className="flex items-center gap-2">
          <input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste a video URL"
            className="input !py-2 text-xs w-56"
          />
          <button
            type="button"
            onClick={addManualUrl}
            className="text-xs text-brass hover:text-ivory transition-colors flex items-center gap-1"
          >
            Set
          </button>
        </div>
      </div>
      <p className="text-xs text-muted mt-1.5">MP4, WEBM, OGG, or MOV — up to 100MB. Optional.</p>
    </div>
  );
}
