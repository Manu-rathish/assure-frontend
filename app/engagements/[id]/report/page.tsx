import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ReportDeck } from "@/app/engagements/[id]/report/_components/report-deck";
import { listFindingsApi } from "@/lib/api/findings";
import {
  getReportSeverityStatsApi,
  listAuditReportsApi,
} from "@/lib/api/reports";
import { getEngagementDetailApi } from "@/lib/api/engagements";
import { ApiClientError } from "@/lib/api/types";

export default async function ReportPage({
  params,
}: PageProps<"/engagements/[id]/report">) {
  const { id } = await params;

  let overview;
  let reports;
  let stats;
  let findingsPage;

  try {
    [overview, reports, stats, findingsPage] = await Promise.all([
      getEngagementDetailApi(id),
      listAuditReportsApi(id),
      getReportSeverityStatsApi(id),
      listFindingsApi(id, { limit: 500 }),
    ]);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <Suspense>
      <ReportDeck
        engagementId={id}
        engagementCode={overview.code}
        reports={reports}
        stats={stats}
        findings={findingsPage.items}
      />
    </Suspense>
  );
}
