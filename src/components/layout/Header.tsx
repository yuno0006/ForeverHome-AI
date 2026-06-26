"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-sunny/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
              <img
                src="/cat-logo.png?v=2"
                alt="ForeverHome"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-cat-dark">
                ForeverHome
              </span>
              <span className="text-[10px] font-medium text-heart -mt-0.5 tracking-wider uppercase">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/cats", label: "Cats" },
              { href: "/coach/barnaby-adoption-1", label: "Coach" },
              { href: "/insights", label: "Insights" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-charcoal/70 hover:text-cat-dark hover:bg-sunny-light rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-sunny-light transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-1">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/cats", label: "Cats" },
              { href: "/coach/barnaby-adoption-1", label: "Coach" },
              { href: "/insights", label: "Insights" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-sm font-medium text-charcoal/70 hover:text-cat-dark hover:bg-sunny-light rounded-xl transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
