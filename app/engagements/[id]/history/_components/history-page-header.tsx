import type { EngagementHistoryPageData } from "@/lib/types/engagement";
import { formatEngagementDate } from "./history-helpers";

interface HistoryPageHeaderProps {
  data: EngagementHistoryPageData;
}

export function HistoryPageHeader({ data }: HistoryPageHeaderProps) {
  const { totalEvents, engagement } = data;
  const eventLabel = totalEvents === 1 ? "event" : "events";

  return (
    <header className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        History & audit trail
      </h2>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Immutable audit trail · {totalEvents} {eventLabel} captured · Engagement
        started {formatEngagementDate(engagement.createdAt)}
      </p>
    </header>
  );
}
