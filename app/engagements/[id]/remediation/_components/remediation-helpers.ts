import type { FindingListItem } from "@/lib/types/finding";
import type { ActionItemListItem } from "@/lib/types/remediation";

const fmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const TERMINAL_STATUSES = new Set(["closed", "verified"]);

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  open: ["in_progress", "closed"],
  in_progress: ["evidence_captured", "verified", "closed"],
  evidence_captured: ["verified", "closed"],
  verified: ["closed"],
  closed: [],
};

export const ACTION_QUICK_FILTERS = [
  "all",
  "open",
  "overdue",
  "due_48h",
  "unlinked",
] as const;

export type ActionQuickFilter = (typeof ACTION_QUICK_FILTERS)[number];

export const ACTION_FILTER_LABELS: Record<ActionQuickFilter, string> = {
  all: "All",
  open: "Open",
  overdue: "Overdue",
  due_48h: "Due 48h",
  unlinked: "Unlinked",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  evidence_captured: "Evidence captured",
  verified: "Verified",
  closed: "Closed",
};

const STATUS_DOT: Record<string, string> = {
  open: "bg-muted-foreground",
  in_progress: "bg-sla-warn",
  evidence_captured: "bg-primary",
  verified: "bg-sla-complete",
  closed: "bg-sla-complete",
};

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return fmt.format(d);
}

export function formatDateTime(iso: string | null) {
  if (!iso) return "Not set";
  return formatDate(iso);
}

export function formatActionItemStatus(status: string) {
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

export function statusDotClass(status: string) {
  return STATUS_DOT[status] ?? "bg-muted-foreground";
}

export function isActionItemOverdue(item: ActionItemListItem, now = Date.now()) {
  if (!item.dueDate || TERMINAL_STATUSES.has(item.status)) return false;
  return new Date(item.dueDate).getTime() < now;
}

export function isDueWithin48h(item: ActionItemListItem, now = Date.now()) {
  if (!item.dueDate || TERMINAL_STATUSES.has(item.status)) return false;
  const due = new Date(item.dueDate).getTime();
  return due >= now && due <= now + 48 * 60 * 60 * 1000;
}

export function slaLabel(item: ActionItemListItem, now = Date.now()) {
  if (TERMINAL_STATUSES.has(item.status)) return "Done";
  if (isActionItemOverdue(item, now)) return "Overdue";
  if (isDueWithin48h(item, now)) return "≤48h";
  return "—";
}

export function slaRowAccent(item: ActionItemListItem, now = Date.now()) {
  if (isActionItemOverdue(item, now)) return "border-l-2 border-l-destructive";
  if (isDueWithin48h(item, now)) return "border-l-2 border-l-primary/50";
  return "";
}

export function countOpenWork(items: ActionItemListItem[]) {
  return items.filter(
    (i) => i.status === "open" || i.status === "in_progress",
  ).length;
}

export function countInVerification(items: ActionItemListItem[]) {
  return items.filter(
    (i) => i.status === "evidence_captured" || i.status === "verified",
  ).length;
}

export function countClosed(items: ActionItemListItem[]) {
  return items.filter((i) => i.status === "closed").length;
}

export function groupItemsByFindingCode(items: ActionItemListItem[]) {
  const map = new Map<string, ActionItemListItem[]>();
  const unlinked: ActionItemListItem[] = [];
  for (const item of items) {
    if (item.findingCode) {
      const group = map.get(item.findingCode) ?? [];
      group.push(item);
      map.set(item.findingCode, group);
    } else {
      unlinked.push(item);
    }
  }
  return { map, unlinked };
}

export function buildFindingRegisterRows(
  findings: FindingListItem[],
  itemsByCode: Map<string, ActionItemListItem[]>,
) {
  return findings.map((finding) => {
    const linked = itemsByCode.get(finding.findingCode) ?? [];
    const closedCount = linked.filter((i) => i.status === "closed").length;
    return { finding, items: linked, closedCount };
  });
}

export function hasFindingLinks(
  rows: ReturnType<typeof buildFindingRegisterRows>,
) {
  return rows.some((r) => r.items.length > 0);
}

export function planProgress(items: ActionItemListItem[]) {
  const closed = items.filter((i) => i.status === "closed").length;
  const total = items.length;
  const pct = total === 0 ? 0 : Math.round((closed / total) * 100);
  return { closed, total, pct };
}

export function progressBarTone(pct: number) {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 50) return "bg-amber-400";
  return "bg-blue-400";
}

export function actionItemHref(engagementId: string, actionItemId: string) {
  return `/engagements/${engagementId}/remediation/${actionItemId}`;
}

export function matchesActionFilter(
  item: ActionItemListItem,
  filter: ActionQuickFilter,
  now = Date.now(),
) {
  switch (filter) {
    case "open":
      return item.status === "open" || item.status === "in_progress";
    case "overdue":
      return isActionItemOverdue(item, now);
    case "due_48h":
      return isDueWithin48h(item, now);
    case "unlinked":
      return !item.findingCode;
    case "all":
    default:
      return true;
  }
}

export function matchesActionSearch(item: ActionItemListItem, search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    item.actionItemId.toLowerCase().includes(q) ||
    item.title.toLowerCase().includes(q) ||
    (item.findingCode?.toLowerCase().includes(q) ?? false) ||
    item.ownerTeamName.toLowerCase().includes(q) ||
    (item.assigneeName?.toLowerCase().includes(q) ?? false)
  );
}

export function filterAndSortActionItems(
  items: ActionItemListItem[],
  search: string,
  filter: ActionQuickFilter,
  now = Date.now(),
) {
  return items
    .filter(
      (i) => matchesActionFilter(i, filter, now) && matchesActionSearch(i, search),
    )
    .sort((a, b) => a.actionItemId.localeCompare(b.actionItemId));
}

export function suggestNextActionItemId(items: ActionItemListItem[]) {
  let max = 0;
  for (const item of items) {
    const match = /^AI-(\d+)$/i.exec(item.actionItemId.trim());
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `AI-${String(max + 1).padStart(3, "0")}`;
}

export function getAllowedTransitions(status: string) {
  return STATUS_TRANSITIONS[status] ?? [];
}
