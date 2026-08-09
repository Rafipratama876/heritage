import { Product, Collection, GalleryItem, Category, AuthUser, Cart } from "@/types";
import { getVisitorId } from "@/lib/visitor";

// Used by Server Components (products, collections, gallery) — these run
// inside the Docker container, so this must resolve on Docker's internal
// network (e.g. http://backend:4000), never "localhost".
const API_URL = process.env.API_URL || "http://localhost:4000";

// Used by client-side auth calls in AuthProvider.tsx — these run in the
// user's browser, so this must be a URL the browser can actually reach:
// http://localhost:4000 works for local docker-compose testing (the port
// is published to the host), but must be the public API URL/reverse-proxy
// path (e.g. https://yourdomain.com/api) once deployed. Baked in at build
// time, so changing it requires a rebuild — see docker-compose.yml.
export const BROWSER_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// The backend stores category as a Prisma enum identifier (no spaces);
// this maps it back to the display string used throughout the frontend.
const CATEGORY_DISPLAY: Record<string, Category> = {
  Batik: "Batik",
  SongketTenun: "Songket and Tenun",
  Kebaya: "Kebaya",
  AccessoriesJewelry: "Accessories and Jewelry",
  Bag: "Bag",
  Jewelry: "Jewelry",
  Plate: "Plate",
  OtherAccessories: "Other Accessories",
};

function fromApiCategory(category: string): Category {
  return CATEGORY_DISPLAY[category] ?? (category as Category);
}

type ApiImage = { url: string; order: number };
type ApiSpec = { label: string; value: string; order: number };
type ApiCollectionSummary = { slug: string; name: string; tagline: string; image: string };
type ApiCollection = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  parent?: ApiCollectionSummary | null;
  children?: ApiCollectionSummary[];
};
type ApiProduct = {
  id: string;
  code: string;
  slug: string;
  name: string;
  price: number;
  shortDescription: string;
  description: string;
  categories: string[];
  featured: boolean;
  available: boolean;
  images: ApiImage[];
  videoUrl: string | null;
  specifications: ApiSpec[];
  collections: { slug: string; name: string }[];
};
type ApiGalleryItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tag: GalleryItem["tag"];
};

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    code: p.code,
    slug: p.slug,
    name: p.name,
    price: p.price,
    shortDescription: p.shortDescription,
    description: p.description,
    collections: (p.collections ?? []).map((c) => c.slug),
    categories: (p.categories ?? []).map(fromApiCategory),
    images: (p.images ?? []).map((img) => img.url),
    videoUrl: p.videoUrl ?? null,
    specifications: (p.specifications ?? []).map((s) => ({ label: s.label, value: s.value })),
    featured: p.featured,
    available: p.available,
  };
}

function mapCollection(c: ApiCollection): Collection {
  return {
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    description: c.description,
    image: c.image,
    parent: c.parent ?? null,
    children: c.children ?? [],
  };
}

function mapGalleryItem(g: ApiGalleryItem): GalleryItem {
  return {
    id: g.id,
    slug: g.slug,
    title: g.title,
    description: g.description,
    date: g.date,
    image: g.image,
    tag: g.tag,
  };
}

async function apiFetch<T>(path: string, revalidateSeconds?: number): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      // Always fetch fresh data by default so edits made directly in the
      // database (or later, an admin panel) show up immediately. Pass a
      // revalidateSeconds value to opt a specific call into ISR-style
      // caching once you need the performance and staleness is acceptable.
      ...(revalidateSeconds !== undefined
        ? { next: { revalidate: revalidateSeconds } }
        : { cache: "no-store" as const }),
    });
  } catch {
    throw new Error(`Couldn't reach the API at ${API_URL}. Is the backend running?`);
  }
  if (!res.ok) {
    throw new Error(`API request failed: ${path} (${res.status})`);
  }
  try {
    return await res.json();
  } catch {
    throw new Error(`API returned an unexpected (non-JSON) response for ${path}.`);
  }
}

// ---- Products ----

