"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pageShellClass } from "@/components/app-shell/page-shell";
import {
  PageReveal,
  SectionItem,
  SectionStagger,
  listContainer,
  listItem,
  listItemReduced,
  ROW_HOVER_CLASS,
  tableRowInteractiveClass,
} from "@/lib/motion";
import { formatDueDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { EngagementListItem } from "@/lib/types/engagement";
import type { User } from "@/lib/types/org";
import { CreateEngagementDialog } from "./create-engagement-dialog";

const PAGE_SIZE = 8;
type StatusFilter = "active" | "closed" | "all";

interface EngagementsViewProps {
  initialItems: EngagementListItem[];
  coUsers: User[];
  canCreate: boolean;
}

export function EngagementsView({
  initialItems,
  coUsers,
  canCreate,
}: EngagementsViewProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const enteredRef = useRef(false);
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = items;
    if (status !== "all") {
      list = list.filter((e) => e.status === status);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.leadName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  if (pageItems.length > 0) enteredRef.current = true;
  const rowVariants = reduce ? listItemReduced : listItem;

  function emptyMessage() {
    if (search.trim()) return "No engagements match this search.";
    if (status === "closed") return "No closed engagements.";
    if (status === "active") return "No active engagements.";
    return "No engagements yet.";
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(next: StatusFilter) {
    setStatus(next);
    setPage(1);
  }

  return (
    <main className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
      <PageReveal className={cn("flex min-h-0 flex-1", pageShellClass)}>
        <SectionStagger className="flex min-h-0 flex-1 flex-col gap-6">
          <SectionItem className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Engagements
              </h1>
              <p className="text-muted-foreground">
                Track every audit, its phase, owner, and open IDR/ADR lines.
              </p>
            </div>
            {canCreate ? (
              <CreateEngagementDialog
                existingCodes={items.map((item) => item.code)}
                coUsers={coUsers}
                onCreated={(item) => {
                  setItems((prev) => [item, ...prev]);
                  setStatus("active");
                  setPage(1);
                }}
              />
            ) : null}
          </SectionItem>

          <SectionItem className="flex min-h-0 flex-1 flex-col">
            <Card className="flex min-h-0 flex-1 flex-col gap-0 py-0">
              <div className="border-b border-border/50 px-7.5 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search by name, code, or lead…"
                      className="h-8 pl-8"
                    />
                  </div>
                  <div className="flex rounded-sm bg-muted p-1">
                    {(["active", "closed", "all"] as const).map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-3 capitalize",
                          status === s &&
                            "bg-background text-foreground hover:bg-background",
                        )}
                        onClick={() => handleStatusChange(s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
                      <TableHead>Engagement name</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead className="text-right">Open lines</TableHead>
                    </TableRow>
                  </TableHeader>
                  {pageItems.length === 0 ? (
                    <TableBody>
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground"
                        >
                          {emptyMessage()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ) : (
                    <motion.tbody
                      variants={enteredRef.current ? undefined : listContainer}
                      initial={enteredRef.current ? false : "hidden"}
                      animate="show"
                    >
                      {pageItems.map((item) => (
                        <motion.tr
                          key={item.id}
                          variants={enteredRef.current ? undefined : rowVariants}
                          tabIndex={0}
                          className={cn(
                            "cursor-pointer border-b border-border/30 outline-none",
                            tableRowInteractiveClass,
                            ROW_HOVER_CLASS,
                            "hover:shadow-[inset_3px_0_0_0_hsl(var(--primary)/0.85)]",
                          )}
                          onClick={() => router.push(`/engagements/${item.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(`/engagements/${item.id}`);
                            }
                          }}
                        >
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
                              {item.code}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.phase}</Badge>
                          </TableCell>
                          <TableCell>{item.leadName}</TableCell>
                          <TableCell>
                            {formatDueDate(item.nextDueDate)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {item.openLineCount}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  )}
                </Table>
              </div>

              {filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-2 border-t border-border/50 px-7.5 py-2.5 text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-3.5" />
                    Prev
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              )}
            </Card>
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
