"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springUi } from "@/lib/motion";
import type { ExaminationThread } from "@/lib/types/examination";

interface ExaminationThreadRailProps {
  threads: ExaminationThread[];
  activeThreadId: string;
  onSelect: (threadId: string) => void;
}

export function ExaminationThreadRail({
  threads,
  activeThreadId,
  onSelect,
}: ExaminationThreadRailProps) {
  const reduce = useReducedMotion();

  if (threads.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <div
        className="flex w-max gap-1 rounded-lg bg-muted/50 p-0.5"
        role="tablist"
        aria-label="Examination threads"
      >
        {threads.map((thread) => {
          const active = thread.id === activeThreadId;
          return (
            <button
              key={thread.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(thread.id)}
              className={cn(
                "relative min-w-[8rem] rounded-md px-3 py-1.5 text-left transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {active &&
                (reduce ? (
                  <span className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-border/60" />
                ) : (
                  <motion.span
                    layoutId="exam-thread-pill"
                    className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-border/60"
                    transition={springUi}
                  />
                ))}
              <span className="relative z-10 block">
                <span className="text-xs font-medium">{thread.name}</span>
                {thread.auditorLabel ? (
                  <span className="mt-0.5 block text-[0.625rem] text-muted-foreground">
                    {thread.auditorLabel}
                  </span>
                ) : null}
                <span className="mt-0.5 block font-mono text-[0.625rem] tabular-nums">
                  {thread.askCount}
                  {thread.concernCount > 0 ? (
                    <span className="text-destructive">
                      {" "}
                      · {thread.concernCount} concern
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
