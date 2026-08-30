import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type { FindingDetail } from "@/lib/types/finding";
import { formatDate } from "@/app/engagements/[id]/report/_components/report-helpers";
import {
  RepeatBadge,
  SeverityBadge,
  StatusBadge,
} from "@/app/engagements/[id]/findings/_components/finding-display";
import { FindingSourceLinks } from "./finding-source-links";
import { FindingWorkflowPanel } from "./finding-workflow-panel";

interface FindingDetailViewProps {
  engagementId: string;
  finding: FindingDetail;
}

export function FindingDetailView({
  engagementId,
  finding,
}: FindingDetailViewProps) {
  const allClosed =
    finding.actionItemsTotal > 0 && finding.actionItemsOpen === 0;

  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem>
            <Link
              href={`/engagements/${engagementId}/report#findings-register`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to findings
            </Link>
          </SectionItem>

          <SectionItem className="min-w-0">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                <Link
                  href={`/engagements/${engagementId}/report#findings-register`}
                  className="hover:text-foreground"
                >
                  Findings
                </Link>{" "}
                / {finding.findingCode}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {finding.findingCode}
                </span>
                <SeverityBadge severity={finding.severity} />
                <StatusBadge status={finding.status} />
                {finding.isRepeat ? <RepeatBadge /> : null}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="text-xl font-semibold leading-tight tracking-tight">
                  {finding.title}
                </h1>
                {finding.targetCloseDate ? (
                  <p className="shrink-0 font-mono text-xs text-muted-foreground">
                    Target close {formatDate(finding.targetCloseDate)}
                  </p>
                ) : null}
              </div>
              {finding.linkedControls.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {finding.linkedControls.map((control) => (
                    <Badge
                      key={control}
                      variant="outline"
                      className="h-5 rounded-sm px-1.5 font-mono text-[10px] ring-1"
                    >
                      {control}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </SectionItem>

          <SectionItem className="min-w-0">
            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-6">
                <Card className="gap-0 py-0 ring-1 ring-foreground/10">
                  <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-4 text-sm leading-relaxed sm:px-5">
                    {finding.description}
                  </CardContent>
                </Card>

                {finding.impact ? (
                  <Card className="gap-0 py-0 ring-1 ring-foreground/10">
                    <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
                      <CardTitle className="text-sm">Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4 text-sm leading-relaxed sm:px-5">
                      {finding.impact}
                    </CardContent>
                  </Card>
                ) : null}

                {finding.recommendation ? (
                  <Card className="gap-0 py-0 ring-1 ring-foreground/10">
                    <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
                      <CardTitle className="text-sm">Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4 text-sm leading-relaxed sm:px-5">
                      {finding.recommendation}
                    </CardContent>
                  </Card>
                ) : null}

                {finding.sourceLinks.length > 0 ? (
                  <Card className="gap-0 py-0 ring-1 ring-foreground/10">
                    <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
                      <CardTitle className="text-sm">Source linkage</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4 sm:px-5">
                      <FindingSourceLinks
                        engagementId={engagementId}
                        sourceLinks={finding.sourceLinks}
                      />
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              <div className="flex w-full shrink-0 flex-col gap-6 lg:w-80">
                <FindingWorkflowPanel finding={finding} />

                <Card className="gap-0 py-0 ring-1 ring-foreground/10">
                  <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
                    <CardTitle className="text-sm">Remediation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 py-4 sm:px-5">
                    <p className="text-sm tabular-nums">
                      <span className="font-bold">{finding.actionItemsOpen}</span>{" "}
                      open /{" "}
                      <span className="font-bold">
                        {finding.actionItemsTotal}
                      </span>{" "}
                      total
                    </p>
                    <Link
                      href={`/engagements/${engagementId}/remediation/findings/${finding.findingCode}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View plan →
                    </Link>
                    {allClosed ? (
                      <p className="text-xs text-emerald-600">
                        All action items closed — finding is ready to be
                        verified.
                      </p>
                    ) : null}
                    {finding.acceptedAt ? (
                      <p className="text-xs text-muted-foreground">
                        Accepted {formatDate(finding.acceptedAt)}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
