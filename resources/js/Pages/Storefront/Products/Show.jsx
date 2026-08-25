import AddToCartForm from '@/Components/AddToCartForm';
import Breadcrumb from '@/Components/Breadcrumb';
import ProductCard from '@/Components/ProductCard';
import ProductGallery from '@/Components/ProductGallery';
import ProductViewTracker from '@/Components/ProductViewTracker';
import SectionHeading from '@/Components/SectionHeading';
import ShareButton from '@/Components/ShareButton';
import WhatsAppOrderButton from '@/Components/WhatsAppOrderButton';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { formatPrice, hasPrice } from '@/lib/format';
import { Head, Link } from '@inertiajs/react';

export default function ProductShow({ product, related }) {
    const collection = product.collections[0];
    const categoryLabels = product.categories.map((c) => c.label);

    return (
        <StorefrontLayout>
            <Head title={product.name} />
            <ProductViewTracker productId={product.id} />

            <div className="container-content pt-32 pb-24">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Products', href: '/products' },
                        ...(collection
                            ? [{ label: collection.name, href: `/collections/${collection.slug}` }]
                            : []),
                        { label: product.name },
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    <ProductGallery images={product.images} videoUrl={product.video_url} alt={product.name} />

                    <div>
                        <p className="eyebrow mb-2">
                            {categoryLabels.join(' · ')} · {product.code}
                        </p>
                        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory leading-tight">
                            {product.name}
                        </h1>
                        <p className="font-mono text-xl text-brass mt-4">{formatPrice(product.price)}</p>
                        {!product.available && (
                            <p className="inline-block mt-4 font-mono text-xs tracking-widest2 text-clay border border-clay px-2.5 py-1">
                                CURRENTLY UNAVAILABLE
                            </p>
                        )}
                        <p className="text-muted mt-6 leading-relaxed">{product.description}</p>

                        <div className="mt-8 space-y-3">
                            {!product.available ? (
                                <div className="flex items-center gap-3">
                                    <p className="flex-1 text-sm text-muted border border-line px-4 py-4">
                                        This piece isn&apos;t available right now — check back later or
                                        ask us on WhatsApp about similar pieces.
                                    </p>
                                    <ShareButton
                                        productId={product.id}
                                        title={product.name}
                                        text={product.short_description}
                                    />
                                </div>
                            ) : hasPrice(product.price) ? (
                                <>
                                    <AddToCartForm product={product} />
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <WhatsAppOrderButton
                                                productId={product.id}
                                                productName={product.name}
                                            />
                                        </div>
                                        <ShareButton
                                            productId={product.id}
                                            title={product.name}
                                            text={product.short_description}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-muted border border-line px-4 py-4">
                                        This piece is priced on request — chat with us on WhatsApp and
                                        we&apos;ll get back to you.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <WhatsAppOrderButton
                                                productId={product.id}
                                                productName={product.name}
                                            />
                                        </div>
                                        <ShareButton
                                            productId={product.id}
                                            title={product.name}
                                            text={product.short_description}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {product.specifications?.length > 0 && (
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
                        )}

                        {collection && (
                            <div className="mt-8">
                                <Link
                                    href={`/collections/${collection.slug}`}
                                    className="text-sm text-brass hover:text-ivory transition-colors"
                                >
                                    Part of the {collection.name} &rarr;
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
        </StorefrontLayout>
    );
}
