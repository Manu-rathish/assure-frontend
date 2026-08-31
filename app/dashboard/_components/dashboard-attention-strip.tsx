import Link from "next/link";
import { AlertTriangle, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgDashboard } from "@/lib/types/dashboard";

interface DashboardAttentionStripProps {
  dashboard: OrgDashboard;
}

export function DashboardAttentionStrip({
  dashboard,
}: DashboardAttentionStripProps) {
  const { overdue } = dashboard.kpis;
  const reviewCount = dashboard.attention?.inboxReviewCount ?? 0;

  if (overdue <= 0 && reviewCount <= 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {overdue > 0 ? (
        <Link
          href="/engagements?status=active&urgency=overdue"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
            "border-sla-breach/40 bg-sla-breach/5 text-sla-breach",
          )}
        >
          <AlertTriangle className="size-3.5" aria-hidden />
          {overdue} overdue lines org-wide
        </Link>
      ) : null}
      {reviewCount > 0 ? (
        <Link
          href="/inbox?tab=review"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
            "border-primary/30 bg-primary/5 text-primary",
          )}
        >
          <ClipboardList className="size-3.5" aria-hidden />
          {reviewCount} items awaiting review
        </Link>
      ) : null}
    </div>
  );
}
