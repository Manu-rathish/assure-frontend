import type { IdrDocument, IdrLineListItem } from "@/lib/types/idr";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const LINE_QUICK_FILTERS = [
  "all",
  "open",
  "needs_review",
  "overdue",
  "due_48h",
] as const;

export type LineQuickFilter = (typeof LINE_QUICK_FILTERS)[number];

export const LINE_SORTS = ["line_id", "due_date", "status", "team"] as const;
export type LineSort = (typeof LINE_SORTS)[number];

const CLOSED = new Set(["approved"]);

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}

export function resolveActiveDocumentId(
  documents: IdrDocument[],
  docParam: string | undefined,
): string | null {
  if (documents.length === 0) return null;
  if (docParam && documents.some((d) => d.id === docParam)) return docParam;
  return documents[0].id;
}

export function isLineOpen(line: IdrLineListItem) {
  return !CLOSED.has(line.status);
}

export function isNeedsReview(line: IdrLineListItem) {
  return line.status === "submitted";
}

export function isOverdue(line: IdrLineListItem, now = Date.now()) {
  if (!line.dueDate || CLOSED.has(line.status)) return false;
  return new Date(line.dueDate).getTime() < now;
}

export function isDueWithin48h(line: IdrLineListItem, now = Date.now()) {
  if (!line.dueDate || CLOSED.has(line.status)) return false;
  const due = new Date(line.dueDate).getTime();
  return due >= now && due <= now + 48 * 60 * 60 * 1000;
}

export function matchesLineQuickFilter(
  line: IdrLineListItem,
  filter: LineQuickFilter,
  now = Date.now(),
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "open":
      return isLineOpen(line);
    case "needs_review":
      return isNeedsReview(line);
    case "overdue":
      return isOverdue(line, now);
    case "due_48h":
      return isDueWithin48h(line, now);
    default:
      return true;
  }
}

export function matchesLineSearch(line: IdrLineListItem, search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    line.lineId.toLowerCase().includes(q) ||
    line.questionText.toLowerCase().includes(q) ||
    line.category.toLowerCase().includes(q) ||
    line.ownerTeamName.toLowerCase().includes(q) ||
    (line.ownerTeamSlug?.toLowerCase().includes(q) ?? false) ||
    (line.assigneeName?.toLowerCase().includes(q) ?? false)
  );
}

export function sortLines(lines: IdrLineListItem[], sort: LineSort) {
  const next = [...lines];
  next.sort((a, b) => {
    switch (sort) {
      case "due_date": {
        const aDue = a.dueDate
          ? new Date(a.dueDate).getTime()
          : Number.POSITIVE_INFINITY;
        const bDue = b.dueDate
          ? new Date(b.dueDate).getTime()
          : Number.POSITIVE_INFINITY;
        return aDue - bDue;
      }
      case "status":
        return a.status.localeCompare(b.status);
      case "team":
        return a.ownerTeamName.localeCompare(b.ownerTeamName);
      case "line_id":
      default:
        return a.lineId.localeCompare(b.lineId);
    }
  });
  return next;
}

export function filterAndSortLines(
  lines: IdrLineListItem[],
  search: string,
  filter: LineQuickFilter,
  sort: LineSort,
  now = Date.now(),
) {
  return sortLines(
    lines.filter(
      (line) =>
        matchesLineQuickFilter(line, filter, now) &&
        matchesLineSearch(line, search),
    ),
    sort,
  );
}

export function computeLineKpis(lines: IdrLineListItem[], now = Date.now()) {
  return {
    total: lines.length,
    open: lines.filter(isLineOpen).length,
    needsReview: lines.filter(isNeedsReview).length,
    overdue: lines.filter((l) => isOverdue(l, now)).length,
  };
}

export function slaRowAccent(line: IdrLineListItem, now = Date.now()): string {
  if (line.status === "approved") return "";
  if (isOverdue(line, now)) return "border-l-2 border-l-destructive";
  if (isDueWithin48h(line, now)) return "border-l-2 border-l-primary/50";
  return "";
}

export function slaColumnText(line: IdrLineListItem, now = Date.now()): string {
  if (line.status === "approved") return "Done";
  if (isOverdue(line, now)) return "Overdue";
  if (isDueWithin48h(line, now)) return "≤48h";
  return "—";
}

export function statusCounts(lines: IdrLineListItem[]) {
  const counts: Record<string, number> = {};
  for (const line of lines) {
    counts[line.status] = (counts[line.status] ?? 0) + 1;
  }
  return counts;
}

export function lineEmptyMessage(
  search: string,
  filter: LineQuickFilter,
  hasLinesInDocument: boolean,
): string {
  if (!hasLinesInDocument) return "No lines in this document yet.";
  if (search.trim() || filter !== "all") return "No lines match these filters.";
  return "No lines in this document yet.";
}

export function isFilterActive(search: string, filter: LineQuickFilter): boolean {
  return filter !== "all" || search.trim().length > 0;
}
