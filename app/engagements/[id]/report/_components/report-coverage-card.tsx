import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FindingListItem } from "@/lib/types/finding";
import {
  countAccepted,
  countDisputed,
  countInRemediation,
  countOverdueFindings,
  countPendingReview,
  countRepeat,
  sumOpenActionItems,
} from "./report-helpers";

interface ReportCoverageCardProps {
  engagementCode: string;
  findings: FindingListItem[];
}

interface CoverageMetric {
  label: string;
  value: string | number;
  valueClassName?: string;
}

export function ReportCoverageCard({
  engagementCode,
  findings,
}: ReportCoverageCardProps) {
  const accepted = countAccepted(findings);
  const disputed = countDisputed(findings);
  const inRemediation = countInRemediation(findings);
  const repeat = countRepeat(findings);
  const openActions = sumOpenActionItems(findings);
  const overdue = countOverdueFindings(findings);
  const pendingReview = countPendingReview(findings);

  const metrics: CoverageMetric[] = [
    { label: "Findings total", value: findings.length },
    {
      label: "Accepted for MR",
      value: accepted,
      valueClassName: accepted > 0 ? "text-emerald-600" : undefined,
    },
    {
      label: "Disputed",
      value: disputed,
      valueClassName: disputed > 0 ? "text-amber-600" : undefined,
    },
    {
      label: "In remediation",
      value: inRemediation,
      valueClassName: inRemediation > 0 ? "text-primary" : undefined,
    },
    {
      label: "Repeat findings",
      value: repeat,
      valueClassName: repeat > 0 ? "text-amber-600" : undefined,
    },
    {
      label: "Open action items",
      value: openActions,
      valueClassName: openActions > 0 ? "text-foreground" : undefined,
    },
  ];

  if (overdue > 0) {
    metrics.push({
      label: "Past due date",
      value: overdue,
      valueClassName: "text-destructive",
    });
  }

  if (pendingReview > 0) {
    metrics.push({
      label: "Pending review",
      value: pendingReview,
    });
  }

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
        <CardTitle className="text-sm">Coverage</CardTitle>
        <CardDescription className="mt-0.5 text-xs">
          Triage posture — acceptance, dispute, and remediation load
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-4 py-3 sm:px-5 sm:py-4">
        <dl className="space-y-0">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-center justify-between gap-3 border-b border-border/40 py-2 last:border-b-0"
            >
              <dt className="text-xs text-muted-foreground">{metric.label}</dt>
              <dd
                className={cn(
                  "font-mono text-sm font-semibold tabular-nums",
                  metric.valueClassName,
                )}
              >
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="rounded-md bg-muted/30 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Engagement
          </p>
          <p className="mt-0.5 truncate font-mono text-xs font-medium">
            {engagementCode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
