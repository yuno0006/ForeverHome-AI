"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserDocument } from "@/types/user";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectTo = searchParams.get("redirect");

  function redirectFromDoc(doc: UserDocument | null) {
    // Incomplete or missing profile -> always onboard.
    if (!doc || !doc.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    // Onboarding complete: honor explicit redirect target if present.
    if (redirectTo) {
      router.replace(redirectTo);
      return;
    }
    if (doc.role === "shelter_staff") {
      router.replace("/shelter/dashboard");
      return;
    }
    router.replace("/dashboard");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const doc = await login(email, password);
      redirectFromDoc(doc);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);

    try {
      const doc = await loginWithGoogle();
      redirectFromDoc(doc);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.";
      setError(message);
      setGoogleLoading(false);
    }
  }

  const isLoading = loading || googleLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-cream px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <Image
            src="/cat.png"
            alt="ForeverHome AI"
            width={64}
            height={64}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold text-cat-dark">Welcome back</h1>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-heart font-medium" role="alert">
                {error}
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
                "Sign in"
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

          {/* Demo credentials — for judges & evaluators */}
          <div className="mt-5 rounded-xl border-2 border-honey/40 bg-honey/5 p-4">
            <p className="text-xs font-bold text-cocoa/50 uppercase tracking-wide mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1 text-xs font-mono text-cocoa/70">
              <p>Email: <span className="font-semibold text-cocoa">demo@foreverhome.ai</span></p>
              <p>Password: <span className="font-semibold text-cocoa">demo123456</span></p>
            </div>
            <p className="mt-2 text-[11px] text-cocoa/40 leading-relaxed">
              Or skip login entirely —{" "}
              <Link
                href="/assessment/barnaby"
                className="underline font-semibold text-cocoa/60 hover:text-cocoa"
              >
                try the quiz as a guest
              </Link>
              {" "}with a sample profile. No account required.
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-cat-dark underline-offset-4 hover:underline cursor-pointer transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


export default function LoginPage() { return <Suspense><LoginPageContent /></Suspense>; }
