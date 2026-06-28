"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cat } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-cream px-4 text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-2xl bg-sunny-light p-6">
          <Cat className="size-16 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-cat-dark">Page not found</h1>
          <p className="max-w-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="default" render={<Link href="/" />}>
            Go Home
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}