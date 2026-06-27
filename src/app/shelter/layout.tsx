"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Cat, Heart, BarChart3, Users } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";

const sidebarLinks = [
  { href: "/shelter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shelter/cats", label: "Cat Management", icon: Cat },
  { href: "/shelter/adoptions", label: "Adoptions", icon: Heart },
  { href: "/shelter/insights", label: "Insights", icon: BarChart3 },
  { href: "/shelter/staff", label: "Staff", icon: Users },
];

export default function ShelterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="shelter_staff">
      <div className="flex min-h-[calc(100vh-4rem)]">
        <ShelterSidebar />
        <main className="flex-1 p-4 lg:p-8 bg-warm-cream">{children}</main>
      </div>
    </AuthGuard>
  );
}

function ShelterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-sunny/20 bg-white py-6 px-3">
      <nav className="flex flex-col gap-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-sunny-light text-cat-dark"
                  : "text-charcoal/70 hover:text-cat-dark hover:bg-sunny-light"
              }`}
            >
              <Icon className="size-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
