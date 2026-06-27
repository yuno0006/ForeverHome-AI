"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

  const isActive = (href: string) => pathname === href;

  const getNavLinks = () => {
    if (!user) {
      return [{ href: "/cats", label: "Cats" }];
    }
    if (role === "adopter") {
      return [
        { href: "/cats", label: "Cats" },
        { href: "/dashboard", label: "My Assessments" },
        { href: "/coach/barnaby-adoption-1", label: "Coach" },
      ];
    }
    return [{ href: "/cats", label: "Cats" }];
  };

  const navLinks = getNavLinks();

  const getDashboardHref = () => {
    if (role === "shelter_staff") return "/shelter/dashboard";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sunny/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/cat.png"
              alt="ForeverHome AI"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            <span className="text-lg font-bold text-cat-dark">
              ForeverHome<span className="text-heart">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive(link.href)
                    ? "bg-sunny-light text-cat-dark"
                    : "text-charcoal/70 hover:text-cat-dark hover:bg-sunny-light"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-sunny-light" />
            ) : !user ? (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-charcoal/70 hover:text-cat-dark"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="cursor-pointer bg-sunny hover:bg-sunny/80 text-cat-dark"
                  >
                    Register
                  </Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sunny transition-all duration-150">
                  <Avatar>
                    {user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={userDoc?.displayName || "User"} />
                    ) : null}
                    <AvatarFallback className="bg-sunny-light text-cat-dark text-xs font-medium">
                      {getInitials(userDoc?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-cat-dark">
                        {userDoc?.displayName}
                      </p>
                      <p className="text-xs text-charcoal/50">{userDoc?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" render={<Link href="/profile" />}>
                    <User className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" render={<Link href={getDashboardHref()} />}>
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-heart"
                    onClick={() => logout()}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="p-2 rounded-xl hover:bg-sunny-light transition-colors duration-200 cursor-pointer">
                <Menu className="h-5 w-5 text-cat-dark" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-warm-cream">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img src="/cat.png" alt="" width={32} height={32} className="w-8 h-8" />
                    <span className="text-cat-dark font-bold">
                      ForeverHome<span className="text-heart">AI</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 px-4 mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                        isActive(link.href)
                          ? "bg-sunny-light text-cat-dark"
                          : "text-charcoal/70 hover:text-cat-dark hover:bg-sunny-light"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {role === "shelter_staff" && (
                    <>
                      <div className="my-2 h-px bg-sunny/20" />
                      {[
                        { href: "/shelter/dashboard", label: "Dashboard" },
                        { href: "/shelter/cats", label: "Cat Management" },
                        { href: "/shelter/adoptions", label: "Adoptions" },
                        { href: "/shelter/insights", label: "Insights" },
                        { href: "/shelter/staff", label: "Staff" },
                      ].map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                            isActive(link.href)
                              ? "bg-sunny-light text-cat-dark"
                              : "text-charcoal/70 hover:text-cat-dark hover:bg-sunny-light"
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </>
                  )}
                </nav>

                <div className="mt-auto px-4 pb-4 pt-4 border-t border-sunny/20">
                  {!user ? (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" className="w-full justify-center cursor-pointer">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full justify-center cursor-pointer bg-sunny hover:bg-sunny/80 text-cat-dark">
                          Register
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar size="sm">
                          {user.photoURL ? (
                            <AvatarImage src={user.photoURL} alt={userDoc?.displayName || "User"} />
                          ) : null}
                          <AvatarFallback className="bg-sunny-light text-cat-dark text-xs">
                            {getInitials(userDoc?.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-cat-dark">
                            {userDoc?.displayName}
                          </span>
                          <span className="text-xs text-charcoal/50">{userDoc?.email}</span>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-charcoal/70 hover:text-cat-dark hover:bg-sunny-light rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        <User className="size-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-heart hover:bg-heart/10 rounded-xl transition-all duration-200 cursor-pointer w-full text-left"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
