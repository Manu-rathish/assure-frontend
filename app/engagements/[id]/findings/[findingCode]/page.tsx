import { notFound } from "next/navigation";
import { FindingDetailView } from "@/app/engagements/[id]/findings/[findingCode]/_components/finding-detail-view";
import { getFindingDetailApi } from "@/lib/api/findings";
import { ApiClientError } from "@/lib/api/types";

export default async function FindingDetailPage({
  params,
}: PageProps<"/engagements/[id]/findings/[findingCode]">) {
  const { id, findingCode } = await params;

  let finding;

  try {
    finding = await getFindingDetailApi(id, findingCode);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <FindingDetailView engagementId={id} finding={finding} />;
}
