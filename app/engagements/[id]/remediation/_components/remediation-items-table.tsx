"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
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
import type { ActionItemListItem } from "@/lib/types/remediation";
import { formatDate, slaLabel, slaRowAccent } from "./remediation-helpers";
import {
  ActionItemStatusBadge,
  SlaCell,
} from "./remediation-display";

interface RemediationItemsTableProps {
  engagementId: string;
  items: ActionItemListItem[];
  totalCount: number;
  showFindingColumn?: boolean;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
}

export function RemediationItemsTable({
  engagementId,
  items,
  totalCount,
  showFindingColumn = true,
  showClearFilters,
  onClearFilters,
}: RemediationItemsTableProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const enteredRef = useRef(false);
  const now = Date.now();

  if (items.length > 0) enteredRef.current = true;
  const rowVariants = reduce ? listItemReduced : listItem;

  const emptyMessage =
    totalCount === 0
      ? "No action items for this engagement yet."
      : "No action items match these filters.";

  function navigate(actionItemId: string) {
    router.push(`/engagements/${engagementId}/remediation/${actionItemId}`);
  }

  return (
    <Table className="w-full table-fixed min-w-[56rem]">
      <colgroup>
        <col className="w-[4.5rem]" />
        <col />
        {showFindingColumn ? <col className="w-[5rem]" /> : null}
        <col className="w-[8rem]" />
        <col className="w-[7rem]" />
        <col className="w-[6.5rem]" />
        <col className="w-[7rem]" />
        <col className="w-[4.5rem]" />
      </colgroup>
      <TableHeader>
        <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
          <TableHead className="pl-4 text-xs font-medium text-muted-foreground sm:pl-6">
            ID
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Action item
          </TableHead>
          {showFindingColumn ? (
            <TableHead className="text-xs font-medium text-muted-foreground">
              Finding
            </TableHead>
          ) : null}
          <TableHead className="text-xs font-medium text-muted-foreground">
            Owner
          </TableHead>
          <TableHead className="hidden text-xs font-medium text-muted-foreground lg:table-cell">
            Assignee
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Target
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground">
            Status
          </TableHead>
          <TableHead className="pr-4 text-right text-xs font-medium text-muted-foreground sm:pr-6">
            SLA
          </TableHead>
        </TableRow>
      </TableHeader>
      {items.length === 0 ? (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={showFindingColumn ? 8 : 7}
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
          {items.map((item) => {
            const sla = slaLabel(item, now);
            return (
              <motion.tr
                key={item.id}
                variants={enteredRef.current ? undefined : rowVariants}
                tabIndex={0}
                className={cn(
                  "cursor-pointer border-b border-border/40",
                  slaRowAccent(item, now),
                  ROW_HOVER_CLASS,
                  tableRowInteractiveClass,
                )}
                onClick={() => navigate(item.actionItemId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(item.actionItemId);
                  }
                }}
              >
                <TableCell className="pl-4 font-mono text-xs font-medium text-primary sm:pl-6">
                  {item.actionItemId}
                </TableCell>
                <TableCell className="min-w-0">
                  <span className="line-clamp-2 text-xs">{item.title}</span>
                </TableCell>
                {showFindingColumn ? (
                  <TableCell className="font-mono text-xs">
                    {item.findingCode ? (
                      <Link
                        href={`/engagements/${engagementId}/remediation/findings/${item.findingCode}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.findingCode}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                ) : null}
                <TableCell className="text-xs">{item.ownerTeamName}</TableCell>
                <TableCell className="hidden text-xs lg:table-cell">
                  {item.assigneeName ?? (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                  {formatDate(item.dueDate)}
                </TableCell>
                <TableCell>
                  <ActionItemStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="pr-4 text-right sm:pr-6">
                  <SlaCell item={item} label={sla} />
                </TableCell>
              </motion.tr>
            );
          })}
        </motion.tbody>
      )}
    </Table>
  );
}
