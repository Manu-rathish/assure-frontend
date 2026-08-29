import type { AdrLineListItem } from "@/lib/types/adr";

export type LineFilter = "all" | "open" | "needs_review" | "overdue" | "due_48h";
export type LineSort = "line_id" | "due_date" | "status" | "parent";

const CLOSED_STATUS = "approved";

function isOpen(line: AdrLineListItem) {
  return line.status !== CLOSED_STATUS;
}

function isOverdue(line: AdrLineListItem, now: Date) {
  if (!line.dueDate || !isOpen(line)) return false;
  return new Date(line.dueDate) < now;
}

function isDue48h(line: AdrLineListItem, now: Date) {
  if (!line.dueDate || !isOpen(line)) return false;
  const due = new Date(line.dueDate);
  const end = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  return due >= now && due <= end;
}

export function matchesLineFilter(
  line: AdrLineListItem,
  filter: LineFilter,
  now = new Date(),
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "open":
      return isOpen(line);
    case "needs_review":
      return line.status === "submitted";
    case "overdue":
      return isOverdue(line, now);
    case "due_48h":
      return isDue48h(line, now);
    default:
      return true;
  }
}

export function matchesLineSearch(line: AdrLineListItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const fields = [
    line.lineId,
    line.questionText,
    line.parentIdrLineId,
    line.parentIdrQuestionText,
    line.category,
    line.ownerTeamName,
    line.assigneeName ?? "",
  ];
  return fields.some((f) => f.toLowerCase().includes(q));
}

export function sortLines(
  lines: AdrLineListItem[],
  sort: LineSort,
): AdrLineListItem[] {
  const copy = [...lines];
  switch (sort) {
    case "due_date":
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    case "status":
      return copy.sort((a, b) => a.status.localeCompare(b.status));
    case "parent":
      return copy.sort((a, b) =>
        a.parentIdrLineId.localeCompare(b.parentIdrLineId),
      );
    case "line_id":
    default:
      return copy.sort((a, b) => a.lineId.localeCompare(b.lineId));
  }
}

export function filterAndSortLines(
  lines: AdrLineListItem[],
  search: string,
  filter: LineFilter,
  sort: LineSort,
): AdrLineListItem[] {
  return sortLines(
    lines.filter(
      (line) => matchesLineSearch(line, search) && matchesLineFilter(line, filter),
    ),
    sort,
  );
}

export function lineEmptyMessage(search: string, filter: LineFilter): string {
  if (search.trim()) return "No lines match these filters.";
  if (filter === "all") return "No ADR lines in this document.";
  return "No lines match these filters.";
}
