import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type { EngagementHistoryPageData } from "@/lib/types/engagement";
import { HistoryPageHeader } from "./history-page-header";
import { HistoryFilterBar } from "./history-filter-bar";
import { HistoryTimeline } from "./history-timeline";

interface HistoryViewProps {
  engagementId: string;
  data: EngagementHistoryPageData;
}

export function HistoryView({ engagementId, data }: HistoryViewProps) {
  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-5">
          <SectionItem className="min-w-0">
            <HistoryPageHeader data={data} />
          </SectionItem>

          <SectionItem className="min-w-0">
            <HistoryFilterBar engagementId={engagementId} data={data} />
          </SectionItem>

          <SectionItem className="min-w-0">
            <HistoryTimeline engagementId={engagementId} data={data} />
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
