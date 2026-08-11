import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "://unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "**.vercel.app" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
};

export default nextConfig;
