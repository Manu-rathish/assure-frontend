import type { EngagementKpis, TeamCompletion } from "@/lib/types/engagement";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const PHASE_ORDER = [
  "planning",
  "idr",
  "adr",
  "examination",
  "report",
  "remediation",
  "closed",
] as const;

export const RAIL_PHASES = [
  { key: "idr", label: "IDR", step: 1 },
  { key: "adr", label: "ADR", step: 2 },
  { key: "examination", label: "Examination", step: 3 },
  { key: "report", label: "Report", step: 4 },
  { key: "remediation", label: "Remediation", step: 5 },
] as const;

export type TeamFilter = "all" | "needs_attention" | "incomplete" | "complete";

export type TeamSortKey =
  | "teamName"
  | "total"
  | "approved"
  | "open"
  | "completionPct"
  | "dueWithin48h"
  | "overdue";

export type TeamSort = { key: TeamSortKey; direction: "asc" | "desc" };

export const DEFAULT_TEAM_SORT: TeamSort = {
  key: "completionPct",
  direction: "asc",
};

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}

export function formatPeriod(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  if (!start || !end) return "—";
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function formatTimelineCaption(
  periodStart: string | null | undefined,
  targetCloseDate: string | null | undefined,
): string | null {
  const parts: string[] = [];
  if (periodStart) {
    parts.push(formatDate(periodStart));
  }
  if (targetCloseDate) {
    parts.push(`Target close ${formatDate(targetCloseDate)}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function normalizePhase(phase: string): string {
  const normalized = phase.trim().toLowerCase();
  if (normalized.includes("idr") && normalized.includes("adr")) {
    return "adr";
  }
  return normalized;
}

export function phaseIndex(phase: string): number {
  return PHASE_ORDER.indexOf(
    normalizePhase(phase) as (typeof PHASE_ORDER)[number],
  );
}

export function statusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "active") {
    return "border-primary/25 bg-primary/10 text-primary";
  }
  if (normalized === "closed") {
    return "border-border bg-muted/50 text-muted-foreground";
  }
  return "border-border bg-muted/30 text-foreground";
}

export function phaseBadgeClass(phase: string): string {
  const normalized = normalizePhase(phase);
  if (normalized === "remediation") {
    return "border-primary/30 bg-primary/10 text-primary";
  }
  if (normalized === "closed") {
    return "border-border bg-muted/50 text-muted-foreground";
  }
  return "border-border bg-background text-foreground";
}

export function buildPhaseSubtext(kpis: EngagementKpis): Record<string, string> {
  const subtext: Record<string, string> = {};
  const idrTotal = kpis.idrOpen + kpis.idrClosed;
  if (idrTotal > 0) {
    subtext.idr = `${kpis.idrClosed} of ${idrTotal} closed`;
  }
  const adrTotal = kpis.adrOpen + kpis.adrClosed;
  if (adrTotal > 0) {
    subtext.adr = `${kpis.adrClosed} of ${adrTotal} closed`;
  }
  if (kpis.asksTotal > 0) {
    subtext.examination = `${kpis.asksTotal} asks`;
  }
  if (kpis.findingsTotal > 0) {
    subtext.report = `${kpis.findingsTotal} findings`;
  }
  if (kpis.actionItemsTotal > 0) {
    subtext.remediation = `${kpis.actionItemsOpen} open`;
  }
  return subtext;
}

export function filterTeamRows(
  rows: TeamCompletion[],
  filter: TeamFilter,
  search: string,
): TeamCompletion[] {
  let out = rows;
  const q = search.trim().toLowerCase();
  if (q) {
    out = out.filter((r) =>
      `${r.teamName} ${r.teamSlug}`.toLowerCase().includes(q),
    );
  }
  if (filter === "needs_attention") {
    out = out.filter((r) => r.overdue > 0 || r.dueWithin48h > 0);
  } else if (filter === "incomplete") {
    out = out.filter((r) => r.open > 0);
  } else if (filter === "complete") {
    out = out.filter((r) => r.open === 0 && r.total > 0);
  }
  return out;
}

export function toggleTeamSort(prev: TeamSort, key: TeamSortKey): TeamSort {
  if (prev.key === key) {
    return {
      key,
      direction: prev.direction === "asc" ? "desc" : "asc",
    };
  }
  const direction =
    key === "overdue" ? "desc" : key === "teamName" ? "asc" : "asc";
  return { key, direction };
}

export function sortTeamRows(
  rows: TeamCompletion[],
  sort: TeamSort,
): TeamCompletion[] {
  return [...rows].sort((a, b) => {
    let cmp = 0;
    if (sort.key === "teamName") {
      cmp = a.teamName.localeCompare(b.teamName);
    } else {
      cmp = a[sort.key] - b[sort.key];
    }
    if (sort.direction === "desc") cmp = -cmp;
    if (cmp !== 0) return cmp;
    if (sort.key !== "overdue" && b.overdue !== a.overdue) {
      return b.overdue - a.overdue;
    }
    return a.teamName.localeCompare(b.teamName);
  });
}

export function sumTeamRows(rows: TeamCompletion[]) {
  return rows.reduce(
    (acc, row) => ({
      total: acc.total + row.total,
      approved: acc.approved + row.approved,
      open: acc.open + row.open,
      dueWithin48h: acc.dueWithin48h + row.dueWithin48h,
      overdue: acc.overdue + row.overdue,
    }),
    { total: 0, approved: 0, open: 0, dueWithin48h: 0, overdue: 0 },
  );
}

export function formatBucketFraction(bucket?: {
  total: number;
  approved: number;
}): string {
  if (!bucket || bucket.total <= 0) return "—";
  return `${bucket.approved}/${bucket.total}`;
}

export function formatDoneTooltip(row: TeamCompletion): string {
  return `IDR ${formatBucketFraction(row.idr)} · ADR ${formatBucketFraction(row.adr)}`;
}

export function hasScopeDrawer(overview: {
  auditorName: string | null;
  appsInScope: string[];
  frameworksInScope: string[];
  examinationStartDate: string | null;
  notes: string | null;
}): boolean {
  const hasScope = Boolean(
    overview.auditorName ||
      overview.appsInScope.length > 0 ||
      overview.frameworksInScope.length > 0 ||
      overview.examinationStartDate,
  );
  return hasScope || Boolean(overview.notes);
}

export function isTeamFilterActive(
  filter: TeamFilter,
  search: string,
): boolean {
  return filter !== "all" || search.trim().length > 0;
}
