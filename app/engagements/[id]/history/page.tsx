import { notFound } from "next/navigation";
import { HistoryView } from "@/app/engagements/[id]/history/_components/history-view";
import {
  buildEngagementHistoryPageData,
  parseHistoryFilters,
} from "@/app/engagements/[id]/history/_components/history-helpers";
import { getEngagementHistoryApi } from "@/lib/api/engagements";
import { ApiClientError } from "@/lib/api/types";

export default async function EngagementHistoryPage({
  params,
  searchParams,
}: PageProps<"/engagements/[id]/history">) {
  const { id } = await params;
  const rawParams = await searchParams;

  let raw;

  try {
    raw = await getEngagementHistoryApi(id);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const filters = parseHistoryFilters(rawParams);
  const data = buildEngagementHistoryPageData(id, raw, filters);

  return <HistoryView engagementId={id} data={data} />;
}
