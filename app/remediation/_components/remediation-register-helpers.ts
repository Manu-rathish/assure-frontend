import type {
  ActionItemListItem,
  RegisterSearchParams,
  RegisterStatusFilter,
  RemediationRegister,
  RemediationRegisterPageData,
} from "@/lib/types/remediation";
import {
  isActionItemOverdue,
  TERMINAL_STATUSES,
} from "@/app/engagements/[id]/remediation/_components/remediation-helpers";

export type SlaVariant = "ok" | "warn" | "breach" | "complete" | "neutral";

export const REGISTER_STATUS_CHIPS: {
  label: string;
  status?: RegisterStatusFilter;
}[] = [
  { label: "All statuses" },
  { label: "Open", status: "open_all" },
  { label: "In progress", status: "in_progress" },
  { label: "Overdue", status: "overdue" },
  { label: "Evidence captured", status: "evidence_captured" },
  { label: "Verified", status: "verified" },
  { label: "Closed", status: "closed" },
];

export function parseRegisterSearchParams(
  params: Record<string, string | string[] | undefined>,
): RegisterSearchParams {
  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const statusParam = pick(params.status);
  const validStatuses: RegisterStatusFilter[] = [
    "open_all",
    "overdue",
    "open",
    "in_progress",
    "evidence_captured",
    "verified",
    "closed",
  ];
  const status = validStatuses.includes(statusParam as RegisterStatusFilter)
    ? (statusParam as RegisterStatusFilter)
    : undefined;

  return {
    q: pick(params.q)?.trim().toLowerCase() || undefined,
    status,
    engagementId: pick(params.engagement)?.trim() || undefined,
  };
}

export function buildRegisterHref(options: RegisterSearchParams): string {
  const search = new URLSearchParams();
  if (options.q) search.set("q", options.q);
  if (options.status) search.set("status", options.status);
  if (options.engagementId) search.set("engagement", options.engagementId);
  const qs = search.toString();
  return qs ? `/remediation?${qs}` : "/remediation";
}

export function summarizeActionItemRegister(
  items: ActionItemListItem[],
  now = Date.now(),
) {
  const openCount = items.filter(
    (i) => i.status === "open" || i.status === "in_progress",
  ).length;
  const overdueCount = items.filter((i) => isActionItemOverdue(i, now)).length;
  const verifiedCount = items.filter(
    (i) => i.status === "evidence_captured" || i.status === "verified",
  ).length;
  return { openCount, overdueCount, verifiedCount, total: items.length };
}

export function filterRegisterItems(
  items: ActionItemListItem[],
  options: RegisterSearchParams,
  now = Date.now(),
): ActionItemListItem[] {
  const query = options.q?.trim().toLowerCase();

  return items.filter((item) => {
    if (options.engagementId && item.engagementId !== options.engagementId) {
      return false;
    }

    if (options.status === "open_all") {
      if (item.status !== "open" && item.status !== "in_progress") return false;
    } else if (options.status === "overdue") {
      if (!isActionItemOverdue(item, now)) return false;
    } else if (options.status && item.status !== options.status) {
      return false;
    }

    if (!query) return true;

    return (
      item.actionItemId.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query) ||
      item.engagementCode.toLowerCase().includes(query) ||
      item.engagementName.toLowerCase().includes(query) ||
      item.ownerTeamName.toLowerCase().includes(query) ||
      (item.findingCode?.toLowerCase().includes(query) ?? false)
    );
  });
}

export function sortRegisterItems(
  items: ActionItemListItem[],
): ActionItemListItem[] {
  return [...items].sort((a, b) => {
    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : null;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : null;
    if (aDue === null && bDue === null) {
      return a.actionItemId.localeCompare(b.actionItemId);
    }
    if (aDue === null) return 1;
    if (bDue === null) return -1;
    if (aDue !== bDue) return aDue - bDue;
    return a.actionItemId.localeCompare(b.actionItemId);
  });
}

export function computeSlaState(
  dueDate: Date | null,
  status: string,
): { variant: SlaVariant; width: number; label: string } {
  if (status === "approved" || status === "closed" || status === "verified") {
    return { variant: "complete", width: 100, label: "Done" };
  }
  if (!dueDate) return { variant: "neutral", width: 0, label: "—" };
  const msUntilDue = dueDate.getTime() - Date.now();
  if (msUntilDue < 0) {
    const hours = Math.max(1, Math.round(Math.abs(msUntilDue) / 3_600_000));
    return {
      variant: "breach",
      width: 96,
      label:
        hours < 24 ? `${hours}h overdue` : `${Math.round(hours / 24)}d overdue`,
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
  if (hoursLeft <= 48) return { variant: "warn", width, label };
  return { variant: "ok", width, label };
}

export function slaStatusForRegisterItem(item: ActionItemListItem): string {
  if (TERMINAL_STATUSES.has(item.status)) return "approved";
  return item.status;
}

export function actionItemHref(
  engagementId: string,
  actionItemId: string,
): string {
  return `/engagements/${engagementId}/remediation/${actionItemId}`;
}

export function buildRegisterPageData(
  raw: RemediationRegister,
  params: RegisterSearchParams,
): RemediationRegisterPageData {
  const filtered = sortRegisterItems(filterRegisterItems(raw.items, params));

  return {
    items: raw.items,
    filteredItems: filtered,
    summary: raw.summary,
    engagementFilters: raw.engagementFilters,
    params,
  };
}

export function hasActiveRegisterFilters(params: RegisterSearchParams): boolean {
  return Boolean(params.q || params.status || params.engagementId);
}
