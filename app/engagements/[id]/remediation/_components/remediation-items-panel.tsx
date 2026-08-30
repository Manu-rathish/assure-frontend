"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import type { ActionItemListItem } from "@/lib/types/remediation";
import { RemediationItemsTable } from "./remediation-items-table";
import {
  ACTION_FILTER_LABELS,
  ACTION_QUICK_FILTERS,
  filterAndSortActionItems,
  type ActionQuickFilter,
} from "./remediation-helpers";

interface RemediationItemsPanelProps {
  engagementId: string;
  items: ActionItemListItem[];
  showFindingColumn?: boolean;
  sectionTitle?: string;
}

export function RemediationItemsPanel({
  engagementId,
  items,
  showFindingColumn = true,
  sectionTitle = "All action items",
}: RemediationItemsPanelProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ActionQuickFilter>("all");

  const visible = useMemo(
    () => filterAndSortActionItems(items, search, filter),
    [items, search, filter],
  );

  const showClearFilters =
    items.length > 0 && visible.length === 0 && (search !== "" || filter !== "all");

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {sectionTitle}
      </h2>
      <Card className="gap-0 overflow-hidden py-0 ring-1 ring-foreground/10">
        <div className="border-b border-border/50 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-[12rem] max-w-xs flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, title, team…"
                  aria-label="Search action items"
                  className={cn("h-8 pl-8", controlFocusClass)}
                />
              </div>

              <div
                className="flex w-max max-w-full gap-1 overflow-x-auto rounded-lg bg-muted/50 p-0.5"
                role="tablist"
                aria-label="Filter action items"
              >
                {ACTION_QUICK_FILTERS.map((key) => {
                  const active = filter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter(key)}
                      className={cn(
                        "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                        controlFocusClass,
                        active
                          ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                          : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
                      )}
                    >
                      {ACTION_FILTER_LABELS[key]}
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
              {visible.length} of {items.length} action items
            </span>
          </div>

          {showClearFilters ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No action items match these filters.{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </p>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <RemediationItemsTable
            engagementId={engagementId}
            items={visible}
            totalCount={items.length}
            showFindingColumn={showFindingColumn}
            showClearFilters={showClearFilters}
            onClearFilters={clearFilters}
          />
        </div>
      </Card>
    </section>
  );
}
