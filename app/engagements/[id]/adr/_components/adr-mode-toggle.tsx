"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springUi } from "@/lib/motion";

export type AdrMode = "lines" | "threads";

interface AdrModeToggleProps {
  mode: AdrMode;
  onChange: (mode: AdrMode) => void;
}

const OPTIONS: { value: AdrMode; label: string }[] = [
  { value: "lines", label: "Lines" },
  { value: "threads", label: "Threads" },
];

export function AdrModeToggle({ mode, onChange }: AdrModeToggleProps) {
  const reduce = useReducedMotion();

  return (
    <div className="rounded-sm bg-muted p-1" role="group">
      <div className="relative flex">
        {OPTIONS.map((opt) => {
          const active = mode === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative z-10 flex-1 rounded-sm px-3 py-1.5 text-xs font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {active &&
                (reduce ? (
                  <span className="absolute inset-0 rounded-sm bg-background shadow-sm" />
                ) : (
                  <motion.span
                    layoutId="adr-mode-pill"
                    className="absolute inset-0 rounded-sm bg-background shadow-sm"
                    transition={springUi}
                  />
                ))}
              <span className="relative z-10">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
