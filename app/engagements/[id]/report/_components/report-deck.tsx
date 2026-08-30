"use client";

import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type {
  AuditReport,
  FindingListItem,
  SeverityStats,
} from "@/lib/types/finding";
import { ReportDeckHeader } from "./report-deck-header";
import { ReportDocumentsCard } from "./report-documents-card";
import { ReportSeverityCard } from "./report-severity-card";
import { ReportCoverageCard } from "./report-coverage-card";
import { ReportFindingsPanel } from "./report-findings-panel";

export type ReportDeckProps = {
  engagementId: string;
  engagementCode: string;
  reports: AuditReport[];
  stats: SeverityStats;
  findings: FindingListItem[];
};

export function ReportDeck({
  engagementId,
  engagementCode,
  reports,
  stats,
  findings,
}: ReportDeckProps) {
  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem className="min-w-0">
            <ReportDeckHeader
              engagementCode={engagementCode}
              reports={reports}
              findings={findings}
            />
          </SectionItem>

          <SectionItem className="min-w-0">
            <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
              <ReportDocumentsCard reports={reports} findings={findings} />
              <ReportSeverityCard stats={stats} />
              <ReportCoverageCard
                engagementCode={engagementCode}
                findings={findings}
              />
            </div>
          </SectionItem>

          <SectionItem className="min-w-0">
            <ReportFindingsPanel
              engagementId={engagementId}
              findings={findings}
            />
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
