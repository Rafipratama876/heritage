import Breadcrumb from '@/Components/Breadcrumb';
import Reveal from '@/Components/Reveal';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link } from '@inertiajs/react';
import { HiArrowRight } from 'react-icons/hi';

// The rest of the story, beyond the two intro paragraphs shown alongside
// the photo — kept as flowing prose further down the page.
const STORY_BODY = [
    `In the beginning, the collection focused exclusively on Palembang Songket. As the years passed, Pak Rizal immersed himself in the world of Indonesian batik—learning its history, techniques, regional characteristics, and the stories woven into every piece. His passion for continuous learning led him to build relationships with collectors, artisans, and textile experts across Indonesia.`,
    `Over the decades, Rizal Heritage has had the privilege of handling some of Indonesia’s most exceptional collector’s batik, including works by legendary names such as Oey Soe Tjoen, rare Batik Cinderella, Red Riding Hood, and many other museum-worthy textiles. Each piece reflects Indonesia’s extraordinary artistic heritage and craftsmanship.`,
    `Today, M. Hijazi Rizal is recognized not only as a textile merchant but also as a respected collector of antique batik and antique songket. Rizal Heritage actively buys, sells, and preserves rare textiles from collectors and families throughout Indonesia, ensuring that these cultural treasures continue to be appreciated by future generations rather than disappearing with time.`,
    `More than a business, Rizal Heritage is a bridge between Indonesia’s textile traditions and the people who value their history. Every fabric carries a story, every motif represents generations of craftsmanship, and every piece in our collection is carefully selected for its authenticity, artistry, and cultural significance.`,
];

export default function OurStory() {
    return (
        <StorefrontLayout>
            <Head title="Our Story" />

            <div className="container-content pt-32 pb-24">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Our Story' }]} />

                <div className="max-w-2xl mb-16 sm:mb-20">
                    <p className="eyebrow mb-3">Since 1998 &bull; 25+ Years of Heritage</p>
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ivory leading-tight">
                        The Story Behind Rizal Heritage
                    </h1>
                </div>

                {/* INTRO — same photo & opening paragraphs as the homepage teaser */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 sm:mb-28">
                    <Reveal className="relative aspect-[4/5] label-frame overflow-hidden order-1">
                        <img
                            src="/images/our-story-rizal.jpg"
                            alt="M. Hijazi Rizal holding a piece of hand-woven Songket Palembang in his store"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </Reveal>
                    <Reveal delay={0.1} className="order-2">
                        <p className="eyebrow mb-3">Our Story</p>
                        <p className="text-muted leading-relaxed text-lg">
                            Rizal Heritage was founded on a lifelong passion for Indonesia&rsquo;s
                            traditional textiles. Since 1998, M. Hijazi Rizal has dedicated himself to
                            collecting, studying, and preserving some of the country&rsquo;s finest
                            handwoven and batik masterpieces.
                        </p>
                        <p className="mt-5 text-muted leading-relaxed text-lg">
                            His journey began in Palembang, where he assisted his brother-in-law in
                            sourcing Songket Palembang to be resold. What started as learning the trade
                            quickly grew into a lifelong calling. By 2000, they opened their first store
                            together in Blok M, Jakarta, introducing authentic Palembang Songket to a
                            wider audience. After three years, the business moved to Pasar Mayestik,
                            where Rizal Heritage continues to welcome collectors, designers, and textile
                            enthusiasts from around the world.
                        </p>
                    </Reveal>
                </div>

                {/* THE REST OF THE STORY — flowing prose, single readable column */}
                <div className="max-w-2xl mx-auto space-y-6">
                    {STORY_BODY.map((paragraph, i) => (
                        <Reveal key={i} delay={i * 0.06}>
                            <p className="text-muted leading-relaxed">{paragraph}</p>
                        </Reveal>
                    ))}
                </div>

                {/* MISSION — closing statement as a large pull quote */}
                <Reveal className="max-w-3xl mx-auto mt-20 sm:mt-24 pt-16 border-t border-line text-center">
                    <p className="eyebrow mb-5">Our Mission</p>
                    <p className="font-display text-2xl sm:text-3xl md:text-4xl text-ivory italic leading-snug">
                        &ldquo;For more than 25 years, our mission has remained unchanged: to
                        preserve, celebrate, and share Indonesia&rsquo;s textile heritage with the
                        world.&rdquo;
                    </p>
                </Reveal>

                {/* CTA */}
                <Reveal className="flex flex-wrap items-center justify-center gap-4 mt-14">
                    <Link href="/collections" className="btn-primary">
                        Explore Our Collections <HiArrowRight />
                    </Link>
                    <Link href="/contact" className="btn-outline">
                        Get in Touch
                    </Link>
                </Reveal>
            </div>
        </StorefrontLayout>
    );
}
