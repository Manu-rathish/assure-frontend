"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import { statusLabel } from "@/lib/formatters";
import type { IdrLineDetail } from "@/lib/types/idr";
import { formatDate } from "@/app/engagements/[id]/idr/_components/idr-filters";

interface IdrLineDetailViewProps {
  engagementId: string;
  line: IdrLineDetail;
}

export function IdrLineDetailView({
  engagementId,
  line,
}: IdrLineDetailViewProps) {
  const backHref = line.documentId
    ? `/engagements/${engagementId}/idr?doc=${line.documentId}`
    : `/engagements/${engagementId}/idr`;

  return (
    <main className={pageShellClass}>
      <PageReveal>
        <SectionStagger className="space-y-4">
          <SectionItem className="space-y-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={backHref}>
                <ArrowLeft className="size-3.5" />
                Back to IDR
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold leading-tight tracking-tight">
                <span className="font-mono">{line.lineId}</span>
              </h1>
              <Badge variant="outline" className="capitalize">
                {statusLabel(line.status)}
              </Badge>
            </div>
            <p className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
              {line.engagementCode} · {line.documentLabel}
            </p>
          </SectionItem>

          <SectionItem>
            <Card>
              <CardHeader>
                <CardTitle>Question</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed">
                {line.questionText}
              </CardContent>
            </Card>
          </SectionItem>

          <SectionItem>
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Category</span>
                  <span>{line.category}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Owner team</span>
                  <span>{line.ownerTeamName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Assignee</span>
                  <span>{line.assigneeName ?? "Unassigned"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Due date</span>
                  <span className="font-mono text-xs tabular-nums">
                    {formatDate(line.dueDate)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </SectionItem>

          <SectionItem>
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed">
                {line.responseText ?? "No response recorded yet."}
              </CardContent>
            </Card>
          </SectionItem>

          {line.status === "rejected" && line.rejectionComment ? (
            <SectionItem>
              <Card className="border-l-2 border-l-destructive">
                <CardHeader>
                  <CardTitle>Rejection</CardTitle>
                </CardHeader>
                <CardContent className="text-xs leading-relaxed text-destructive">
                  {line.rejectionComment}
                </CardContent>
              </Card>
            </SectionItem>
          ) : null}

          <SectionItem>
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {line.attachments.length === 0 ? (
                  <p className="text-muted-foreground">No attachments.</p>
                ) : (
                  <ul className="space-y-1">
                    {line.attachments.map((att) => (
                      <li
                        key={att.id ?? att.fileName}
                        className="font-mono text-xs"
                      >
                        {att.fileName}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </SectionItem>

          <SectionItem>
            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                {line.recentAudit.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No recent activity.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {line.recentAudit.map((event) => (
                      <li key={event.id} className="py-3 first:pt-0">
                        <div className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                          {event.eventType}
                        </div>
                        {event.message ? (
                          <div className="mt-0.5 text-xs">{event.message}</div>
                        ) : null}
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {event.actorName ? `${event.actorName} · ` : ""}
                          {formatDate(event.createdAt)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
