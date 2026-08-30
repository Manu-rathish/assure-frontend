"use client";

import { Button } from "@/components/ui/button";
import type { FindingListItem } from "@/lib/types/finding";
import {
  countAccepted,
  countDisputed,
} from "@/app/engagements/[id]/report/_components/report-helpers";

interface FindingsRegisterHeaderProps {
  engagementCode: string;
  findings: FindingListItem[];
}

export function FindingsRegisterHeader({
  engagementCode,
  findings,
}: FindingsRegisterHeaderProps) {
  const accepted = countAccepted(findings);
  const disputed = countDisputed(findings);
  const criticalHigh = findings.filter(
    (f) => f.severity === "critical" || f.severity === "high",
  ).length;

  const kpis = [
    { label: "Total", value: findings.length },
    { label: "Accepted", value: accepted },
    { label: "Disputed", value: disputed },
    { label: "Critical/High", value: criticalHigh },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
          {engagementCode}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Findings
        </h1>
        <p className="text-muted-foreground">
          Register of auditor findings — review severity, dispute or accept, and
          trace sources to IDR and ADR.
        </p>
      </div>
      <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-end sm:gap-6">
        <div className="flex gap-4 overflow-x-auto sm:gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="min-w-16 shrink-0">
              <div className="text-2xl font-bold tabular-nums">{kpi.value}</div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled
          title="Not connected yet"
        >
          Add finding manually
        </Button>
      </div>
    </div>
  );
}
