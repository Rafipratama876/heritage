"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { adminFetchProduct } from "@/lib/api";
import type { Product } from "@/types";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetchProduct(params.slug)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load product"));
  }, [params.slug]);

  return (
    <div>
      <p className="eyebrow mb-2">Catalog</p>
      <h1 className="font-display text-3xl text-ivory mb-8">Edit Product</h1>
      {error && <p className="text-clay text-sm">{error}</p>}
      {!error && !product && <p className="text-muted text-sm">Loading…</p>}
      {product && <ProductForm mode="edit" initialProduct={product} />}
    </div>
  );
}
