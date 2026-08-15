import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Locally-uploaded media is served from the backend's own loopback
    // address in dev (127.0.0.1) — Next.js 16 blocks optimizing images
    // from local/private IPs by default (SSRF protection), so it must be
    // explicitly opted into here or every uploaded image 404s via next/image.
    // Dev-only: in production this would let the image optimizer be pointed
    // at internal services / cloud metadata endpoints via an admin-entered
    // image URL, since remotePatterns below is deliberately wide open.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Product/category images are arbitrary URLs entered by admins in
      // the dashboard, so any host needs to be renderable — including http,
      // to tolerate old/local-dev image URLs saved before this went live.
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // A full CSP isn't set here — the storefront injects Facebook/Google/
  // TikTok pixel scripts dynamically (see components/pixels.tsx) and
  // locking that down safely needs a dedicated nonce/allow-list pass. These
  // are the headers that don't risk breaking that.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
