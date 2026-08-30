import { paginate, requireEngagement } from "@/lib/data/dummy";
import { ApiClientError } from "@/lib/api/types";
import type { Page } from "@/lib/api/types";
import type {
  ActionItemDetail,
  ActionItemListItem,
} from "@/lib/types/remediation";

export interface ListActionItemsParams {
  status?: string;
  findingCode?: string;
  limit?: number;
  offset?: number;
}

function mapActionItem(raw: Record<string, unknown>): ActionItemListItem {
  return {
    id: String(raw.id ?? ""),
    actionItemId: String(raw.actionItemId ?? ""),
    title: String(raw.title ?? ""),
    description: (raw.description as string | null) ?? null,
    findingCode: (raw.findingCode as string | null) ?? null,
    engagementId: String(raw.engagementId ?? ""),
    engagementCode: String(raw.engagementCode ?? ""),
    engagementName: String(raw.engagementName ?? ""),
    ownerTeamName: String(raw.ownerTeamName ?? ""),
    assigneeName: (raw.assigneeName as string | null) ?? null,
    dueDate: (raw.dueDate as string | null) ?? null,
    status: String(raw.status ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    permissionsByRole:
      (raw.permissionsByRole as ActionItemListItem["permissionsByRole"]) ?? {},
  };
}

export async function listActionItemsApi(
  engagementId: string,
  params: ListActionItemsParams = {},
): Promise<Page<ActionItemListItem>> {
  const { status, findingCode, limit = 50, offset = 0 } = params;
  const engagement = requireEngagement(engagementId);
  let items = (engagement.remediation?.actionItems ?? []).map((raw) =>
    mapActionItem(raw as unknown as Record<string, unknown>),
  );

  if (status && status !== "all") {
    items = items.filter((i) => i.status === status);
  }
  if (findingCode) {
    items = items.filter((i) => i.findingCode === findingCode);
  }

  items.sort((a, b) => a.actionItemId.localeCompare(b.actionItemId));

  return paginate(items, limit, offset);
}

export async function getActionItemDetailApi(
  engagementId: string,
  actionItemId: string,
): Promise<ActionItemDetail> {
  const engagement = requireEngagement(engagementId);
  const detail =
    engagement.remediation?.actionItemDetails?.[actionItemId] ??
    engagement.remediation?.actionItems?.find(
      (i) => i.actionItemId === actionItemId,
    );

  if (!detail) {
    throw new ApiClientError(
      `Action item not found: ${actionItemId}`,
      404,
      "ACTION_ITEM_NOT_FOUND",
    );
  }

  return mapActionItem(detail as unknown as Record<string, unknown>);
}
