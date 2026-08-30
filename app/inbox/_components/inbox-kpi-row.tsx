import Link from "next/link";
import { AlertCircle, ClipboardCheck, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InboxCounts, InboxSearchParams } from "@/lib/types/inbox";
import { buildInboxHref } from "./inbox-helpers";

interface InboxKpiRowProps {
  counts: InboxCounts;
  params: InboxSearchParams;
}

export function InboxKpiRow({ counts, params }: InboxKpiRowProps) {
  const overdueDestructive = counts.overdue > 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card/50 px-4 py-3 text-sm">
      <Link
        href={buildInboxHref({
          tab: "response",
          engagementId: params.engagementId,
          q: params.q,
        })}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
      >
        <Inbox className="size-4 text-muted-foreground" aria-hidden />
        <span className="font-bold tabular-nums">{counts.response}</span>
        <span className="text-muted-foreground">response</span>
      </Link>

      <Link
        href={buildInboxHref({
          tab: "review",
          engagementId: params.engagementId,
          q: params.q,
        })}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
      >
        <ClipboardCheck className="size-4 text-muted-foreground" aria-hidden />
        <span className="font-bold tabular-nums">{counts.review}</span>
        <span className="text-muted-foreground">to review</span>
      </Link>

      <div
        className={cn(
          "flex cursor-default items-center gap-2 rounded-md px-2 py-1",
          overdueDestructive && "text-destructive",
        )}
      >
        <AlertCircle
          className={cn(
            "size-4",
            overdueDestructive ? "text-destructive" : "text-muted-foreground",
          )}
          aria-hidden
        />
        <span className="font-bold tabular-nums">{counts.overdue}</span>
        <span className={overdueDestructive ? "" : "text-muted-foreground"}>
          overdue
        </span>
      </div>
    </div>
  );
}
