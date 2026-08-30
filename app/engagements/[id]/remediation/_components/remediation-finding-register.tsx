"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listContainer,
  listItem,
  listItemReduced,
  ROW_HOVER_CLASS,
  tableRowInteractiveClass,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { FindingListItem } from "@/lib/types/finding";
import type { ActionItemListItem } from "@/lib/types/remediation";
import { formatDate, planProgress, progressBarTone } from "./remediation-helpers";
import {
  SeverityBadge,
  severityRowBorder,
} from "@/app/engagements/[id]/findings/_components/finding-display";
import {
  buildFindingRegisterRows,
  groupItemsByFindingCode,
  hasFindingLinks,
} from "./remediation-helpers";

interface RemediationFindingRegisterProps {
  engagementId: string;
  findings: FindingListItem[];
  items: ActionItemListItem[];
}

export function RemediationFindingRegister({
  engagementId,
  findings,
  items,
}: RemediationFindingRegisterProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { map } = groupItemsByFindingCode(items);
  const rows = buildFindingRegisterRows(findings, map);

  if (!hasFindingLinks(rows)) return null;

  const rowVariants = reduce ? listItemReduced : listItem;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Finding register
      </h2>
      <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
        <Table className="w-full min-w-[48rem] table-fixed">
          <TableHeader>
            <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-[5rem] pl-4 text-xs font-medium text-muted-foreground sm:pl-6">
                Finding
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Title
              </TableHead>
              <TableHead className="w-[6.5rem] text-xs font-medium text-muted-foreground">
                Severity
              </TableHead>
              <TableHead className="w-[10rem] text-xs font-medium text-muted-foreground">
                Progress
              </TableHead>
              <TableHead className="w-[6rem] text-center text-xs font-medium text-muted-foreground">
                Items open / total
              </TableHead>
              <TableHead className="w-[6.5rem] pr-4 text-right text-xs font-medium text-muted-foreground sm:pr-6">
                Target close
              </TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody
            variants={reduce ? undefined : listContainer}
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            {rows.map(({ finding, items: linked, closedCount }) => {
              const { pct, total } = planProgress(linked);
              const planHref = `/engagements/${engagementId}/remediation/findings/${finding.findingCode}`;

              return (
                <motion.tr
                  key={finding.id}
                  variants={rowVariants}
                  tabIndex={0}
                  className={cn(
                    "cursor-pointer border-b border-border/40 border-l-2",
                    severityRowBorder(finding.severity),
                    ROW_HOVER_CLASS,
                    tableRowInteractiveClass,
                  )}
                  onClick={() => router.push(planHref)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(planHref);
                    }
                  }}
                >
                  <TableCell className="pl-4 font-mono text-xs font-medium text-primary sm:pl-6">
                    <Link href={planHref} onClick={(e) => e.stopPropagation()}>
                      {finding.findingCode}
                    </Link>
                  </TableCell>
                  <TableCell className="line-clamp-2 text-xs">
                    <Link href={planHref} onClick={(e) => e.stopPropagation()}>
                      {finding.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={finding.severity} />
                  </TableCell>
                  <TableCell>
                    {linked.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        No action items
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted/70">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              progressBarTone(pct),
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground tabular-nums">
                          {closedCount}/{total} · {pct}%
                        </p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs tabular-nums">
                    {finding.actionItemsOpen} / {finding.actionItemsTotal}
                  </TableCell>
                  <TableCell className="pr-4 text-right font-mono text-xs text-muted-foreground sm:pr-6">
                    {formatDate(finding.targetCloseDate)}
                  </TableCell>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </Table>
      </div>
    </section>
  );
}
