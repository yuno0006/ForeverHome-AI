import type { Metadata, Viewport } from "next";
import { Nunito, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PWAInstallButton from "@/components/ui/PWAInstallButton";
import { Providers } from "@/components/Providers";
import { OnboardingGuard } from "@/components/auth/OnboardingGuard";
import { CatBackground } from "@/components/CatBackground";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFBF5",
};

export const metadata: Metadata = {
  title: "ForeverHome — Adopt Your Perfect Cat Companion",
  description:
    "Discover your ideal feline friend with AI-powered compatibility matching, the 9 Lives Protocol, and Days 10–14 of Maintenance Mode support.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/cat.png", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ForeverHome AI",
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
      className={`${nunito.variable} ${fraunces.variable} ${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-cream text-cocoa relative" suppressHydrationWarning>
        <CatBackground />
        <Providers>
          <OnboardingGuard>
            <Header />
            <main className="relative z-10 flex-1">{children}</main>
            <Footer />
            <PWAInstallButton />
          </OnboardingGuard>
        </Providers>
      </body>
    </html>
  );
}
