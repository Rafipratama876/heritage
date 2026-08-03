# Rizal Heritage — Backend API

REST API for the Rizal Heritage catalog, built with **Express + TypeScript + Prisma + MySQL**.
It replaces the dummy data in `lib/products.ts`, `lib/collections.ts`, and `lib/gallery.ts` on the
frontend with a real database-backed API, and adds simple email/password auth (JWT) for the
existing login page.

## Stack

- Express 4 + TypeScript
- Prisma ORM → MySQL 8
- JWT auth (`jsonwebtoken` + `bcryptjs`)
- Validation with `zod`

## Data model

| Table                | Notes                                                        |
|-----------------------|---------------------------------------------------------------|
| `collections`         | matches `Collection` type on the frontend                     |
| `products`            | matches `Product` type; `images` and `specifications` are relations |
| `product_images`      | ordered list of image URLs per product                        |
| `specifications`      | ordered label/value spec rows per product                     |
| `product_categories`  | many-to-many: a product can have more than one category       |
| `product_collections` | many-to-many: a product can belong to more than one collection |
| `gallery_items`       | matches `GalleryItem` type                                    |
| `users`               | email/password accounts for the login page (`CUSTOMER`/`ADMIN`) |
| `carts`               | one per user, created on first cart interaction                |
| `cart_items`          | product + quantity rows in a user's cart                       |
| `wishlist_items`      | direct user-to-product links, no quantity (unique per user+product) |

## Running with Docker (recommended)

From the **project root** (where `docker-compose.yml` lives):

```bash
# 1. Start MySQL + the API
docker compose up --build -d

# 2. Seed the database with the catalog's existing dummy data
docker compose run --rm seed

# API is now at http://localhost:4000
# Adminer (DB UI) is at http://localhost:8080  (system: MySQL, server: mysql, user: rizal, password: rizalpassword, db: rizal_heritage)
curl http://localhost:4000/health
```

The `backend` service automatically runs `prisma migrate deploy` on startup, so tables are
created on first boot. The `seed` service is a one-off container (`profiles: [tools]`), so it
only runs when you explicitly call `docker compose run --rm seed` — it won't start with `up`.

## Running locally without Docker

```bash
cd backend
cp .env.example .env      # then point DATABASE_URL at your MySQL instance
npm install
npx prisma migrate deploy # or `npx prisma migrate dev` while developing the schema
npm run seed               # loads the catalog's dummy data into the DB
npm run dev                 # starts the API on http://localhost:4000
```

## Environment variables (`backend/.env`)

