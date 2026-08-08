import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ProductGallery from "@/components/ProductGallery";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";
import AddToCartForm from "@/components/AddToCartForm";
import ShareButton from "@/components/ShareButton";
import ProductViewTracker from "@/components/ProductViewTracker";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { getProduct, getRelatedProducts } from "@/lib/products";
import { getCollection } from "@/lib/collections";
import { formatIDR } from "@/lib/utils";

// Rendered per-request (not pre-generated at build time) since product
// data comes from a live database that may not be reachable during
// `docker compose build` — see app/products/[slug]/loading.tsx for the
// instant navigation feedback in the meantime.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const [collection, related] = await Promise.all([
    product.collections[0] ? getCollection(product.collections[0]) : Promise.resolve(undefined),
    getRelatedProducts(product.slug),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.code,
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="container-content pt-32 pb-24">
      <ProductViewTracker productId={product.id} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          ...(collection
            ? [{ label: collection.name, href: `/collections/${collection.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <ProductGallery images={product.images} videoUrl={product.videoUrl} alt={product.name} />

        <div>
          <p className="eyebrow mb-2">
            {product.categories.join(" · ")} · {product.code}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory leading-tight">
            {product.name}
          </h1>
          <p className="font-mono text-xl text-brass mt-4">
            {formatIDR(product.price)}
          </p>
          <p className="text-muted mt-6 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8 space-y-3">
            <AddToCartForm product={product} />
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <WhatsAppOrderButton productId={product.id} productName={product.name} />
              </div>
              <ShareButton productId={product.id} title={product.name} text={product.shortDescription} />
            </div>
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <h2 className="eyebrow mb-4">Specifications</h2>
            <dl className="divide-y divide-line">
              {product.specifications.map((spec) => (
                <div
                  key={spec.label}
                  className="flex justify-between py-3 text-sm gap-4"
                >
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="text-ivory text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {collection && (
            <div className="mt-8">
              <Link
                href={`/collections/${collection.slug}`}
                className="text-sm text-brass hover:text-ivory transition-colors"
              >
                Part of the {collection.name} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-28">
          <SectionHeading eyebrow="You Might Also Like" title="Related Pieces" />
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12">
            {related.map((p, i) => (
              <ProductCard product={p} key={p.id} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
