import Link from "next/link";
import Image from "next/image";
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
          <Image
            src="/images/logo.png"
            alt="Rizal Heritage"
            width={892}
            height={821}
            className="h-16 w-auto"
          />
          <p className="mt-4 text-sm text-muted max-w-xs leading-relaxed">
          Since 1998, Rizal Heritage has been
dedicated to preserving Indonesia’s
textile heritage through a carefully
curated collection .
          </p>
          <div className="flex items-center gap-4 mt-6 text-lg text-muted">
            {/* <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="hover:text-brass transition-colors"
            >
              <FaWhatsapp />
            </a> */}
            <a
              href="https://www.instagram.com/rizal_heritage/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Instagram"
              className="hover:text-brass transition-colors"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.facebook.com/marketplace/profile/100028906128157/?ref=permalink&mibextid=6ojiHh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Facebook page"
              className="hover:text-brass transition-colors"
            >
              <FaFacebook />
            </a>
            <a
              href="https://shopee.co.id/dhina17_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Shopee store"
              className="hover:text-brass transition-colors"
            >
              <SiShopee />
            </a>
            <a
              href="mailto:rizalhijazi@gmail.com"
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
          <h3 className="eyebrow mb-4">Visit The Store</h3>
          <address className="not-italic text-sm text-ivory/80 leading-relaxed">
            Pasar Mayestik Blok A Lantai
            <br />
            Mezanine AKS 116 dan 110, Jl. Tebah 1
            <br />
            No.117, RT.15/RW.3, Gunung, Kec. Kby.
            <br />
            Baru, Kota Jakarta Selatan, Daerah 
            <br />
            Khusu Ibukota DKI Jakarta 12120
          </address>
          <a
            href="https://maps.app.goo.gl/bGSc6bT4EKW9yvfEA"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brass hover:underline"
          >
            View on Google Maps
          </a>
          <address className="not-italic text-sm text-ivory/80 leading-relaxed mt-4">
            Ruko Pasar Mayestik (samping JNE)
            <br />
            Jl. Tebah I No. 19, Kebayoran Baru, 
            <br />
            Jakarta Selatan
          </address>
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