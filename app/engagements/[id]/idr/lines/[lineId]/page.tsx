import { notFound } from "next/navigation";
import { IdrLineDetailView } from "@/app/engagements/[id]/idr/lines/[lineId]/_components/idr-line-detail-view";
import { getIdrLineDetailApi } from "@/lib/api/idr";
import { ApiClientError } from "@/lib/api/types";

export default async function IdrLineDetailPage({
  params,
}: PageProps<"/engagements/[id]/idr/lines/[lineId]">) {
  const { id, lineId } = await params;

  try {
    const line = await getIdrLineDetailApi(id, lineId);
    return <IdrLineDetailView engagementId={id} line={line} />;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
