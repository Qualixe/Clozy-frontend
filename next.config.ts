import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Locally-uploaded media is served from the backend's own loopback
    // address in dev (127.0.0.1) — Next.js 16 blocks optimizing images
    // from local/private IPs by default (SSRF protection), so it must be
    // explicitly opted into here or every uploaded image 404s via next/image.
    dangerouslyAllowLocalIP: true,
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
};

export default nextConfig;
