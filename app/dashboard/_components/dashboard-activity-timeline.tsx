import { cn } from "@/lib/utils";
import type { OrgActivityItem } from "@/lib/types/dashboard";
import {
  getAuditEventIcon,
  getHistoryEventTypePill,
} from "@/app/engagements/[id]/history/_components/history-audit-display";
import {
  formatActivityMessage,
  formatRelativeTime,
} from "./dashboard-helpers";
import { DashboardPanel } from "./dashboard-panel";

interface DashboardActivityTimelineProps {
  items: OrgActivityItem[];
}

function iconWellClass(eventType: string): string {
  const lower = eventType.toLowerCase();
  if (lower.includes("reject") || lower.includes("breach")) {
    return "bg-destructive/10";
  }
  if (lower.includes("approved")) {
    return "bg-sla-complete/10";
  }
  if (lower.includes("submitted")) {
    return "bg-sla-warn/10";
  }
  return "bg-primary/10";
}

export function DashboardActivityTimeline({
  items,
}: DashboardActivityTimelineProps) {
  return (
    <DashboardPanel
      title="Recent activity"
      description="Last 24 hours"
      bodyClassName="p-0"
      className="h-full min-w-0 xl:h-full"
    >
      {items.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-medium">No activity yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Submissions, approvals, and other events from the last 24 hours will
            show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item, index) => {
            const { Icon, className: iconClass } = getAuditEventIcon(
              item.eventType,
            );
            const pillLabel = getHistoryEventTypePill(item.eventType);
            const message = formatActivityMessage(item);

            return (
              <li
                key={item.id}
                className="px-4 py-3"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      iconWellClass(item.eventType),
                    )}
                  >
                    <Icon className={cn("size-3.5", iconClass)} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs font-semibold">
                        {item.actorName ?? "System"}
                      </span>
                      <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {pillLabel}
                      </span>
                      <time
                        dateTime={item.createdAt}
                        className="ml-auto text-[11px] text-muted-foreground tabular-nums"
                      >
                        {formatRelativeTime(item.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1 text-sm leading-snug break-words text-foreground/90">
                      {message}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardPanel>
  );
}
