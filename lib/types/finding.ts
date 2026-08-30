export interface AuditReport {
  id: string;
  fileName: string;
  storagePath: string | null;
  receivedAt: string;
  pageCount: number | null;
  isDraft: boolean;
  createdAt: string;
}

export interface FindingSourceLink {
  id: string;
  note: string | null;
  idrLineId: string | null;
  idrLineRef: string | null;
  idrQuestionText: string | null;
  adrLineId: string | null;
  adrLineRef?: string | null;
  adrQuestionText?: string | null;
}

export interface FindingListItem {
  id: string;
  findingCode: string;
  title: string;
  description: string;
  impact: string | null;
  recommendation: string | null;
  severity: string;
  status: string;
  linkedControls: string[];
  targetCloseDate: string | null;
  isRepeat: boolean;
  actionItemsOpen: number;
  actionItemsTotal: number;
  acceptedAt: string | null;
  acceptanceRationale: string | null;
  disputeReason: string | null;
  createdAt: string;
  sourceLinks: FindingSourceLink[];
}

export type FindingDetail = FindingListItem;

export interface SeverityStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  observation: number;
  total: number;
}
