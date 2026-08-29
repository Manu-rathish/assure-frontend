"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartReveal } from "@/lib/motion";
import { statusLabel } from "@/lib/formatters";
import type { AdrLineListItem } from "@/lib/types/adr";
import { duration, easeOut, springUi } from "@/lib/motion";

interface AdrInsightDrawerProps {
  lines: AdrLineListItem[];
}

export function AdrInsightDrawer({ lines }: AdrInsightDrawerProps) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const reduce = useReducedMotion();

  const stats = useMemo(() => {
    const now = new Date();
    const openCount = lines.filter((l) => l.status !== "approved").length;
    const needsReview = lines.filter((l) => l.status === "submitted").length;
    const overdue = lines.filter((l) => {
      if (!l.dueDate || l.status === "approved") return false;
      return new Date(l.dueDate) < now;
    }).length;
    const byStatus = lines.reduce<Record<string, number>>((acc, line) => {
      acc[line.status] = (acc[line.status] ?? 0) + 1;
      return acc;
    }, {});
    return { openCount, needsReview, overdue, total: lines.length, byStatus };
  }, [lines]);

  const maxCount = Math.max(...Object.values(stats.byStatus), 1);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && !revealed) setRevealed(true);
  }

  return (
    <Card className="gap-0 py-0">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-6"
      >
        <div>
          <div className="text-sm font-medium">Insights</div>
          <div className="text-xs text-muted-foreground">
            Status mix and SLA pressure for the active document
          </div>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : springUi}
        >
          <ChevronDown className="size-4 text-muted-foreground" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={
              reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }
            }
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    height: springUi,
                    opacity: { duration: duration.enter, ease: easeOut },
                  }
            }
            className="overflow-hidden border-t border-border/40"
          >
            {revealed && (
              <ChartReveal className="space-y-4 px-4 py-4 sm:px-6">
                <p className="text-xs text-muted-foreground">
                  {stats.openCount} open · {stats.needsReview} needs review ·{" "}
                  {stats.overdue} overdue · {stats.total} total
                </p>
                <div className="space-y-2">
                  {Object.entries(stats.byStatus).map(([status, count]) => (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize">{statusLabel(status)}</span>
                        <span className="tabular-nums">{count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-sm bg-muted">
                        <div
                          className="h-full origin-left bg-primary transition-transform duration-300"
                          style={{
                            transform: `scaleX(${count / maxCount})`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-sm bg-muted/40 p-3 text-xs text-muted-foreground">
                  Use Lines for triage and Threads to verify every follow-up
                  still traces to its parent IDR question.
                </div>
              </ChartReveal>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
