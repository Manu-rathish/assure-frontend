import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExaminationJournal } from "@/app/engagements/[id]/examination/_components/examination-journal";
import { resolveActiveThreadId } from "@/app/engagements/[id]/examination/_components/examination-helpers";
import {
  getExaminationDailyPulseApi,
  listExaminationAsksApi,
  listExaminationThreadsApi,
} from "@/lib/api/examination";
import { getEngagementDetailApi } from "@/lib/api/engagements";
import { getDummySessionUser, isStaffRole } from "@/lib/data/session";
import { ApiClientError } from "@/lib/api/types";

export default async function ExaminationPage({
  params,
  searchParams,
}: PageProps<"/engagements/[id]/examination">) {
  const { id } = await params;
  const { thread } = await searchParams;
  const threadParam = typeof thread === "string" ? thread : undefined;

  let overview;
  let threads;
  let pulse;

  try {
    [overview, threads, pulse] = await Promise.all([
      getEngagementDetailApi(id),
      listExaminationThreadsApi(id),
      getExaminationDailyPulseApi(id),
    ]);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const activeThreadId = resolveActiveThreadId(threads, threadParam);

  const [asksPage, allAsksPage] = await Promise.all([
    activeThreadId
      ? listExaminationAsksApi(id, { threadId: activeThreadId, limit: 500 })
      : Promise.resolve({ items: [] }),
    listExaminationAsksApi(id, { limit: 500 }),
  ]);

  const session = getDummySessionUser();
  const canCapture = isStaffRole(session.role);

  return (
    <Suspense>
      <ExaminationJournal
        engagementId={id}
        engagementCode={overview.code}
        examinationStartDate={overview.examinationStartDate}
        examinationEndDate={overview.examinationEndDate}
        auditorName={overview.auditorName}
        asksTotal={overview.kpis.asksTotal}
        threads={threads}
        activeThreadId={activeThreadId}
        asks={asksPage.items}
        allAsks={allAsksPage.items}
        pulse={pulse}
        canCapture={canCapture}
      />
    </Suspense>
  );
}
