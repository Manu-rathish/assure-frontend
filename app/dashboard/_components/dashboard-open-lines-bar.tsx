import { cn } from "@/lib/utils";

interface OpenLinesBarProps {
  count: number;
  dueWithin48h: number;
  overdue: number;
}

export function OpenLinesBar({
  count,
  dueWithin48h,
  overdue,
}: OpenLinesBarProps) {
  const onTrack = Math.max(0, count - dueWithin48h - overdue);
  const total = Math.max(count, 1);
  const onTrackPct = (onTrack / total) * 100;
  const duePct = (dueWithin48h / total) * 100;
  const overduePct = (overdue / total) * 100;

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-muted sm:flex">
        {onTrack > 0 ? (
          <div
            className="h-full bg-sla-ok/70"
            style={{ width: `${onTrackPct}%` }}
          />
        ) : null}
        {dueWithin48h > 0 ? (
          <div
            className="h-full bg-sla-warn/80"
            style={{ width: `${duePct}%` }}
          />
        ) : null}
        {overdue > 0 ? (
          <div
            className="h-full bg-sla-breach/80"
            style={{ width: `${overduePct}%` }}
          />
        ) : null}
      </div>
      <span className="w-5 text-right text-xs tabular-nums">{count}</span>
    </div>
  );
}