export async function getProducts(params?: {
  search?: string;
  category?: string;
  collection?: string;
  featured?: boolean;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category && params.category !== "all") query.set("category", params.category);
  if (params?.collection && params.collection !== "all") query.set("collection", params.collection);
  if (params?.featured) query.set("featured", "true");
  query.set("pageSize", "100"); // catalog is small enough to fetch in one page

  try {
    const data = await apiFetch<{ items: ApiProduct[] }>(`/api/products?${query.toString()}`);
    return data.items.map(mapProduct);
  } catch (err) {
    // Next.js executes this page once during `next build` even though
    // it's marked force-dynamic (a known quirk), and the backend isn't
    // reachable at that point in a fresh `docker compose build`. Fail
    // soft here so the build succeeds — real requests at runtime (when
    // the backend IS reachable) still get real data.
    console.warn("getProducts: falling back to an empty list —", err);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ featured: true });
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    const data = await apiFetch<ApiProduct>(`/api/products/${slug}`);
    return mapProduct(data);
  } catch {
    return undefined;
  }
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  try {
    const data = await apiFetch<ApiProduct[]>(`/api/products/${slug}/related`);
    return data.map(mapProduct);
  } catch (err) {
    console.warn("getRelatedProducts: falling back to an empty list —", err);
    return [];
  }
}

// ---- Collections ----

export async function getCollections(): Promise<Collection[]> {
  try {
    const data = await apiFetch<ApiCollection[]>("/api/collections");
    return data.map(mapCollection);
  } catch (err) {
    console.warn("getCollections: falling back to an empty list —", err);
    return [];
  }
}

export async function getCollection(
  slug: string
): Promise<(Collection & { products: Product[] }) | undefined> {
  try {
    const data = await apiFetch<ApiCollection & { products: ApiProduct[] }>(`/api/collections/${slug}`);
    return { ...mapCollection(data), products: data.products.map(mapProduct) };
  } catch {
    return undefined;
  }
}

// ---- Gallery ----

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const data = await apiFetch<ApiGalleryItem[]>("/api/gallery");
    return data.map(mapGalleryItem);
  } catch (err) {
    console.warn("getGalleryItems: falling back to an empty list —", err);
    return [];
  }
}

// ---- Admin: browser-side data fetchers ----
// The /admin dashboard runs entirely in the browser, so it can't use the
// getProducts/getCollections/getGalleryItems above (those use the
// server-only API_URL). These hit the same public GET endpoints but via
// BROWSER_API_URL instead, and always return live data straight from the
// backend regardless of what lib/products.ts etc. currently serve to the
// public storefront (static demo data or the live API).

export async function adminFetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BROWSER_API_URL}/api/products?pageSize=100`);
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  const data: { items: ApiProduct[] } = await res.json();
  return data.items.map(mapProduct);
}

export async function adminFetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${BROWSER_API_URL}/api/products/${slug}`);
  if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
  return mapProduct(await res.json());
}

export async function adminFetchCollections(): Promise<Collection[]> {
  const res = await fetch(`${BROWSER_API_URL}/api/collections?all=true`);
  if (!res.ok) throw new Error(`Failed to load collections (${res.status})`);
  const data: ApiCollection[] = await res.json();
  return data.map(mapCollection);
}

export async function adminFetchGalleryItems(): Promise<GalleryItem[]> {
  const res = await fetch(`${BROWSER_API_URL}/api/gallery`);
  if (!res.ok) throw new Error(`Failed to load gallery items (${res.status})`);
  return res.json();
}

// ---- Auth ----

type AuthResponse = { token: string; user: AuthUser };

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BROWSER_API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Response wasn't valid JSON (e.g. an HTML error page from a proxy,
    // or the API server not running) — fall through with data = null so
    // the generic message below is used instead of a raw parse error.
  }

  if (!res.ok) {
    throw new Error(data?.error || `Something went wrong (${res.status}). Please try again.`);
  }
  if (data === null) {
    throw new Error("Received an unexpected response from the server. Please try again.");
  }
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(token: string): Promise<AuthUser> {
  return authFetch<AuthUser>("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Search (browser-side, for the navbar search overlay) ----

export async function searchProducts(query: string, limit = 6): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const params = new URLSearchParams({ search: trimmed, pageSize: String(limit) });
  const data = await authFetch<{ items: ApiProduct[] }>(`/api/products?${params.toString()}`);
  return data.items.map(mapProduct);
}

// Fire-and-forget: logs a search keyword and how many products it
// matched, to power the admin "Search Insight" dashboard. Never surfaced
// to the visitor if it fails.
export function trackSearch(query: string, resultsCount: number): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  fetch(`${BROWSER_API_URL}/api/track/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: trimmed, resultsCount }),
    keepalive: true,
  }).catch(() => {});
}

// Fire-and-forget: logs a product page view / WhatsApp order click /
// share click, to power the admin "Product Insight" dashboard. Called
// from the product detail page, WhatsAppOrderButton, and ShareButton.
export function trackProductEvent(productId: string, type: "VIEW" | "WA_CLICK" | "SHARE"): void {
  fetch(`${BROWSER_API_URL}/api/track/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, type, visitorId: getVisitorId() ?? undefined }),
    keepalive: true,
  }).catch(() => {});
}

