"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { NAV_ITEMS, isNavItemActive } from "@/components/app-shell/nav-items";
import { chromeInnerClass } from "@/components/app-shell/page-shell";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <div className={cn("flex h-14 items-center justify-between", chromeInnerClass)}>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              <span className="text-muted-foreground">Apex </span>
              <span className="text-primary">Assure</span>
            </span>
          </Link>
          <nav className="hidden items-center rounded-lg bg-muted/50 p-0.5 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 opacity-70" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
