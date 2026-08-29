"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import {
  listContainer,
  listItem,
  listItemReduced,
} from "@/lib/motion";
import type { TeamCompletion } from "@/lib/types/engagement";
import {
  formatDoneTooltip,
  sumTeamRows,
  toggleTeamSort,
  type TeamSort,
  type TeamSortKey,
} from "./overview-helpers";

interface OverviewTeamTableProps {
  allTeams: TeamCompletion[];
  rows: TeamCompletion[];
  sort: TeamSort;
  onSortChange: (sort: TeamSort) => void;
  filterActive: boolean;
  onClearFilters: () => void;
}

const COLUMNS: {
  key: TeamSortKey;
  label: string;
  tooltip: string;
  className?: string;
  hideBelow?: "md" | "lg";
}[] = [
  {
    key: "teamName",
    label: "Team",
    tooltip: "Owning team for assigned line items.",
  },
  {
    key: "total",
    label: "Total",
    tooltip: "All IDR and ADR lines owned by this team.",
    className: "text-right",
  },
  {
    key: "approved",
    label: "Closed",
    tooltip: "Lines with approved status.",
    className: "text-right hidden md:table-cell",
    hideBelow: "md",
  },
  {
    key: "open",
    label: "Open",
    tooltip: "Lines not yet approved.",
    className: "text-right",
  },
  {
    key: "completionPct",
    label: "Done",
    tooltip: "Share approved. Hover for IDR/ADR split.",
    className: "text-right",
  },
  {
    key: "dueWithin48h",
    label: "Due",
    tooltip: "Open lines due within 48 hours.",
    className: "text-right hidden lg:table-cell",
    hideBelow: "lg",
  },
  {
    key: "overdue",
    label: "Late",
    tooltip: "Open lines past due date.",
    className: "text-right",
  },
];

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  if (!active) return null;
  return <span className="ml-1">{direction === "asc" ? "↑" : "↓"}</span>;
}

export function OverviewTeamTable({
  allTeams,
  rows,
  sort,
  onSortChange,
  filterActive,
  onClearFilters,
}: OverviewTeamTableProps) {
  const reduce = useReducedMotion();
  const enteredRef = useRef(false);
  if (rows.length > 0) enteredRef.current = true;
  const rowVariants = reduce ? listItemReduced : listItem;
  const totals = sumTeamRows(rows);

  const footerLabel = filterActive
    ? `${rows.length} of ${allTeams.length}`
    : `${allTeams.length} teams`;

  if (allTeams.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No line items assigned to teams yet.
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No teams match this filter.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={controlFocusClass}
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <Table className="min-w-[40rem]">
      <TableHeader>
        <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
          {COLUMNS.map((col) => {
            const active = sort.key === col.key;
            return (
              <TableHead
                key={col.key}
                className={cn(
                  "text-xs font-medium text-muted-foreground",
                  col.className,
                )}
                title={col.tooltip}
              >
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center",
                    col.key !== "teamName" && "ml-auto",
                    controlFocusClass,
                  )}
                  aria-sort={
                    active
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  onClick={() => onSortChange(toggleTeamSort(sort, col.key))}
                >
                  {col.label}
                  <SortIndicator active={active} direction={sort.direction} />
                </button>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <motion.tbody
        variants={enteredRef.current ? undefined : listContainer}
        initial={enteredRef.current ? false : "hidden"}
        animate="show"
      >
        {rows.map((row) => (
          <motion.tr
            key={row.teamId}
            variants={enteredRef.current ? undefined : rowVariants}
            className={cn(
              "border-b border-border/30",
              row.overdue > 0 && "border-l-2 border-l-destructive",
              row.overdue === 0 &&
                row.dueWithin48h > 0 &&
                "border-l-2 border-l-primary/50",
            )}
          >
            <TableCell>
              <div className="line-clamp-2 font-medium">{row.teamName}</div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase">
                {row.teamSlug}
              </div>
            </TableCell>
            <TableCell className="text-right font-mono text-xs tabular-nums">
              {row.total}
            </TableCell>
            <TableCell className="hidden text-right font-mono text-xs text-emerald-600 tabular-nums md:table-cell">
              {row.approved}
            </TableCell>
            <TableCell className="text-right font-mono text-xs tabular-nums">
              {row.open}
            </TableCell>
            <TableCell
              className="text-right"
              title={formatDoneTooltip(row)}
            >
              <div className="flex items-center justify-end gap-2">
                <span className="font-mono text-xs tabular-nums">
                  {row.completionPct}%
                </span>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full origin-left rounded-full bg-primary/70 transition-transform duration-300"
                    style={{
                      transform: `scaleX(${Math.min(row.completionPct, 100) / 100})`,
                    }}
                  />
                </div>
              </div>
            </TableCell>
            <TableCell
              className={cn(
                "hidden text-right font-mono text-xs tabular-nums lg:table-cell",
                row.dueWithin48h > 0 && "text-primary/70",
              )}
            >
              {row.dueWithin48h > 0 ? row.dueWithin48h : "—"}
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-mono text-xs tabular-nums",
                row.overdue > 0 && "text-destructive",
              )}
            >
              {row.overdue > 0 ? row.overdue : "—"}
            </TableCell>
          </motion.tr>
        ))}
        <TableRow className="border-t border-border/40 bg-muted/10 font-medium hover:bg-muted/10">
          <TableCell>{footerLabel}</TableCell>
          <TableCell className="text-right font-mono text-xs tabular-nums">
            {totals.total}
          </TableCell>
          <TableCell className="hidden text-right font-mono text-xs tabular-nums md:table-cell">
            {totals.approved}
          </TableCell>
          <TableCell className="text-right font-mono text-xs tabular-nums">
            {totals.open}
          </TableCell>
          <TableCell />
          <TableCell className="hidden text-right font-mono text-xs tabular-nums lg:table-cell">
            {totals.dueWithin48h > 0 ? totals.dueWithin48h : "—"}
          </TableCell>
          <TableCell
            className={cn(
              "text-right font-mono text-xs tabular-nums",
              totals.overdue > 0 && "text-destructive",
            )}
          >
            {totals.overdue > 0 ? totals.overdue : "—"}
          </TableCell>
        </TableRow>
      </motion.tbody>
    </Table>
  );
}
