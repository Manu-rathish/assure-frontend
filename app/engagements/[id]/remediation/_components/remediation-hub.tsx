"use client";

import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type { FindingListItem } from "@/lib/types/finding";
import type { ActionItemListItem } from "@/lib/types/remediation";
import type { Team } from "@/lib/types/org";
import { RemediationHubHeader } from "./remediation-hub-header";
import { RemediationKpiStrip } from "./remediation-kpi-strip";
import { RemediationFindingRegister } from "./remediation-finding-register";
import { RemediationItemsPanel } from "./remediation-items-panel";

export type RemediationHubProps = {
  engagementId: string;
  engagementCode: string;
  items: ActionItemListItem[];
  findings: FindingListItem[];
  teams: Team[];
  canCreate: boolean;
};

export function RemediationHub({
  engagementId,
  engagementCode,
  items,
  findings,
  teams,
  canCreate,
}: RemediationHubProps) {
  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem className="min-w-0">
            <RemediationHubHeader
              engagementCode={engagementCode}
              findings={findings}
              items={items}
              teams={teams}
              canCreate={canCreate}
            />
          </SectionItem>

          <SectionItem className="min-w-0">
            <RemediationKpiStrip items={items} />
          </SectionItem>

          <SectionItem className="min-w-0">
            <RemediationFindingRegister
              engagementId={engagementId}
              findings={findings}
              items={items}
            />
          </SectionItem>

          <SectionItem className="min-w-0">
            <RemediationItemsPanel engagementId={engagementId} items={items} />
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
