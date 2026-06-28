"use client";

import Image from "next/image";

export default function PageLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-warm-cream/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/cat.png"
          alt="Loading"
          width={32}
          height={32}
          className="animate-pulse"
        />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}