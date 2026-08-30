import Link from "next/link";
import { cn } from "@/lib/utils";
import type { InboxCounts, InboxSearchParams, InboxTab } from "@/lib/types/inbox";
import { buildInboxHref } from "./inbox-helpers";

const TABS: { value: InboxTab; label: string; countKey: keyof InboxCounts }[] = [
  { value: "response", label: "Response", countKey: "response" },
  { value: "review", label: "Review", countKey: "review" },
  { value: "approval", label: "Approval", countKey: "approval" },
];

interface InboxTabsProps {
  counts: InboxCounts;
  params: InboxSearchParams;
}

function TabBadge({
  count,
  active,
}: {
  count: number;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
        active
          ? "bg-foreground/10 text-foreground"
          : count > 0
            ? "bg-muted text-muted-foreground"
            : "bg-muted/50 text-muted-foreground/60",
      )}
    >
      {count}
    </span>
  );
}

export function InboxTabs({ counts, params }: InboxTabsProps) {
  return (
    <div
      className="flex gap-6 border-b border-border"
      role="tablist"
      aria-label="Inbox queues"
    >
      {TABS.map((tab) => {
        const active = params.tab === tab.value;
        const count = counts[tab.countKey];
        const highlightReview =
          tab.value === "review" && counts.review > 0 && params.tab !== "review";

        return (
          <Link
            key={tab.value}
            href={buildInboxHref({
              tab: tab.value,
              engagementId: params.engagementId,
              q: params.q,
            })}
            role="tab"
            aria-selected={active}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
              highlightReview && !active && "text-primary",
            )}
          >
            {tab.label}
            <TabBadge count={count} active={active} />
          </Link>
        );
      })}
    </div>
  );
}
