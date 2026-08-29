import { Suspense } from "react";
import { AdrWorkspace } from "@/app/engagements/[id]/adr/_components/adr-workspace";
import { getEngagementOverviewApi } from "@/lib/api/engagements";
import {
  listAdrDocumentsApi,
  listAdrLinesApi,
  listAdrThreadsApi,
  listIdrLinesApi,
} from "@/lib/api/adr";
import { listTeamsApi } from "@/lib/api/teams";

export default async function AdrPage({
  params,
}: PageProps<"/engagements/[id]/adr">) {
  const { id } = await params;
  const [overview, documents, threads, teams] = await Promise.all([
    getEngagementOverviewApi(id),
    listAdrDocumentsApi(id),
    listAdrThreadsApi(id),
    listTeamsApi(),
  ]);

  const linesByDocument: Record<string, Awaited<ReturnType<typeof listAdrLinesApi>>> = {};
  await Promise.all(
    documents.map(async (doc) => {
      linesByDocument[doc.id] = await listAdrLinesApi(id, doc.id);
    }),
  );

  const idrLines = await listIdrLinesApi(id);

  return (
    <Suspense>
      <AdrWorkspace
        engagementId={id}
        engagementCode={overview.code}
        documents={documents}
        threads={threads}
        linesByDocument={linesByDocument}
        idrLines={idrLines}
        teams={teams}
        canCreate
      />
    </Suspense>
  );
}
