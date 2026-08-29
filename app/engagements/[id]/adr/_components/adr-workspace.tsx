"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import { duration, easeOut } from "@/lib/motion";
import type { AdrDocument, AdrLineListItem, AdrThread, IdrLineListItem } from "@/lib/types/adr";
import type { Team } from "@/lib/types/org";
import { AdrWorkspaceHeader } from "./adr-workspace-header";
import { AdrDocumentRail } from "./adr-document-rail";
import { AdrModeToggle, type AdrMode } from "./adr-mode-toggle";
import { AdrEmptyState } from "./adr-empty-state";
import { AdrLinesPanel } from "./adr-lines-panel";
import { AdrThreadsPanel } from "./adr-threads-panel";
import { AdrInsightDrawer } from "./adr-insight-drawer";

interface AdrWorkspaceProps {
  engagementId: string;
  engagementCode: string;
  documents: AdrDocument[];
  threads: AdrThread[];
  linesByDocument: Record<string, AdrLineListItem[]>;
  idrLines: IdrLineListItem[];
  teams: Team[];
  canCreate?: boolean;
}

export function AdrWorkspace({
  engagementId,
  engagementCode,
  documents,
  threads,
  linesByDocument,
  idrLines,
  teams,
  canCreate = true,
}: AdrWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<AdrMode>("lines");
  const [threadsActivateToken, setThreadsActivateToken] = useState(0);

  const activeDocId = useMemo(() => {
    const docParam = searchParams.get("doc");
    if (docParam && documents.some((d) => d.id === docParam)) {
      return docParam;
    }
    return documents[0]?.id ?? null;
  }, [searchParams, documents]);

  const lines = activeDocId ? (linesByDocument[activeDocId] ?? []) : [];

  const setActiveDoc = useCallback(
    (docId: string) => {
      router.replace(`/engagements/${engagementId}/adr?doc=${docId}`, {
        scroll: false,
      });
    },
    [router, engagementId],
  );

  function handleModeChange(next: AdrMode) {
    setMode(next);
    if (next === "threads") {
      setThreadsActivateToken((t) => t + 1);
    }
  }

  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)]">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex flex-col gap-6">
          <SectionItem>
            <AdrWorkspaceHeader
              engagementCode={engagementCode}
              documents={documents}
              lines={lines}
            />
          </SectionItem>

          {documents.length === 0 ? (
            <SectionItem>
              <AdrEmptyState />
            </SectionItem>
          ) : (
            <>
              <SectionItem className="flex flex-col gap-3">
                <AdrDocumentRail
                  documents={documents}
                  activeDocId={activeDocId!}
                  onSelect={setActiveDoc}
                />
                <AdrModeToggle mode={mode} onChange={handleModeChange} />
              </SectionItem>

              <SectionItem className="min-h-[28rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={
                      reduce ? { opacity: 0 } : { opacity: 0, y: 6 }
                    }
                    animate={
                      reduce ? { opacity: 1 } : { opacity: 1, y: 0 }
                    }
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: duration.enter, ease: easeOut }
                    }
                    className="h-full"
                  >
                    {mode === "lines" ? (
                      <AdrLinesPanel
                        engagementId={engagementId}
                        lines={lines}
                        idrLines={idrLines}
                        teams={teams}
                        canCreate={canCreate}
                      />
                    ) : (
                      <AdrThreadsPanel
                        engagementId={engagementId}
                        threads={threads}
                        lines={lines}
                        activateToken={threadsActivateToken}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </SectionItem>

              <SectionItem>
                <AdrInsightDrawer lines={lines} />
              </SectionItem>
            </>
          )}
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
