"use client";

import { motion, useReducedMotion } from "motion/react";
import { duration, easeOut, listContainer, listItem } from "@/lib/motion";
import type { ExaminationAsk } from "@/lib/types/examination";
import { sortAsksByRecency } from "./examination-helpers";
import { ExaminationAskItem } from "./examination-ask-item";

interface ExaminationAskFeedProps {
  asks: ExaminationAsk[];
  engagementId: string;
  activeThreadId: string;
}

export function ExaminationAskFeed({
  asks,
  engagementId,
  activeThreadId,
}: ExaminationAskFeedProps) {
  const reduce = useReducedMotion();
  const sorted = sortAsksByRecency(asks);

  if (sorted.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
        No asks captured yet for this thread.
      </p>
    );
  }

  return (
    <motion.ul
      key={activeThreadId}
      role="list"
      className="flex flex-col"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: duration.enter, ease: easeOut }
      }
      variants={reduce ? undefined : listContainer}
    >
      {sorted.map((ask) => (
        <motion.li
          key={ask.id}
          variants={reduce ? undefined : listItem}
          className="list-none"
        >
          <ExaminationAskItem ask={ask} engagementId={engagementId} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
