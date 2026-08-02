import type { Metadata } from "next";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import Breadcrumb from "@/components/Breadcrumb";
import Reveal from "@/components/Reveal";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Rizal Heritage — visit our workshop in Pekalongan, or reach us on WhatsApp, Instagram, or email.",
};

const CONTACT_ITEMS = [
  {
    icon: HiOutlineLocationMarker,
    label: "Address",
    value: "Jl. Diponegoro No. 12, Pekalongan, Central Java 51111, Indonesia",
  },
  {
    icon: HiOutlineClock,
    label: "Business Hours",
    value: "Monday – Saturday, 09:00 – 17:00 WIB",
  },
  {
    icon: HiOutlinePhone,
    label: "Phone",
    value: "+62 812-3456-7890",
    href: "tel:+6281234567890",
  },
  {
    icon: HiOutlineMail,
    label: "Email",
    value: "hello@rizalheritage.com",
    href: "mailto:hello@rizalheritage.com",
  },
];

export default function ContactPage() {
  return (
    <div className="container-content pt-32 pb-24">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />

      <div className="mb-16 max-w-2xl">
        <p className="eyebrow mb-3">Get in Touch</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ivory">
          Contact Us
        </h1>
        <p className="text-muted mt-4">
          Have a question about a piece, custom sizing, or shipping to your
          country? Reach out — our team usually replies within a day.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Reveal>
          <div className="space-y-6">
            {CONTACT_ITEMS.map((item) => (
              <div key={item.label} className="flex gap-4 items-start border-b border-line pb-6">
                <item.icon className="text-2xl text-brass shrink-0 mt-0.5" />
                <div>
                  <p className="eyebrow mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-ivory hover:text-brass transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-ivory">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <FaWhatsapp /> Chat on WhatsApp
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <FaInstagram /> Follow on Instagram
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="label-frame overflow-hidden min-h-[360px]">
          <iframe
            title="Rizal Heritage workshop location on Google Maps"
            src="https://www.google.com/maps?q=Pekalongan,Central+Java,Indonesia&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 360 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </div>
  );
}
