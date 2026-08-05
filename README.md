# Rizal Heritage

A modern, elegant product catalog SPA for a heritage furniture & craft brand, built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion. No checkout — every order is completed via WhatsApp.

## Design direction

"Museum label" catalog: a dark teak-and-parchment canvas (`#1C1712` / `#EDE6D6`) with a brass accent (`#C9A25D`), a Fraunces display serif paired with Plus Jakarta Sans, and product cards framed like gallery placards with catalog codes (`RH-014`). See `tailwind.config.ts` for the full token system.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** `next/font/google` fetches fonts at build time and needs outbound internet access to `fonts.googleapis.com`. This works automatically on Vercel/Netlify. If you're building in a network-restricted environment, temporarily swap the `next/font/google` imports in `app/layout.tsx` for local/system fonts.

## Project structure

```
app/                  Routes (App Router)
  products/            Catalog listing + [slug] detail page
  collections/          Collection listing + [slug] detail page
  gallery/              Masonry gallery with lightbox
  shipping/             Shipping & delivery info + FAQ
  contact/              Contact info + map
  login/                Customer login (UI only, no backend)
components/           Reusable UI (Navbar, ProductCard, Lightbox, etc.)
hooks/                 useDebounce, etc.
lib/                   Dummy data (products, collections, gallery) + utils
types/                 Shared TypeScript types
```

## Key features implemented

- Sticky navbar: transparent at top, blurred background on scroll, mobile menu, active-link indicator
- Real-time debounced search + category/collection filters on `/products`
- Product detail page with image gallery, keyboard/swipe-enabled lightbox, and specs table
- "Order via WhatsApp" button that opens `wa.me` with a pre-filled message
- Clickable breadcrumbs on every internal page
- Masonry gallery with lightbox
- Loading skeletons for the product grid, plus a global route-level spinner
- SEO: Metadata API, Open Graph/Twitter cards, JSON-LD (Product/Store), `sitemap.ts`, `robots.ts`
- Scroll-reveal and hover animations via Framer Motion, respecting `prefers-reduced-motion`
- Dummy data only — swap `lib/products.ts`, `lib/collections.ts`, `lib/gallery.ts` for a real API/CMS later

## Next steps (prepared for, not built)

The architecture (typed data layer, `features/`-ready structure, login UI) is set up so you can later add: customer dashboard, wishlist, order history, notifications, a CMS-backed product source, admin panel, inventory, and analytics — without restructuring the app.

## Backend API

A Prisma + MySQL backend now lives in `backend/`, with a root-level `docker-compose.yml` to run
MySQL, the API, and Adminer together. See `backend/README.md` for setup, environment variables,
and the full API reference. Quick start:

```bash
docker compose up --build -d
docker compose run --rm seed   # loads the same catalog data used in lib/products.ts etc.
```

## Before going live

1. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env` (or `.env.local`) to your real business number — digits only, country code first, no `+`/spaces/leading 0 (e.g. `62812xxxxxxx`). `lib/utils.ts` reads it from there, with a dummy fallback for local dev.
2. Replace dummy Unsplash images with real product photography.
3. Replace the Google Maps embed query in `app/contact/page.tsx` with your real address.
4. Update `siteUrl` in `app/layout.tsx` and `app/sitemap.ts`/`app/robots.ts` to your real domain.
5. Wire the login form to real authentication when you're ready to store customer accounts.
