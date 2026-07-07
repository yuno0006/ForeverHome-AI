"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LogOut, Menu, X, Bookmark, LayoutDashboard, Cat, MessageCircle, Sparkles, Info, Gamepad2, User } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { fetchSavedCatIds } from "@/lib/firestoreService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string | undefined | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Header() {
  const { user, userDoc, role, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  useEffect(() => {
    if (user) {
      fetchSavedCatIds(user.uid)
        .then((ids) => setSavedCount(ids.length))
        .catch(() => {});
    } else {
      setSavedCount(0);
    }
  }, [user, pathname]);

  const getNavLinks = () => {
    const alwaysLinks = [
      { href: "/", label: "Home", icon: Home },
      { href: "/cats", label: "Cats", icon: Cat },
      { href: "/coach", label: "AI Coach", icon: MessageCircle },
    ];
    if (!userDoc?.onboardingComplete) {
      alwaysLinks.push({ href: "/assessment/new", label: "Quiz", icon: Sparkles });
    }
    if (!user) return [
      ...alwaysLinks,
      { href: "/about", label: "About", icon: Info },
    ];
    return alwaysLinks;
  };

  const navLinks = getNavLinks();

  const getDashboardHref = () => {
    if (role === "shelter_staff") return "/shelter/dashboard";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 glass border-b-2 border-cocoa/10">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-[49px] h-[49px] rounded-2xl bg-gradient-to-br from-coral/15 to-honey/15 flex items-center justify-center border-2 border-cocoa/10 shadow-[3px_3px_0px_0px_rgba(42,29,20,0.15)] group-hover:shadow-[5px_5px_0px_0px_rgba(255,107,107,0.4)] group-hover:-translate-y-0.5 group-hover:border-coral/30 transition-all">
            <Image src="/cat.png" alt="Logo" width={60} height={60} className="w-[85%] h-[85%] object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tight text-cocoa leading-none">
              ForeverHome <span className="text-coral">AI</span>
            </span>
            <span className="text-[10px] font-bold text-cocoa/50 tracking-[0.1em] uppercase mt-0.5">
              Cat Adoption
            </span>
          </div>
        </Link>

        {/* Desktop Links — always show: Home, Cats, AI Coach, Quiz, About */}
        <div className="hidden lg:flex items-center gap-1 bg-white/60 border-2 border-cocoa/10 rounded-full p-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full font-bold text-xs transition-all ${
                isActive(link.href)
                  ? "bg-cocoa text-cream shadow-[2px_2px_0px_0px_rgba(255,107,107,1)]"
                  : "text-cocoa/70 hover:bg-cocoa/5"
              }`}
            >
              <link.icon className={`w-4 h-4 ${isActive(link.href) ? "text-coral" : ""}`} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-cocoa/10" />
          ) : !user ? (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cocoa text-cream font-bold text-sm border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(255,107,107,1)] hover:shadow-[5px_5px_0px_0px_rgba(255,107,107,1)] hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Heart className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border-2 border-cocoa/15 hover:border-cocoa hover:shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] transition-all outline-none"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border-2 border-cocoa/10">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={userDoc?.displayName || "User"}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-coral flex items-center justify-center text-white text-xs font-medium">
                        {getInitials(userDoc?.displayName)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-bold text-cocoa hidden sm:inline">
                    {userDoc?.displayName?.split(' ')[0] || 'Profile'}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-2 border-cocoa/15 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] p-2 bg-cream">
                  <DropdownMenuItem
                    render={<Link href="/profile" className="flex items-center w-full" />}
                    className="rounded-xl cursor-pointer hover:bg-cocoa/5 font-semibold text-cocoa focus-visible:bg-cocoa/5"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href={getDashboardHref()} className="flex items-center w-full" />}
                    className="rounded-xl cursor-pointer hover:bg-cocoa/5 font-semibold text-cocoa focus-visible:bg-cocoa/5"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {role === "shelter_staff" ? "Shelter Hub" : "Dashboard"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href="/saved" className="flex items-center w-full" />}
                    className="rounded-xl cursor-pointer hover:bg-cocoa/5 font-semibold text-cocoa focus-visible:bg-cocoa/5"
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href="/about" className="flex items-center w-full" />}
                    className="rounded-xl cursor-pointer hover:bg-cocoa/5 font-semibold text-cocoa focus-visible:bg-cocoa/5"
                  >
                    <Info className="mr-2 h-4 w-4" />
                    About
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-cocoa/10 my-1 h-[2px]" />
                  <DropdownMenuItem onClick={() => logout()} className="rounded-xl cursor-pointer hover:bg-coral/10 font-bold text-coral focus:bg-coral/10 focus:text-coral">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <button
            className="lg:hidden p-3 rounded-xl bg-cocoa/15 hover:bg-cocoa/25 transition-colors border-2 border-cocoa/25 shadow-[2px_2px_0px_0px_rgba(42,29,20,1)]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-6 h-6 text-cocoa" /> : <Menu className="w-6 h-6 text-cocoa" />}
          </button>
        </div>
      </div>

      {/* Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t-2 border-cocoa/10 bg-cream"
          >
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all ${
                    isActive(link.href)
                      ? "bg-cocoa text-cream"
                      : "text-cocoa/70 hover:bg-cocoa/5"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all ${
                      isActive("/profile") ? "bg-cocoa text-cream" : "text-cocoa/70 hover:bg-cocoa/5"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all ${
                      isActive(getDashboardHref()) ? "bg-cocoa text-cream" : "text-cocoa/70 hover:bg-cocoa/5"
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {role === "shelter_staff" ? "Shelter Hub" : "Dashboard"}
                  </Link>
                  <Link
                    href="/saved"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all ${
                      isActive("/saved") ? "bg-cocoa text-cream" : "text-cocoa/70 hover:bg-cocoa/5"
                    }`}
                  >
                    <Bookmark className="w-5 h-5" />
                    Wishlist
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); logout(); }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl font-bold text-coral hover:bg-coral/10 transition-all w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
