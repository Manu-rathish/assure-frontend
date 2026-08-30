"use client";

import { pageShellClass } from "@/components/app-shell/page-shell";
import { Card } from "@/components/ui/card";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type { EngagementOverview } from "@/lib/types/engagement";
import { OverviewHeader } from "./overview-header";
import { OverviewPhaseRail } from "./overview-phase-rail";
import { OverviewModuleCards } from "./overview-module-cards";
import { OverviewTeamPanel } from "./overview-team-panel";
import { OverviewSlaBand } from "./overview-sla-band";
import { OverviewActivityFeed } from "./overview-activity-feed";
import { OverviewScopeDrawer } from "./overview-scope-drawer";
import { hasScopeDrawer } from "./overview-helpers";

interface OverviewViewProps {
  overview: EngagementOverview;
}

export function OverviewView({ overview }: OverviewViewProps) {
  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem className="min-w-0">
            <Card className="min-w-0 gap-0 overflow-hidden py-0">
              <OverviewHeader overview={overview} />
            </Card>
          </SectionItem>

          <SectionItem className="min-w-0">
            <OverviewPhaseRail
              phase={overview.phase}
              periodStart={overview.periodStart}
              targetCloseDate={overview.targetCloseDate}
              kpis={overview.kpis}
            />
          </SectionItem>

          <SectionItem className="min-w-0">
            <OverviewModuleCards
              engagementId={overview.id}
              kpis={overview.kpis}
            />
          </SectionItem>

          <SectionItem className="min-w-0">
            <OverviewTeamPanel teams={overview.teamCompletion} />
          </SectionItem>

          <SectionItem className="grid min-w-0 gap-6 lg:grid-cols-2">
            <OverviewSlaBand slaHealth={overview.slaHealth} />
            <OverviewActivityFeed
              engagementId={overview.id}
              activity={overview.recentActivity}
            />
          </SectionItem>

          {hasScopeDrawer(overview) ? (
            <SectionItem className="min-w-0">
              <OverviewScopeDrawer overview={overview} />
            </SectionItem>
          ) : null}
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
