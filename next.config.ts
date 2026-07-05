import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Move build cache to C: SSD for much faster compilation
  // distDir: "C:\\.next-cache\\foreverhome-ai",
  // Disable image optimization for faster dev builds
  images: {
    unoptimized: true,
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

export default withPWA(nextConfig);