| Variable        | Description                                     |
|------------------|--------------------------------------------------|
| `DATABASE_URL`   | MySQL connection string for Prisma                |
| `PORT`           | API port (default `4000`)                         |
| `CORS_ORIGIN`    | Comma-separated list of allowed frontend origins   |
| `JWT_SECRET`     | Secret used to sign JWTs — change this in production |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`                          |

## API reference

All list/detail endpoints are public. Write endpoints on products/collections/gallery require a
Bearer token from a user with `role = ADMIN` (the seed script creates one — see below). Cart
endpoints require a Bearer token from **any** logged-in user (customer or admin) — the cart
belongs to whoever is authenticated.

### Auth
| Method | Path              | Body                                | Notes                       |
|--------|-------------------|--------------------------------------|------------------------------|
| POST   | `/api/auth/register` | `{ name, email, password, phone? }` | Creates a `CUSTOMER` account |
| POST   | `/api/auth/login`    | `{ email, password }`               | Returns `{ token, user }`    |
| GET    | `/api/auth/me`       | —  (Bearer token)                   | Returns the current user     |

### Collections
| Method | Path                     | Auth  |
|--------|---------------------------|-------|
| GET    | `/api/collections`        | none  |
| GET    | `/api/collections/:slug`  | none — includes its products |
| POST   | `/api/collections`        | admin |
| PUT    | `/api/collections/:slug`  | admin |
| DELETE | `/api/collections/:slug`  | admin |

### Products
| Method | Path                        | Auth  | Notes |
|--------|------------------------------|-------|-------|
| GET    | `/api/products`              | none  | Query: `search`, `category`, `collection` (slug), `featured=true`, `page`, `pageSize` — `category`/`collection` match if the product has that value among its (possibly several) categories/collections |
| GET    | `/api/products/:slug`        | none  | Includes images, specs, categories, collections |
| GET    | `/api/products/:slug/related`| none  | Up to 4 products sharing any category or collection |
| POST   | `/api/products`              | admin | Body includes `categories: string[]` and `collectionSlugs: string[]` — a product can have more than one of each |
| PUT    | `/api/products/:slug`        | admin | Partial update |
| DELETE | `/api/products/:slug`        | admin | |

A product response looks like:
```json
{
  "id": "...", "code": "RH-101", "slug": "...", "name": "...", "price": 1250000,
  "categories": ["Batik", "Songket and Tenun"],
  "collections": [{ "slug": "batik", "name": "Batik" }, { "slug": "songket-and-tenun", "name": "Songket and Tenun" }],
  "images": [{ "id": "...", "url": "...", "order": 0 }],
  "specifications": [{ "label": "Material", "value": "..." }]
}
```

### Uploads
| Method | Path            | Auth  | Body | Notes |
|--------|------------------|-------|------|-------|
| POST   | `/api/uploads`   | admin | `multipart/form-data`, field `files` (up to 10) | JPG/PNG/WEBP/GIF, 5MB max each. Returns `{ "urls": ["/uploads/xxx.jpg", ...] }` — paths are relative to this API's origin; the frontend prefixes them with its known API base URL. Files are written to `backend/uploads/` and served statically at `/uploads/...` |

### Gallery
| Method | Path                    | Auth  | Notes |
|--------|---------------------------|-------|-------|
| GET    | `/api/gallery`            | none  | Query: `tag` (Exhibition/Visit/Event/Workshop/Showcase) |
| GET    | `/api/gallery/:slug`      | none  | |
| POST   | `/api/gallery`            | admin | |
| PUT    | `/api/gallery/:slug`      | admin | |
| DELETE | `/api/gallery/:slug`      | admin | |

### Cart
| Method | Path                    | Auth  | Body | Notes |
|--------|---------------------------|-------|------|-------|
| GET    | `/api/cart`               | user  | — | Creates an empty cart on first call |
| POST   | `/api/cart/items`         | user  | `{ productId, quantity? }` | Adds a product, or increases quantity if already in the cart |
| PATCH  | `/api/cart/items/:itemId` | user  | `{ quantity }` | Sets an exact quantity; `0` removes the item |
| DELETE | `/api/cart/items/:itemId` | user  | — | Removes one item |
| DELETE | `/api/cart`               | user  | — | Empties the cart |

Every cart response looks like:
```json
{
  "id": "cart_...",
  "items": [
    {
      "id": "cartitem_...",
      "quantity": 2,
      "product": { "id": "...", "slug": "...", "code": "RH-001", "name": "...", "price": 4850000, "image": "https://..." },
      "lineTotal": 9700000
    }
  ],
  "totalItems": 2,
  "totalPrice": 9700000
}
```

### Wishlist
| Method | Path                          | Auth  | Body | Notes |
|--------|--------------------------------|-------|------|-------|
| GET    | `/api/wishlist`                | user  | — | Returns the current user's wishlist |
| POST   | `/api/wishlist/items`          | user  | `{ productId }` | Idempotent — adding a product already on the list just returns the current state |
| DELETE | `/api/wishlist/items/:productId` | user | — | Removes by product id (not item id) |

Every wishlist response looks like:
```json
{
  "items": [
    {
      "id": "wishlistitem_...",
      "product": { "id": "...", "slug": "...", "code": "RH-001", "name": "...", "price": 4850000, "image": "https://..." }
    }
  ]
}
```

### Users (admin only)
| Method | Path                  | Body            | Notes |
|--------|------------------------|------------------|-------|
| GET    | `/api/users`           | —                | Lists all registered users |
| PATCH  | `/api/users/:id/role`  | `{ role }` (`CUSTOMER`/`ADMIN`) | Can't remove your own admin access |
| DELETE | `/api/users/:id`       | —                | Can't delete your own account |

### Analytics (admin only)
| Method | Path                       | Notes |
|--------|-----------------------------|-------|
| GET    | `/api/analytics/overview`  | Registered-user activity metrics — see below |
| GET    | `/api/analytics/visitors`  | Anonymous site-traffic metrics — see below |

```json
{
  "totalUsers": 42,
  "newUsersToday": 2,
  "activeToday": 5,
  "activeThisMonth": 18,
  "onlineNow": 1,
  "totalLogins": 130,
  "loginsToday": 7,
  "returningUsers": 12,
  "onlineWindowMinutes": 5
}
```

`onlineNow` counts users whose `lastSeenAt` is within the last `onlineWindowMinutes`,
kept fresh by a heartbeat ping:

| Method | Path                  | Auth | Notes |
|--------|------------------------|------|-------|
| POST   | `/api/auth/heartbeat`  | user | Updates `lastSeenAt` to now. The frontend calls this once a minute while someone is logged in (see `components/AuthProvider.tsx`). |

`GET /api/analytics/visitors` looks like:
```json
{
  "totalVisitors": 340,
  "uniqueVisitors": 210,
  "pageViews": 1204,
  "sessions": 340,
  "avgSessionDurationSeconds": 96,
  "bounceRate": 42,
  "devices": { "desktop": 180, "mobile": 160 }
}
```
This comes from an anonymous, cookie-free page-view log (`page_views` table): the
frontend (`components/VisitorTracker.tsx`) pings a public endpoint on every route
change with a random id it keeps in `localStorage`, no IP address or precise location
stored. "Total Visitor" and "Session" are currently the same number (both mean
"a visit") — see the code comment in `backend/src/routes/analytics.ts` if you want to
change that. Country/city (`Negara/Kota`) isn't implemented — it needs a GeoIP lookup,
which wasn't set up yet.

| Method | Path         | Auth | Body | Notes |
|--------|---------------|------|------|-------|
| POST   | `/api/track` | none | `{ visitorId, sessionId, path, device }` | Public, fire-and-forget from the browser |

### Google Analytics 4 (optional)

`GET /api/analytics/ga4` pulls the same kind of summary from Google Analytics 4 instead
of our own `page_views` table — same shape as `/visitors`, plus a free top-5-countries
breakdown (GeoIP isn't set up locally, but GA4 already has this data). Requires three
env vars (see `backend/.env.example`): `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`,
`GA_PRIVATE_KEY` (the last two come from a service account JSON key with Viewer access
on the GA4 property — see `lib/ga4.ts` for details). Returns `503` with a clear message
if these aren't set. Data has GA4's usual few-hours processing delay, so it's less
"live" than the custom `/visitors` endpoint.

The frontend's `components/GoogleAnalytics.tsx` loads the gtag.js snippet using
`NEXT_PUBLIC_GA_MEASUREMENT_ID` (a separate, public value — not a secret, unlike the
three above). Automatic pageview tracking is turned off; `components/VisitorTracker.tsx`
fires pageviews manually instead, so GA4 can skip `/admin` routes the same way our own
tracking already does.

## Seeded admin account

The seed script creates one admin account so you can immediately call the write endpoints:

```
email:    admin@rizalheritage.com
password: Admin123!
```

Log in via `POST /api/auth/login` to get a token, then send it as `Authorization: Bearer <token>`.

## Admin dashboard

A simple CMS lives at `/admin` on the frontend (see `app/admin/`), for managing products,
collections, gallery items, and users — it's a thin UI over the admin-only endpoints documented
above. Log in with an `ADMIN` account (e.g. the seeded admin) and an "Admin" link appears in the
navbar.

## Frontend integration

The frontend is already connected via `lib/api.ts`, which fetches from this API and maps the
responses back into the existing `Product`, `Collection`, and `GalleryItem` shapes so the UI
components didn't need to change. It uses **two** base URLs, because product/collection/gallery
data is fetched server-side while auth (login/register/getMe) is called from the browser:

| Variable | Used by | Must be reachable from |
|---|---|---|
| `API_URL` | Server Components (products, collections, gallery) | Inside the frontend container |
| `NEXT_PUBLIC_API_URL` | Client-side auth calls in `AuthProvider.tsx` | The user's browser |

- Running the frontend with `npm run dev` locally: set both in `.env.local` (see
  `.env.local.example` at the project root) — typically both `http://localhost:4000`.
- Running both via `docker compose`: already wired up in the root `docker-compose.yml` — `API_URL`
  is `http://backend:4000` (Docker's internal DNS resolves `backend` to this service's container;
  using `localhost` here would point at the frontend container itself), while
  `NEXT_PUBLIC_API_URL` defaults to `http://localhost:4000` (works locally because this service's
  port is published to the host) and should become your public API URL once deployed — see the
  deployment guide for using Nginx to expose it at `https://yourdomain.com/api`.

Note that `NEXT_PUBLIC_API_URL` is baked into the frontend's JS bundle at build time — changing it
requires `docker compose build frontend` again, not just a restart.
