import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  observation: "Observation",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  disputed: "Disputed",
  accepted: "Accepted · MR drafting",
  in_remediation: "Remediation",
  verified: "Verified",
  closed: "Closed",
};

const SEVERITY_BADGE: Record<string, string> = {
  critical:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
  high: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400",
  medium:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  low: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
  observation:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400",
};

const STATUS_BADGE: Record<string, string> = {
  draft: "border-border bg-muted/50 text-muted-foreground",
  disputed:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  in_remediation: "border-primary/30 bg-primary/10 text-primary",
  verified:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  closed: "border-border bg-muted/50 text-muted-foreground",
};

const SEVERITY_BAR: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
  observation: "bg-slate-400",
};

export const SEVERITY_ROW_BORDER: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-amber-500",
  low: "border-l-blue-500",
  observation: "border-l-slate-400",
};

export function severityLabel(severity: string) {
  return SEVERITY_LABELS[severity] ?? severity.replaceAll("_", " ");
}

export function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

export function severityRowBorder(severity: string) {
  return SEVERITY_ROW_BORDER[severity] ?? "border-l-transparent";
}

export function severityBarColor(severity: string) {
  return SEVERITY_BAR[severity] ?? "bg-muted-foreground";
}

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-sm px-1.5 text-[0.625rem] font-medium ring-1",
        SEVERITY_BADGE[severity] ??
          "border-border bg-muted text-muted-foreground",
      )}
    >
      {severityLabel(severity)}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-sm px-1.5 text-[0.625rem] font-medium ring-1",
        STATUS_BADGE[status] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {statusLabel(status)}
    </Badge>
  );
}

export function RepeatBadge() {
  return (
    <Badge
      variant="outline"
      className="h-5 rounded-sm border-amber-200 bg-amber-50 px-1.5 text-[0.625rem] font-medium text-amber-700 ring-1 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
    >
      Repeat
    </Badge>
  );
}
