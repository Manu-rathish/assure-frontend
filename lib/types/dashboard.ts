import type { EngagementListItem } from "./engagement";

export interface Tenant {
  id: string;
  code: string;
  name: string;
}

export interface OrgDashboardKpis {
  activeEngagements: number;
  openIdrLines: number;
  openAdrLines: number;
  dueWithin48h: number;
  overdue: number;
  slaBreaches7d: number;
  phaseSummary: string;
}

export interface LineRiskBucket {
  open: number;
  onTrack: number;
  dueWithin48h: number;
  overdue: number;
}

export interface DashboardLineRisk {
  idr: LineRiskBucket;
  adr: LineRiskBucket;
}

export interface ReviewFlow {
  intake: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface PhaseRiskItem {
  phase: string;
  activeCount: number;
  dueWithin48h: number;
  overdue: number;
}

export interface OrgActivityItem {
  id: string;
  eventType: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  engagementCode: string | null;
  engagementName: string | null;
  actorName: string | null;
  message?: string;
}

export interface OrgDashboard {
  tenant: Tenant;
  kpis: OrgDashboardKpis;
  lineRisk: DashboardLineRisk;
  reviewFlow: ReviewFlow;
  phaseRisk: PhaseRiskItem[];
  activeEngagements: EngagementListItem[];
  recentActivity: OrgActivityItem[];
  attention?: {
    inboxReviewCount?: number;
  };
}
