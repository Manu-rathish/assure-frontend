"use client";

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
import type { ActionItemDetail } from "@/lib/types/remediation";
import {
  formatDate,
  formatDateTime,
  slaLabel,
} from "@/app/engagements/[id]/remediation/_components/remediation-helpers";
import {
  ActionItemStatusBadge,
} from "@/app/engagements/[id]/remediation/_components/remediation-display";
import { RemediationStatusActions } from "@/app/engagements/[id]/remediation/_components/remediation-status-actions";

interface RemediationItemDetailViewProps {
  engagementId: string;
  item: ActionItemDetail;
}

export function RemediationItemDetailView({
  engagementId,
  item,
}: RemediationItemDetailViewProps) {
  const now = Date.now();
  const sla = slaLabel(item, now);
  const hubHref = `/engagements/${engagementId}/remediation`;
  const planHref = item.findingCode
    ? `/engagements/${engagementId}/remediation/findings/${item.findingCode}`
    : null;

  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem>
            <Link
              href={hubHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to remediation
            </Link>
          </SectionItem>

          <SectionItem className="min-w-0">
            <div className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">
                {item.actionItemId}
              </p>
              <h1 className="text-2xl font-semibold leading-tight tracking-tight">
                {item.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <ActionItemStatusBadge status={item.status} />
                {item.findingCode && planHref ? (
                  <Link href={planHref}>
                    <Badge
                      variant="outline"
                      className="h-5 rounded-sm px-1.5 text-[0.625rem] font-medium"
                    >
                      Finding {item.findingCode}
                    </Badge>
                  </Link>
                ) : null}
                {sla === "Overdue" ? (
                  <span className="text-xs font-medium text-destructive">
                    Overdue
                  </span>
                ) : null}
                {sla === "≤48h" ? (
                  <span className="text-xs font-medium text-primary">≤48h</span>
                ) : null}
              </div>
            </div>
          </SectionItem>

          <SectionItem className="min-w-0">
            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-6">
                {item.description ? (
                  <Card className="gap-0 py-0 ring-1 ring-foreground/10">
                    <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
                      <CardTitle className="text-sm">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4 text-sm leading-relaxed sm:px-5">
                      {item.description}
                    </CardContent>
                  </Card>
                ) : null}

                <RemediationStatusActions status={item.status} />
              </div>

              <Card className="h-fit gap-0 py-0 ring-1 ring-foreground/10">
                <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
                  <CardTitle className="text-sm">Ownership</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 py-4 text-sm sm:px-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Owner team</p>
                    <p>{item.ownerTeamName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assignee</p>
                    <p>
                      {item.assigneeName ?? (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target date</p>
                    <p className="font-mono text-xs tabular-nums">
                      {formatDateTime(item.dueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                    <p>{item.engagementName}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {item.engagementCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Updated</p>
                    <p className="font-mono text-xs tabular-nums">
                      {formatDate(item.updatedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
