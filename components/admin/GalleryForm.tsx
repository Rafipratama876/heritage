"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateGalleryItem, adminUpdateGalleryItem, GalleryInput } from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import ImageUpload from "@/components/admin/ImageUpload";
import type { GalleryItem } from "@/types";
import { cn } from "@/lib/utils";

const TAGS: GalleryItem["tag"][] = ["Exhibition", "Visit", "Event", "Workshop", "Showcase"];

export default function GalleryForm({
  mode,
  initialItem,
}: {
  mode: "create" | "edit";
  initialItem?: GalleryItem;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [slug, setSlug] = useState(initialItem?.slug ?? "");
  const [title, setTitle] = useState(initialItem?.title ?? "");
  const [description, setDescription] = useState(initialItem?.description ?? "");
  const [date, setDate] = useState(initialItem?.date ?? "");
  const [image, setImage] = useState(initialItem?.image ?? "");
  const [tag, setTag] = useState<GalleryItem["tag"]>(initialItem?.tag ?? "Exhibition");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const token = readToken();
    if (!token) {
      setError("You're not logged in.");
      showToast("You're not logged in.", "error");
      return;
    }

    const input: GalleryInput = { slug, title, description, date, image, tag };

    setSaving(true);
    try {
      if (mode === "create") {
        await adminCreateGalleryItem(token, input);
        showToast("Gallery item created.", "success");
      } else {
        await adminUpdateGalleryItem(token, initialItem!.slug, input);
        showToast("Gallery item updated.", "success");
      }
      router.push("/admin/gallery");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save gallery item";
      setError(message);
      showToast(message, "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {error && <p className="text-clay text-sm">{error}</p>}

      <Field label="Slug">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="input" />
      </Field>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input" />
      </Field>
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="input"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date">
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            placeholder="March 2026"
            className="input"
          />
        </Field>
        <Field label="Tag">
          <select value={tag} onChange={(e) => setTag(e.target.value as GalleryItem["tag"])} className="input">
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Image">
        <ImageUpload
          value={image ? [image] : []}
          onChange={(urls) => setImage(urls[0] ?? "")}
          multiple={false}
        />
      </Field>

      <button type="submit" disabled={saving} className={cn("btn-primary !py-2.5 !px-6 text-sm", saving && "opacity-60")}>
        {saving ? "Saving…" : mode === "create" ? "Create Item" : "Save Changes"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow mb-2 block">{label}</label>
      {children}
    </div>
  );
}
