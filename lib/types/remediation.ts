export interface ActionItemPermissions {
  canUpdate: boolean;
  canApproveStatus: boolean;
  canRejectStatus: boolean;
  canCreate: boolean;
}

export interface ActionItemListItem {
  id: string;
  actionItemId: string;
  title: string;
  description: string | null;
  findingCode: string | null;
  engagementId: string;
  engagementCode: string;
  engagementName: string;
  ownerTeamName: string;
  assigneeName: string | null;
  dueDate: string | null;
  status: string;
  updatedAt: string;
  createdAt: string;
  permissionsByRole: Record<string, ActionItemPermissions>;
}

export type ActionItemDetail = ActionItemListItem;

export interface RemediationRegisterSummary {
  openCount: number;
  overdueCount: number;
  verifiedCount: number;
  total: number;
}

export interface RemediationRegisterEngagementFilter {
  id: string;
  code: string;
  name: string;
}

export interface RemediationRegister {
  items: ActionItemListItem[];
  summary: RemediationRegisterSummary;
  engagementFilters: RemediationRegisterEngagementFilter[];
}

export type RegisterStatusFilter =
  | "open_all"
  | "overdue"
  | "open"
  | "in_progress"
  | "evidence_captured"
  | "verified"
  | "closed";

export interface RegisterSearchParams {
  q?: string;
  status?: RegisterStatusFilter;
  engagementId?: string;
}

export interface RemediationRegisterPageData {
  items: ActionItemListItem[];
  filteredItems: ActionItemListItem[];
  summary: RemediationRegisterSummary;
  engagementFilters: RemediationRegisterEngagementFilter[];
  params: RegisterSearchParams;
}
