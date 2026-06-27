"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to login
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Role mismatch - redirect to home
    if (requiredRole && role !== requiredRole) {
      router.replace("/");
      return;
    }
  }, [user, role, loading, requiredRole, router, pathname]);

  // Show loading spinner while auth resolves
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Do not render children until auth check passes
  if (!user) return null;
  if (requiredRole && role !== requiredRole) return null;

  return <>{children}</>;
}