"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiPlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { adminFetchProducts, adminDeleteProduct } from "@/lib/api";
import { readToken } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { formatIDR } from "@/lib/utils";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    function load() {
      adminFetchProducts()
        .then(setProducts)
        .catch((e) => {
          const message = e instanceof Error ? e.message : "Failed to load products";
          setError(message);
          showToast(message, "error");
        });
    }
    
    load();
  }, []);

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    const token = readToken();
    if (!token) return;
    setDeletingSlug(slug);
    try {
      await adminDeleteProduct(token, slug);
      setProducts((prev) => (prev ? prev.filter((p) => p.slug !== slug) : prev));
      showToast(`"${name}" was deleted.`, "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete product";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="eyebrow mb-2">Catalog</p>
          <h1 className="font-display text-3xl text-ivory">Products</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary !py-2.5 !px-5 text-sm">
          <HiPlus /> New Product
        </Link>
      </div>

      {error && <p className="text-clay text-sm mb-4">{error}</p>}

      {!products ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted text-sm">No products yet.</p>
      ) : (
        <div className="border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="p-3 font-normal text-muted w-16"></th>
                <th className="p-3 font-normal text-muted">Name</th>
                <th className="p-3 font-normal text-muted">Category</th>
                <th className="p-3 font-normal text-muted">Collection</th>
                <th className="p-3 font-normal text-muted text-right">Price</th>
                <th className="p-3 font-normal text-muted w-24"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <div className="relative w-10 h-12 bg-surface">
                      {p.images[0] && (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-ivory">
                    {p.name}
                    {p.featured && (
                      <span className="ml-2 text-[10px] font-mono text-brass border border-brass px-1.5 py-0.5">
                        FEATURED
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted">{p.categories.join(", ")}</td>
                  <td className="p-3 text-muted">{p.collections.join(", ")}</td>
                  <td className="p-3 text-ivory text-right font-mono">{formatIDR(p.price)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.slug}/edit`}
                        className="p-1.5 text-ivory/70 hover:text-brass transition-colors"
                        aria-label={`Edit ${p.name}`}
                      >
                        <HiOutlinePencil />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.slug, p.name)}
                        disabled={deletingSlug === p.slug}
                        className="p-1.5 text-ivory/70 hover:text-clay transition-colors disabled:opacity-40"
                        aria-label={`Delete ${p.name}`}
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
