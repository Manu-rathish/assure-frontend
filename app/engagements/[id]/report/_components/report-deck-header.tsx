import type { FindingListItem } from "@/lib/types/finding";
import {
  countAccepted,
  countDisputed,
  latestReport,
} from "./report-helpers";

interface ReportDeckHeaderProps {
  engagementCode: string;
  reports: import("@/lib/types/finding").AuditReport[];
  findings: FindingListItem[];
}

export function ReportDeckHeader({
  engagementCode,
  reports,
  findings,
}: ReportDeckHeaderProps) {
  const latest = latestReport(reports);
  const accepted = countAccepted(findings);
  const disputed = countDisputed(findings);

  const subtitle = latest
    ? `${latest.fileName} received · ${findings.length} findings transcribed · ${accepted} accepted · ${disputed} disputed`
    : "No audit report registered yet";

  return (
    <div className="min-w-0">
      <p className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
        {engagementCode}
      </p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Report</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}
