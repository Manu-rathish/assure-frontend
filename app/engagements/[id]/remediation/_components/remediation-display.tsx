import { cn } from "@/lib/utils";
import {
  formatActionItemStatus,
  statusDotClass,
} from "./remediation-helpers";

export function ActionItemStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", statusDotClass(status))}
        aria-hidden
      />
      {formatActionItemStatus(status)}
    </span>
  );
}

export function SlaCell({
  item,
  label,
}: {
  item: import("@/lib/types/remediation").ActionItemListItem;
  label: string;
}) {
  if (label === "Overdue") {
    return <span className="text-xs font-medium text-destructive">{label}</span>;
  }
  if (label === "≤48h") {
    return <span className="text-xs font-medium text-primary">{label}</span>;
  }
  if (label === "Done") {
    return <span className="text-xs text-muted-foreground">{label}</span>;
  }
  return <span className="text-xs text-muted-foreground">{label}</span>;
}
