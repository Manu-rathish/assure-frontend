import type { RemediationRegisterSummary } from "@/lib/types/remediation";

interface RemediationRegisterHeaderProps {
  summary: RemediationRegisterSummary;
}

export function RemediationRegisterHeader({
  summary,
}: RemediationRegisterHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Remediation</h1>
      <p className="text-sm text-muted-foreground">
        Cross-engagement action item tracker · {summary.openCount} open ·{" "}
        {summary.verifiedCount} in verification · {summary.overdueCount} overdue
      </p>
    </header>
  );
}
