"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import {
  FILTER_LABELS,
  FINDING_QUICK_FILTERS,
  type FindingQuickFilter,
} from "./findings-filters";

interface FindingsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FindingQuickFilter;
  onFilterChange: (filter: FindingQuickFilter) => void;
  visibleCount: number;
  totalCount: number;
  onClearFilters: () => void;
  showClearFilters: boolean;
}

export function FindingsToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  visibleCount,
  totalCount,
  onClearFilters,
  showClearFilters,
}: FindingsToolbarProps) {
  return (
    <div className="border-b border-border/50 px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[12rem] max-w-xs flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search code, title, controls…"
              aria-label="Search findings"
              className={cn("h-8 pl-8", controlFocusClass)}
            />
          </div>

          <div
            className="flex w-max max-w-full gap-1 overflow-x-auto rounded-lg bg-muted/50 p-0.5"
            role="tablist"
            aria-label="Filter findings"
          >
            {FINDING_QUICK_FILTERS.map((key) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onFilterChange(key)}
                  className={cn(
                    "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                    controlFocusClass,
                    active
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                      : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
                  )}
                >
                  {FILTER_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>

        <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums sm:ml-2">
          {visibleCount} of {totalCount} findings
        </span>
      </div>

      {showClearFilters ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No findings match these filters.{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        </p>
      ) : null}
    </div>
  );
}
