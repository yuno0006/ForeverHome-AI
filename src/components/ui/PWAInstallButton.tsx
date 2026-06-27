"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-sunny/20 p-4 max-w-xs relative">
        <button
          onClick={() => setShowBanner(false)}
          className="absolute top-2 right-2 p-1 text-charcoal/30 hover:text-charcoal transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sunny/15 rounded-xl shrink-0">
            <Image src="/cat.png" alt="" width={28} height={28} className="rounded-lg" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-cat-dark text-sm">Install ForeverHome</p>
            <p className="text-xs text-charcoal/50 mt-0.5">
              Add to your home screen for quick access
            </p>
            <Button
              onClick={handleInstall}
              size="sm"
              className="mt-2 bg-sunny hover:bg-sunny/90 text-cat-dark text-xs h-7 px-3 rounded-xl font-semibold"
            >
              <Download className="h-3 w-3 mr-1" />
              Install App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
