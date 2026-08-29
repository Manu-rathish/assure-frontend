"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDueDate, statusLabel } from "@/lib/formatters";
import {
  listContainer,
  listItem,
  listItemReduced,
  ROW_HOVER_CLASS,
  tableRowInteractiveClass,
} from "@/lib/motion";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { AdrLineListItem } from "@/lib/types/adr";

interface AdrLinesTableProps {
  engagementId: string;
  lines: AdrLineListItem[];
  emptyMessage: string;
}

export function AdrLinesTable({
  engagementId,
  lines,
  emptyMessage,
}: AdrLinesTableProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const enteredRef = useRef(false);
  if (lines.length > 0) enteredRef.current = true;

  const rowVariants = reduce ? listItemReduced : listItem;

  function navigate(lineId: string) {
    router.push(`/engagements/${engagementId}/adr/lines/${lineId}`);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
          <TableHead className="pl-4 sm:pl-6">Line</TableHead>
          <TableHead>Parent</TableHead>
          <TableHead>Question</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Due</TableHead>
          <TableHead className="pr-4 sm:pr-6">Status</TableHead>
        </TableRow>
      </TableHeader>
      {lines.length === 0 ? (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={7}
              className="py-8 text-center text-muted-foreground"
            >
              {emptyMessage}
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
                "hover:shadow-[inset_3px_0_0_0_hsl(var(--primary)/0.85)]",
              )}
              onClick={() => navigate(line.lineId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(line.lineId);
                }
              }}
            >
              <TableCell className="pl-4 font-mono text-xs tabular-nums sm:pl-6">
                {line.lineId}
              </TableCell>
              <TableCell>
                <Link
                  href={`/engagements/${engagementId}/idr/lines/${line.parentIdrLineId}`}
                  className="font-mono text-xs text-primary tabular-nums hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {line.parentIdrLineId}
                </Link>
              </TableCell>
              <TableCell className="max-w-[10rem] truncate sm:max-w-xs md:max-w-md lg:max-w-xl xl:max-w-none">
                {line.questionText}
              </TableCell>
              <TableCell>{line.category}</TableCell>
              <TableCell>{line.ownerTeamName}</TableCell>
              <TableCell>{formatDueDate(line.dueDate)}</TableCell>
              <TableCell className="pr-4 sm:pr-6">
                <Badge variant="outline" className="capitalize">
                  {statusLabel(line.status)}
                </Badge>
              </TableCell>
            </motion.tr>
          ))}
        </motion.tbody>
      )}
    </Table>
  );
}
