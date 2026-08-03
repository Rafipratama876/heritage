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
      // Uploaded product/collection/gallery images are served by the
      // backend at /uploads/... — this covers local dev and
      // docker-compose testing. Once deployed, add your backend's real
      // domain here too (e.g. { protocol: 'https', hostname: 'api.yourdomain.com' }).
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
