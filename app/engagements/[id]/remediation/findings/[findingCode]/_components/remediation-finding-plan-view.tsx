"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { FindingDetail } from "@/lib/types/finding";
import type { ActionItemListItem } from "@/lib/types/remediation";
import {
  formatDate,
  planProgress,
  progressBarTone,
} from "@/app/engagements/[id]/remediation/_components/remediation-helpers";
import {
  SeverityBadge,
  StatusBadge,
} from "@/app/engagements/[id]/findings/_components/finding-display";
import { RemediationItemsPanel } from "@/app/engagements/[id]/remediation/_components/remediation-items-panel";

interface RemediationFindingPlanViewProps {
  engagementId: string;
  finding: FindingDetail;
  items: ActionItemListItem[];
}

export function RemediationFindingPlanView({
  engagementId,
  finding,
  items,
}: RemediationFindingPlanViewProps) {
  const reduce = useReducedMotion();
  const { closed, total, pct } = planProgress(items);
  const hubHref = `/engagements/${engagementId}/remediation`;
  const findingDetailHref = `/engagements/${engagementId}/findings/${finding.findingCode}`;

  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem>
            <p className="text-xs text-muted-foreground">
              <Link href={hubHref} className="hover:text-foreground">
                Remediation
              </Link>{" "}
              / {finding.findingCode}
            </p>
          </SectionItem>

          <SectionItem className="min-w-0">
            <Card className="gap-0 py-0 ring-1 ring-foreground/10">
              <CardContent className="space-y-3 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium">
                    {finding.findingCode}
                  </span>
                  <SeverityBadge severity={finding.severity} />
                  <StatusBadge status={finding.status} />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h1 className="text-base font-semibold">{finding.title}</h1>
                  <Link
                    href={findingDetailHref}
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    Full detail →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </SectionItem>

          <SectionItem className="min-w-0">
            <Card className="gap-0 py-0 ring-1 ring-foreground/10">
              <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-sm">Plan progress</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    Target close {formatDate(finding.targetCloseDate)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 py-4 sm:px-5">
                <p className="text-sm text-muted-foreground">
                  {closed} of {total} action items closed
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>0%</span>
                    <span className="font-mono tabular-nums">{pct}%</span>
                    <span>100%</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted/70"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        progressBarTone(pct),
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.6, ease: "easeOut" }
                      }
                    />
                  </div>
                </div>
                {pct === 100 ? (
                  <p className="text-sm text-emerald-600">
                    All action items closed — finding is ready to be verified in
                    the Findings tab.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </SectionItem>

          <SectionItem className="min-w-0">
            <RemediationItemsPanel
              engagementId={engagementId}
              items={items}
              showFindingColumn={false}
              sectionTitle={`Action items for ${finding.findingCode}`}
            />
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
