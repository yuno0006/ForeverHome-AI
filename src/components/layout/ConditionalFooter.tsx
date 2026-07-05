"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on chat screens
  if (pathname.startsWith("/coach")) return null;

  return <Footer />;
}
