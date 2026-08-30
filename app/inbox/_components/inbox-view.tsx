import { Suspense } from "react";
import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type { InboxPageData, InboxSearchParams } from "@/lib/types/inbox";
import { InboxHeader } from "./inbox-header";
import { InboxKpiRow } from "./inbox-kpi-row";
import { InboxTabs } from "./inbox-tabs";
import { InboxFilters } from "./inbox-filters";
import { InboxCardGrid } from "./inbox-card-grid";

interface InboxViewProps {
  data: InboxPageData;
  params: InboxSearchParams;
}

export function InboxView({ data, params }: InboxViewProps) {
  return (
    <main className="min-h-[calc(100dvh-3.5rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem className="min-w-0">
            <InboxHeader counts={data.counts} />
          </SectionItem>

          <SectionItem className="min-w-0">
            <InboxKpiRow counts={data.counts} params={params} />
          </SectionItem>

          <SectionItem className="min-w-0 space-y-4">
            <InboxTabs counts={data.counts} params={params} />
            <Suspense fallback={null}>
              <InboxFilters
                params={params}
                engagementFilters={data.engagementFilters}
              />
            </Suspense>
          </SectionItem>

          <SectionItem className="min-w-0">
            <InboxCardGrid data={data} params={params} />
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
