"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type { IdrDocument, IdrLineListItem } from "@/lib/types/idr";
import type { Team } from "@/lib/types/org";
import { resolveActiveDocumentId } from "./idr-filters";
import { IdrWorkspaceHeader } from "./idr-workspace-header";
import { IdrDocumentRail } from "./idr-document-rail";
import { IdrEmptyState } from "./idr-empty-state";
import { IdrLinesPanel } from "./idr-lines-panel";
import { IdrInsightDrawer } from "./idr-insight-drawer";

export type IdrWorkspaceProps = {
  engagementId: string;
  engagementCode: string;
  documents: IdrDocument[];
  activeDocumentId: string | null;
  lines: IdrLineListItem[];
  canCreate: boolean;
  teams: Team[];
};

export function IdrWorkspace({
  engagementId,
  engagementCode,
  documents,
  activeDocumentId,
  lines,
  canCreate,
  teams,
}: IdrWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const resolvedDocId =
    activeDocumentId ??
    resolveActiveDocumentId(documents, searchParams.get("doc") ?? undefined);

  const setActiveDoc = useCallback(
    (docId: string) => {
      router.replace(`/engagements/${engagementId}/idr?doc=${docId}`, {
        scroll: false,
      });
    },
    [router, engagementId],
  );

  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem className="min-w-0">
            <IdrWorkspaceHeader
              engagementCode={engagementCode}
              documents={documents}
              lines={lines}
            />
          </SectionItem>

          {documents.length === 0 ? (
            <SectionItem>
              <IdrEmptyState />
            </SectionItem>
          ) : (
            <>
              {resolvedDocId ? (
                <SectionItem className="min-w-0">
                  <IdrDocumentRail
                    documents={documents}
                    activeDocId={resolvedDocId}
                    onSelect={setActiveDoc}
                  />
                </SectionItem>
              ) : null}

              <SectionItem className="min-h-[28rem] min-w-0">
                <IdrLinesPanel
                  engagementId={engagementId}
                  lines={lines}
                  allLinesCount={lines.length}
                  teams={teams}
                  canCreate={canCreate}
                />
              </SectionItem>

              <SectionItem className="min-w-0">
                <IdrInsightDrawer lines={lines} />
              </SectionItem>
            </>
          )}
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
