import {
  CheckCircle2,
  FilePlus2,
  Send,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewFlow } from "@/lib/types/dashboard";
import { DashboardPanel } from "./dashboard-panel";

interface DashboardReviewFlowChartProps {
  reviewFlow: ReviewFlow;
}

const STEPS = [
  {
    key: "intake" as const,
    label: "Intake",
    icon: FilePlus2,
    color: "bg-chart-1/75",
  },
  {
    key: "submitted" as const,
    label: "Submitted",
    icon: Send,
    color: "bg-primary/60",
  },
  {
    key: "approved" as const,
    label: "Approved",
    icon: CheckCircle2,
    color: "bg-sla-ok/70",
  },
  {
    key: "rejected" as const,
    label: "Rejected",
    icon: XCircle,
    color: "bg-sla-breach/70",
  },
];

export function DashboardReviewFlowChart({
  reviewFlow,
}: DashboardReviewFlowChartProps) {
  const total =
    reviewFlow.intake +
    reviewFlow.submitted +
    reviewFlow.approved +
    reviewFlow.rejected;
  const maxStep = Math.max(
    reviewFlow.intake,
    reviewFlow.submitted,
    reviewFlow.approved,
    reviewFlow.rejected,
    1,
  );

  return (
    <DashboardPanel
      title="Review flow"
      description="Intake to decisions · last 24h"
      className="h-full"
    >
      <div className="space-y-4">
        {total > 0 ? (
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
            {STEPS.map((step) => {
              const value = reviewFlow[step.key];
              if (value <= 0) return null;
              return (
                <div
                  key={step.key}
                  className={cn("dashboard-bar-grow", step.color)}
                  style={{ width: `${(value / total) * 100}%` }}
                />
              );
            })}
          </div>
        ) : (
          <div className="h-2.5 rounded-full bg-muted-foreground/15" />
        )}

        <div className="grid grid-cols-2 gap-2">
          {STEPS.map((step) => {
            const value = reviewFlow[step.key];
            const Icon = step.icon;
            const barPct = (value / maxStep) * 100;

            return (
              <div
                key={step.key}
                className="rounded-md border border-border/60 bg-background/50 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                  <span className="text-xs text-muted-foreground">
                    {step.label}
                  </span>
                </div>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {value}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "dashboard-bar-grow h-full rounded-full",
                      step.color,
                    )}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardPanel>
  );
}
