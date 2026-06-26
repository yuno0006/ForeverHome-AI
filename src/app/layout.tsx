import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LottieCatRunner from "@/components/ui/LottieCatRunner";
import PWAInstallButton from "@/components/ui/PWAInstallButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ForeverHome AI — Every cat deserves a forever home",
  description:
    "ForeverHome AI helps shelters identify compatibility concerns before adoption, supports adopters during the first 14 days, and tracks progress so shelters can see how each cat is adjusting.",
  manifest: "/manifest.json",
  themeColor: "#FFC107",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ForeverHome AI",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-cream text-charcoal">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <LottieCatRunner />
        <PWAInstallButton />
      </body>
    </html>
  );
}
