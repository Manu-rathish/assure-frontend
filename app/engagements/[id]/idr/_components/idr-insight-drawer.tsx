"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartReveal } from "@/lib/motion";
import { duration, easeOut, springUi } from "@/lib/motion";
import { statusLabel } from "@/lib/formatters";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import type { IdrLineListItem } from "@/lib/types/idr";
import { statusCounts } from "./idr-filters";

interface IdrInsightDrawerProps {
  lines: IdrLineListItem[];
}

export function IdrInsightDrawer({ lines }: IdrInsightDrawerProps) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();

  const stats = useMemo(() => {
    const counts = statusCounts(lines);
    const approved = counts.approved ?? 0;
    const total = lines.length;
    return { counts, approved, total };
  }, [lines]);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && !revealed) setRevealed(true);
  }

  const approvedPct = stats.total > 0 ? stats.approved / stats.total : 0;

  return (
    <Card className="gap-0 py-0">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-left sm:px-6",
          controlFocusClass,
        )}
      >
        <div>
          <div className="text-sm font-medium">Document insights</div>
          <div className="text-xs text-muted-foreground">
            Status mix for the active document — not affected by table filters.
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
            id={panelId}
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
                  {Object.entries(stats.counts)
                    .map(([status, count]) => `${count} ${statusLabel(status)}`)
                    .join(" · ")}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full origin-left rounded-full bg-primary transition-transform duration-500"
                    style={{ transform: `scaleX(${approvedPct})` }}
                  />
                </div>
                <p className="rounded-sm bg-muted/40 p-3 text-xs text-muted-foreground">
                  Use the lines table for triage. ADR follow-ups link back to
                  these parent questions.
                </p>
              </ChartReveal>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
