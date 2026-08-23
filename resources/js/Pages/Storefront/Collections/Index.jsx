import Breadcrumb from '@/Components/Breadcrumb';
import Reveal from '@/Components/Reveal';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';

export default function CollectionsIndex({ collections }) {
    return (
        <StorefrontLayout>
            <Head title="Collections" />

            <div className="container-content pt-32 pb-24">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Collections' }]} />

                <div className="mb-16 max-w-2xl">
                    <p className="eyebrow mb-3">Curated Lines</p>
                    <h1 className="font-display text-4xl sm:text-5xl text-ivory">Collections</h1>
                    <p className="text-muted mt-4">
                        Each collection is rooted in a different craft tradition of Central Java — pick
                        one to filter the full catalog.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {collections.map((c, i) => (
                        <Reveal key={c.slug} delay={i * 0.06}>
                            <Link href={`/collections/${c.slug}`} className="group block">
                                <div className="relative aspect-[16/10] overflow-hidden label-frame">
                                    <img
                                        src={c.image}
                                        alt={c.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/10 to-transparent" />
                                    <div className="absolute bottom-0 p-7">
                                        <h2 className="font-display text-2xl sm:text-3xl text-ivory">
                                            {c.name}
                                        </h2>
                                        <p className="text-sm text-muted mt-1">{c.tagline}</p>
                                    </div>
                                </div>
                            </Link>
                            {!!c.children?.length && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {c.children.map((child) => (
                                        <Link
                                            key={child.slug}
                                            href={`/collections/${child.slug}`}
                                            className="text-xs text-muted hover:text-brass border border-line px-3 py-1.5 transition-colors"
                                        >
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </Reveal>
                    ))}
                </div>
            </div>
        </StorefrontLayout>
    );
}
