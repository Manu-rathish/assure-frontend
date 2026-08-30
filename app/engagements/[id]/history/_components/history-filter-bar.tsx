import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import type { EngagementHistoryPageData } from "@/lib/types/engagement";
import {
  buildClearFiltersHref,
  buildHistoryHref,
  CATEGORY_CHIPS,
  ENTITY_OPTIONS,
  formatActiveFilterSummary,
  toDateInputValue,
} from "./history-helpers";

interface HistoryFilterBarProps {
  engagementId: string;
  data: EngagementHistoryPageData;
}

const labelClass =
  "block text-[10px] font-medium tracking-wider text-muted-foreground uppercase";

const selectClass = cn(
  "h-9 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-sm shadow-xs",
  controlFocusClass,
);

const dateClass = cn(
  selectClass,
  "font-mono text-xs tabular-nums",
);

export function HistoryFilterBar({
  engagementId,
  data,
}: HistoryFilterBarProps) {
  const { filters, filterOptions, history, totalEvents } = data;
  const actorName = filterOptions.actors.find((a) => a.id === filters.actorId)
    ?.name;
  const activeSummary = formatActiveFilterSummary(filters, actorName);
  const clearHref = buildClearFiltersHref(engagementId, filters);

  const showingStart =
    history.totalItems === 0 ? 0 : (history.page - 1) * history.pageSize + 1;
  const showingEnd = Math.min(
    history.page * history.pageSize,
    history.totalItems,
  );

  const formKey = [
    filters.category,
    filters.entity,
    filters.actorId ?? "",
    filters.from ? toDateInputValue(filters.from) : "",
    filters.to ? toDateInputValue(filters.to) : "",
    filters.q ?? "",
    filters.sort,
  ].join("|");

  return (
    <div className="space-y-4">
      <div
        className="flex w-max max-w-full gap-1 overflow-x-auto rounded-lg bg-muted/50 p-0.5"
        role="tablist"
        aria-label="Filter audit events by category"
      >
        {CATEGORY_CHIPS.map((chip) => {
          const active = filters.category === chip.value;
          const href = buildHistoryHref(engagementId, {
            ...filters,
            category: chip.value,
            page: 1,
          });
          return (
            <Link
              key={chip.value}
              href={href}
              role="tab"
              aria-selected={active}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                controlFocusClass,
                active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
              )}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm sm:px-5">
        <form
          key={formKey}
          method="get"
          action={`/engagements/${engagementId}/history`}
          className="space-y-4"
        >
          <input type="hidden" name="category" value={filters.category} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-1.5">
              <label htmlFor="history-entity" className={labelClass}>
                Entity
              </label>
              <select
                id="history-entity"
                name="entity"
                defaultValue={filters.entity}
                className={selectClass}
              >
                {ENTITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="history-actor" className={labelClass}>
                Actor
              </label>
              <select
                id="history-actor"
                name="actor"
                defaultValue={filters.actorId ?? ""}
                className={selectClass}
              >
                <option value="">All actors</option>
                {filterOptions.actors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name} ({actor.eventCount})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="history-from" className={labelClass}>
                From
              </label>
              <input
                id="history-from"
                name="from"
                type="date"
                defaultValue={
                  filters.from ? toDateInputValue(filters.from) : ""
                }
                className={dateClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="history-to" className={labelClass}>
                To
              </label>
              <input
                id="history-to"
                name="to"
                type="date"
                defaultValue={filters.to ? toDateInputValue(filters.to) : ""}
                className={dateClass}
              />
            </div>

            <div className="col-span-2 space-y-1.5 sm:col-span-1">
              <label htmlFor="history-sort" className={labelClass}>
                Sort
              </label>
              <select
                id="history-sort"
                name="sort"
                defaultValue={filters.sort}
                className={selectClass}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <label htmlFor="history-q" className={labelClass}>
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="history-q"
                  name="q"
                  type="search"
                  defaultValue={filters.q ?? ""}
                  placeholder="Line id, file, actor…"
                  aria-label="Search audit events"
                  className={cn("h-9 pl-8", controlFocusClass)}
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:pb-0.5">
              <Button type="submit" size="sm" className="h-9 min-w-[5.5rem]">
                Apply
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 min-w-[5.5rem]"
                asChild
              >
                <Link href={clearHref}>Clear</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border/60 pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground tabular-nums">
                Showing {showingStart}–{showingEnd} of {history.totalItems}
                {history.totalItems !== totalEvents
                  ? ` (${totalEvents} total)`
                  : null}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Active filters: {activeSummary} · Date range defaults to
              engagement period through today
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
