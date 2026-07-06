"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Heart, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole } from "@/types/user";

interface FieldErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!displayName.trim()) {
      errors.displayName = "Display name is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!selectedRole) {
      errors.role = "Please select a role";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    setLoading(true);

    try {
      await register(email, password, selectedRole!, displayName.trim());
      // New users always go through onboarding.
      router.replace("/onboarding");
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code
          : "";

      const friendlyMessages: Record<string, string> = {
        "auth/email-already-in-use":
          "An account with this email already exists. Please sign in instead.",
        "auth/weak-password":
          "Password is too weak. Please use at least 8 characters with a mix of letters and numbers.",
        "auth/invalid-email":
          "Please enter a valid email address.",
        "auth/network-request-failed":
          "Network error. Please check your internet connection.",
        "auth/too-many-requests":
          "Too many attempts. Please wait a moment and try again.",
      };

      const message =
        friendlyMessages[code] ||
        (err instanceof Error
          ? err.message
          : "Registration failed. Please try again.");
      setFormError(message);
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setFormError("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      // New / unverified Google users always onboard; AuthGuard and the
      // onboarding page redirect them onward if already complete.
      router.replace("/onboarding");
    } catch (err: unknown) {
      // "REDIRECTING_TO_GOOGLE" means we fell back to redirect flow —
      // the page is about to navigate away, so don't show an error.
      if (err instanceof Error && err.message === "REDIRECTING_TO_GOOGLE") {
        return; // redirect is in progress, keep loading state
      }

      const code =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code
          : "";

      const friendlyMessages: Record<string, string> = {
        "auth/popup-closed-by-user":
          "Sign-in popup was closed. Please try again and select your Google account.",
        "auth/cancelled-popup-request":
          "Another sign-in attempt is already in progress.",
        "auth/network-request-failed":
          "Network error. Please check your internet connection and try again.",
      };

      const message =
        friendlyMessages[code] ||
        (err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.");

      setFormError(message);
      setGoogleLoading(false);
    }
  }

  const isLoading = loading || googleLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <Image
            src="/cat.png"
            alt="ForeverHome AI"
            width={64}
            height={64}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold text-cat-dark">
            Create your account
          </h1>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                aria-invalid={!!fieldErrors.displayName}
              />
              {fieldErrors.displayName && (
                <p className="text-xs text-heart" role="alert">
                  {fieldErrors.displayName}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="text-xs text-heart" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <p className="text-xs text-heart" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.confirmPassword}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-heart" role="alert">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <Label>I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("adopter")}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 min-h-[88px] ${
                    selectedRole === "adopter"
                      ? "border-heart bg-heart-light ring-2 ring-heart/20"
                      : "border-border hover:border-heart/50 hover:bg-heart-light/50"
                  }`}
                >
                  <Heart
                    className={`size-6 ${
                      selectedRole === "adopter"
                        ? "text-heart"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-medium text-cat-dark">
                    Adopter
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("shelter_staff")}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 min-h-[88px] ${
                    selectedRole === "shelter_staff"
                      ? "border-sunny bg-sunny-light ring-2 ring-sunny/20"
                      : "border-border hover:border-sunny/50 hover:bg-sunny-light/50"
                  }`}
                >
                  <Shield
                    className={`size-6 ${
                      selectedRole === "shelter_staff"
                        ? "text-sunny"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-medium text-cat-dark">
                    Shelter Staff
                  </span>
                </button>
              </div>
              {fieldErrors.role && (
                <p className="text-xs text-heart" role="alert">
                  {fieldErrors.role}
                </p>
              )}
            </div>

            {formError && (
              <p className="text-sm text-heart font-medium" role="alert">
                {formError}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 cursor-pointer bg-cat-dark text-white hover:bg-cat-dark/90 transition-colors duration-200"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full h-11 cursor-pointer transition-colors duration-200"
          >
            {googleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <svg className="size-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-cat-dark underline-offset-4 hover:underline cursor-pointer transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
