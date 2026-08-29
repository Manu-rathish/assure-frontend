import { cache } from "react";
import dummyData from "@dummy-data";
import type { DummyData, DummyEngagement } from "@/lib/types/dummy-data";
import { ApiClientError } from "@/lib/api/types";

export const loadDummy = cache((): DummyData => dummyData as DummyData);

export function requireEngagement(engagementId: string): DummyEngagement {
  const data = loadDummy();
  const engagement = data.engagements.find((e) => e.id === engagementId);
  if (!engagement) {
    throw new ApiClientError(
      `Engagement not found: ${engagementId}`,
      404,
      "ENGAGEMENT_NOT_FOUND",
    );
  }
  return engagement;
}

export function paginate<T>(
  items: T[],
  limit: number,
  offset: number,
): { items: T[]; total: number; limit: number; offset: number } {
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  };
}
