import type { AdrDocument, AdrLineListItem } from "@/lib/types/adr";

interface AdrWorkspaceHeaderProps {
  engagementCode: string;
  documents: AdrDocument[];
  lines: AdrLineListItem[];
}

export function AdrWorkspaceHeader({
  engagementCode,
  documents,
  lines,
}: AdrWorkspaceHeaderProps) {
  const now = new Date();
  const openLines = lines.filter((l) => l.status !== "approved").length;
  const needsReview = lines.filter((l) => l.status === "submitted").length;
  const overdue = lines.filter((l) => {
    if (!l.dueDate || l.status === "approved") return false;
    return new Date(l.dueDate) < now;
  }).length;

  const kpis = [
    { label: "Documents", value: documents.length },
    { label: "Open lines", value: openLines },
    { label: "Needs review", value: needsReview },
    { label: "Overdue", value: overdue },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
          {engagementCode}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Additional Document Request
        </h1>
        <p className="text-muted-foreground">
          Follow-ups linked to parent IDR lines — trace every auditor ask back
          to its source.
        </p>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-4 sm:flex sm:gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="min-w-16 shrink-0">
            <div className="text-2xl font-bold tabular-nums">{kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
