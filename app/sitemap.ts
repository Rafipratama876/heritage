import { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { getCollections } from "@/lib/collections";

const siteUrl = "https://rizalheritage.com";

// Generated per-request (not at build time) since it depends on the
// live database and the API isn't reachable during `docker compose build`.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/products",
    "/collections",
    "/gallery",
    "/shipping",
    "/contact",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const [products, collections] = await Promise.all([getProducts(), getCollections()]);

  const productRoutes = products.map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: new Date(),
  }));

  const collectionRoutes = collections.map((c) => ({
    url: `${siteUrl}/collections/${c.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
