import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionItemListItem } from "@/lib/types/remediation";
import { formatDate } from "@/app/engagements/[id]/remediation/_components/remediation-helpers";
import { ActionItemStatusBadge } from "@/app/engagements/[id]/remediation/_components/remediation-display";
import {
  actionItemHref,
  computeSlaState,
  slaStatusForRegisterItem,
} from "./remediation-register-helpers";
import { RemediationSlaIndicator } from "./remediation-sla-indicator";

interface RemediationRegisterTableProps {
  items: ActionItemListItem[];
}

export function RemediationRegisterTable({
  items,
}: RemediationRegisterTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
        No action items yet. Create them from an engagement Remediation tab.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs">ID</TableHead>
            <TableHead className="text-xs">Action item</TableHead>
            <TableHead className="text-xs">Engagement</TableHead>
            <TableHead className="text-xs">Owner</TableHead>
            <TableHead className="text-xs">Target</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-right text-xs">SLA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const href = actionItemHref(item.engagementId, item.actionItemId);
            const dueDate = item.dueDate ? new Date(item.dueDate) : null;
            const sla = computeSlaState(
              dueDate,
              slaStatusForRegisterItem(item),
            );

            return (
              <TableRow
                key={item.id}
                className="h-11 hover:bg-muted/40"
              >
                <TableCell className="font-mono text-xs">
                  <Link href={href} className="text-primary hover:underline">
                    {item.actionItemId}
                  </Link>
                </TableCell>
                <TableCell className="min-w-[12rem]">
                  <Link
                    href={href}
                    className="line-clamp-2 text-sm font-medium hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  {item.findingCode ? (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Finding {item.findingCode}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="text-xs">
                  <div className="font-medium text-foreground/80">
                    {item.engagementName}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {item.engagementCode}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div>{item.ownerTeamName}</div>
                  {item.assigneeName ? (
                    <div className="text-[10px] text-muted-foreground">
                      {item.assigneeName}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                  {formatDate(item.dueDate)}
                </TableCell>
                <TableCell>
                  <ActionItemStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-right">
                  <RemediationSlaIndicator
                    variant={sla.variant}
                    width={sla.width}
                    label={sla.label}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
