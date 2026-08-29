"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pageShellClass } from "@/components/app-shell/page-shell";
import { Card } from "@/components/ui/card";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type {
  ExaminationAsk,
  ExaminationDailyPulse,
  ExaminationThread,
} from "@/lib/types/examination";
import { resolveActiveThreadId, suggestNextAskCode } from "./examination-helpers";
import { ExaminationJournalHeader } from "./examination-journal-header";
import { ExaminationThreadRail } from "./examination-thread-rail";
import { ExaminationEmptyState } from "./examination-empty-state";
import { ExaminationCaptureForm } from "./examination-capture-form";
import { ExaminationAskFeed } from "./examination-ask-feed";
import { ExaminationPulseRail } from "./examination-pulse-rail";
import { ExaminationOtherThreads } from "./examination-other-threads";
import { ExaminationNewThreadDialog } from "./examination-new-thread-dialog";

export type ExaminationJournalProps = {
  engagementId: string;
  engagementCode: string;
  examinationStartDate: string | null;
  examinationEndDate: string | null;
  auditorName: string | null;
  asksTotal: number;
  threads: ExaminationThread[];
  activeThreadId: string | null;
  asks: ExaminationAsk[];
  allAsks: ExaminationAsk[];
  pulse: ExaminationDailyPulse;
  canCapture: boolean;
};

export function ExaminationJournal({
  engagementId,
  engagementCode,
  examinationStartDate,
  examinationEndDate,
  auditorName,
  asksTotal,
  threads,
  activeThreadId: serverActiveThreadId,
  asks,
  allAsks,
  pulse,
  canCapture,
}: ExaminationJournalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newThreadOpen, setNewThreadOpen] = useState(false);

  const activeThreadId =
    serverActiveThreadId ??
    resolveActiveThreadId(threads, searchParams.get("thread") ?? undefined);

  const nextAskCode = useMemo(
    () => suggestNextAskCode(allAsks),
    [allAsks],
  );

  const setActiveThread = useCallback(
    (threadId: string) => {
      router.replace(
        `/engagements/${engagementId}/examination?thread=${threadId}`,
        { scroll: false },
      );
    },
    [router, engagementId],
  );

  const openNewThread = useCallback(() => setNewThreadOpen(true), []);

  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem className="min-w-0">
            <ExaminationJournalHeader
              engagementCode={engagementCode}
              examinationStartDate={examinationStartDate}
              examinationEndDate={examinationEndDate}
              auditorName={auditorName}
              threads={threads}
              activeAsks={asks}
              asksTotal={asksTotal}
              pulse={pulse}
              onAddThread={openNewThread}
            />
          </SectionItem>

          {threads.length === 0 ? (
            <SectionItem>
              <ExaminationEmptyState onAddThread={openNewThread} />
            </SectionItem>
          ) : (
            <>
              {activeThreadId ? (
                <SectionItem className="min-w-0">
                  <ExaminationThreadRail
                    threads={threads}
                    activeThreadId={activeThreadId}
                    onSelect={setActiveThread}
                  />
                </SectionItem>
              ) : null}

              <SectionItem className="min-w-0">
                <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                  <Card className="flex min-h-[28rem] flex-col gap-0 py-0 ring-1 ring-foreground/10">
                    <ExaminationCaptureForm
                      defaultAskCode={nextAskCode}
                      canCapture={canCapture}
                    />
                    {activeThreadId ? (
                      <ExaminationAskFeed
                        asks={asks}
                        engagementId={engagementId}
                        activeThreadId={activeThreadId}
                      />
                    ) : null}
                  </Card>

                  <div className="flex w-full shrink-0 flex-col gap-6 lg:w-80">
                    <ExaminationPulseRail pulse={pulse} />
                    {activeThreadId ? (
                      <ExaminationOtherThreads
                        engagementId={engagementId}
                        threads={threads}
                        activeThreadId={activeThreadId}
                      />
                    ) : null}
                  </div>
                </div>
              </SectionItem>
            </>
          )}
        </SectionStagger>
      </PageReveal>

      <ExaminationNewThreadDialog
        open={newThreadOpen}
        onOpenChange={setNewThreadOpen}
      />
    </main>
  );
}
