"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname === "/login";

  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
    </>
  );
}
