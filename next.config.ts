import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // REQUIRED FOR GITHUB PAGES STATIC HOSTING
  images: {
    unoptimized: true, // REQUIRED FOR STATIC EXPORTS
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "**.vercel.app" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
};

export default nextConfig;
