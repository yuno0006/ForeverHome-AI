"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent px-4 text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-2xl bg-heart-light p-6">
          <AlertTriangle className="size-12 text-heart" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-cat-dark">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="default" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" render={<Link href="/" />}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}