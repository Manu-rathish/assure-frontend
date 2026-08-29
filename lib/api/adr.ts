import { requireEngagement } from "@/lib/data/dummy";
import { listAllIdrLinesApi } from "@/lib/api/idr";
import { ApiClientError } from "@/lib/api/types";
import type {
  AdrDocument,
  AdrLineDetail,
  AdrLineListItem,
  AdrThread,
} from "@/lib/types/adr";
import type { IdrLineListItem } from "@/lib/types/idr";

export async function listAdrDocumentsApi(
  engagementId: string,
): Promise<AdrDocument[]> {
  const engagement = requireEngagement(engagementId);
  return engagement.adr?.documents ?? [];
}

export async function listAdrLinesApi(
  engagementId: string,
  documentId: string,
): Promise<AdrLineListItem[]> {
  const engagement = requireEngagement(engagementId);
  return engagement.adr?.linesByDocument[documentId] ?? [];
}

export async function listAdrThreadsApi(
  engagementId: string,
): Promise<AdrThread[]> {
  const engagement = requireEngagement(engagementId);
  return engagement.adr?.threads ?? [];
}

export async function getAdrLineDetailApi(
  engagementId: string,
  lineId: string,
): Promise<AdrLineDetail> {
  const engagement = requireEngagement(engagementId);
  const detail = engagement.adr?.lineDetails[lineId];
  if (!detail) {
    throw new ApiClientError(
      `ADR line not found: ${lineId}`,
      404,
      "ADR_LINE_NOT_FOUND",
    );
  }

  return {
    ...detail,
    attachments: (detail.attachments ?? []).map((a) => ({
      ...a,
      fileName: a.fileName ?? a.filename,
    })),
  };
}

export async function listIdrLinesApi(
  engagementId: string,
): Promise<IdrLineListItem[]> {
  return listAllIdrLinesApi(engagementId);
}
