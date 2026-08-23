import Breadcrumb from '@/Components/Breadcrumb';
import Reveal from '@/Components/Reveal';
import SectionHeading from '@/Components/SectionHeading';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head } from '@inertiajs/react';
import { HiOutlineClock, HiOutlineCube, HiOutlineGlobeAlt, HiOutlineTruck } from 'react-icons/hi';

const CARDS = [
    {
        icon: HiOutlineTruck,
        title: 'Shipping Methods',
        body: 'Domestic orders are shipped via our trusted courier partners, JNE and J&T. Instant online services for shipments within Jakarta. International orders are shipped via Rayspeed for destinations within Southeast Asia, and via DHL Express for all other international destinations, ensuring fast and reliable worldwide delivery.',
    },
    {
        icon: HiOutlineGlobeAlt,
        title: 'Delivery Coverage',
        body: 'We deliver throughout Indonesia and to destinations worldwide. Shipping costs are not included in the product price and will be calculated based on your delivery location. Please contact us before placing your order to confirm your shipping destination, and we will provide the applicable shipping rate.',
    },
    {
        icon: HiOutlineClock,
        title: 'Estimated Delivery',
        body: 'Domestic (Java): 1–4 business days. Domestic (outer islands): 3–7 business days. International: 5 - 21 business days, depending on the destination and customs clearance process.',
    },
    {
        icon: HiOutlineCube,
        title: 'Packaging',
        body: 'Textiles are carefully folded, wrapped in protective plastic, and sealed in poly mailers to keep them dry. Jewelry and ceramics are securely boxed with padded inserts and corner protection for safe delivery.',
    },
];

const FAQ = [
    {
        q: 'Can I track my order?',
        a: "Yes. Once your order ships, we'll send a tracking number through WhatsApp or email, along with the courier's tracking link.",
    },
    {
        q: 'Do I need to pay for shipping?',
        a: 'Yes, you need to pay for shipping. Please tell us your shipping destination, and we will provide the applicable shipping rate.',
    },
    {
        q: 'Will I Need to Pay Customs Duties or Taxes?',
        a: 'Customs duties, import taxes, and courier processing fees may apply in your destination country. These charges are determined by your local customs authority and must be paid by the recipient. They are not included in your order total or shipping fee.\n\nIf any customs charges are due, the shipping carrier will contact you directly with payment instructions before delivery.\n\nRizal Heritage is unable to pay or reimburse customs duties, taxes, or processing fees on your behalf. If these charges are refused or remain unpaid, the parcel may be returned to us. In such cases, the order will not be eligible for a refund.\n\nTo avoid unexpected costs or delivery delays, we recommend contacting your local customs office before placing your order to estimate any applicable import duties or taxes.',
    },
    {
        q: 'What should I do if my parcel arrives damaged?',
        a: 'If your parcel arrives damaged, please record a video before opening it (an unboxing video) and take clear photos of the damaged packaging and the contents. Keep all packaging materials and the damaged items until your claim has been resolved.\n\nOnce your parcel has been shipped, the courier is responsible for its safe delivery. However, we will assist you throughout the claims process and provide any necessary support.',
    },
    {
        q: 'Can I add shipping insurance?',
        a: 'Shipping insurance is not included in our prices. If you would like to insure your order, please contact us via WhatsApp before payment. We will calculate the insurance cost and add it to your order total.',
    },
    {
        q: 'What about refused delivery?',
        a: 'Customers are responsible for ensuring their address and contact phone number are correct and complete. Rizal Heritage will not be held responsible for shipping to incorrect addresses.',
    },
];

export default function Shipping() {
    return (
        <StorefrontLayout>
            <Head title="Shipping & Delivery" />

            <div className="container-content pt-32 pb-24">
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shipping & Delivery' }]} />

                <div className="mb-16 max-w-2xl">
                    <p className="eyebrow mb-3">Getting Your Order</p>
                    <h1 className="font-display text-4xl sm:text-5xl text-ivory">Shipping & Delivery</h1>
                    <p className="text-muted mt-4">
                        Everything you need to know about how we pack, ship, and deliver each piece —
                        from our workshop in Jakarta, Indonesia to your door.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-24">
                    {CARDS.map((c, i) => (
                        <Reveal key={c.title} delay={i * 0.07} className="label-frame bg-surface p-8">
                            <c.icon className="text-3xl text-brass" />
                            <h2 className="font-display text-xl text-ivory mt-4">{c.title}</h2>
                            <p className="text-sm text-muted mt-3 leading-relaxed">{c.body}</p>
                        </Reveal>
                    ))}
                </div>

                <SectionHeading eyebrow="Common Questions" title="Frequently Asked" />
                <div className="mt-10 divide-y divide-line border-t border-line max-w-3xl">
                    {FAQ.map((item) => (
                        <details key={item.q} className="group py-6">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                <span className="font-display text-lg text-ivory">{item.q}</span>
                                <span className="text-brass text-xl group-open:rotate-45 transition-transform">
                                    +
                                </span>
                            </summary>
                            <p className="text-muted mt-3 leading-relaxed whitespace-pre-line">
                                {item.a}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </StorefrontLayout>
    );
}
