import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { EngagementOverview } from "@/lib/types/engagement";
import {
  formatDate,
  formatPeriod,
  phaseBadgeClass,
  statusBadgeClass,
} from "./overview-helpers";

interface OverviewHeaderProps {
  overview: EngagementOverview;
}

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="size-3.5 shrink-0 opacity-60" />
      {children}
    </span>
  );
}

function DateStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-background/80 px-3 py-2 ring-1 ring-foreground/8">
      <div className="text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-xs tabular-nums">{value}</div>
    </div>
  );
}

export function OverviewHeader({ overview }: OverviewHeaderProps) {
  return (
    <div className="relative px-5 py-5 sm:px-6 sm:py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-muted/25"
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase tabular-nums">
              {overview.code}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn("capitalize", statusBadgeClass(overview.status))}
              >
                {statusLabel(overview.status)}
              </Badge>
              <Badge
                variant="outline"
                className={cn("capitalize", phaseBadgeClass(overview.phase))}
              >
                {statusLabel(overview.phase)}
              </Badge>
            </div>
          </div>

          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {overview.name}
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <MetaItem icon={UserRound}>{overview.type}</MetaItem>
            <MetaItem icon={UserRound}>Lead: {overview.leadName}</MetaItem>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3 lg:flex-col lg:items-stretch">
          <DateStat
            label="Period"
            value={formatPeriod(overview.periodStart, overview.periodEnd)}
          />
          {overview.targetCloseDate ? (
            <DateStat
              label="Target close"
              value={formatDate(overview.targetCloseDate)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
