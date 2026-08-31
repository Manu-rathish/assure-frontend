import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OrgDashboardKpis } from "@/lib/types/dashboard";
import { getSlaHealth } from "./dashboard-helpers";
import { DashboardPanel } from "./dashboard-panel";

interface DashboardSlaHealthRingProps {
  kpis: OrgDashboardKpis;
}

const RADIUS = 54;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function HealthChip({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-border/60 bg-background/50 px-3 py-2 transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </Link>
  );
}

export function DashboardSlaHealthRing({ kpis }: DashboardSlaHealthRingProps) {
  const { totalOpen, onTrack, healthyPct, tone } = getSlaHealth(kpis);
  const dashOffset = CIRCUMFERENCE - (healthyPct / 100) * CIRCUMFERENCE;

  const borderAccent =
    tone === "danger"
      ? "border-sla-breach/30"
      : tone === "warn"
        ? "border-sla-warn/30"
        : undefined;

  return (
    <DashboardPanel
      title="SLA health"
      description="On-track share of open lines"
      borderAccent={borderAccent}
      className="h-full"
      bodyClassName="p-3 sm:p-4"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="relative mx-auto size-32 shrink-0 sm:size-36 lg:mx-0">
          <svg
            viewBox="0 0 144 144"
            className="size-full -rotate-90"
            role="img"
            aria-label={`SLA health: ${healthyPct}% healthy`}
          >
            <circle
              cx="72"
              cy="72"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              className="text-muted/60"
            />
            <circle
              cx="72"
              cy="72"
              r={RADIUS}
              fill="none"
              stroke="var(--sla-ok)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="dashboard-ring-segment"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-medium tracking-tight text-foreground tabular-nums">
              {healthyPct}%
            </span>
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
              healthy
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <HealthChip
              label="On track"
              value={onTrack}
              href="/engagements?status=active"
            />
            <HealthChip
              label="Due ≤ 48h"
              value={kpis.dueWithin48h}
              href="/engagements?status=active&urgency=due48h"
            />
            <HealthChip
              label="Overdue"
              value={kpis.overdue}
              href="/engagements?status=active&urgency=overdue"
            />
            <HealthChip
              label="Breaches 7d"
              value={kpis.slaBreaches7d}
              href="/engagements?status=active&urgency=breach7d"
            />
          </div>

          <p className="text-xs text-muted-foreground lg:text-left">
            {totalOpen} open line{totalOpen === 1 ? "" : "s"} across active
            engagements
          </p>
        </div>
      </div>
    </DashboardPanel>
  );
}
