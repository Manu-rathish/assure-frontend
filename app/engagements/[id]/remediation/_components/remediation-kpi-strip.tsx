import type { ActionItemListItem } from "@/lib/types/remediation";
import {
  countClosed,
  countInVerification,
  countOpenWork,
} from "./remediation-helpers";

interface RemediationKpiStripProps {
  items: ActionItemListItem[];
}

export function RemediationKpiStrip({ items }: RemediationKpiStripProps) {
  const kpis = [
    { label: "Open", value: countOpenWork(items) },
    { label: "In verification", value: countInVerification(items) },
    { label: "Closed", value: countClosed(items) },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto sm:gap-8">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="min-w-16 shrink-0">
          <div className="text-2xl font-bold tabular-nums">{kpi.value}</div>
          <div className="text-xs text-muted-foreground">{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}
