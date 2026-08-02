import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Product/category images are arbitrary URLs entered by admins in
      // the dashboard, so any https host needs to be renderable.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
