"use client";

import { Button } from "@/components/ui/button";
import {
  computeExamDay,
  computeHeaderKpis,
  formatExamWindow,
} from "./examination-helpers";
import type {
  ExaminationAsk,
  ExaminationDailyPulse,
  ExaminationThread,
} from "@/lib/types/examination";

interface ExaminationJournalHeaderProps {
  engagementCode: string;
  examinationStartDate: string | null;
  examinationEndDate: string | null;
  auditorName: string | null;
  threads: ExaminationThread[];
  activeAsks: ExaminationAsk[];
  asksTotal: number;
  pulse: ExaminationDailyPulse;
  onAddThread: () => void;
}

export function ExaminationJournalHeader({
  engagementCode,
  examinationStartDate,
  examinationEndDate,
  auditorName,
  threads,
  activeAsks,
  asksTotal,
  pulse,
  onAddThread,
}: ExaminationJournalHeaderProps) {
  const kpis = computeHeaderKpis(threads, activeAsks, asksTotal, pulse);
  const examWindow = formatExamWindow(examinationStartDate, examinationEndDate);
  const examDay = computeExamDay(examinationStartDate);

  const kpiItems = [
    { label: "Threads", value: kpis.threads },
    { label: "Total asks", value: kpis.totalAsks },
    { label: "This thread", value: kpis.activeThreadAsks },
    { label: "Concerns", value: kpis.concerns },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
          {engagementCode}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Examination
        </h1>
        <p className="text-muted-foreground">
          Live journal for onsite auditor asks — BDTS captures questions,
          responses, and reactions.
        </p>
        {examWindow ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {examWindow}
            {examDay != null ? (
              <>
                {" "}
                · <span className="tabular-nums">Day {examDay}</span>
              </>
            ) : null}
          </p>
        ) : null}
        {auditorName ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {auditorName}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-end sm:gap-6">
        <div className="flex gap-4 overflow-x-auto sm:gap-6">
          {kpiItems.map((kpi) => (
            <div key={kpi.label} className="min-w-16 shrink-0">
              <div className="text-2xl font-bold tabular-nums">{kpi.value}</div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onAddThread}>
          Add thread
        </Button>
      </div>
    </div>
  );
}
