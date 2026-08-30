import { notFound } from "next/navigation";
import { RemediationFindingPlanView } from "@/app/engagements/[id]/remediation/findings/[findingCode]/_components/remediation-finding-plan-view";
import { getFindingDetailApi } from "@/lib/api/findings";
import { listActionItemsApi } from "@/lib/api/remediation";
import { ApiClientError } from "@/lib/api/types";

export default async function FindingRemediationPlanPage({
  params,
}: PageProps<"/engagements/[id]/remediation/findings/[findingCode]">) {
  const { id, findingCode } = await params;

  let finding;
  let itemsPage;

  try {
    [finding, itemsPage] = await Promise.all([
      getFindingDetailApi(id, findingCode),
      listActionItemsApi(id, { findingCode, limit: 500 }),
    ]);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <RemediationFindingPlanView
      engagementId={id}
      finding={finding}
      items={itemsPage.items}
    />
  );
}
