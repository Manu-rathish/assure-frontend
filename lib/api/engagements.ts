import { loadDummy, paginate, requireEngagement } from "@/lib/data/dummy";
import { ApiClientError } from "@/lib/api/types";
import type { Page } from "@/lib/api/types";
import type {
  EngagementActivity,
  EngagementHistory,
  EngagementKpis,
  EngagementListItem,
  EngagementOverview,
  SlaHealth,
  TeamCompletion,
} from "@/lib/types/engagement";

export interface ListEngagementsParams {
  limit?: number;
  offset?: number;
  status?: string;
}

export async function listEngagementsApi(
  params: ListEngagementsParams = {},
): Promise<Page<EngagementListItem>> {
  const { limit = 50, offset = 0, status } = params;
  const data = loadDummy();
  let items = [...data.views.engagementsList];

  if (status && status !== "all") {
    items = items.filter((e) => e.status === status);
  }

  return paginate(items, limit, offset);
}

function defaultKpis(): EngagementKpis {
  return {
    idrOpen: 0,
    idrClosed: 0,
    adrOpen: 0,
    adrClosed: 0,
    dueWithin48h: 0,
    overdue: 0,
    asksTotal: 0,
    findingsTotal: 0,
    actionItemsOpen: 0,
    actionItemsTotal: 0,
  };
}

function defaultSlaHealth(): SlaHealth {
  return {
    healthyPct: 0,
    onTrack: 0,
    dueWithin48h: 0,
    overdue: 0,
    totalOpen: 0,
  };
}

function mapOverview(raw: Record<string, unknown>): EngagementOverview {
  const kpis = (raw.kpis as EngagementKpis | undefined) ?? defaultKpis();
  const slaHealth =
    (raw.slaHealth as SlaHealth | undefined) ?? defaultSlaHealth();

  return {
    id: String(raw.id ?? ""),
    code: String(raw.code ?? ""),
    name: String(raw.name ?? ""),
    type: String(raw.type ?? ""),
    status: String(raw.status ?? "active"),
    phase: String(raw.phase ?? ""),
    leadName: String(raw.leadName ?? ""),
    periodStart: (raw.periodStart as string | null) ?? null,
    periodEnd: (raw.periodEnd as string | null) ?? null,
    targetCloseDate: (raw.targetCloseDate as string | null) ?? null,
    auditorName: (raw.auditorName as string | null) ?? null,
    examinationStartDate: (raw.examinationStartDate as string | null) ?? null,
    examinationEndDate: (raw.examinationEndDate as string | null) ?? null,
    appsInScope: (raw.appsInScope as string[] | undefined) ?? [],
    frameworksInScope: (raw.frameworksInScope as string[] | undefined) ?? [],
    notes: (raw.notes as string | null) ?? null,
    kpis,
    teamCompletion: (raw.teamCompletion as TeamCompletion[] | undefined) ?? [],
    slaHealth,
    recentActivity: (raw.recentActivity as EngagementActivity[] | undefined) ?? [],
  };
}

export async function getEngagementDetailApi(
  id: string,
): Promise<EngagementOverview> {
  const engagement = requireEngagement(id);
  const raw = engagement.overview;

  if (!raw) {
    throw new ApiClientError(
      `Engagement overview not found: ${id}`,
      404,
      "ENGAGEMENT_OVERVIEW_NOT_FOUND",
    );
  }

  return mapOverview(raw as Record<string, unknown>);
}

export async function getEngagementOverviewApi(
  id: string,
): Promise<Pick<
  EngagementOverview,
  "id" | "code" | "name" | "status" | "phase" | "leadName"
>> {
  const detail = await getEngagementDetailApi(id);
  return {
    id: detail.id,
    code: detail.code,
    name: detail.name,
    status: detail.status,
    phase: detail.phase,
    leadName: detail.leadName,
  };
}

export async function getEngagementHistoryApi(
  engagementId: string,
): Promise<EngagementHistory> {
  const engagement = requireEngagement(engagementId);
  const raw = engagement.history;

  if (!raw) {
    throw new ApiClientError(
      `Engagement history not found: ${engagementId}`,
      404,
      "ENGAGEMENT_HISTORY_NOT_FOUND",
    );
  }

  return raw as EngagementHistory;
}
