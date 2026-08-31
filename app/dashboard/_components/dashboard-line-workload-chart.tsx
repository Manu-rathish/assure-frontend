import Link from "next/link";
import { FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LineRiskBucket } from "@/lib/types/dashboard";
import { DashboardPanel } from "./dashboard-panel";

interface DashboardLineWorkloadChartProps {
  idr: LineRiskBucket;
  adr: LineRiskBucket;
}

function RiskStack({ bucket }: { bucket: LineRiskBucket }) {
  const total = Math.max(bucket.open, 1);
  const onTrackPct = (bucket.onTrack / total) * 100;
  const duePct = (bucket.dueWithin48h / total) * 100;
  const overduePct = (bucket.overdue / total) * 100;

  if (bucket.open === 0) {
    return <div className="h-2 rounded-full bg-muted" />;
  }

  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
      {bucket.onTrack > 0 ? (
        <div
          className="dashboard-bar-grow bg-sla-ok/70"
          style={{ width: `${onTrackPct}%` }}
        />
      ) : null}
      {bucket.dueWithin48h > 0 ? (
        <div
          className="dashboard-bar-grow bg-sla-warn/80"
          style={{ width: `${duePct}%` }}
        />
      ) : null}
      {bucket.overdue > 0 ? (
        <div
          className="dashboard-bar-grow bg-sla-breach/80"
          style={{ width: `${overduePct}%` }}
        />
      ) : null}
    </div>
  );
}

function StreamCard({
  label,
  icon: Icon,
  bucket,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bucket: LineRiskBucket;
}) {
  const atRisk = bucket.dueWithin48h + bucket.overdue;

  return (
    <Link
      href="/engagements?status=active"
      className={cn(
        "flex h-full flex-col rounded-lg border border-border/60 bg-background/50 p-2.5 shadow-sm sm:p-3",
        "transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-3.5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-lg font-semibold tabular-nums">{bucket.open}</p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {atRisk} at risk
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <RiskStack bucket={bucket} />
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span>{bucket.onTrack} on track</span>
          <span>{bucket.dueWithin48h} due</span>
          <span>{bucket.overdue} overdue</span>
        </div>
      </div>
    </Link>
  );
}

export function DashboardLineWorkloadChart({
  idr,
  adr,
}: DashboardLineWorkloadChartProps) {
  return (
    <DashboardPanel
      title="Line workload"
      description="SLA pressure by workstream"
      className="h-full"
      bodyClassName="p-3 sm:p-4"
    >
      <div className="grid h-full gap-3 lg:grid-cols-2">
        <StreamCard label="IDR lines" icon={FileText} bucket={idr} />
        <StreamCard label="ADR lines" icon={MessageSquare} bucket={adr} />
      </div>
    </DashboardPanel>
  );
}
