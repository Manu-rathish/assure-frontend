import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { EngagementHistoryPageData } from "@/lib/types/engagement";
import { buildHistoryHref } from "./history-helpers";

interface HistoryPaginationProps {
  engagementId: string;
  data: EngagementHistoryPageData;
  showCount?: boolean;
}

export function HistoryPagination({
  engagementId,
  data,
  showCount = true,
}: HistoryPaginationProps) {
  const { history, filters } = data;
  const { page, totalPages, totalItems, pageSize } = history;

  if (totalItems <= pageSize) return null;

  const prevHref =
    page > 1
      ? buildHistoryHref(engagementId, { ...filters, page: page - 1 })
      : undefined;
  const nextHref =
    page < totalPages
      ? buildHistoryHref(engagementId, { ...filters, page: page + 1 })
      : undefined;

  return (
    <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
      {showCount ? (
        <span className="mr-auto text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
      ) : null}

      {prevHref ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={prevHref}>Previous</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}

      {!showCount ? (
        <span className="px-2 font-mono text-xs text-muted-foreground tabular-nums">
          Page {page} of {totalPages}
        </span>
      ) : null}

      {nextHref ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={nextHref}>Next</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </div>
  );
}