// ---- Cart ----
// All cart calls run in the browser (triggered by "Add to cart" clicks,
// the cart drawer, etc.), so — like auth — they use BROWSER_API_URL and
// require the caller to pass a bearer token explicitly.

type ApiCartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    code: string;
    name: string;
    price: number;
    image: string | null;
  };
};
type ApiCart = { id: string; items: ApiCartItem[]; totalItems: number; totalPrice: number };

function mapCart(c: ApiCart): Cart {
  return {
    items: c.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    })),
    totalItems: c.totalItems,
    totalPrice: c.totalPrice,
  };
}

function withAuth(token: string): RequestInit {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function getCart(token: string): Promise<Cart> {
  const data = await authFetch<ApiCart>("/api/cart", withAuth(token));
  return mapCart(data);
}

export async function addCartItem(
  token: string,
  productId: string,
  quantity = 1
): Promise<Cart> {
  const data = await authFetch<ApiCart>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
    ...withAuth(token),
  });
  return mapCart(data);
}

export async function updateCartItemQuantity(
  token: string,
  itemId: string,
  quantity: number
): Promise<Cart> {
  const data = await authFetch<ApiCart>(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
    ...withAuth(token),
  });
  return mapCart(data);
}

export async function removeCartItem(token: string, itemId: string): Promise<Cart> {
  const data = await authFetch<ApiCart>(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    ...withAuth(token),
  });
  return mapCart(data);
}

export async function clearCart(token: string): Promise<Cart> {
  const data = await authFetch<ApiCart>("/api/cart", {
    method: "DELETE",
    ...withAuth(token),
  });
  return mapCart(data);
}

// ---- Wishlist ----
// Same shape/approach as cart: browser-side calls with an explicit token.

export type ServerWishlistItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
};

type ApiWishlistItem = {
  id: string;
  product: { id: string; slug: string; code: string; name: string; price: number; image: string | null };
};

function mapWishlistItem(w: ApiWishlistItem): ServerWishlistItem {
  return {
    id: w.id,
    productId: w.product.id,
    slug: w.product.slug,
    name: w.product.name,
    price: w.product.price,
    image: w.product.image,
  };
}

export async function getWishlist(token: string): Promise<ServerWishlistItem[]> {
  const data = await authFetch<{ items: ApiWishlistItem[] }>("/api/wishlist", withAuth(token));
  return data.items.map(mapWishlistItem);
}

export async function addWishlistItem(
  token: string,
  productId: string
): Promise<ServerWishlistItem[]> {
  const data = await authFetch<{ items: ApiWishlistItem[] }>("/api/wishlist/items", {
    method: "POST",
    body: JSON.stringify({ productId }),
    ...withAuth(token),
  });
  return data.items.map(mapWishlistItem);
}

export async function removeWishlistItem(
  token: string,
  productId: string
): Promise<ServerWishlistItem[]> {
  const data = await authFetch<{ items: ApiWishlistItem[] }>(`/api/wishlist/items/${productId}`, {
    method: "DELETE",
    ...withAuth(token),
  });
  return data.items.map(mapWishlistItem);
}

// ---- Admin: Products ----
// Used by the /admin dashboard. All require an ADMIN bearer token.

export type ProductInput = {
  code: string;
  slug: string;
  name: string;
  price: number;
  shortDescription: string;
  description: string;
  collectionSlugs: string[];
  categories: Category[];
  images: string[];
  videoUrl?: string | null;
  specifications: { label: string; value: string }[];
  featured?: boolean;
  available?: boolean;
};

