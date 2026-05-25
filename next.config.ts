import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: {
    // External images (Unsplash, etc.) — unoptimized for static export
    unoptimized: true,
  },
};

export default nextConfig;
