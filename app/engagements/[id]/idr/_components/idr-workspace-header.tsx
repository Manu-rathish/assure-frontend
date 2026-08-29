import type { IdrDocument, IdrLineListItem } from "@/lib/types/idr";
import { computeLineKpis } from "./idr-filters";

interface IdrWorkspaceHeaderProps {
  engagementCode: string;
  documents: IdrDocument[];
  lines: IdrLineListItem[];
}

export function IdrWorkspaceHeader({
  engagementCode,
  documents,
  lines,
}: IdrWorkspaceHeaderProps) {
  const kpis = computeLineKpis(lines);

  const items = [
    { label: "Documents", value: documents.length },
    { label: "Open lines", value: kpis.open },
    { label: "Needs review", value: kpis.needsReview },
    { label: "Overdue", value: kpis.overdue },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
          {engagementCode}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Initial Document Request
        </h1>
        <p className="text-muted-foreground">
          Auditor questionnaire lines for this engagement — triage ownership, due
          dates, and review queue.
        </p>
      </div>
      <div className="flex gap-4 overflow-x-auto sm:gap-6">
        {items.map((kpi) => (
          <div key={kpi.label} className="min-w-16 shrink-0">
            <div className="text-2xl font-bold tabular-nums">{kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
