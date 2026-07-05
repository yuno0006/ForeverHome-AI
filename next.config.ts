import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const isDev = process.env.NODE_ENV === "development";

// Origins the app actually talks to: Firebase Auth/Firestore/Storage and
// the Gemini API. Keep this list tight — anything not listed here will be
// blocked by the browser.
const connectSrc = [
  "'self'",
  "https://firestore.googleapis.com",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://firebasestorage.googleapis.com",
  "https://generativelanguage.googleapis.com",
  "https://*.firebaseio.com",
  "wss://*.firebaseio.com",
].join(" ");

// Google's sign-in popup flow relies on a small iframe for auth-state
// communication, hosted on the Firebase auth domain.
const frameSrc = [
  "'self'",
  "https://foreverhomeai.firebaseapp.com",
  "https://accounts.google.com",
].join(" ");

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com;
  font-src 'self' data:;
  connect-src ${connectSrc};
  frame-src ${frameSrc};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  // Superseded by CSP's frame-ancestors above, but kept for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Move build cache to C: SSD for much faster compilation
  // distDir: "C:\\.next-cache\\foreverhome-ai",
  // Disable image optimization for faster dev builds
  images: {
    unoptimized: true,
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withPWA(nextConfig);
