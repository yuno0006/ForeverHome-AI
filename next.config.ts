import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move build cache to C: SSD for much faster compilation
  // distDir: "C:\\.next-cache\\foreverhome-ai",
  // Disable image optimization for faster dev builds
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
