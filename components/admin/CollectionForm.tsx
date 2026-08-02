"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateCollection,
  adminUpdateCollection,
  adminFetchCollections,
  CollectionInput,
} from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Collection } from "@/types";
import { cn } from "@/lib/utils";

export default function CollectionForm({
  mode,
  initialCollection,
}: {
  mode: "create" | "edit";
  initialCollection?: Collection;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);

  const [slug, setSlug] = useState(initialCollection?.slug ?? "");
  const [name, setName] = useState(initialCollection?.name ?? "");
  const [tagline, setTagline] = useState(initialCollection?.tagline ?? "");
  const [description, setDescription] = useState(initialCollection?.description ?? "");
  const [image, setImage] = useState(initialCollection?.image ?? "");
  const [parentSlug, setParentSlug] = useState(initialCollection?.parent?.slug ?? "");

  useEffect(() => {
    adminFetchCollections()
      .then(setAllCollections)
      .catch(() => {});
  }, []);

  // A collection can't be its own parent — exclude it from the options
  // when editing.
  const parentOptions = allCollections.filter((c) => c.slug !== initialCollection?.slug);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const token = readToken();
    if (!token) {
      setError("You're not logged in.");
      showToast("You're not logged in.", "error");
      return;
    }

    const input: CollectionInput = {
      slug,
      name,
      tagline,
      description,
      image,
      parentSlug: parentSlug || null,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        await adminCreateCollection(token, input);
        showToast("Collection created.", "success");
      } else {
        await adminUpdateCollection(token, initialCollection!.slug, input);
        showToast("Collection updated.", "success");
      }
      router.push("/admin/collections");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save collection";
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
      <Field label="Name">
        <input value={name} onChange={(e) => setName(e.target.value)} required className="input" />
      </Field>
      <Field label="Parent Collection (optional)">
        <select value={parentSlug} onChange={(e) => setParentSlug(e.target.value)} className="input">
          <option value="">None — this is a top-level collection</option>
          {parentOptions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.parent ? `${c.parent.name} → ${c.name}` : c.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted mt-1.5">
          e.g. "Songket Palembang" could sit under the parent "Songket and Tenun".
        </p>
      </Field>
      <Field label="Tagline">
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} required className="input" />
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
      <Field label="Image">
        <ImageUpload
          value={image ? [image] : []}
          onChange={(urls) => setImage(urls[0] ?? "")}
          multiple={false}
        />
      </Field>

      <button type="submit" disabled={saving} className={cn("btn-primary !py-2.5 !px-6 text-sm", saving && "opacity-60")}>
        {saving ? "Saving…" : mode === "create" ? "Create Collection" : "Save Changes"}
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
