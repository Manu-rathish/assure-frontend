import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EngagementHistoryItem } from "@/lib/types/engagement";
import {
  getAuditEventIcon,
  getHistoryCategoryPillClass,
  getHistoryEventCategory,
  getHistoryEventTypePill,
} from "./history-audit-display";
import { formatEventTime } from "./history-helpers";

interface HistoryEventRowProps {
  item: EngagementHistoryItem;
  isLast: boolean;
}

export function HistoryEventRow({ item, isLast }: HistoryEventRowProps) {
  const category = getHistoryEventCategory(item.eventType, item.category);
  const { Icon, className: iconClass } = getAuditEventIcon(item.eventType);
  const pillLabel = getHistoryEventTypePill(item.eventType);
  const pillClass = getHistoryCategoryPillClass(category);

  return (
    <div className="flex gap-4 py-3">
      <div className="w-[100px] shrink-0 pt-0.5 text-right font-mono text-[12px] text-muted-foreground tabular-nums">
        <time dateTime={item.createdAt}>{formatEventTime(item.createdAt)}</time>
      </div>

      <div className="flex w-4 shrink-0 flex-col items-center">
        <span
          className={cn(
            "size-2.5 shrink-0 rounded-full",
            category === "workflow"
              ? "bg-primary"
              : category === "files"
                ? "bg-muted-foreground"
                : category === "engagement"
                  ? "bg-foreground/70"
                  : category === "remediation"
                    ? "bg-sla-warn"
                    : category === "examination"
                      ? "bg-violet-500"
                      : category === "findings"
                        ? "bg-destructive/80"
                        : "bg-border",
          )}
          aria-hidden
        />
        {!isLast ? <div className="w-px flex-1 bg-border" /> : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="font-medium text-foreground">
            {item.actorName ?? "System"}
          </span>
          <span className="text-muted-foreground" aria-hidden>
            ·
          </span>
          <span
            className={cn(
              "inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
              pillClass,
            )}
          >
            {pillLabel}
          </span>
          <Icon
            className={cn("hidden size-3.5 sm:inline-flex", iconClass)}
            aria-hidden
          />
        </div>

        {item.href ? (
          <Link
            href={item.href}
            className="mt-1 block text-[13px] leading-relaxed text-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            {item.message}
          </Link>
        ) : (
          <p className="mt-1 text-[13px] leading-relaxed text-foreground">
            {item.message}
          </p>
        )}

        {item.detail ? (
          <div className="mt-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {item.detailKind === "reason" ? (
              <>
                <span className="font-medium text-foreground">Reason:</span>{" "}
                {item.detail}
              </>
            ) : item.detailKind === "status" ? (
              <>
                <span className="font-medium text-foreground">Status:</span>{" "}
                <span className="font-mono">{item.detail}</span>
              </>
            ) : item.detailKind === "title" ? (
              <>
                <span className="font-medium text-foreground">Title:</span>{" "}
                &ldquo;{item.detail}&rdquo;
              </>
            ) : (
              item.detail
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
