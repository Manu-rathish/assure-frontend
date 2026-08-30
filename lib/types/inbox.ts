export type InboxItemKind = "idr" | "adr" | "action_item";

export interface InboxItem {
  kind: InboxItemKind;
  internalId: string;
  displayId: string;
  title: string;
  engagementId: string;
  engagementCode: string;
  engagementName: string;
  ownerTeamName: string;
  assigneeName: string | null;
  dueDate: string | null;
  status: string;
  href: string;
  lineKind?: "idr" | "adr";
  submittedAt?: string;
  submittedByName?: string | null;
}

export interface InboxReviewItem extends InboxItem {
  kind: "idr" | "adr";
  lineKind: "idr" | "adr";
  submittedAt?: string;
  submittedByName?: string | null;
}

export interface InboxCounts {
  response: number;
  review: number;
  approval: number;
  overdue: number;
  total: number;
}

export interface InboxView {
  responseItems: InboxItem[];
  reviewItems: InboxReviewItem[];
  approvalItems: InboxItem[];
  counts: InboxCounts;
}

export type InboxTab = "response" | "review" | "approval";

export interface InboxEngagementFilter {
  id: string;
  code: string;
  name: string;
}

export interface InboxPageData {
  responseItems: InboxItem[];
  reviewItems: InboxReviewItem[];
  approvalItems: InboxItem[];
  counts: InboxCounts;
  engagementFilters: InboxEngagementFilter[];
  activeTab: InboxTab;
  filteredItems: InboxItem[];
  query?: string;
  engagementId?: string;
}

export interface InboxSearchParams {
  tab: InboxTab;
  engagementId?: string;
  q?: string;
}
