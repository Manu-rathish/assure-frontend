"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { duration, easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SeverityStats } from "@/lib/types/finding";
import {
  SEVERITY_ORDER,
  severityBarScale,
} from "@/app/engagements/[id]/findings/_components/findings-filters";
import {
  severityBarColor,
  severityLabel,
} from "@/app/engagements/[id]/findings/_components/finding-display";

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
  observation: "bg-slate-400",
};

interface ReportSeverityCardProps {
  stats: SeverityStats;
}

export function ReportSeverityCard({ stats }: ReportSeverityCardProps) {
  const reduce = useReducedMotion();

  return (
    <Card className="flex h-full flex-col gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Severity distribution</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Finding mix across severity bands
            </CardDescription>
          </div>
          {stats.total > 0 ? (
            <span className="shrink-0 rounded-sm bg-muted px-2 py-1 font-mono text-[10px] font-medium tabular-nums text-muted-foreground">
              {stats.total} total
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        {stats.total <= 0 ? (
          <p className="text-sm text-muted-foreground">No findings yet.</p>
        ) : (
          SEVERITY_ORDER.map((severity) => {
            const count = stats[severity];
            const scale = severityBarScale(count, stats.total);
            const hasValue = count > 0;

            return (
              <div key={severity} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        SEVERITY_DOT[severity] ?? "bg-muted-foreground",
                        !hasValue && "opacity-40",
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        hasValue ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {severityLabel(severity)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs font-semibold tabular-nums",
                      hasValue ? "text-foreground" : "text-muted-foreground/60",
                    )}
                  >
                    {count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                  <motion.div
                    className={cn(
                      "h-full origin-left rounded-full",
                      severityBarColor(severity),
                      !hasValue && "opacity-30",
                    )}
                    initial={{ scaleX: reduce ? scale : 0 }}
                    animate={{ scaleX: scale }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: duration.barFill, ease: easeOut }
                    }
                    aria-hidden
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
