import Link from "next/link";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EngagementListItem } from "@/lib/types/engagement";
import {
  computeSlaState,
  engagementRiskTone,
  nextSlaLabel,
} from "./dashboard-helpers";
import { DashboardPanel } from "./dashboard-panel";
import { OpenLinesBar } from "./dashboard-open-lines-bar";

interface DashboardEngagementsTableProps {
  engagements: EngagementListItem[];
}

export function DashboardEngagementsTable({
  engagements,
}: DashboardEngagementsTableProps) {
  const action = (
    <Link
      href="/engagements?status=active"
      className="text-xs font-medium text-primary hover:underline"
    >
      View all →
    </Link>
  );

  if (engagements.length === 0) {
    return (
      <DashboardPanel
        title="Active engagements"
        description="Open line counts and next SLA"
        action={action}
      >
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Folder className="size-8 text-muted-foreground/60" aria-hidden />
          <div>
            <p className="text-sm font-medium">No active engagements</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create an engagement to start tracking IDR and ADR lines.
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/engagements/new">New engagement</Link>
          </Button>
        </div>
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel
      title="Active engagements"
      description="Open line counts and next SLA"
      action={action}
      bodyClassName="p-0"
      className="h-full"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[36%] text-xs">Engagement</TableHead>
              <TableHead className="w-[14%] text-xs">Phase</TableHead>
              <TableHead className="hidden w-[18%] text-xs md:table-cell">
                Lead
              </TableHead>
              <TableHead className="w-[16%] text-xs">Next SLA</TableHead>
              <TableHead className="w-[16%] text-right text-xs">Open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {engagements.map((engagement) => {
              const stripeTone = engagementRiskTone(engagement);
              const slaMeta = nextSlaLabel(engagement.nextDueDate);
              const slaState = engagement.nextDueDate
                ? computeSlaState(
                    new Date(engagement.nextDueDate),
                    "in_progress",
                  )
                : null;

              return (
                <TableRow
                  key={engagement.id}
                  className="h-10 hover:bg-muted/40"
                >
                  <TableCell className="relative py-2">
                    <span
                      className={cn(
                        "absolute top-1 bottom-1 left-0 w-0.5 rounded-r",
                        stripeTone,
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 pl-2">
                      <Link
                        href={`/engagements/${engagement.id}`}
                        className="block truncate text-sm font-medium hover:text-primary"
                        title={engagement.name}
                      >
                        {engagement.name}
                      </Link>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {engagement.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      {engagement.phase}
                    </span>
                  </TableCell>
                  <TableCell className="hidden py-2 md:table-cell">
                    <span className="block truncate text-xs text-muted-foreground">
                      {engagement.leadName}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant={slaMeta.variant}
                      className={cn(
                        "text-[10px] font-normal tabular-nums",
                        slaState?.variant === "breach" &&
                          "border-sla-breach/40 text-sla-breach",
                        slaState?.variant === "warn" &&
                          "border-sla-warn/40 text-sla-warn",
                      )}
                    >
                      {slaMeta.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <OpenLinesBar
                      count={engagement.openLineCount}
                      dueWithin48h={engagement.dueWithin48h}
                      overdue={engagement.overdue}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </DashboardPanel>
  );
}