export async function adminCreateProduct(token: string, input: ProductInput): Promise<Product> {
  const data = await authFetch<ApiProduct>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
    ...withAuth(token),
  });
  return mapProduct(data);
}

export async function adminUpdateProduct(
  token: string,
  slug: string,
  input: Partial<ProductInput>
): Promise<Product> {
  const data = await authFetch<ApiProduct>(`/api/products/${slug}`, {
    method: "PUT",
    body: JSON.stringify(input),
    ...withAuth(token),
  });
  return mapProduct(data);
}

async function authDelete(path: string, token: string): Promise<void> {
  const res = await fetch(`${BROWSER_API_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    // DELETE endpoints return 204 (no body) on success, but may return a
    // JSON error body on failure — try to surface that message.
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // no JSON body — keep the generic message
    }
    throw new Error(message);
  }
}

export async function adminDeleteProduct(token: string, slug: string): Promise<void> {
  return authDelete(`/api/products/${slug}`, token);
}

// ---- Admin: Collections ----

export type CollectionInput = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  parentSlug?: string | null;
};

export async function adminCreateCollection(
  token: string,
  input: CollectionInput
): Promise<Collection> {
  const data = await authFetch<ApiCollection>("/api/collections", {
    method: "POST",
    body: JSON.stringify(input),
    ...withAuth(token),
  });
  return mapCollection(data);
}

export async function adminUpdateCollection(
  token: string,
  slug: string,
  input: Partial<CollectionInput>
): Promise<Collection> {
  const data = await authFetch<ApiCollection>(`/api/collections/${slug}`, {
    method: "PUT",
    body: JSON.stringify(input),
    ...withAuth(token),
  });
  return mapCollection(data);
}

export async function adminDeleteCollection(token: string, slug: string): Promise<void> {
  return authDelete(`/api/collections/${slug}`, token);
}

// ---- Admin: Gallery ----

export type GalleryInput = {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tag: GalleryItem["tag"];
};

export async function adminCreateGalleryItem(
  token: string,
  input: GalleryInput
): Promise<GalleryItem> {
  return authFetch<GalleryItem>("/api/gallery", {
    method: "POST",
    body: JSON.stringify(input),
    ...withAuth(token),
  });
}

export async function adminUpdateGalleryItem(
  token: string,
  slug: string,
  input: Partial<GalleryInput>
): Promise<GalleryItem> {
  return authFetch<GalleryItem>(`/api/gallery/${slug}`, {
    method: "PUT",
    body: JSON.stringify(input),
    ...withAuth(token),
  });
}

export async function adminDeleteGalleryItem(token: string, slug: string): Promise<void> {
  return authDelete(`/api/gallery/${slug}`, token);
}

// ---- Admin: Users ----

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  _count?: { wishlistItems: number };
};

export async function adminListUsers(token: string): Promise<AdminUser[]> {
  return authFetch<AdminUser[]>("/api/users", withAuth(token));
}

export async function adminUpdateUserRole(
  token: string,
  id: string,
  role: "CUSTOMER" | "ADMIN"
): Promise<AdminUser> {
  return authFetch<AdminUser>(`/api/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    ...withAuth(token),
  });
}

export async function adminDeleteUser(token: string, id: string): Promise<void> {
  return authDelete(`/api/users/${id}`, token);
}

// ---- Admin: Image Upload ----
// Uploads one or more files to the backend (Multer-backed, admin only)
// and returns full, browser-viewable URLs — combining BROWSER_API_URL
// with the relative paths the backend returns, since the backend itself
// doesn't know its own public origin.

