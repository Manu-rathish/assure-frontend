import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileUp,
  FolderPlus,
  Paperclip,
  PlusCircle,
  Send,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { HistoryCategory } from "@/lib/types/engagement";
import { categorizeEventType } from "./history-helpers";

export function getAuditEventIcon(eventType: string): {
  Icon: LucideIcon;
  className: string;
} {
  const lower = eventType.toLowerCase();
  if (lower.includes("reject") || lower.includes("breach")) {
    return { Icon: XCircle, className: "text-destructive" };
  }
  if (lower.includes("approved")) {
    return { Icon: CheckCircle2, className: "text-sla-complete" };
  }
  if (lower.includes("submitted")) {
    return { Icon: Send, className: "text-sla-warn" };
  }
  if (eventType === "line.created") {
    return { Icon: PlusCircle, className: "text-primary" };
  }
  if (eventType === "document.imported") {
    return { Icon: FileUp, className: "text-primary" };
  }
  if (eventType === "attachment.uploaded") {
    return { Icon: Paperclip, className: "text-muted-foreground" };
  }
  if (eventType === "engagement.created") {
    return { Icon: FolderPlus, className: "text-primary" };
  }
  if (eventType === "action_item.created") {
    return { Icon: PlusCircle, className: "text-sla-warn" };
  }
  if (eventType === "action_item.status_changed") {
    return { Icon: Activity, className: "text-sla-warn" };
  }
  if (lower.includes("warn") || lower.includes("due")) {
    return { Icon: AlertTriangle, className: "text-sla-warn" };
  }
  return { Icon: Activity, className: "text-muted-foreground" };
}

export function getHistoryEventCategory(
  eventType: string,
  category: HistoryCategory | null,
): HistoryCategory | null {
  if (category && category !== "all") return category;
  return categorizeEventType(eventType);
}

export function getHistoryCategoryRailClass(
  category: HistoryCategory | null,
): string {
  switch (category) {
    case "workflow":
      return "bg-primary";
    case "files":
      return "bg-muted-foreground";
    case "engagement":
      return "bg-foreground/70";
    case "remediation":
      return "bg-sla-warn";
    case "examination":
      return "bg-violet-500";
    case "findings":
      return "bg-destructive/80";
    default:
      return "bg-border";
  }
}

export function getHistoryCategoryPillClass(
  category: HistoryCategory | null,
): string {
  switch (category) {
    case "workflow":
      return "border-primary/30 bg-primary/5 text-primary";
    case "files":
      return "border-border bg-muted/30 text-muted-foreground";
    case "engagement":
      return "border-foreground/20 bg-foreground/5 text-foreground";
    case "remediation":
      return "border-sla-warn/30 bg-sla-warn/5 text-sla-warn";
    case "examination":
      return "border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-300";
    case "findings":
      return "border-destructive/30 bg-destructive/5 text-destructive";
    default:
      return "border-border bg-muted/20 text-muted-foreground";
  }
}

const EVENT_TYPE_PILL: Record<string, string> = {
  "line.submitted": "Submission",
  "line.approved": "Approval",
  "line.rejected": "Rejection",
  "line.created": "Line created",
  "attachment.uploaded": "File upload",
  "document.imported": "Import",
  "engagement.created": "Engagement",
  "engagement.phase_changed": "Phase change",
  "action_item.created": "Action created",
  "action_item.status_changed": "Status change",
  "examination.ask_created": "Exam ask",
  "examination.reaction_set": "Reaction",
  "report.ingested": "Report",
  "finding.created": "Finding created",
  "finding.accepted": "Accepted",
  "finding.disputed": "Disputed",
  "finding.verified": "Verified",
};

export function getHistoryEventTypePill(eventType: string): string {
  if (EVENT_TYPE_PILL[eventType]) return EVENT_TYPE_PILL[eventType];
  return eventType.replaceAll(".", " · ");
}
