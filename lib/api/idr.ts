import { loadDummy, paginate, requireEngagement } from "@/lib/data/dummy";
import { ApiClientError } from "@/lib/api/types";
import type { Page } from "@/lib/api/types";
import type {
  IdrDocument,
  IdrLineDetail,
  IdrLineListItem,
} from "@/lib/types/idr";

export interface ListIdrLinesParams {
  documentId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

function mapLineListItem(raw: Record<string, unknown>): IdrLineListItem {
  return {
    id: String(raw.id ?? raw.lineId ?? ""),
    lineId: String(raw.lineId ?? ""),
    questionText: String(raw.questionText ?? ""),
    category: String(raw.category ?? ""),
    ownerTeamSlug: String(raw.ownerTeamSlug ?? ""),
    ownerTeamName: String(raw.ownerTeamName ?? ""),
    assigneeName: (raw.assigneeName as string | null) ?? null,
    dueDate: (raw.dueDate as string | null) ?? null,
    status: String(raw.status ?? "assigned"),
  };
}

export async function listIdrDocumentsApi(
  engagementId: string,
): Promise<IdrDocument[]> {
  const engagement = requireEngagement(engagementId);
  const docs = engagement.idr?.documents ?? [];
  return docs as IdrDocument[];
}

export async function listIdrLinesApi(
  engagementId: string,
  params: ListIdrLinesParams = {},
): Promise<Page<IdrLineListItem>> {
  const { documentId, status, limit = 50, offset = 0 } = params;
  const engagement = requireEngagement(engagementId);
  const idr = engagement.idr;

  if (!idr) {
    return paginate([], limit, offset);
  }

  let lines: IdrLineListItem[] = [];

  if (documentId) {
    const docLines = idr.linesByDocument[documentId] ?? [];
    lines = docLines.map((raw) =>
      mapLineListItem(raw as Record<string, unknown>),
    );
  } else {
    for (const docLines of Object.values(idr.linesByDocument)) {
      for (const raw of docLines) {
        lines.push(mapLineListItem(raw as Record<string, unknown>));
      }
    }
  }

  if (status) {
    lines = lines.filter((line) => line.status === status);
  }

  return paginate(lines, limit, offset);
}

export async function getIdrLineDetailApi(
  engagementId: string,
  lineId: string,
): Promise<IdrLineDetail> {
  const engagement = requireEngagement(engagementId);
  const raw = engagement.idr?.lineDetails?.[lineId];

  if (!raw) {
    throw new ApiClientError(
      `IDR line not found: ${lineId}`,
      404,
      "IDR_LINE_NOT_FOUND",
    );
  }

  const detail = raw as Record<string, unknown>;
  const base = mapLineListItem(detail);
  const attachments = (detail.attachments as IdrLineDetail["attachments"]) ?? [];

  return {
    ...base,
    engagementId: String(detail.engagementId ?? engagementId),
    engagementCode: String(detail.engagementCode ?? engagement.code),
    engagementName: String(detail.engagementName ?? engagement.name),
    documentId: String(detail.documentId ?? ""),
    documentLabel: String(detail.documentLabel ?? ""),
    responseText: (detail.responseText as string | null) ?? null,
    rejectionComment: (detail.rejectionComment as string | null) ?? null,
    submittedAt: (detail.submittedAt as string | null) ?? null,
    submittedByName: (detail.submittedByName as string | null) ?? null,
    postSubmitAmendmentUsed: Boolean(detail.postSubmitAmendmentUsed),
    attachments: attachments.map((a) => ({
      ...a,
      fileName: a.fileName ?? a.filename,
    })),
    recentAudit: (detail.recentAudit as IdrLineDetail["recentAudit"]) ?? [],
    permissionsByRole:
      (detail.permissionsByRole as IdrLineDetail["permissionsByRole"]) ?? {},
  };
}

/** Flat list across all documents — used by ADR create dialog. */
export async function listAllIdrLinesApi(
  engagementId: string,
): Promise<IdrLineListItem[]> {
  const page = await listIdrLinesApi(engagementId, { limit: 500 });
  return page.items;
}
