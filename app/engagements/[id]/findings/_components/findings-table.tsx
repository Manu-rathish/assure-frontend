"use client";

import { useRef } from "react";
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
import { formatDate } from "@/app/engagements/[id]/report/_components/report-helpers";
import {
  RepeatBadge,
  SeverityBadge,
  severityRowBorder,
  StatusBadge,
} from "./finding-display";

interface FindingsTableProps {
  engagementId: string;
  findings: FindingListItem[];
  totalCount: number;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
}

export function FindingsTable({
  engagementId,
  findings,
  totalCount,
  showClearFilters,
  onClearFilters,
}: FindingsTableProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const enteredRef = useRef(false);

  if (findings.length > 0) enteredRef.current = true;
  const rowVariants = reduce ? listItemReduced : listItem;

  function navigate(findingCode: string) {
    router.push(`/engagements/${engagementId}/findings/${findingCode}`);
  }

  const emptyMessage =
    totalCount === 0
      ? "No findings transcribed yet."
      : "No findings match these filters.";

  return (
    <Table className="w-full table-fixed">
      <colgroup>
        <col className="w-[4.5rem]" />
        <col />
        <col className="w-[6.5rem]" />
        <col className="w-[9rem]" />
        <col className="w-[9.5rem]" />
        <col className="w-[6.5rem]" />
      </colgroup>
      <TableHeader>
        <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
          <TableHead className="pl-4 text-xs font-medium text-muted-foreground sm:pl-6">
            ID
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Finding
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Severity
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Controls
          </TableHead>
          <TableHead className="text-right text-xs font-medium text-muted-foreground">
            Status
          </TableHead>
          <TableHead className="pr-4 text-right text-xs font-medium text-muted-foreground sm:pr-6">
            Due
          </TableHead>
        </TableRow>
      </TableHeader>
      {findings.length === 0 ? (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-12 text-center text-muted-foreground"
            >
              <div className="space-y-3">
                <p>{emptyMessage}</p>
                {showClearFilters && onClearFilters ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={onClearFilters}
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      ) : (
        <motion.tbody
          variants={enteredRef.current ? undefined : listContainer}
          initial={enteredRef.current ? false : "hidden"}
          animate="show"
        >
          {findings.map((finding) => (
            <motion.tr
              key={finding.id}
              variants={enteredRef.current ? undefined : rowVariants}
              tabIndex={0}
              onClick={() => navigate(finding.findingCode)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(finding.findingCode);
                }
              }}
              className={cn(
                "cursor-pointer border-b border-border/40 border-l-2",
                severityRowBorder(finding.severity),
                ROW_HOVER_CLASS,
                tableRowInteractiveClass,
              )}
            >
              <TableCell className="pl-4 font-mono text-xs font-medium text-primary sm:pl-6">
                {finding.findingCode}
              </TableCell>
              <TableCell className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="line-clamp-2 text-xs">{finding.title}</span>
                  {finding.isRepeat ? <RepeatBadge /> : null}
                </div>
              </TableCell>
              <TableCell>
                <SeverityBadge severity={finding.severity} />
              </TableCell>
              <TableCell className="truncate font-mono text-[10px] text-muted-foreground">
                {finding.linkedControls.length > 0
                  ? finding.linkedControls.join(", ")
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <StatusBadge status={finding.status} />
                </div>
              </TableCell>
              <TableCell className="pr-4 text-right font-mono text-xs text-muted-foreground tabular-nums sm:pr-6">
                {formatDate(finding.targetCloseDate)}
              </TableCell>
            </motion.tr>
          ))}
        </motion.tbody>
      )}
    </Table>
  );
}
