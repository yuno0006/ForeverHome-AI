import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto rounded-t-3xl border-t border-border bg-card/70 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          {/* Brand */}
          <div className="max-w-sm text-center sm:text-left">
            <div className="flex items-center justify-center gap-2.5 sm:justify-start">
              <div className="rounded-2xl bg-secondary p-1.5 ring-1 ring-primary/15">
                <Image
                  src="/cat.png"
                  alt="ForeverHome AI"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="text-lg font-extrabold text-cat-dark">
                ForeverHome <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Warm, transparent technology that helps shelters and adopters give
              every cat a forever home.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-col items-center gap-3 text-sm font-semibold text-muted-foreground sm:items-end">
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

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            Made with
            <Heart className="h-4 w-4 fill-primary text-primary" />
            for cats
          </p>
          <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground sm:text-right">
            ForeverHome AI is not a replacement for shelter professionals or
            veterinarians. It is a decision-support and adopter-education platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
