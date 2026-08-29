export interface EngagementListItem {
  id: string;
  code: string;
  name: string;
  status: string;
  leadName: string;
  phase: string;
  openLineCount: number;
  nextDueDate: string | null;
  dueWithin48h: number;
  overdue: number;
}

export interface EngagementKpis {
  idrOpen: number;
  idrClosed: number;
  adrOpen: number;
  adrClosed: number;
  dueWithin48h: number;
  overdue: number;
  asksTotal: number;
  findingsTotal: number;
  findingsBySeverity?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
    observation?: number;
  };
  actionItemsOpen: number;
  actionItemsTotal: number;
}

export interface TeamCompletionBucket {
  total: number;
  approved: number;
  open: number;
}

export interface TeamCompletion {
  teamId: string;
  teamSlug: string;
  teamName: string;
  total: number;
  approved: number;
  open: number;
  completionPct: number;
  idr?: TeamCompletionBucket;
  adr?: TeamCompletionBucket;
  dueWithin48h: number;
  overdue: number;
  [key: string]: unknown;
}

export interface SlaHealth {
  healthyPct: number;
  onTrack: number;
  dueWithin48h: number;
  overdue: number;
  totalOpen: number;
}

export interface EngagementActivity {
  id: string;
  eventType: string;
  createdAt: string;
  actorName: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface EngagementOverview {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  phase: string;
  leadName: string;
  periodStart: string | null;
  periodEnd: string | null;
  targetCloseDate: string | null;
  auditorName: string | null;
  examinationStartDate: string | null;
  examinationEndDate: string | null;
  appsInScope: string[];
  frameworksInScope: string[];
  notes: string | null;
  kpis: EngagementKpis;
  teamCompletion: TeamCompletion[];
  slaHealth: SlaHealth;
  recentActivity: EngagementActivity[];
}
