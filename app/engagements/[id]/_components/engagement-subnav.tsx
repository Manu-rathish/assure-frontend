"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { chromeInnerClass } from "@/components/app-shell/page-shell";
import { cn } from "@/lib/utils";
import { springUi } from "@/lib/motion";

const TABS = [
  { segment: "", label: "Overview" },
  { segment: "idr", label: "IDR" },
  { segment: "adr", label: "ADR" },
  { segment: "examination", label: "Examination" },
  { segment: "report", label: "Report" },
  { segment: "findings", label: "Findings" },
  { segment: "remediation", label: "Remediation" },
] as const;

export function EngagementSubnav({ engagementId }: { engagementId: string }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const base = `/engagements/${engagementId}`;

  function isActive(segment: string) {
    if (!segment) {
      return pathname === base || pathname === `${base}/`;
    }
    return (
      pathname === `${base}/${segment}` ||
      pathname.startsWith(`${base}/${segment}/`)
    );
  }

  return (
    <div className="sticky top-14 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <div className={cn("overflow-x-auto py-2", chromeInnerClass)}>
        <div
          className="flex w-full min-w-0 rounded-lg bg-muted/50 p-0.5"
          aria-label="Engagement sections"
        >
          {TABS.map((tab) => {
            const href = tab.segment ? `${base}/${tab.segment}` : base;
            const active = isActive(tab.segment);
            return (
              <Link
                key={tab.segment || "overview"}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
                )}
              >
                {active &&
                  (reduce ? (
                    <span className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-border/60" />
                  ) : (
                    <motion.span
                      layoutId="engagement-subnav-active"
                      className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-border/60"
                      transition={springUi}
                    />
                  ))}
                <span className="relative z-10">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
