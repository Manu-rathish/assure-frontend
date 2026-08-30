import { cn } from "@/lib/utils";
import {
  formatActionItemStatus,
  statusDotClass,
} from "./remediation-helpers";

export function ActionItemStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex h-5 items-center gap-1.5 rounded-sm bg-muted/60 px-1.5 text-[0.625rem] font-medium">
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
