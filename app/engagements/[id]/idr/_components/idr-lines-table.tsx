"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusLabel } from "@/lib/formatters";
import {
  listContainer,
  listItem,
  listItemReduced,
  ROW_HOVER_CLASS,
  tableRowInteractiveClass,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { IdrLineListItem } from "@/lib/types/idr";
import {
  formatDate,
  slaColumnText,
  slaRowAccent,
} from "./idr-filters";

interface IdrLinesTableProps {
  engagementId: string;
  lines: IdrLineListItem[];
  emptyMessage: string;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
}

export function IdrLinesTable({
  engagementId,
  lines,
  emptyMessage,
  showClearFilters,
  onClearFilters,
}: IdrLinesTableProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const enteredRef = useRef(false);
  const now = Date.now();

  if (lines.length > 0) enteredRef.current = true;
  const rowVariants = reduce ? listItemReduced : listItem;

  function navigate(lineId: string) {
    router.push(`/engagements/${engagementId}/idr/lines/${lineId}`);
  }

  return (
    <Table className="min-w-[48rem]">
      <TableHeader>
        <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
          <TableHead className="pl-4 text-xs font-medium text-muted-foreground sm:pl-6">
            Line
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Question
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Category
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Owner
          </TableHead>
          <TableHead className="hidden text-xs font-medium text-muted-foreground lg:table-cell">
            Assignee
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Due
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Status
          </TableHead>
          <TableHead className="hidden pr-4 text-xs font-medium text-muted-foreground xl:table-cell sm:pr-6">
            SLA
          </TableHead>
        </TableRow>
      </TableHeader>
      {lines.length === 0 ? (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={8}
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
          {lines.map((line) => (
            <motion.tr
              key={line.id}
              variants={enteredRef.current ? undefined : rowVariants}
              tabIndex={0}
              className={cn(
                "cursor-pointer border-b border-border/30 outline-none",
                tableRowInteractiveClass,
                ROW_HOVER_CLASS,
                slaRowAccent(line, now),
              )}
              onClick={() => navigate(line.lineId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(line.lineId);
                }
              }}
            >
              <TableCell className="pl-4 font-mono text-xs text-primary tabular-nums sm:pl-6">
                {line.lineId}
              </TableCell>
              <TableCell
                className="line-clamp-2 max-w-[12rem] sm:max-w-xs md:max-w-md"
                title={line.questionText}
              >
                {line.questionText}
              </TableCell>
              <TableCell>{line.category}</TableCell>
              <TableCell>
                <div>{line.ownerTeamName}</div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase">
                  {line.ownerTeamSlug}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {line.assigneeName ?? "—"}
              </TableCell>
              <TableCell className="font-mono text-xs tabular-nums">
                {formatDate(line.dueDate)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {statusLabel(line.status)}
                </Badge>
              </TableCell>
              <TableCell
                className={cn(
                  "hidden pr-4 text-xs sm:pr-6 xl:table-cell",
                  slaColumnText(line, now) === "Overdue" && "text-destructive",
                  slaColumnText(line, now) === "≤48h" && "text-primary/70",
                )}
              >
                {slaColumnText(line, now)}
              </TableCell>
            </motion.tr>
          ))}
        </motion.tbody>
      )}
    </Table>
  );
}
