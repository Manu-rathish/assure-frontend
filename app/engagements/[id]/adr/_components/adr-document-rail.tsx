"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springUi } from "@/lib/motion";
import type { AdrDocument } from "@/lib/types/adr";

interface AdrDocumentRailProps {
  documents: AdrDocument[];
  activeDocId: string;
  onSelect: (docId: string) => void;
}

export function AdrDocumentRail({
  documents,
  activeDocId,
  onSelect,
}: AdrDocumentRailProps) {
  const reduce = useReducedMotion();

  if (documents.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <div
        className="flex w-max gap-1 rounded-lg bg-muted/50 p-0.5"
        role="tablist"
      >
        {documents.map((doc) => {
          const active = doc.id === activeDocId;
          return (
            <button
              key={doc.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(doc.id)}
              className={cn(
                "relative rounded-md px-3 py-1.5 text-left text-xs transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {active &&
                (reduce ? (
                  <span className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-border/60" />
                ) : (
                  <motion.span
                    layoutId="adr-doc-pill"
                    className="absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-border/60"
                    transition={springUi}
                  />
                ))}
              <span className="relative z-10 block">
                <span className="font-medium">{doc.label}</span>
                <span className="mt-0.5 block text-[0.625rem] text-muted-foreground tabular-nums">
                  {doc.openLines} open · {doc.closedLines} closed
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
