import { paginate, requireEngagement } from "@/lib/data/dummy";
import { ApiClientError } from "@/lib/api/types";
import type { Page } from "@/lib/api/types";
import type { FindingDetail, FindingListItem } from "@/lib/types/finding";

export interface ListFindingsParams {
  severity?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

function mapFinding(raw: Record<string, unknown>): FindingListItem {
  return {
    id: String(raw.id ?? ""),
    findingCode: String(raw.findingCode ?? ""),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    impact: (raw.impact as string | null) ?? null,
    recommendation: (raw.recommendation as string | null) ?? null,
    severity: String(raw.severity ?? ""),
    status: String(raw.status ?? ""),
    linkedControls: (raw.linkedControls as string[] | undefined) ?? [],
    targetCloseDate: (raw.targetCloseDate as string | null) ?? null,
    isRepeat: Boolean(raw.isRepeat),
    actionItemsOpen: Number(raw.actionItemsOpen ?? 0),
    actionItemsTotal: Number(raw.actionItemsTotal ?? 0),
    acceptedAt: (raw.acceptedAt as string | null) ?? null,
    acceptanceRationale: (raw.acceptanceRationale as string | null) ?? null,
    disputeReason: (raw.disputeReason as string | null) ?? null,
    createdAt: String(raw.createdAt ?? ""),
    sourceLinks: (raw.sourceLinks as FindingListItem["sourceLinks"]) ?? [],
  };
}

export async function listFindingsApi(
  engagementId: string,
  params: ListFindingsParams = {},
): Promise<Page<FindingListItem>> {
  const { severity, status, limit = 50, offset = 0 } = params;
  const engagement = requireEngagement(engagementId);
  let items = (engagement.report?.findings ?? []).map((raw) =>
    mapFinding(raw as unknown as Record<string, unknown>),
  );

  if (severity && severity !== "all") {
    items = items.filter((f) => f.severity === severity);
  }
  if (status && status !== "all") {
    items = items.filter((f) => f.status === status);
  }

  return paginate(items, limit, offset);
}

export async function getFindingDetailApi(
  engagementId: string,
  findingCode: string,
): Promise<FindingDetail> {
  const engagement = requireEngagement(engagementId);
  const detail =
    engagement.report?.findingDetails?.[findingCode] ??
    engagement.report?.findings?.find((f) => f.findingCode === findingCode);

  if (!detail) {
    throw new ApiClientError(
      `Finding not found: ${findingCode}`,
      404,
      "FINDING_NOT_FOUND",
    );
  }

  return mapFinding(detail as unknown as Record<string, unknown>);
}
