"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  listContainer,
  listItem,
  listItemReduced,
  ROW_HOVER_CLASS,
  tapScale,
} from "@/lib/motion";
import type { EngagementKpis } from "@/lib/types/engagement";

interface OverviewModuleCardsProps {
  engagementId: string;
  kpis: EngagementKpis;
}

interface ModuleCardDef {
  title: string;
  href?: string;
  ariaLabel: string;
  primary: string;
  primaryLabel?: string;
  secondary: string;
  destructive?: boolean;
  onClick?: () => void;
}

export function OverviewModuleCards({
  engagementId,
  kpis,
}: OverviewModuleCardsProps) {
  const reduce = useReducedMotion();
  const enteredRef = useRef(false);
  const base = `/engagements/${engagementId}`;

  const idrTotal = kpis.idrOpen + kpis.idrClosed;
  const adrTotal = kpis.adrOpen + kpis.adrClosed;
  const critical = kpis.findingsBySeverity?.critical ?? 0;
  const high = kpis.findingsBySeverity?.high ?? 0;

  function scrollToSla() {
    document.getElementById("sla-band")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

  const cards: ModuleCardDef[] = [
    {
      title: "IDR",
      href: `${base}/idr`,
      ariaLabel: `IDR, ${kpis.idrOpen} open lines`,
      primary: String(kpis.idrOpen),
      primaryLabel: "open",
      secondary: `${kpis.idrOpen} open · ${idrTotal} total`,
    },
    {
      title: "ADR",
      href: `${base}/adr`,
      ariaLabel: `ADR, ${kpis.adrOpen} open lines`,
      primary: String(kpis.adrOpen),
      primaryLabel: "open",
      secondary: `${kpis.adrOpen} open · ${adrTotal} total`,
    },
    {
      title: "Examination",
      href: `${base}/examination`,
      ariaLabel: `Examination, ${kpis.asksTotal} asks`,
      primary: String(kpis.asksTotal),
      secondary: "Examination asks",
    },
    {
      title: "Findings",
      href: `${base}/findings`,
      ariaLabel: `Findings, ${kpis.findingsTotal} recorded`,
      primary: String(kpis.findingsTotal),
      secondary:
        critical > 0 || high > 0
          ? `${critical} critical · ${high} high`
          : "Findings recorded",
    },
    {
      title: "Remediation",
      href: `${base}/remediation`,
      ariaLabel: `Remediation, ${kpis.actionItemsOpen} open items`,
      primary: String(kpis.actionItemsOpen),
      primaryLabel: "open",
      secondary: `${kpis.actionItemsOpen} open · ${kpis.actionItemsTotal} total`,
    },
    {
      title: "SLA risk",
      ariaLabel: `SLA risk, ${kpis.dueWithin48h} due within 48 hours`,
      primary: String(kpis.dueWithin48h),
      primaryLabel: "due ≤48h",
      secondary: `${kpis.overdue} overdue`,
      destructive: kpis.overdue > 0,
      onClick: scrollToSla,
    },
  ];

  if (cards.length > 0) enteredRef.current = true;
  const rowVariants = reduce ? listItemReduced : listItem;

  return (
    <motion.div
      className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={enteredRef.current ? undefined : listContainer}
      initial={enteredRef.current ? false : "hidden"}
      animate="show"
    >
      {cards.map((card) => {
        const content = (
          <Card
            className={cn(
              "gap-0 py-0",
              (card.href || card.onClick) && ROW_HOVER_CLASS,
              card.destructive && "ring-destructive/30",
            )}
          >
            <div className="p-4 sm:p-5">
              <div className="text-sm font-medium">{card.title}</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums">
                  {card.primary}
                </span>
                {card.primaryLabel ? (
                  <span className="text-xs text-muted-foreground">
                    {card.primaryLabel}
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {card.secondary}
              </div>
            </div>
          </Card>
        );

        const inner = card.href ? (
          <Link
            href={card.href}
            className="block outline-none"
            aria-label={card.ariaLabel}
          >
            {content}
          </Link>
        ) : (
          <button
            type="button"
            className="block w-full text-left outline-none"
            aria-label={card.ariaLabel}
            onClick={card.onClick}
          >
            {content}
          </button>
        );

        return (
          <motion.div
            key={card.title}
            variants={enteredRef.current ? undefined : rowVariants}
            whileTap={card.href || card.onClick ? tapScale(reduce) : undefined}
          >
            {inner}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
