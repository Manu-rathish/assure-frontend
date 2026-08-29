import type { AdrLineListItem, AdrThread } from "@/lib/types/adr";

export type ThreadFilter =
  | "all"
  | "has_open"
  | "has_overdue"
  | "multi_followup";
export type ThreadSort = "most_open" | "most_overdue" | "parent_line_id";

const CLOSED_STATUS = "approved";

export interface ThreadMetrics {
  total: number;
  open: number;
  overdue: number;
}

export function threadMetrics(
  thread: AdrThread,
  now = new Date(),
): ThreadMetrics {
  const total = thread.lines.length;
  const open = thread.lines.filter((l) => l.status !== CLOSED_STATUS).length;
  const overdue = thread.lines.filter((l) => {
    if (!l.dueDate || l.status === CLOSED_STATUS) return false;
    return new Date(l.dueDate) < now;
  }).length;
  return { total, open, overdue };
}

export function threadsForDocument(
  threads: AdrThread[],
  lineIds: Set<string>,
): AdrThread[] {
  return threads
    .map((thread) => ({
      ...thread,
      lines: thread.lines.filter((l) => lineIds.has(l.lineId)),
    }))
    .filter((thread) => thread.lines.length > 0);
}

export function matchesThreadFilter(
  thread: AdrThread,
  filter: ThreadFilter,
  now = new Date(),
): boolean {
  const { total, open, overdue } = threadMetrics(thread, now);
  switch (filter) {
    case "all":
      return true;
    case "has_open":
      return open > 0;
    case "has_overdue":
      return overdue > 0;
    case "multi_followup":
      return total >= 2;
    default:
      return true;
  }
}

export function matchesThreadSearch(thread: AdrThread, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  if (
    thread.parentLineId.toLowerCase().includes(q) ||
    thread.parentQuestionText.toLowerCase().includes(q) ||
    thread.parentCategory.toLowerCase().includes(q)
  ) {
    return true;
  }
  return thread.lines.some(
    (l) =>
      l.lineId.toLowerCase().includes(q) ||
      l.questionText.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q),
  );
}

export function sortThreads(
  threads: AdrThread[],
  sort: ThreadSort,
  now = new Date(),
): AdrThread[] {
  const copy = [...threads];
  switch (sort) {
    case "most_overdue":
      return copy.sort((a, b) => {
        const diff = threadMetrics(b, now).overdue - threadMetrics(a, now).overdue;
        return diff !== 0
          ? diff
          : a.parentLineId.localeCompare(b.parentLineId);
      });
    case "parent_line_id":
      return copy.sort((a, b) => a.parentLineId.localeCompare(b.parentLineId));
    case "most_open":
    default:
      return copy.sort((a, b) => {
        const diff = threadMetrics(b, now).open - threadMetrics(a, now).open;
        return diff !== 0
          ? diff
          : a.parentLineId.localeCompare(b.parentLineId);
      });
  }
}

export function filterAndSortThreads(
  threads: AdrThread[],
  search: string,
  filter: ThreadFilter,
  sort: ThreadSort,
): AdrThread[] {
  return sortThreads(
    threads.filter(
      (t) => matchesThreadSearch(t, search) && matchesThreadFilter(t, filter),
    ),
    sort,
  );
}

export function defaultExpandedThreadIds(
  threads: AdrThread[],
  now = new Date(),
): Set<string> {
  const ids = new Set<string>();
  for (const thread of threads) {
    const { open, overdue } = threadMetrics(thread, now);
    if (open > 0 || overdue > 0) {
      ids.add(thread.parentLineId);
    }
  }
  return ids;
}
