export interface IdrDocument {
  id: string;
  label: string;
  receivedDate: string;
  createdAt: string;
  totalLines: number;
  openLines: number;
  closedLines: number;
  lastImportAt: string | null;
  lastImportRowCount: number;
}

export interface IdrLineListItem {
  id: string;
  lineId: string;
  questionText: string;
  category: string;
  ownerTeamSlug: string;
  ownerTeamName: string;
  assigneeName: string | null;
  dueDate: string | null;
  status: string;
}

export interface Attachment {
  id?: string;
  fileName?: string;
  filename?: string;
}

export interface AuditEvent {
  id: string;
  eventType: string;
  createdAt: string;
  message?: string;
  actorName?: string;
  metadata?: Record<string, unknown>;
}

export interface LinePermissions {
  canUpdate: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canUploadAttachment: boolean;
  canAmendSubmission: boolean;
}

export interface IdrLineDetail extends IdrLineListItem {
  engagementId: string;
  engagementCode: string;
  engagementName: string;
  documentId: string;
  documentLabel: string;
  responseText: string | null;
  rejectionComment: string | null;
  submittedAt: string | null;
  submittedByName: string | null;
  postSubmitAmendmentUsed: boolean;
  attachments: Attachment[];
  recentAudit: AuditEvent[];
  permissionsByRole: Record<string, LinePermissions>;
}
