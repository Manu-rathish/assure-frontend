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

export const HISTORY_PAGE_SIZE = 25;

export type HistoryCategory =
  | "all"
  | "workflow"
  | "files"
  | "engagement"
  | "remediation"
  | "examination"
  | "findings";

export type HistoryEntityFilter =
  | "all"
  | "engagement"
  | "idr_document"
  | "adr_document"
  | "idr_line"
  | "adr_line"
  | "attachment"
  | "action_item"
  | "examination_ask"
  | "audit_report"
  | "finding";

export type HistoryDetailKind = "reason" | "status" | "title" | "default";

export interface EngagementHistoryItem {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  actorUserId?: string;
  actorName: string | null;
  category: HistoryCategory | null;
  message: string;
  detail?: string;
  detailKind?: HistoryDetailKind;
  href?: string;
  lineKind?: "idr" | "adr";
  lineDisplayId?: string;
}

export interface HistoryActorOption {
  id: string;
  name: string;
  eventCount: number;
}

export interface HistoryFilters {
  category: HistoryCategory;
  entity: HistoryEntityFilter;
  actorId?: string;
  from?: Date;
  to?: Date;
  q?: string;
  sort: "asc" | "desc";
  page: number;
}

export interface EngagementHistoryPageData {
  engagement: {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    periodStart: string;
  };
  totalEvents: number;
  filterOptions: { actors: HistoryActorOption[] };
  history: {
    items: EngagementHistoryItem[];
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  filters: HistoryFilters;
}

export interface EngagementHistory {
  engagement: {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    periodStart: string;
  };
  slaHealth: SlaHealth;
  totalEvents: number;
  filterOptions: { actors: HistoryActorOption[] };
  history: {
    items: Array<Record<string, unknown>>;
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  filters: {
    category: string;
    entity: string;
    sort: string;
    page: number;
  };
  allEvents?: EngagementHistoryItem[];
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
