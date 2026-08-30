import Link from "next/link";
import { ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EngagementHistoryPageData } from "@/lib/types/engagement";
import {
  buildHistoryHref,
  getEmptyHistoryMessage,
  groupHistoryByDay,
} from "./history-helpers";
import { HistoryDayGroupSection } from "./history-day-group";
import { HistoryPagination } from "./history-pagination";

interface HistoryTimelineProps {
  engagementId: string;
  data: EngagementHistoryPageData;
}

export function HistoryTimeline({ engagementId, data }: HistoryTimelineProps) {
  const { history, filters } = data;
  const dayGroups = groupHistoryByDay(history.items);
  const nextSort = filters.sort === "desc" ? "asc" : "desc";
  const sortHref = buildHistoryHref(engagementId, {
    ...filters,
    sort: nextSort,
    page: 1,
  });
  const sortLabel = filters.sort === "desc" ? "Newest first" : "Oldest first";
  const sortTitle =
    filters.sort === "desc" ? "Show oldest first" : "Show newest first";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold">Chronological feed</h3>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-muted-foreground">
            {sortLabel}
          </span>
          <Button variant="ghost" size="sm" asChild title={sortTitle}>
            <Link href={sortHref}>
              <ArrowDownUp className="size-3.5" aria-hidden />
              Sort
            </Link>
          </Button>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-5">
        {history.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {getEmptyHistoryMessage(filters.category)}
          </p>
        ) : (
          <div className="space-y-8">
            {dayGroups.map((group) => (
              <HistoryDayGroupSection key={group.dayKey} group={group} />
            ))}
          </div>
        )}
      </div>

      <HistoryPagination
        engagementId={engagementId}
        data={data}
        showCount={false}
      />
    </div>
  );
}
