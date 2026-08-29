"use client";

import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
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
import type { AdrLineListItem, IdrLineListItem } from "@/lib/types/adr";
import type { Team } from "@/lib/types/org";
import { AdrLinesTable } from "./adr-lines-table";
import { AdrCreateLineDialog } from "./adr-create-line-dialog";
import {
  filterAndSortLines,
  lineEmptyMessage,
  type LineFilter,
  type LineSort,
} from "./adr-filters";

const FILTERS: { value: LineFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "needs_review", label: "Needs review" },
  { value: "overdue", label: "Overdue" },
  { value: "due_48h", label: "Due 48h" },
];

interface AdrLinesPanelProps {
  engagementId: string;
  lines: AdrLineListItem[];
  idrLines: IdrLineListItem[];
  teams: Team[];
  canCreate?: boolean;
}

export function AdrLinesPanel({
  engagementId,
  lines,
  idrLines,
  teams,
  canCreate = true,
}: AdrLinesPanelProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LineFilter>("all");
  const [sort, setSort] = useState<LineSort>("line_id");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(
    () => filterAndSortLines(lines, search, filter, sort),
    [lines, search, filter, sort],
  );

  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-0 py-0">
      <div className="flex flex-col gap-3 border-b border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lines, parent, team…"
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
          <Select value={sort} onValueChange={(v) => setSort(v as LineSort)}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line_id">Line ID</SelectItem>
              <SelectItem value="due_date">Due date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
            </SelectContent>
          </Select>
          {canCreate && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="size-3.5" />
              Add line
            </Button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <AdrLinesTable
          engagementId={engagementId}
          lines={filtered}
          emptyMessage={lineEmptyMessage(search, filter)}
        />
      </div>
      <AdrCreateLineDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        idrLines={idrLines}
        teams={teams}
      />
    </Card>
  );
}
