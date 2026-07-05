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

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    let showTimer: NodeJS.Timeout;

    // Only run this cycle if the prompt is available and not yet installed
    if (showBanner && deferredPrompt && !isInstalled) {
      hideTimer = setTimeout(() => {
        setShowBanner(false);
        showTimer = setTimeout(() => {
          setShowBanner(true);
        }, 60000);
      }, 30000);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, [showBanner, deferredPrompt, isInstalled]);

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
      <div className="bg-white rounded-2xl shadow-2xl border border-cocoa/10 p-4 max-w-xs relative">
        <button
          onClick={() => setShowBanner(false)}
          className="absolute top-2 right-2 p-1 text-cocoa/30 hover:text-cocoa transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <Image src="/cat.png" alt="" width={56} height={56} className="rounded-lg object-contain w-[56px] h-[56px] shrink-0" />
          <div className="pt-1">
            <p className="font-bold text-cocoa text-sm">Install ForeverHome AI</p>
            <p className="text-xs text-cocoa/50 mt-0.5">
              Add to your home screen for quick access
            </p>
            <Button
              onClick={handleInstall}
              size="sm"
              className="mt-2 bg-coral text-white hover:bg-coral-deep text-xs h-7 px-3 rounded-xl font-semibold"
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
