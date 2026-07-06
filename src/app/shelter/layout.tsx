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
      <div className="flex min-h-[calc(100vh-4rem)] relative z-10">
        <ShelterSidebar />
        <main className="flex-1 p-4 lg:p-8 bg-transparent">{children}</main>
      </div>
    </AuthGuard>
  );
}

function ShelterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r-2 border-cocoa/10 bg-cream/70 backdrop-blur-md py-6 px-3">
      <nav className="flex flex-col gap-1.5">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-cocoa text-cream shadow-[2px_2px_0px_0px_rgba(255,107,107,1)]"
                  : "text-cocoa/70 hover:text-cocoa hover:bg-cocoa/5"
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
