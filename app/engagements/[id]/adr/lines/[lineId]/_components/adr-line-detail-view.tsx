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
import { formatDueDate, statusLabel } from "@/lib/formatters";
import type { AdrLineDetail } from "@/lib/types/adr";
import { AdrParentContext } from "./adr-parent-context";

interface AdrLineDetailViewProps {
  engagementId: string;
  line: AdrLineDetail;
}

export function AdrLineDetailView({
  engagementId,
  line,
}: AdrLineDetailViewProps) {
  const backHref = line.documentId
    ? `/engagements/${engagementId}/adr?doc=${line.documentId}`
    : `/engagements/${engagementId}/adr`;

  return (
    <main className={pageShellClass}>
      <PageReveal>
        <SectionStagger className="space-y-4">
          <SectionItem className="space-y-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={backHref}>
                <ArrowLeft className="size-3.5" />
                Back to ADR
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
              {line.engagementCode}
              {line.documentLabel ? ` · ${line.documentLabel}` : ""}
            </p>
          </SectionItem>

          <SectionItem>
            <AdrParentContext engagementId={engagementId} line={line} />
          </SectionItem>

          <SectionItem className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Question</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{line.questionText}</CardContent>
            </Card>
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
                  <span className="text-muted-foreground">Owner</span>
                  <span>{line.ownerTeamName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Assignee</span>
                  <span>{line.assigneeName ?? "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Due</span>
                  <span>{formatDueDate(line.dueDate)}</span>
                </div>
              </CardContent>
            </Card>
          </SectionItem>

          <SectionItem className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{line.responseText ?? "No response yet."}</p>
                {line.submittedAt && (
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDueDate(line.submittedAt)}
                    {line.submittedByName ? ` by ${line.submittedByName}` : ""}
                  </p>
                )}
                {line.rejectionComment && (
                  <p className="text-xs text-destructive">
                    {line.rejectionComment}
                  </p>
                )}
              </CardContent>
            </Card>
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
                <CardTitle>Recent audit</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {line.recentAudit.length === 0 ? (
                  <p className="text-muted-foreground">No audit events.</p>
                ) : (
                  <ul className="space-y-2">
                    {line.recentAudit.map((event) => (
                      <li
                        key={event.id}
                        className="flex justify-between gap-4 text-xs"
                      >
                        <span className="font-mono">{event.eventType}</span>
                        <span className="text-muted-foreground">
                          {formatDueDate(event.createdAt)}
                        </span>
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
