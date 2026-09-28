import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.sephora.com" },
      { protocol: "https", hostname: "**.ulta.com" },
      { protocol: "https", hostname: "**.dior.com" },
      { protocol: "https", hostname: "**.chanel.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
