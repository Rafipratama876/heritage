"use client";

import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <p className="eyebrow mb-2">Catalog</p>
      <h1 className="font-display text-3xl text-ivory mb-8">New Product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
