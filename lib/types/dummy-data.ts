import type { EngagementListItem } from "./engagement";
import type { Team } from "./org";

export interface DummyEngagement {
  id: string;
  code: string;
  name: string;
  status: string;
  phase: string;
  leadName: string;
  overview?: {
    id: string;
    code: string;
    name: string;
    status: string;
    phase: string;
    leadName: string;
  };
  idr?: {
    documents: unknown[];
    linesByDocument: Record<string, { lineId: string; questionText: string }[]>;
    lineDetails?: Record<string, unknown>;
  };
  adr?: {
    documents: import("./adr").AdrDocument[];
    linesByDocument: Record<string, import("./adr").AdrLineListItem[]>;
    threads: import("./adr").AdrThread[];
    lineDetails: Record<string, import("./adr").AdrLineDetail>;
  };
  examination?: {
    threads: import("./examination").ExaminationThread[];
    asksByThread: Record<string, import("./examination").ExaminationAsk[]>;
    dailyPulse: import("./examination").ExaminationDailyPulse;
  };
  report?: {
    auditReports: import("./finding").AuditReport[];
    findings: import("./finding").FindingListItem[];
    severityStats: import("./finding").SeverityStats;
    findingDetails: Record<string, import("./finding").FindingDetail>;
  };
  remediation?: {
    actionItems: import("./remediation").ActionItemListItem[];
    actionItemDetails: Record<string, import("./remediation").ActionItemDetail>;
  };
  history?: import("./engagement").EngagementHistory;
}

export interface DummyData {
  teams: Team[];
  users: import("./org").User[];
  views: {
    engagementsList: EngagementListItem[];
    inbox: import("./inbox").InboxView;
  };
  engagements: DummyEngagement[];
}
