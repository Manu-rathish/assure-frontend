import { Card, CardContent } from "@/components/ui/card";
import { duration } from "@/lib/motion";
import type { SlaHealth } from "@/lib/types/engagement";

interface OverviewSlaBandProps {
  slaHealth: SlaHealth;
}

export function OverviewSlaBand({ slaHealth }: OverviewSlaBandProps) {
  return (
    <Card id="sla-band" className="h-full min-w-0 gap-0 py-0">
      <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 className="text-sm font-medium">SLA health</h2>
          <p className="text-xs text-muted-foreground">
            Open line SLA posture across IDR and ADR
          </p>
        </div>

        <div>
          <div className="text-2xl font-bold tabular-nums">
            {slaHealth.healthyPct}%
          </div>
          <div className="text-xs text-muted-foreground">on track</div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full origin-left rounded-full bg-primary"
            style={{
              transform: `scaleX(${Math.min(slaHealth.healthyPct, 100) / 100})`,
              transition: `transform ${duration.barFill}s ease-out`,
            }}
          />
        </div>

        <CardContent className="p-0 text-xs text-muted-foreground">
          {slaHealth.onTrack} on track · {slaHealth.dueWithin48h} due ≤48h ·{" "}
          {slaHealth.overdue} overdue · {slaHealth.totalOpen} total open
        </CardContent>
      </div>
    </Card>
  );
}
