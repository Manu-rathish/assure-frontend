import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  RemediationRegisterPageData,
  RemediationRegisterSummary,
} from "@/lib/types/remediation";
import { buildRegisterHref } from "./remediation-register-helpers";

interface RemediationRegisterKpiRowProps {
  summary: RemediationRegisterSummary;
  params: RemediationRegisterPageData["params"];
}

export function RemediationRegisterKpiRow({
  summary,
  params,
}: RemediationRegisterKpiRowProps) {
  const overdueDanger = summary.overdueCount > 0;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border bg-card/50 px-4 py-3">
        <div className="text-2xl font-bold tabular-nums">{summary.openCount}</div>
        <div className="text-xs text-muted-foreground">Open action items</div>
      </div>

      <div
        className={cn(
          "rounded-lg border bg-card/50 px-4 py-3",
          overdueDanger && "border-destructive/30",
        )}
      >
        {overdueDanger ? (
          <Link
            href={buildRegisterHref({
              ...params,
              status: "overdue",
            })}
            className="block"
          >
            <div
              className={cn(
                "text-2xl font-bold tabular-nums",
                overdueDanger && "text-destructive",
              )}
            >
              {summary.overdueCount}
            </div>
            <div className="text-xs text-muted-foreground">Overdue</div>
            <div className="mt-1 text-[10px] font-medium text-primary">
              View overdue
            </div>
          </Link>
        ) : (
          <>
            <div className="text-2xl font-bold tabular-nums">
              {summary.overdueCount}
            </div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </>
        )}
      </div>

      <div className="rounded-lg border bg-card/50 px-4 py-3">
        <div className="text-2xl font-bold tabular-nums">{summary.total}</div>
        <div className="text-xs text-muted-foreground">Total tracked</div>
      </div>
    </div>
  );
}
