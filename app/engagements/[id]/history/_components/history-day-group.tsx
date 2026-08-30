import type { HistoryDayGroup } from "./history-helpers";
import { HistoryEventRow } from "./history-event-row";

interface HistoryDayGroupSectionProps {
  group: HistoryDayGroup;
}

export function HistoryDayGroupSection({ group }: HistoryDayGroupSectionProps) {
  const eventLabel = group.items.length === 1 ? "event" : "events";

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2 border-b border-border/60 pb-2">
        <h3 className="text-sm font-semibold tracking-tight">{group.dayLabel}</h3>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          — {group.items.length} {eventLabel}
        </span>
      </div>
      <div className="divide-y divide-border/40">
        {group.items.map((item, index) => (
          <HistoryEventRow
            key={item.id}
            item={item}
            isLast={index === group.items.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
