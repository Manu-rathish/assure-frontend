import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InboxCounts } from "@/lib/types/inbox";

interface InboxHeaderProps {
  counts: InboxCounts;
}

export function InboxHeader({ counts }: InboxHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Your cross-engagement work queue · {counts.total} items
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/remediation">
          View all action items
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
