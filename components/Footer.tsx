import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaEnvelope, FaFacebook } from "react-icons/fa";
import { SiShopee } from "react-icons/si";
import { buildWhatsAppLink } from "@/lib/utils";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/collections", label: "Collections" },
      { href: "/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/shipping", label: "Shipping & Delivery" },
      { href: "/contact", label: "Contact Us" },
      { href: "/login", label: "Login" },
      { href: "/register", label: "Register" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-24">
      <div className="container-content py-16 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-12">
        <div>
          <span className="font-display text-2xl text-ivory">
            Rizal <span className="italic text-brass">Heritage</span>
          </span>
          <p className="mt-4 text-sm text-muted max-w-xs leading-relaxed">
            Hand-drawn batik, hand-loomed songket and tenun, and traditional
            accessories, made by artisan workshops across Indonesia since 1988.
          </p>
          <div className="flex items-center gap-4 mt-6 text-lg text-muted">
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="hover:text-brass transition-colors"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Instagram"
              className="hover:text-brass transition-colors"
            >
              <FaInstagram />
            </a>
            <a
              href="https://facebook.com/rizalheritage"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Facebook page"
              className="hover:text-brass transition-colors"
            >
              <FaFacebook />
            </a>
            <a
              href="https://shopee.co.id/rizalheritage"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Shopee store"
              className="hover:text-brass transition-colors"
            >
              <SiShopee />
            </a>
            <a
              href="mailto:hello@rizalheritage.com"
              aria-label="Send an email"
              className="hover:text-brass transition-colors"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="eyebrow mb-4">{col.title}</h3>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ivory/80 hover:text-brass transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="eyebrow mb-4">Visit the Workshop</h3>
          <address className="not-italic text-sm text-ivory/80 leading-relaxed">
            Jl. Diponegoro No. 12
            <br />
            Pekalongan, Central Java 51111
            <br />
            Indonesia
          </address>
          <p className="text-sm text-muted mt-4">Mon–Sat, 09:00–17:00 WIB</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-content py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted">
          <p>© {new Date().getFullYear()} Rizal Heritage. All rights reserved.</p>
          <p>Handmade in Pekalongan, Indonesia</p>
        </div>
      </div>
    </footer>
  );
}