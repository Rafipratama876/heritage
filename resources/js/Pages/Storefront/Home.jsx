import ProductCard from '@/Components/ProductCard';
import Reveal from '@/Components/Reveal';
import SectionHeading from '@/Components/SectionHeading';
import WhatsAppOrderButton from '@/Components/WhatsAppOrderButton';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { GiSewingNeedle } from 'react-icons/gi';
import { HiArrowRight, HiOutlineGlobeAlt, HiOutlineLocationMarker, HiOutlineSparkles } from 'react-icons/hi';
import { SiShopee } from 'react-icons/si';

const WHY_ITEMS = [
    {
        icon: GiSewingNeedle,
        title: '100% Authentic Heritage Textiles',
        body: 'Carefully sourced traditional textiles and accessories from across Indonesia, with a strong focus on authenticity and craftsmanship.',
    },
    {
        icon: HiOutlineSparkles,
        title: 'Rare & Collector Pieces',
        body: 'Our collection includes antique songket, vintage batik and other exceptional textiles that are increasingly difficult to find.',
    },
    {
        icon: HiOutlineGlobeAlt,
        title: 'Shipped Worldwide',
        body: 'Securely packed and shipped internationally, with tracked delivery available for every order.',
    },
    {
        icon: HiOutlineLocationMarker,
        title: 'Direct From Our Store',
        body: 'Purchase directly from Rizal Heritage in Mayestik Market, Jakarta, with personal assistance from our team.',
    },
];

