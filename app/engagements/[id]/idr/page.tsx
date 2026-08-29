import { Suspense } from "react";
import { notFound } from "next/navigation";
import { IdrWorkspace } from "@/app/engagements/[id]/idr/_components/idr-workspace";
import { resolveActiveDocumentId } from "@/app/engagements/[id]/idr/_components/idr-filters";
import { getEngagementDetailApi } from "@/lib/api/engagements";
import { listIdrDocumentsApi, listIdrLinesApi } from "@/lib/api/idr";
import { listTeamsApi } from "@/lib/api/teams";
import { getDummySessionUser, isStaffRole } from "@/lib/data/session";
import { ApiClientError } from "@/lib/api/types";

export default async function IdrPage({
  params,
  searchParams,
}: PageProps<"/engagements/[id]/idr">) {
  const { id } = await params;
  const { doc } = await searchParams;
  const docParam = typeof doc === "string" ? doc : undefined;

  let overview;
  let documents;
  let teams;

  try {
    [overview, documents, teams] = await Promise.all([
      getEngagementDetailApi(id),
      listIdrDocumentsApi(id),
      listTeamsApi(),
    ]);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const activeDocumentId = resolveActiveDocumentId(documents, docParam);
  const linesPage = activeDocumentId
    ? await listIdrLinesApi(id, { documentId: activeDocumentId, limit: 500 })
    : { items: [] };

  const session = getDummySessionUser();
  const canCreate = isStaffRole(session.role);

  return (
    <Suspense>
      <IdrWorkspace
        engagementId={id}
        engagementCode={overview.code}
        documents={documents}
        activeDocumentId={activeDocumentId}
        lines={linesPage.items}
        teams={teams}
        canCreate={canCreate}
      />
    </Suspense>
  );
}
