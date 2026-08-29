export interface AdrDocument {
  id: string;
  label: string;
  receivedDate: string;
  createdAt: string;
  totalLines: number;
  openLines: number;
  closedLines: number;
  lastImportAt?: string | null;
  lastImportRowCount?: number;
}

export interface AdrLineListItem {
  id: string;
  lineId: string;
  questionText: string;
  category: string;
  ownerTeamSlug: string;
  ownerTeamName: string;
  assigneeName: string | null;
  dueDate: string | null;
  status: string;
  parentIdrLineId: string;
  parentIdrQuestionText: string;
  parentIdrStatus: string;
  parentIdrCategory: string;
}

export interface AdrThread {
  parentLineId: string;
  parentQuestionText: string;
  parentCategory: string;
  parentStatus: string;
  lines: AdrLineListItem[];
}

export interface AdrLineDetail extends AdrLineListItem {
  engagementId: string;
  engagementCode: string;
  engagementName: string;
  documentId?: string;
  documentLabel?: string;
  responseText: string | null;
  rejectionComment: string | null;
  submittedAt: string | null;
  submittedByName: string | null;
  attachments: { id?: string; fileName?: string; filename?: string }[];
  recentAudit: { id: string; eventType: string; createdAt: string }[];
}

export interface IdrLineListItem {
  id: string;
  lineId: string;
  questionText: string;
  category: string;
  status: string;
  ownerTeamSlug?: string;
  ownerTeamName?: string;
  assigneeName?: string | null;
  dueDate?: string | null;
}
