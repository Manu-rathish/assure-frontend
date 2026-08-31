import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import { pageShellClass } from "@/components/app-shell/page-shell";
import type { OrgDashboard } from "@/lib/types/dashboard";
import { DashboardHeader } from "./dashboard-header";
import { DashboardAttentionStrip } from "./dashboard-attention-strip";
import { DashboardKpiStrip } from "./dashboard-kpi-strip";
import { DashboardSlaHealthRing } from "./dashboard-sla-health-ring";
import { DashboardLineWorkloadChart } from "./dashboard-line-workload-chart";
import { DashboardReviewFlowChart } from "./dashboard-review-flow-chart";
import { DashboardPhaseMixChart } from "./dashboard-phase-mix-chart";
import { DashboardEngagementsTable } from "./dashboard-engagements-table";
import { DashboardActivityTimeline } from "./dashboard-activity-timeline";

interface DashboardViewProps {
  dashboard: OrgDashboard;
}

export function DashboardView({ dashboard }: DashboardViewProps) {
  return (
    <main className="min-h-[calc(100dvh-3.5rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex flex-col gap-5 sm:gap-6">
          <SectionItem className="dashboard-section-1 flex flex-col gap-3 sm:gap-4">
            <DashboardHeader dashboard={dashboard} />
            <DashboardAttentionStrip dashboard={dashboard} />
            <DashboardKpiStrip kpis={dashboard.kpis} />
          </SectionItem>

          <SectionItem className="dashboard-section-2 flex flex-col gap-4">
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-4 xl:col-span-3">
                <DashboardSlaHealthRing kpis={dashboard.kpis} />
              </div>
              <div className="min-w-0 lg:col-span-8 xl:col-span-9">
                <DashboardLineWorkloadChart
                  idr={dashboard.lineRisk.idr}
                  adr={dashboard.lineRisk.adr}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DashboardReviewFlowChart reviewFlow={dashboard.reviewFlow} />
              <DashboardPhaseMixChart phaseRisk={dashboard.phaseRisk} />
            </div>
          </SectionItem>

          <SectionItem className="dashboard-section-3 grid gap-4 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-7">
              <DashboardEngagementsTable
                engagements={dashboard.activeEngagements}
              />
            </div>
            <div className="min-w-0 lg:col-span-5">
              <DashboardActivityTimeline items={dashboard.recentActivity} />
            </div>
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
