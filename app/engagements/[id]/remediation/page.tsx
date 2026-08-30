import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RemediationHub } from "@/app/engagements/[id]/remediation/_components/remediation-hub";
import { listActionItemsApi } from "@/lib/api/remediation";
import { listFindingsApi } from "@/lib/api/findings";
import { getEngagementDetailApi } from "@/lib/api/engagements";
import { listTeamsApi } from "@/lib/api/teams";
import { getDummySessionUser, isStaffRole } from "@/lib/data/session";
import { ApiClientError } from "@/lib/api/types";

export default async function RemediationPage({
  params,
}: PageProps<"/engagements/[id]/remediation">) {
  const { id } = await params;

  let overview;
  let itemsPage;
  let findingsPage;
  let teams;

  try {
    [overview, itemsPage, findingsPage, teams] = await Promise.all([
      getEngagementDetailApi(id),
      listActionItemsApi(id, { limit: 500 }),
      listFindingsApi(id, { limit: 500 }),
      listTeamsApi(),
    ]);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const session = getDummySessionUser();
  const canCreate = isStaffRole(session.role);

  return (
    <Suspense>
      <RemediationHub
        engagementId={id}
        engagementCode={overview.code}
        items={itemsPage.items}
        findings={findingsPage.items}
        teams={teams}
        canCreate={canCreate}
      />
    </Suspense>
  );
}
