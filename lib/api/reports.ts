import { requireEngagement } from "@/lib/data/dummy";
import type { AuditReport, SeverityStats } from "@/lib/types/finding";

function defaultSeverityStats(): SeverityStats {
  return {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    observation: 0,
    total: 0,
  };
}

function mapReport(raw: Record<string, unknown>): AuditReport {
  return {
    id: String(raw.id ?? ""),
    fileName: String(raw.fileName ?? ""),
    storagePath: (raw.storagePath as string | null) ?? null,
    receivedAt: String(raw.receivedAt ?? ""),
    pageCount: (raw.pageCount as number | null) ?? null,
    isDraft: Boolean(raw.isDraft),
    createdAt: String(raw.createdAt ?? ""),
  };
}

export async function listAuditReportsApi(
  engagementId: string,
): Promise<AuditReport[]> {
  const engagement = requireEngagement(engagementId);
  const reports = engagement.report?.auditReports ?? [];
  return reports.map((raw) =>
    mapReport(raw as unknown as Record<string, unknown>),
  );
}

export async function getReportSeverityStatsApi(
  engagementId: string,
): Promise<SeverityStats> {
  const engagement = requireEngagement(engagementId);
  const stats = engagement.report?.severityStats;
  if (!stats) return defaultSeverityStats();
  return {
    critical: stats.critical ?? 0,
    high: stats.high ?? 0,
    medium: stats.medium ?? 0,
    low: stats.low ?? 0,
    observation: stats.observation ?? 0,
    total: stats.total ?? 0,
  };
}
