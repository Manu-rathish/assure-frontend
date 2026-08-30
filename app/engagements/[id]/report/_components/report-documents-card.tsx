import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditReport, FindingListItem } from "@/lib/types/finding";
import {
  countAccepted,
  countDisputed,
  formatDate,
  reportFileTypeLabel,
} from "./report-helpers";
import { ReportStatTile } from "./report-stat-tile";

interface ReportDocumentsCardProps {
  reports: AuditReport[];
  findings: FindingListItem[];
}

export function ReportDocumentsCard({
  reports,
  findings,
}: ReportDocumentsCardProps) {
  const accepted = countAccepted(findings);
  const disputed = countDisputed(findings);

  return (
    <Card className="flex h-full flex-col gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
        <CardTitle className="text-sm">Auditor&apos;s report</CardTitle>
        <CardDescription className="mt-0.5 text-xs">
          Registered report artifacts and extraction summary
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5">
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No report registered yet. Report metadata will appear here after
            ingest is connected.
          </p>
        ) : (
          <div className="space-y-2.5">
            {reports.map((report) => {
              const fileType = reportFileTypeLabel(report.fileName);
              const isPdf = fileType === "PDF";

              return (
                <div
                  key={report.id}
                  className="flex gap-3 rounded-lg border border-border/50 bg-muted/20 p-3"
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-md",
                      isPdf
                        ? "bg-red-500/10 text-red-600"
                        : "bg-blue-500/10 text-blue-600",
                    )}
                  >
                    <FileText className="size-4" aria-hidden />
                    <span className="sr-only">{fileType}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-snug">
                      {report.fileName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {report.pageCount != null
                        ? `${report.pageCount} pages · `
                        : ""}
                      Received {formatDate(report.receivedAt)}
                    </p>
                    {report.isDraft ? (
                      <span className="mt-1.5 inline-flex rounded-sm border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                        Draft
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border/40 pt-3">
          <ReportStatTile
            label="Extracted"
            value={findings.length}
            size="compact"
          />
          <ReportStatTile
            label="Accepted"
            value={accepted}
            valueClassName="text-emerald-600"
            size="compact"
          />
          <ReportStatTile
            label="Disputed"
            value={disputed}
            valueClassName="text-amber-600"
            size="compact"
          />
        </div>
      </CardContent>
    </Card>
  );
}