export async function adminUploadImages(token: string, files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  let res: Response;
  try {
    res = await fetch(`${BROWSER_API_URL}/api/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // fall through — handled below
  }

  if (!res.ok) {
    throw new Error(data?.error || `Upload failed (${res.status}). Please try again.`);
  }
  if (!data?.urls) {
    throw new Error("Received an unexpected response from the server. Please try again.");
  }
  return data.urls.map((url: string) => `${BROWSER_API_URL}${url}`);
}

// Uploads a single product video (Multer-backed, admin only, separate
// size/mimetype limits from images — see backend/src/routes/uploads.ts)
// and returns the full, browser-viewable URL.
export async function adminUploadVideo(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${BROWSER_API_URL}/api/uploads/video`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // fall through — handled below
  }

  if (!res.ok) {
    throw new Error(data?.error || `Upload failed (${res.status}). Please try again.`);
  }
  if (!data?.url) {
    throw new Error("Received an unexpected response from the server. Please try again.");
  }
  return `${BROWSER_API_URL}${data.url}`;
}

// ---- Admin: Analytics ----

// Period grouping for the /admin/insight charts — mirrors the backend's
// GroupBy type (backend/src/lib/timeseries.ts).
export type InsightGroupBy = "day" | "week" | "month";

function groupByQuery(groupBy?: InsightGroupBy): string {
  return groupBy ? `?groupBy=${groupBy}` : "";
}

export type AnalyticsOverview = {
  totalUsers: number;
  newUsersToday: number;
  activeToday: number;
  activeThisMonth: number;
  onlineNow: number;
  totalLogins: number;
  loginsToday: number;
  returningUsers: number;
  onlineWindowMinutes: number;
  timeseries: { bucket: string; newUsers: number; logins: number }[];
};

export async function adminFetchAnalytics(
  token: string,
  groupBy?: InsightGroupBy
): Promise<AnalyticsOverview> {
  return authFetch<AnalyticsOverview>(`/api/analytics/overview${groupByQuery(groupBy)}`, withAuth(token));
}

export type VisitorInsight = {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
  avgSessionDurationSeconds: number;
  bounceRate: number;
  devices: Record<string, number>;
  timeseries: { bucket: string; pageViews: number; sessions: number }[];
};

export async function adminFetchVisitorInsight(
  token: string,
  groupBy?: InsightGroupBy
): Promise<VisitorInsight> {
  return authFetch<VisitorInsight>(`/api/analytics/visitors${groupByQuery(groupBy)}`, withAuth(token));
}

export type Ga4Overview = {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDurationSeconds: number;
  bounceRate: number;
  devices: Record<string, number>;
  topCountries: { country: string; activeUsers: number }[];
  dateRange: string;
};

export async function adminFetchGa4Overview(token: string): Promise<Ga4Overview> {
  return authFetch<Ga4Overview>("/api/analytics/ga4", withAuth(token));
}

export type BehaviorInsight = {
  peakHours: { hour: number; count: number }[];
  newVisitors: number;
  returningVisitors: number;
};

export async function adminFetchBehaviorInsight(token: string): Promise<BehaviorInsight> {
  return authFetch<BehaviorInsight>("/api/analytics/behavior", withAuth(token));
}

export type SearchInsight = {
  topKeywords: { query: string; count: number }[];
  zeroResultKeywords: { query: string; count: number }[];
  timeseries: { bucket: string; count: number }[];
};

export async function adminFetchSearchInsight(
  token: string,
  groupBy?: InsightGroupBy
): Promise<SearchInsight> {
  return authFetch<SearchInsight>(`/api/analytics/search${groupByQuery(groupBy)}`, withAuth(token));
}

export type ProductInsight = {
  totalViews: number;
  totalWaClicks: number;
  totalShares: number;
  conversionRate: number;
  repeatViewCount: number;
  topViewed: { product: { id: string; name: string; slug: string } | null; count: number }[];
  topWishlisted: { product: { id: string; name: string; slug: string } | null; count: number }[];
  timeseries: { bucket: string; views: number; waClicks: number; shares: number }[];
};

export async function adminFetchProductInsight(
  token: string,
  groupBy?: InsightGroupBy
): Promise<ProductInsight> {
  return authFetch<ProductInsight>(`/api/analytics/products${groupByQuery(groupBy)}`, withAuth(token));
}

// ---- Heartbeat ----
// Called periodically by AuthProvider while someone is logged in, so
// the admin dashboard's "online now" count reflects reality.

export async function sendHeartbeat(token: string): Promise<void> {
  try {
    await fetch(`${BROWSER_API_URL}/api/auth/heartbeat`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Best-effort — a missed heartbeat isn't worth surfacing to the user.
  }
}