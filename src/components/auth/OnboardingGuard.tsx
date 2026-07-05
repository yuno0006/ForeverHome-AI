"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const EXEMPT_PATHS = ["/login", "/onboarding", "/register"];

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, userDoc, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Don't guard exempt paths
    if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return;

    // Authenticated user without completed onboarding → force onboarding
    if (user && (!userDoc || !userDoc.onboardingComplete)) {
      router.replace("/onboarding");
    }
  }, [loading, user, userDoc, pathname, router]);

  // Show nothing while checking — avoids flash of wrong content
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-cream">
        <Loader2 className="size-8 animate-spin text-sunny" />
      </div>
    );
  }

  // On exempt paths or fully onboarded users, render normally
  if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return <>{children}</>;

  // Not logged in — render normally (auth guard handles individual pages)
  if (!user) return <>{children}</>;

  // Still loading userDoc or needs onboarding — spinner until redirect
  if (!userDoc || !userDoc.onboardingComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-cream">
        <Loader2 className="size-8 animate-spin text-sunny" />
      </div>
    );
  }

  return <>{children}</>;
}
