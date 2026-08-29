"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/ui/card";
import { listContainer, listItem, listItemReduced } from "@/lib/motion";
import type { EngagementActivity } from "@/lib/types/engagement";
import { formatDate } from "./overview-helpers";

interface OverviewActivityFeedProps {
  activity: EngagementActivity[];
}

export function OverviewActivityFeed({ activity }: OverviewActivityFeedProps) {
  const reduce = useReducedMotion();
  const enteredRef = useRef(false);
  const items = activity.slice(0, 10);
  if (items.length > 0) enteredRef.current = true;
  const rowVariants = reduce ? listItemReduced : listItem;

  return (
    <Card className="h-full min-w-0 gap-0 py-0">
      <div className="border-b border-border/40 px-4 py-4 sm:px-6">
        <h2 className="text-sm font-medium">Recent activity</h2>
        <p className="text-xs text-muted-foreground">
          Latest events on this engagement
        </p>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
          No recent activity.
        </p>
      ) : (
        <motion.ul
          className="divide-y divide-border/40"
          variants={enteredRef.current ? undefined : listContainer}
          initial={enteredRef.current ? false : "hidden"}
          animate="show"
        >
          {items.map((item) => (
            <motion.li
              key={item.id}
              variants={enteredRef.current ? undefined : rowVariants}
              className="px-4 py-3 sm:px-6"
            >
              <div className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                {item.eventType}
              </div>
              <div className="mt-0.5 text-xs text-foreground">{item.message}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {item.actorName} · {formatDate(item.createdAt)}
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </Card>
  );
}
