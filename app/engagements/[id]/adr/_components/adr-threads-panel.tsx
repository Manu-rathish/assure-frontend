"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AdrLineListItem, AdrThread } from "@/lib/types/adr";
import { AdrThreadItem } from "./adr-thread-item";
import {
  defaultExpandedThreadIds,
  filterAndSortThreads,
  threadsForDocument,
  type ThreadFilter,
  type ThreadSort,
} from "./adr-thread-chain";

const FILTERS: { value: ThreadFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "has_open", label: "Has open" },
  { value: "has_overdue", label: "Has overdue" },
  { value: "multi_followup", label: "Multi follow-up" },
];

interface AdrThreadsPanelProps {
  engagementId: string;
  threads: AdrThread[];
  lines: AdrLineListItem[];
  activateToken: number;
}

export function AdrThreadsPanel({
  engagementId,
  threads,
  lines,
  activateToken,
}: AdrThreadsPanelProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ThreadFilter>("all");
  const [sort, setSort] = useState<ThreadSort>("most_open");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const scopedThreads = useMemo(
    () => threadsForDocument(threads, new Set(lines.map((l) => l.lineId))),
    [threads, lines],
  );

  const filtered = useMemo(
    () => filterAndSortThreads(scopedThreads, search, filter, sort),
    [scopedThreads, search, filter, sort],
  );

  useEffect(() => {
    if (activateToken > 0) {
      setExpandedIds(defaultExpandedThreadIds(scopedThreads));
    }
  }, [activateToken, scopedThreads]);

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-0 py-0">
      <div className="flex flex-col gap-3 border-b border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parent or follow-up…"
            className="h-8 pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-sm bg-muted p-1">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2",
                  filter === f.value &&
                    "bg-background text-foreground hover:bg-background",
                )}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as ThreadSort)}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most_open">Most open</SelectItem>
              <SelectItem value="most_overdue">Most overdue</SelectItem>
              <SelectItem value="parent_line_id">Parent ID</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setExpandedIds(new Set(filtered.map((t) => t.parentLineId)))
            }
          >
            Expand all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExpandedIds(new Set())}
          >
            Collapse
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No IDR → ADR threads for this document.
          </p>
        ) : (
          filtered.map((thread) => (
            <AdrThreadItem
              key={thread.parentLineId}
              engagementId={engagementId}
              thread={thread}
              expanded={expandedIds.has(thread.parentLineId)}
              onToggle={() => toggle(thread.parentLineId)}
            />
          ))
        )}
      </div>
    </Card>
  );
}
