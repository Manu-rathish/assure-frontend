"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDueDate, statusLabel } from "@/lib/formatters";
import { duration, easeOut, springUi } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { AdrThread } from "@/lib/types/adr";
import { threadMetrics } from "./adr-thread-chain";

interface AdrThreadItemProps {
  engagementId: string;
  thread: AdrThread;
  expanded: boolean;
  onToggle: () => void;
}

export function AdrThreadItem({
  engagementId,
  thread,
  expanded,
  onToggle,
}: AdrThreadItemProps) {
  const reduce = useReducedMotion();
  const { total, open, overdue } = threadMetrics(thread);
  const hot = (open > 0 || overdue > 0) && !expanded;

  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-start gap-2 px-4 py-3 text-left sm:px-6",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary/10",
          hot && "bg-primary/5",
        )}
      >
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : springUi}
        >
          <ChevronDown className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs tabular-nums">
              {thread.parentLineId}
            </span>
            <Badge variant="outline" className="capitalize">
              {statusLabel(thread.parentStatus)}
            </Badge>
            <span className="text-[0.625rem] text-muted-foreground tabular-nums">
              {total} ADR · {open} open · {overdue} overdue
            </span>
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {thread.parentQuestionText}
          </p>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={
              reduce
                ? { opacity: 1 }
                : { height: "auto", opacity: 1 }
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
            className="overflow-hidden bg-muted/20 sm:pl-12"
          >
            <div className="space-y-2 px-4 py-3 sm:px-6">
              <p className="text-xs text-foreground">
                {thread.parentQuestionText}
              </p>
              {thread.lines.map((line) => (
                <Link
                  key={line.id}
                  href={`/engagements/${engagementId}/adr/lines/${line.lineId}`}
                  className="block rounded-sm bg-card px-3 py-2 ring-1 ring-foreground/10 transition-colors hover:bg-primary/5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs tabular-nums">
                      {line.lineId}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {statusLabel(line.status)}
                    </Badge>
                    <span className="text-[0.625rem] text-muted-foreground">
                      Due {formatDueDate(line.dueDate)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {line.questionText}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
