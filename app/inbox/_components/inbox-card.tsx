import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { InboxItem, InboxTab } from "@/lib/types/inbox";
import { InboxKindPill } from "./inbox-kind-pill";
import { InboxSlaIndicator } from "./inbox-sla-indicator";
import { InboxCardActions } from "./inbox-card-actions";
import {
  computeSlaState,
  slaStatusForItem,
} from "./inbox-helpers";

interface InboxCardProps {
  item: InboxItem;
  activeTab: InboxTab;
  style?: React.CSSProperties;
}

export function InboxCard({ item, activeTab, style }: InboxCardProps) {
  const slaStatus =
    activeTab === "review" ? "submitted" : slaStatusForItem(item);
  const dueDate = item.dueDate ? new Date(item.dueDate) : null;
  const sla = computeSlaState(dueDate, slaStatus);

  const secondaryLabel = activeTab === "review" ? "Submitted by" : "Team";
  const secondaryValue =
    activeTab === "review"
      ? (item.assigneeName ?? "—")
      : item.ownerTeamName;

  return (
    <article
      className="group relative flex flex-col rounded-lg border bg-card p-4 shadow-sm transition-shadow duration-200 hover:border-foreground/15 hover:shadow-md"
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <InboxKindPill kind={item.kind} />
          <Link
            href={item.href}
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            {item.displayId}
          </Link>
        </div>
        <InboxSlaIndicator
          variant={sla.variant}
          width={sla.width}
          label={sla.label}
        />
      </div>

      <Link
        href={item.href}
        className="mt-2 line-clamp-2 text-sm leading-snug font-medium group-hover:text-primary"
      >
        {item.title}
      </Link>

      <p className="mt-2 text-xs">
        <span className="font-medium text-foreground/80">
          {item.engagementName}
        </span>
        <span className="text-muted-foreground"> · </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {item.engagementCode}
        </span>
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        <span>{secondaryLabel}:</span>{" "}
        <span className="text-foreground">{secondaryValue}</span>
      </p>

      {activeTab === "response" ? (
        <div className="mt-4 flex items-center gap-2 border-t pt-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={item.href}>Open</Link>
          </Button>
        </div>
      ) : null}

      {activeTab === "review" && item.lineKind ? (
        <InboxCardActions
          engagementId={item.engagementId}
          lineKind={item.lineKind}
          internalId={item.internalId}
          lineId={item.displayId}
        />
      ) : null}
    </article>
  );
}
