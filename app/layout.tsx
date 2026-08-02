import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = "https://rizalheritage.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rizal Heritage — Handmade Batik, Textiles & Accessories",
    template: "%s — Rizal Heritage",
  },
  description:
    "Rizal Heritage is a heritage textile and craft house from Indonesia, making hand-drawn batik, hand-loomed songket and tenun, kebaya, and traditional jewelry and accessories. Browse the catalog and order via WhatsApp.",
  keywords: [
    "batik Indonesia",
    "songket tenun",
    "kebaya",
    "handmade Indonesian jewelry",
    "traditional textile accessories",
  ],
  openGraph: {
    title: "Rizal Heritage — Handmade Batik, Textiles & Accessories",
    description:
      "Hand-drawn batik, hand-loomed songket and tenun, and traditional accessories, made by artisan workshops across Indonesia.",
    url: siteUrl,
    siteName: "Rizal Heritage",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizal Heritage — Handmade Batik, Textiles & Accessories",
    description:
      "Hand-drawn batik, hand-loomed songket and tenun, and traditional accessories, made by artisan workshops across Indonesia.",
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Rizal Heritage",
    url: siteUrl,
    description:
      "Heritage textile and craft house from Indonesia, specializing in batik, songket, tenun, kebaya, and traditional accessories.",
  };

  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable} ${plexMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] bg-brass text-canvas px-4 py-2 text-sm font-medium"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}