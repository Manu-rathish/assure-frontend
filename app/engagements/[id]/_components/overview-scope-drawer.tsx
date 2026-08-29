"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { ChartReveal } from "@/lib/motion";
import { duration, easeOut, springUi } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { EngagementOverview } from "@/lib/types/engagement";
import { formatDate } from "./overview-helpers";

interface OverviewScopeDrawerProps {
  overview: EngagementOverview;
}

export function OverviewScopeDrawer({ overview }: OverviewScopeDrawerProps) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();

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
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-left sm:px-6",
          controlFocusClass,
        )}
      >
        <div>
          <div className="text-sm font-medium">Scope & notes</div>
          <div className="text-xs text-muted-foreground">
            Auditor, examination window, apps, frameworks
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
              <ChartReveal className="space-y-4 px-4 pb-4 text-xs sm:px-6">
                {overview.auditorName ? (
                  <div>
                    <div className="text-muted-foreground">Auditor</div>
                    <div className="mt-0.5">{overview.auditorName}</div>
                  </div>
                ) : null}
                {overview.examinationStartDate && overview.examinationEndDate ? (
                  <div>
                    <div className="text-muted-foreground">
                      Examination window
                    </div>
                    <div className="mt-0.5">
                      {formatDate(overview.examinationStartDate)} –{" "}
                      {formatDate(overview.examinationEndDate)}
                    </div>
                  </div>
                ) : null}
                {overview.appsInScope.length > 0 ? (
                  <div>
                    <div className="mb-2 text-muted-foreground">
                      Apps in scope
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {overview.appsInScope.map((app) => (
                        <Badge key={app} variant="outline">
                          {app}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {overview.frameworksInScope.length > 0 ? (
                  <div>
                    <div className="mb-2 text-muted-foreground">Frameworks</div>
                    <div className="flex flex-wrap gap-1.5">
                      {overview.frameworksInScope.map((fw) => (
                        <Badge key={fw} variant="outline">
                          {fw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {overview.notes ? (
                  <div>
                    <div className="text-muted-foreground">Notes</div>
                    <p className="mt-0.5 text-xs leading-relaxed whitespace-pre-wrap">
                      {overview.notes}
                    </p>
                  </div>
                ) : null}
              </ChartReveal>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
