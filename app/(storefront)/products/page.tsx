import { Suspense } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import ProductsClient from "@/components/ProductsClient";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { getProducts } from "@/lib/products";
import { getCollections } from "@/lib/collections";

// Rendered per-request (not pre-rendered at build time) — the backend
// isn't reachable during `docker compose build`.
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ]);

  return (
    <div className="container-content pt-32 pb-24">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductsClient initialProducts={products} collections={collections} />
      </Suspense>
    </div>
  );
}
