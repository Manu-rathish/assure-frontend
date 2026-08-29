"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import type { TeamCompletion } from "@/lib/types/engagement";
import { OverviewTeamTable } from "./overview-team-table";
import {
  DEFAULT_TEAM_SORT,
  filterTeamRows,
  isTeamFilterActive,
  sortTeamRows,
  type TeamFilter,
  type TeamSort,
} from "./overview-helpers";

const FILTERS: { value: TeamFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "needs_attention", label: "Attention" },
  { value: "incomplete", label: "Incomplete" },
  { value: "complete", label: "Complete" },
];

interface OverviewTeamPanelProps {
  teams: TeamCompletion[];
}

export function OverviewTeamPanel({ teams }: OverviewTeamPanelProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TeamFilter>("all");
  const [sort, setSort] = useState<TeamSort>(DEFAULT_TEAM_SORT);

  const filtered = useMemo(
    () => sortTeamRows(filterTeamRows(teams, filter, search), sort),
    [teams, filter, search, sort],
  );

  const filterActive = isTeamFilterActive(filter, search);

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  return (
    <Card className="flex min-h-0 min-w-0 flex-col gap-0 py-0">
      <div className="border-b border-border/40 px-4 py-3 sm:px-4">
        <h2 className="text-sm font-medium">Team completion</h2>
        <p className="text-xs text-muted-foreground">
          Line item progress by owning team
        </p>
      </div>

      <div className="flex flex-col gap-2 border-b border-border/40 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-4">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams…"
            aria-label="Search teams"
            className={cn("h-8 w-full pl-8", controlFocusClass)}
          />
        </div>
        <div className="min-w-0 overflow-x-auto">
          <div className="flex w-max max-w-full rounded-sm bg-muted p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className={cn(
                  "shrink-0 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
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
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto">
        <OverviewTeamTable
          allTeams={teams}
          rows={filtered}
          sort={sort}
          onSortChange={setSort}
          filterActive={filterActive}
          onClearFilters={clearFilters}
        />
      </div>
    </Card>
  );
}
