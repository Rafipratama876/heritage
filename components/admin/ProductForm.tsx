"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiPlus, HiOutlineTrash } from "react-icons/hi";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminFetchCollections,
  ProductInput,
} from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import ImageUpload from "@/components/admin/ImageUpload";
import VideoUpload from "@/components/admin/VideoUpload";
import type { Product, Collection, Category } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORIES: Category[] = [
  "Batik",
  "Songket and Tenun",
  "Kebaya",
  "Accessories and Jewelry",
  "Bag",
  "Jewelry",
  "Plate",
  "Other Accessories",
];

export default function ProductForm({
  mode,
  initialProduct,
}: {
  mode: "create" | "edit";
  initialProduct?: Product;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState(initialProduct?.code ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [noPrice, setNoPrice] = useState(initialProduct ? initialProduct.price == null : false);
  const [price, setPrice] = useState(String(initialProduct?.price ?? ""));
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [collectionSlugs, setCollectionSlugs] = useState<string[]>(initialProduct?.collections ?? []);
  const [categories, setCategories] = useState<Category[]>(initialProduct?.categories ?? []);
  const [featured, setFeatured] = useState(initialProduct?.featured ?? false);
  const [available, setAvailable] = useState(initialProduct?.available ?? true);
  const [images, setImages] = useState<string[]>(initialProduct?.images ?? []);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialProduct?.videoUrl ?? null);
  const [specs, setSpecs] = useState(
    initialProduct?.specifications?.length
      ? initialProduct.specifications
      : [{ label: "", value: "" }]
  );

  useEffect(() => {
    adminFetchCollections()
      .then((c) => {
        setCollections(c);
        setCollectionSlugs((prev) => (prev.length ? prev : c.length ? [c[0].slug] : []));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleCollection(slug: string) {
    setCollectionSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function toggleCategory(cat: Category) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  function updateSpec(index: number, field: "label" | "value", value: string) {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addSpec() {
    setSpecs((prev) => [...prev, { label: "", value: "" }]);
  }

  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    function fail(message: string) {
      setError(message);
      showToast(message, "error");
    }

    const token = readToken();
    if (!token) {
      fail("You're not logged in.");
      return;
    }
    if (!noPrice && price.trim() === "") {
      fail("Enter a price, or check \"No price\".");
      return;
    }
    if (images.length === 0) {
      fail("At least one image is required.");
      return;
    }
    if (categories.length === 0) {
      fail("Select at least one category.");
      return;
    }
    if (collectionSlugs.length === 0) {
      fail("Select at least one collection.");
      return;
    }

    const input: ProductInput = {
      code,
      slug,
      name,
      price: noPrice ? null : Number(price),
      shortDescription,
      description,
      collectionSlugs,
      categories,
      images,
      videoUrl,
      specifications: specs.filter((s) => s.label.trim() && s.value.trim()),
      featured,
      available,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        await adminCreateProduct(token, input);
        showToast("Product created.", "success");
      } else {
        await adminUpdateProduct(token, initialProduct!.slug, input);
        showToast("Product updated.", "success");
      }
      router.push("/admin/products");
    } catch (err) {
      fail(err instanceof Error ? err.message : "Failed to save product");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <p className="text-clay text-sm">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Code">
          <input value={code} onChange={(e) => setCode(e.target.value)} required className="input" />
        </Field>
        <Field label="Slug">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="input" />
        </Field>
      </div>

      <Field label="Name">
        <input value={name} onChange={(e) => setName(e.target.value)} required className="input" />
      </Field>

      <Field label="Price (IDR)">
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={noPrice}
          required={!noPrice}
          className="input disabled:opacity-40"
        />
        <label className="flex items-center gap-2 text-sm text-ivory/80 mt-2">
          <input
            type="checkbox"
            checked={noPrice}
            onChange={(e) => setNoPrice(e.target.checked)}
            className="accent-brass"
          />
          No price (display &amp; inquiry only — shown as &quot;Contact for price&quot;, orders routed through WhatsApp instead of Add to Cart)
        </label>
      </Field>

      <Field label="Categories (select one or more)">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => toggleCategory(c)}
              className={cn(
                "text-xs px-3 py-1.5 border transition-colors",
                categories.includes(c)
                  ? "bg-brass border-brass text-canvas"
                  : "border-line text-ivory/70 hover:border-brass"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Collections (select one or more)">
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <button
              type="button"
              key={c.slug}
              onClick={() => toggleCollection(c.slug)}
              className={cn(
                "text-xs px-3 py-1.5 border transition-colors",
                collectionSlugs.includes(c.slug)
                  ? "bg-brass border-brass text-canvas"
                  : "border-line text-ivory/70 hover:border-brass"
              )}
            >
              {c.parent ? `${c.parent.name} → ${c.name}` : c.name}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Short Description">
        <input
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          required
          className="input"
        />
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

      <Field label="Images">
        <ImageUpload value={images} onChange={setImages} />
      </Field>

      <Field label="Product Video (optional)">
        <VideoUpload value={videoUrl} onChange={setVideoUrl} />
      </Field>

      <div>
        <label className="eyebrow mb-2 block">Specifications</label>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={s.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
                placeholder="Material"
                className="input flex-1"
              />
              <input
                value={s.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                placeholder="100% cotton"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => removeSpec(i)}
                className="text-ivory/50 hover:text-clay px-2"
                aria-label="Remove specification"
              >
                <HiOutlineTrash />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSpec}
          className="text-xs text-brass hover:text-ivory transition-colors mt-2 flex items-center gap-1"
        >
          <HiPlus /> Add specification
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-ivory/80">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="accent-brass"
        />
        Featured (shown on homepage)
      </label>

      <label className="flex items-center gap-2 text-sm text-ivory/80">
        <input
          type="checkbox"
          checked={!available}
          onChange={(e) => setAvailable(!e.target.checked)}
          className="accent-clay"
        />
        Unavailable (hides Order/Add to Cart — no stock tracking, this is a manual switch)
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className={cn("btn-primary !py-2.5 !px-6 text-sm", saving && "opacity-60")}>
          {saving ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
      </div>
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