export default function Home({ featuredProducts, collections, galleryItems }) {
    return (
        <StorefrontLayout>
            <Head title="Rizal Heritage" />

            {/* HERO */}
            <section className="relative min-h-[92vh] flex items-end overflow-hidden border-b border-line">
                <div className="absolute inset-0">
                    <img
                        src="/images/hero-bg.png"
                        alt="Traditional Indonesian songket textile pattern in red and gold"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/70 to-canvas/50" />
                </div>

                {/* lg:pl-[117px] nudges the heading to align with the "Home"
                    nav link above it (measured: Home sits 117px right of the
                    logo/container edge, now a fixed offset since Navbar.jsx's
                    nav list has a fixed ml-14 instead of justify-between).
                    Only applied at lg+ since nav links are hidden below that,
                    where aligning to the logo/container edge instead is right. */}
                <div className="container-content relative pb-20 pt-40 w-full lg:pl-[165px]">
                    <p
                        className="eyebrow mb-5 animate-fadeUp drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
                        style={{ animationDelay: '0.1s', opacity: 0 }}
                    >
                        Est. 1998 &bull; Curating Indonesian Textile Heritage &bull; Java &amp; Sumatra,
                        Indonesia
                    </p>
                    <h1
                        className="font-display text-[13vw] leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl text-ivory max-w-4xl animate-fadeUp"
                        style={{ animationDelay: '0.2s', opacity: 0 }}
                    >
                        Indonesia&rsquo;s Textile Heritage,
                        <br />
                        <span className="italic text-brass">Curated</span> for Generations.
                    </h1>
                    <p
                        className="mt-6 text-muted text-base sm:text-lg max-w-2xl animate-fadeUp"
                        style={{ animationDelay: '0.35s', opacity: 0 }}
                    >
                        Discover handcrafted batik, tenun, songket, and other Indonesian textiles from
                        master artisans across the archipelago—preserving stories, traditions, and
                        craftsmanship for generations to come.
                    </p>
                    <div
                        className="mt-9 flex flex-wrap gap-4 animate-fadeUp"
                        style={{ animationDelay: '0.5s', opacity: 0 }}
                    >
                        <Link href="/products" className="btn-primary">
                            Browse the Catalog <HiArrowRight />
                        </Link>
                        <Link href="/collections" className="btn-outline">
                            View Collections
                        </Link>
                    </div>

                    <div
                        className="mt-8 flex items-center gap-4 animate-fadeUp"
                        style={{ animationDelay: '0.6s', opacity: 0 }}
                    >
                        <span className="text-xs text-muted uppercase tracking-wide">Also find us on</span>
                        <a
                            href="https://www.instagram.com/rizal_heritage/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Visit Instagram"
                            className="flex items-center justify-center w-6 h-6 text-2xl text-ivory/80 hover:text-brass transition-colors"
                        >
                            <FaInstagram />
                        </a>
                        <a
                            href="https://shopee.co.id/dhina17_"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Visit our Shopee store"
                            className="flex items-center justify-center w-6 h-6 text-2xl text-ivory/80 hover:text-brass transition-colors"
                        >
                            <SiShopee />
                        </a>
                        <a
                            href="https://www.facebook.com/marketplace/profile/100028906128157/?ref=permalink&mibextid=6ojiHh"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Visit our Facebook page"
                            className="flex items-center justify-center w-6 h-6 text-2xl text-ivory/80 hover:text-brass transition-colors"
                        >
                            <FaFacebook />
                        </a>
                    </div>
                </div>
            </section>

            {/* ABOUT BRAND */}
            <section className="container-content py-24 sm:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <Reveal className="relative aspect-[4/5] label-frame overflow-hidden">
                    <img
                        src="/images/our-story-rizal.jpg"
                        alt="M. Hijazi Rizal holding a piece of hand-woven Songket Palembang in his store"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </Reveal>
                <div>
                    <p className="eyebrow mb-3">Our Story</p>
                    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory leading-tight">
                        The Story Behind Rizal Heritage
                    </h2>
                    <p className="mt-6 text-muted leading-relaxed">
                        Rizal Heritage was founded on a lifelong passion for Indonesia&rsquo;s
                        traditional textiles. Since 1998, M. Hijazi Rizal has dedicated himself to
                        collecting, studying, and preserving some of the country&rsquo;s finest
                        handwoven and batik masterpieces.
                    </p>
                    <p className="mt-4 text-muted leading-relaxed">
                        His journey began in Palembang, where he assisted his brother-in-law in
                        sourcing Songket Palembang to be resold. What started as learning the trade
                        quickly grew into a lifelong calling &mdash; and over 25 years later,
                        continues to this day.
                    </p>

                    <Link
                        href="/our-story"
                        className="mt-5 inline-flex items-center gap-1.5 text-sm text-brass hover:text-ivory transition-colors"
                    >
                        Read the full story <HiArrowRight />
                    </Link>
                </div>
            </section>

            {/* FEATURED COLLECTIONS */}
            <section className="py-24 sm:py-32 bg-surface border-y border-line">
                <div className="container-content">
                    <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
                        <SectionHeading
                            eyebrow="Curated Lines"
                            title="Featured Collections"
                            description="Eight lines, each rooted in a different textile or craft tradition of Indonesia."
                        />
                        <Link
                            href="/collections"
                            className="hidden sm:inline-flex items-center gap-2 text-sm text-brass hover:text-ivory transition-colors"
                        >
                            View all collections <HiArrowRight />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.slice(0, 3).map((c, i) => (
                            <Reveal key={c.slug} delay={i * 0.08}>
                                <Link href={`/collections/${c.slug}`} className="group block">
                                    <div className="relative aspect-[3/4] overflow-hidden label-frame">
                                        <img
                                            src={c.image}
                                            alt={c.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/10 to-transparent" />
                                        <div className="absolute bottom-0 p-6">
                                            <h3 className="font-display text-2xl text-ivory">{c.name}</h3>
                                            <p className="text-sm text-muted mt-1">{c.tagline}</p>
                                        </div>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED PRODUCTS */}
            <section className="container-content py-24 sm:py-32">
                <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
                    <SectionHeading eyebrow="From the Catalog" title="Featured Pieces" />
                    <Link
                        href="/products"
                        className="hidden sm:inline-flex items-center gap-2 text-sm text-brass hover:text-ivory transition-colors"
                    >
                        Browse full catalog <HiArrowRight />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12">
                    {featuredProducts.map((p, i) => (
                        <ProductCard product={p} key={p.id} index={i} />
                    ))}
                </div>
            </section>

            {/* GALLERY PREVIEW */}
            <section className="py-24 sm:py-32 bg-surface border-y border-line">
                <div className="container-content">
                    <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
                        <SectionHeading eyebrow="Behind the Craft" title="Moments & Memories" />
                        <Link
                            href="/gallery"
                            className="hidden sm:inline-flex items-center gap-2 text-sm text-brass hover:text-ivory transition-colors"
                        >
                            View gallery <HiArrowRight />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryItems.map((g, i) => (
                            <Reveal
                                key={g.slug}
                                delay={i * 0.06}
                                className="relative aspect-square overflow-hidden"
                            >
                                <img
                                    src={g.image}
                                    alt={g.title}
                                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="container-content py-24 sm:py-32">
                <SectionHeading
                    eyebrow="Why Rizal Heritage"
                    title="Authentic textiles, carefully curated."
                    align="center"
                />
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {WHY_ITEMS.map((item, i) => (
                        <Reveal key={item.title} delay={i * 0.08} className="text-center sm:text-left">
                            <item.icon className="text-3xl text-brass mx-auto sm:mx-0" />
                            <h3 className="font-display text-xl text-ivory mt-4">{item.title}</h3>
                            <p className="text-sm text-muted mt-2 leading-relaxed">{item.body}</p>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="container-content pb-24 sm:pb-32">
                <Reveal>
                    <div className="label-frame bg-surface px-8 py-16 sm:py-20 text-center flex flex-col items-center">
                        <p className="eyebrow mb-4">Ready to Order</p>
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory max-w-2xl">
                            Chat with our team directly on WhatsApp.
                        </h2>
                        <p className="text-muted mt-4 max-w-md">
                            Have questions about product condition, measurements, shipping, or anything
                            else? Our team is here to help and typically replies within one business
                            day.
                        </p>
                        <p className="text-muted mt-2 max-w-md text-sm">
                            Please log in to your account before placing an order via WhatsApp.
                        </p>
                        <div className="mt-8">
                            <WhatsAppOrderButton />
                        </div>
                    </div>
                </Reveal>
            </section>
        </StorefrontLayout>
    );
}
