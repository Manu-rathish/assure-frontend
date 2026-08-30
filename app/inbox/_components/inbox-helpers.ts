import type {
  InboxCounts,
  InboxEngagementFilter,
  InboxItem,
  InboxPageData,
  InboxReviewItem,
  InboxSearchParams,
  InboxTab,
  InboxView,
} from "@/lib/types/inbox";

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const TERMINAL_STATUSES = new Set(["approved", "closed", "verified"]);

export type SlaVariant = "ok" | "warn" | "breach" | "complete" | "neutral";

export function buildInboxViewModel(raw: InboxView): InboxView {
  const actionItemsFromApproval = raw.approvalItems.filter(
    (item) => item.kind === "action_item",
  );
  const responseItems = sortResponseItems([
    ...raw.responseItems,
    ...actionItemsFromApproval.filter(
      (ai) => !raw.responseItems.some((r) => r.internalId === ai.internalId),
    ),
  ]);

  const reviewItems = sortReviewItems(raw.reviewItems);
  const approvalItems: InboxItem[] = [];
  const counts = computeInboxCounts(responseItems, reviewItems, approvalItems);

  return { responseItems, reviewItems, approvalItems, counts };
}

export function slaUrgencyRank(dueDate: Date | null): number {
  if (!dueDate) return 3;
  const msUntilDue = dueDate.getTime() - Date.now();
  if (msUntilDue < 0) return 0;
  if (msUntilDue <= FORTY_EIGHT_HOURS_MS) return 1;
  return 2;
}

export function compareInboxItems(
  a: Pick<InboxItem, "dueDate">,
  b: Pick<InboxItem, "dueDate">,
): number {
  const aDue = a.dueDate ? new Date(a.dueDate) : null;
  const bDue = b.dueDate ? new Date(b.dueDate) : null;
  const rankDiff = slaUrgencyRank(aDue) - slaUrgencyRank(bDue);
  if (rankDiff !== 0) return rankDiff;
  if (!aDue && !bDue) return 0;
  if (!aDue) return 1;
  if (!bDue) return -1;
  return aDue.getTime() - bDue.getTime();
}

export function sortResponseItems(items: InboxItem[]): InboxItem[] {
  return [...items].sort(compareInboxItems);
}

export function sortReviewItems(items: InboxReviewItem[]): InboxReviewItem[] {
  return [...items].sort((a, b) => {
    const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return tb - ta;
  });
}

export function isInboxItemOverdue(
  item: Pick<InboxItem, "dueDate" | "status">,
  now = Date.now(),
): boolean {
  if (!item.dueDate) return false;
  if (TERMINAL_STATUSES.has(item.status)) return false;
  return new Date(item.dueDate).getTime() < now;
}

export function computeInboxCounts(
  responseItems: InboxItem[],
  reviewItems: InboxReviewItem[],
  approvalItems: InboxItem[],
): InboxCounts {
  const overdue = [...responseItems, ...reviewItems].filter((item) =>
    isInboxItemOverdue(item),
  ).length;

  return {
    response: responseItems.length,
    review: reviewItems.length,
    approval: approvalItems.length,
    overdue,
    total: responseItems.length + reviewItems.length + approvalItems.length,
  };
}

export function computeSlaState(
  dueDate: Date | null,
  status: string,
): { variant: SlaVariant; width: number; label: string } {
  if (status === "approved") {
    return { variant: "complete", width: 100, label: "Done" };
  }
  if (!dueDate) {
    return { variant: "neutral", width: 0, label: "—" };
  }

  const msUntilDue = dueDate.getTime() - Date.now();

  if (msUntilDue < 0) {
    const hoursOverdue = Math.max(
      1,
      Math.round(Math.abs(msUntilDue) / 3_600_000),
    );
    return {
      variant: "breach",
      width: 96,
      label:
        hoursOverdue < 24
          ? `${hoursOverdue}h overdue`
          : `${Math.round(hoursOverdue / 24)}d overdue`,
    };
  }

  const hoursLeft = Math.max(1, Math.round(msUntilDue / 3_600_000));
  const width = Math.min(96, Math.max(8, 100 - (hoursLeft / 120) * 100));
  const label =
    hoursLeft < 48
      ? hoursLeft < 24
        ? `${hoursLeft}h`
        : `${Math.round(hoursLeft / 24)}d`
      : `${Math.round(hoursLeft / 24)}d`;

  if (hoursLeft <= 48) {
    return { variant: "warn", width, label };
  }
  return { variant: "ok", width, label };
}

export function slaStatusForItem(item: InboxItem): string {
  if (item.kind === "action_item") {
    return item.status === "closed" || item.status === "verified"
      ? "approved"
      : "in_progress";
  }
  return item.status;
}

export function deriveInboxEngagementFilters(
  items: InboxItem[],
): InboxEngagementFilter[] {
  const map = new Map<string, InboxEngagementFilter>();
  for (const item of items) {
    if (!map.has(item.engagementId)) {
      map.set(item.engagementId, {
        id: item.engagementId,
        code: item.engagementCode,
        name: item.engagementName,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export function matchesInboxSearch(item: InboxItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.displayId.toLowerCase().includes(q) ||
    item.title.toLowerCase().includes(q) ||
    item.engagementCode.toLowerCase().includes(q) ||
    item.engagementName.toLowerCase().includes(q) ||
    item.ownerTeamName.toLowerCase().includes(q)
  );
}

export function parseInboxSearchParams(
  params: Record<string, string | string[] | undefined>,
): InboxSearchParams {
  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const tabParam = pick(params.tab);
  const tab: InboxTab =
    tabParam === "review" || tabParam === "approval" ? tabParam : "response";

  const engagementId = pick(params.engagement)?.trim() || undefined;
  const q = pick(params.q)?.trim().toLowerCase() || undefined;

  return { tab, engagementId, q };
}

export function buildInboxHref(options: {
  tab?: InboxTab;
  engagementId?: string;
  q?: string;
}): string {
  const params = new URLSearchParams();
  if (options.tab && options.tab !== "response") {
    params.set("tab", options.tab);
  }
  if (options.engagementId) {
    params.set("engagement", options.engagementId);
  }
  if (options.q) {
    params.set("q", options.q);
  }
  const qs = params.toString();
  return qs ? `/inbox?${qs}` : "/inbox";
}

export function buildInboxPageData(
  raw: InboxView,
  params: InboxSearchParams,
): InboxPageData {
  const normalized = buildInboxViewModel(raw);
  const allForFilters = [...normalized.responseItems, ...normalized.reviewItems];
  const engagementFilters = deriveInboxEngagementFilters(allForFilters);

  const tabItems =
    params.tab === "review"
      ? normalized.reviewItems
      : params.tab === "approval"
        ? normalized.approvalItems
        : normalized.responseItems;

  let filteredItems = tabItems;

  if (params.engagementId) {
    filteredItems = filteredItems.filter(
      (item) => item.engagementId === params.engagementId,
    );
  }

  if (params.q) {
    filteredItems = filteredItems.filter((item) =>
      matchesInboxSearch(item, params.q!),
    );
  }

  return {
    ...normalized,
    engagementFilters,
    activeTab: params.tab,
    filteredItems,
    query: params.q,
    engagementId: params.engagementId,
  };
}
