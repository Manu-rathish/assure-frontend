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
