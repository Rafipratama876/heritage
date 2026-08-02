import type { Metadata } from "next";
import {
  HiOutlineTruck,
  HiOutlineGlobeAlt,
  HiOutlineClock,
  HiOutlineCube,
} from "react-icons/hi";
import Breadcrumb from "@/components/Breadcrumb";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "Shipping methods, delivery coverage, estimated delivery times, and packaging details for Rizal Heritage orders.",
};

const CARDS = [
  {
    icon: HiOutlineTruck,
    title: "Shipping Methods",
    body: "Domestic orders ship via trusted courier partners (JNE, J&T), with standard packaging for textiles and reinforced boxes for jewelry and ceramics. International orders ship via air cargo.",
  },
  {
    icon: HiOutlineGlobeAlt,
    title: "Delivery Coverage",
    body: "We deliver across all of Indonesia and to 18 countries internationally, including Singapore, Australia, the US, and the EU. Contact us to confirm coverage for your location.",
  },
  {
    icon: HiOutlineClock,
    title: "Estimated Delivery",
    body: "Domestic (Java): 2–5 business days. Domestic (outer islands): 5–10 business days. International: 1–3 weeks by air, depending on customs.",
  },
  {
    icon: HiOutlineCube,
    title: "Packaging",
    body: "Textiles are folded in acid-free tissue and sealed in poly mailers to stay dry. Jewelry and ceramics are boxed with padded inserts and corner protection.",
  },
];

const FAQ = [
  {
    q: "Do you ship internationally?",
    a: "Yes, we regularly ship to Singapore, Malaysia, Australia, the US, and across Europe. Freight cost depends on weight and destination — send us a message on WhatsApp with your city for a quote.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Once your order ships, we'll send a tracking number through WhatsApp or email, along with the courier's tracking link.",
  },
  {
    q: "What if a piece is made to order?",
    a: "Made-to-order pieces such as songket and tailored kebaya typically take 2–4 weeks to complete before shipping begins. We'll confirm the exact lead time when you order.",
  },
  {
    q: "How should I care for handwoven or hand-dyed pieces?",
    a: "Hand wash cold and dry in shade for batik and tenun to protect natural dyes; songket and delicate embroidery are best dry-cleaned. Care instructions are listed on each product page.",
  },
];

export default function ShippingPage() {
  return (
    <div className="container-content pt-32 pb-24">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shipping & Delivery" }]} />

      <div className="mb-16 max-w-2xl">
        <p className="eyebrow mb-3">Getting Your Order</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ivory">
          Shipping & Delivery
        </h1>
        <p className="text-muted mt-4">
          Everything you need to know about how we pack, ship, and deliver
          each piece — from our workshop in Pekalongan to your door.
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
            <p className="text-muted mt-3 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
