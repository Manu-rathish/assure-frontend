import type { FindingListItem } from "@/lib/types/finding";
import { ACCEPTED_STATUSES } from "@/app/engagements/[id]/report/_components/report-helpers";

export const SEVERITY_ORDER = [
  "critical",
  "high",
  "medium",
  "low",
  "observation",
] as const;

export const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  observation: 4,
};

export const FINDING_QUICK_FILTERS = [
  "all",
  "accepted",
  "disputed",
  "open_remediation",
  "critical_high",
] as const;

export type FindingQuickFilter = (typeof FINDING_QUICK_FILTERS)[number];

export const FILTER_LABELS: Record<FindingQuickFilter, string> = {
  all: "All",
  accepted: "Accepted",
  disputed: "Disputed",
  open_remediation: "In remediation",
  critical_high: "Critical / High",
};

export function severityBarScale(count: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, count / total));
}

export function sortFindingsDefault(findings: FindingListItem[]) {
  return [...findings].sort((a, b) => {
    const sa = SEVERITY_RANK[a.severity] ?? 99;
    const sb = SEVERITY_RANK[b.severity] ?? 99;
    if (sa !== sb) return sa - sb;
    return a.findingCode.localeCompare(b.findingCode);
  });
}

export function matchesFindingFilter(
  f: FindingListItem,
  filter: FindingQuickFilter,
) {
  switch (filter) {
    case "accepted":
      return ACCEPTED_STATUSES.has(f.status);
    case "disputed":
      return f.status === "disputed";
    case "open_remediation":
      return f.status === "in_remediation" || f.actionItemsOpen > 0;
    case "critical_high":
      return f.severity === "critical" || f.severity === "high";
    case "all":
    default:
      return true;
  }
}

export function matchesFindingSearch(f: FindingListItem, search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    f.findingCode.toLowerCase().includes(q) ||
    f.title.toLowerCase().includes(q) ||
    f.description.toLowerCase().includes(q) ||
    f.linkedControls.some((c) => c.toLowerCase().includes(q))
  );
}

export function filterAndSortFindings(
  findings: FindingListItem[],
  search: string,
  filter: FindingQuickFilter,
) {
  return sortFindingsDefault(
    findings.filter(
      (f) => matchesFindingFilter(f, filter) && matchesFindingSearch(f, search),
    ),
  );
}
