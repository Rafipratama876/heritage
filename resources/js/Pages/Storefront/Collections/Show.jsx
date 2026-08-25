import Breadcrumb from '@/Components/Breadcrumb';
import ProductCard from '@/Components/ProductCard';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';

export default function CollectionShow({ collection }) {
    return (
        <StorefrontLayout>
            <Head title={collection.name} />

            <div>
                <div className="relative h-[50vh] min-h-[380px] flex items-end border-b border-line overflow-hidden">
                    <img
                        src={collection.image}
                        alt={collection.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-canvas/10" />
                    <div className="container-content relative pb-12">
                        <Breadcrumb
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Collections', href: '/collections' },
                                ...(collection.parent
                                    ? [{ label: collection.parent.name, href: `/collections/${collection.parent.slug}` }]
                                    : []),
                                { label: collection.name },
                            ]}
                        />
                        <p className="eyebrow mb-3">{collection.products.length} Pieces</p>
                        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ivory">
                            {collection.name}
                        </h1>
                        <p className="text-muted mt-4 max-w-lg">{collection.description}</p>
                    </div>
                </div>

                <div className="container-content py-20">
                    {collection.video_url && (
                        <div className="mb-14">
                            <p className="eyebrow mb-4">Watch</p>
                            <div className="label-frame bg-surface overflow-hidden aspect-video max-w-3xl">
                                <video
                                    src={collection.video_url}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

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

                    {collection.products.length === 0 ? (
                        <p className="text-muted text-center py-16">
                            New pieces from this collection are coming soon.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
                            {collection.products.map((p, i) => (
                                <ProductCard product={p} key={p.id} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StorefrontLayout>
    );
}
