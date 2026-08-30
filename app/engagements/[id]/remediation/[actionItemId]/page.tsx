import { notFound } from "next/navigation";
import { RemediationItemDetailView } from "@/app/engagements/[id]/remediation/[actionItemId]/_components/remediation-item-detail-view";
import { getActionItemDetailApi } from "@/lib/api/remediation";
import { ApiClientError } from "@/lib/api/types";

export default async function ActionItemDetailPage({
  params,
}: PageProps<"/engagements/[id]/remediation/[actionItemId]">) {
  const { id, actionItemId } = await params;

  let item;

  try {
    item = await getActionItemDetailApi(id, actionItemId);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <RemediationItemDetailView engagementId={id} item={item} />;
}
