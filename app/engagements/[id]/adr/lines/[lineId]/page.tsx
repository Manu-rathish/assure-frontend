import { AdrLineDetailView } from "@/app/engagements/[id]/adr/lines/[lineId]/_components/adr-line-detail-view";
import { getAdrLineDetailApi } from "@/lib/api/adr";

export default async function AdrLineDetailPage({
  params,
}: PageProps<"/engagements/[id]/adr/lines/[lineId]">) {
  const { id, lineId } = await params;
  const line = await getAdrLineDetailApi(id, lineId);

  return <AdrLineDetailView engagementId={id} line={line} />;
}
