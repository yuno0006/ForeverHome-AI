import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto rounded-t-3xl border-t-2 border-cocoa/15 bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          {/* Brand */}
          <div className="max-w-sm text-center sm:text-left">
            <div className="flex items-center justify-center gap-2.5 sm:justify-start">
              <Image
                src="/cat.png"
                alt="ForeverHome AI"
                width={56}
                height={56}
                className="h-14 w-14 object-contain shrink-0"
              />
              <span className="text-lg font-extrabold text-cat-dark">
                ForeverHome <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-cocoa font-bold">
              Warm, transparent technology that helps shelters and adopters give
              every cat a forever home.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-col items-center gap-3 text-sm font-bold text-cocoa sm:items-end">
            <Link
              href="/cats"
              className="transition-colors hover:text-primary"
            >
              Cats
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary"
            >
              Privacy
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t-2 border-cocoa/15 pt-6 sm:flex-row">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold text-cocoa">
            Made with
            <Heart className="h-4 w-4 fill-primary text-primary" />
            for cats
          </p>
          <p className="max-w-md text-center text-xs leading-relaxed text-cocoa font-bold sm:text-right">
            ForeverHome AI is not a replacement for shelter professionals or
            veterinarians. It is a decision-support and adopter-education platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
