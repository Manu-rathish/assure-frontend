import { Inbox } from "lucide-react";
import type { InboxPageData, InboxSearchParams } from "@/lib/types/inbox";
import { InboxCard } from "./inbox-card";

interface InboxCardGridProps {
  data: InboxPageData;
  params: InboxSearchParams;
}

const EMPTY_COPY = {
  response: {
    title: "Nothing awaiting response",
    description:
      "Open lines and action items assigned to teams will appear here.",
  },
  review: {
    title: "No items to review",
    description:
      "Team members submit lines for your review from their My Plate.",
  },
  approval: {
    title: "No approvals pending",
    description:
      "Management response approvals will appear here in a future release.",
  },
} as const;

export function InboxCardGrid({ data, params }: InboxCardGridProps) {
  const { filteredItems, activeTab, query } = data;

  if (filteredItems.length === 0) {
    const copy = query
      ? {
          title: "No matching items",
          description: `No items match "${query}"`,
        }
      : EMPTY_COPY[activeTab];

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="mb-3 size-8 text-muted-foreground/50" aria-hidden />
        <h3 className="text-sm font-medium">{copy.title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {copy.description}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredItems.map((item, index) => (
        <InboxCard
          key={item.internalId}
          item={item}
          activeTab={activeTab}
          style={{
            animationDelay: `${Math.min(index * 50, 300)}ms`,
          }}
        />
      ))}
    </div>
  );
}
