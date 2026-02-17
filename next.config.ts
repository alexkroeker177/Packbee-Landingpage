import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "picsum.photos" },
      { hostname: "ui-avatars.com" },
    ],
  },
};

export default nextConfig;
