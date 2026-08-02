import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import { getCollection } from "@/lib/collections";

// Rendered per-request (not pre-generated at build time) — see
// app/products/[slug]/page.tsx for why.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const collection = await getCollection(params.slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const collection = await getCollection(params.slug);
  if (!collection) notFound();

  const collectionProducts = collection.products;

  return (
    <div>
      <div className="relative h-[50vh] min-h-[380px] flex items-end border-b border-line overflow-hidden">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-canvas/10" />
        <div className="container-content relative pb-12">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Collections", href: "/collections" },
              ...(collection.parent
                ? [{ label: collection.parent.name, href: `/collections/${collection.parent.slug}` }]
                : []),
              { label: collection.name },
            ]}
          />
          <p className="eyebrow mb-3">{collectionProducts.length} Pieces</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ivory">
            {collection.name}
          </h1>
          <p className="text-muted mt-4 max-w-lg">{collection.description}</p>
        </div>
      </div>

      <div className="container-content py-20">
        {!!collection.children?.length && (
          <div className="mb-14">
            <p className="eyebrow mb-4">Sub-Collections</p>
            <div className="flex flex-wrap gap-3">
              {collection.children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/collections/${child.slug}`}
                  className="btn-outline !py-2.5 !px-5 text-sm"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {collectionProducts.length === 0 ? (
          <p className="text-muted text-center py-16">
            New pieces from this collection are coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
            {collectionProducts.map((p, i) => (
              <ProductCard product={p} key={p.id} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
