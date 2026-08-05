import type { Metadata } from "next";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import Breadcrumb from "@/components/Breadcrumb";
import Reveal from "@/components/Reveal";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Rizal Heritage — visit our store at Pasar Mayestik, Jakarta Selatan, or reach us on WhatsApp, Instagram, or email.",
};

const ADDRESSES = [
  {
    name: "Rizal Heritage / Rizal Songket / Toko Songket Palembang",
    value:
      "Pasar Mayestik Blok A Lantai Mezanine AKS 116 dan 110, Jl. Tebah 1 No.117, RT.15/RW.3, Gunung, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12120",
    mapHref: "https://maps.app.goo.gl/bGSc6bT4EKW9yvfEA",
  },
  {
    name: "Ruko Pasar Mayestik (samping JNE)",
    value: "Jl. Tebah I No. 19 Kebayoran Baru, Jakarta Selatan",
  },
];

const CONTACT_ITEMS = [
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
            {ADDRESSES.map((addr) => (
              <div key={addr.name} className="flex gap-4 items-start border-b border-line pb-6">
                <HiOutlineLocationMarker className="text-2xl text-brass shrink-0 mt-0.5" />
                <div>
                  <p className="eyebrow mb-1">{addr.name}</p>
                  <p className="text-ivory">{addr.value}</p>
                  {addr.mapHref && (
                    <a
                      href={addr.mapHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brass hover:underline"
                    >
                      View on Google Maps
                    </a>
                  )}
                </div>
              </div>
            ))}
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
              href="https://www.instagram.com/rizal_heritage/"
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
            title="Rizal Heritage store location on Google Maps"
            src="https://www.google.com/maps?q=Pasar+Mayestik+Blok+A+Lantai+Mezanine,+Jl.+Tebah+1+No.117,+Kebayoran+Baru,+Jakarta+Selatan&output=embed"
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
