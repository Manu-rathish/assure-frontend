"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Upload } from "lucide-react";
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
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import type { IdrLineListItem } from "@/lib/types/idr";
import type { Team } from "@/lib/types/org";
import { IdrLinesTable } from "./idr-lines-table";
import { IdrCreateLineDialog } from "./idr-create-line-dialog";
import {
  filterAndSortLines,
  isFilterActive,
  lineEmptyMessage,
  type LineQuickFilter,
  type LineSort,
} from "./idr-filters";

const FILTERS: { value: LineQuickFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "needs_review", label: "Needs review" },
  { value: "overdue", label: "Overdue" },
  { value: "due_48h", label: "Due 48h" },
];

interface IdrLinesPanelProps {
  engagementId: string;
  lines: IdrLineListItem[];
  allLinesCount: number;
  teams: Team[];
  canCreate?: boolean;
}

export function IdrLinesPanel({
  engagementId,
  lines,
  allLinesCount,
  teams,
  canCreate = true,
}: IdrLinesPanelProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LineQuickFilter>("all");
  const [sort, setSort] = useState<LineSort>("line_id");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(
    () => filterAndSortLines(lines, search, filter, sort),
    [lines, search, filter, sort],
  );

  const filterActive = isFilterActive(search, filter);

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  function handleImport() {
    window.alert("Import will be available when API is connected.");
  }

  return (
    <Card className="flex min-h-0 min-w-0 flex-1 flex-col gap-0 py-0 ring-1 ring-foreground/10">
      <div className="flex flex-col gap-3 border-b border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[12rem] max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lines, team, category…"
              aria-label="Search IDR lines"
              className={cn("h-8 pl-8", controlFocusClass)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-sm bg-muted p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={filter === f.value}
                  className={cn(
                    "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                    controlFocusClass,
                    filter === f.value
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                      : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
                  )}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Select value={sort} onValueChange={(v) => setSort(v as LineSort)}>
              <SelectTrigger className={cn("h-8 w-36", controlFocusClass)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line_id">Line ID</SelectItem>
                <SelectItem value="due_date">Due date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {canCreate ? (
          <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleImport}
            >
              <Upload className="size-3.5" />
              Import
            </Button>
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" />
              Add line
            </Button>
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto">
        <IdrLinesTable
          engagementId={engagementId}
          lines={filtered}
          emptyMessage={lineEmptyMessage(search, filter, allLinesCount > 0)}
          showClearFilters={filterActive && allLinesCount > 0}
          onClearFilters={clearFilters}
        />
      </div>

      <IdrCreateLineDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        teams={teams}
      />
    </Card>
  );
}
