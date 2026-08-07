// Uploaded product/collection/gallery images are served by the backend
// (e.g. https://api.yourdomain.com/uploads/...) and rendered via
// NEXT_PUBLIC_API_URL, which lib/api.ts prefixes onto the relative path
// the backend returns. next/image blocks any hostname not explicitly
// allow-listed here — previously only "localhost" was allowed, so
// uploaded images silently failed to render (broken-image icon) on any
// deployment where NEXT_PUBLIC_API_URL points at a real domain instead
// of localhost. We derive that hostname from the env var automatically
// so this stays correct without manual edits on every deploy.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
let apiRemotePattern;
try {
  const parsed = new URL(apiUrl);
  apiRemotePattern = {
    protocol: parsed.protocol.replace(":", ""),
    hostname: parsed.hostname,
    ...(parsed.port ? { port: parsed.port } : {}),
  };
} catch {
  apiRemotePattern = { protocol: "http", hostname: "localhost" };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // Optimization disabled: Next's built-in optimizer fetches images
    // server-side (inside the frontend container), where "localhost"
    // resolves to the frontend container itself — not the backend. That
    // breaks uploaded images specifically (Unsplash images are already
    // pre-optimized via their own URL params anyway, so little is lost).
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Local dev / docker-compose fallback, kept even if the API URL
      // above resolves to something else.
      { protocol: 'http', hostname: 'localhost' },
      apiRemotePattern,
    ],
  },
};

export default nextConfig;
