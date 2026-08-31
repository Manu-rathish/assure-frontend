import { cn } from "@/lib/utils";
import type { PhaseRiskItem } from "@/lib/types/dashboard";
import { DashboardPanel } from "./dashboard-panel";

interface DashboardPhaseMixChartProps {
  phaseRisk: PhaseRiskItem[];
}

function PhaseRow({ item }: { item: PhaseRiskItem }) {
  const risk = item.dueWithin48h + item.overdue;
  const total = Math.max(item.activeCount, 1);
  const duePct = (item.dueWithin48h / total) * 100;
  const overduePct = (item.overdue / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{item.phase}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {risk} risk · {item.activeCount} active
        </span>
      </div>
      {risk > 0 ? (
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          {item.dueWithin48h > 0 ? (
            <div
              className="dashboard-bar-grow bg-sla-warn/80"
              style={{ width: `${duePct}%` }}
            />
          ) : null}
          {item.overdue > 0 ? (
            <div
              className="dashboard-bar-grow bg-sla-breach/80"
              style={{ width: `${overduePct}%` }}
            />
          ) : null}
        </div>
      ) : (
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="dashboard-bar-grow h-full w-1/4 bg-sla-ok/50" />
        </div>
      )}
    </div>
  );
}

export function DashboardPhaseMixChart({
  phaseRisk,
}: DashboardPhaseMixChartProps) {
  const total = phaseRisk.reduce((sum, p) => sum + p.activeCount, 0);

  return (
    <DashboardPanel
      title="Phase risk"
      description={`${total} active engagement${total === 1 ? "" : "s"}`}
      className="h-full"
    >
      {phaseRisk.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No active engagements
        </p>
      ) : (
        <div className="space-y-4">
          {phaseRisk.map((item) => (
            <PhaseRow key={item.phase} item={item} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}
