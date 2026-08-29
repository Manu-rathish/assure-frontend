"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EngagementKpis } from "@/lib/types/engagement";
import {
  RAIL_PHASES,
  buildPhaseSubtext,
  formatTimelineCaption,
  normalizePhase,
  phaseIndex,
} from "./overview-helpers";

export type EngagementTimelineProps = {
  phase: string;
  periodStart?: string | null;
  targetCloseDate?: string | null;
  kpis: Pick<
    EngagementKpis,
    | "idrOpen"
    | "idrClosed"
    | "adrOpen"
    | "adrClosed"
    | "asksTotal"
    | "findingsTotal"
    | "actionItemsOpen"
    | "actionItemsTotal"
  >;
};

interface TimelineStepState {
  key: string;
  label: string;
  step: number;
  subtext?: string;
  isDone: boolean;
  isActive: boolean;
  isFuture: boolean;
}

function buildStepAriaLabel(
  step: TimelineStepState,
): string {
  const status = step.isDone
    ? "complete"
    : step.isActive
      ? "current"
      : "upcoming";
  const detail = step.subtext ? `, ${step.subtext}` : "";
  return `${step.label} ${status}${detail}`;
}

function TimelineStepColumn({ step }: { step: TimelineStepState }) {
  return (
    <div
      role="listitem"
      aria-current={step.isActive ? "step" : undefined}
      aria-label={buildStepAriaLabel(step)}
      className="flex min-w-[4.5rem] flex-1 flex-col items-center text-center"
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-sm text-xs font-semibold",
          step.isDone && "bg-emerald-600 text-white",
          step.isActive && "bg-primary text-primary-foreground",
          step.isFuture &&
            "bg-background text-muted-foreground ring-1 ring-border",
        )}
      >
        {step.isDone ? (
          <Check className="size-4" strokeWidth={2.5} aria-hidden />
        ) : (
          <span aria-hidden>{step.step}</span>
        )}
      </div>

      <span
        className={cn(
          "mt-2 text-xs font-medium",
          step.isDone && "text-emerald-600",
          step.isActive && "text-primary",
          step.isFuture && "text-muted-foreground",
        )}
      >
        {step.label}
      </span>

      {step.subtext ? (
        <span className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
          {step.subtext}
        </span>
      ) : (
        <span className="mt-0.5 h-[0.875rem]" aria-hidden />
      )}
    </div>
  );
}

function TimelineConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div
      aria-hidden
      className="flex h-8 min-w-[0.75rem] flex-1 items-center px-0.5 sm:px-1"
    >
      <div
        className={cn(
          "h-px w-full",
          isComplete ? "bg-emerald-600" : "bg-border",
        )}
      />
    </div>
  );
}

export function OverviewPhaseRail({
  phase,
  periodStart,
  targetCloseDate,
  kpis,
}: EngagementTimelineProps) {
  const normalizedPhase = normalizePhase(phase);
  const currentIdx = phaseIndex(phase);
  const isClosed = normalizedPhase === "closed";
  const subtext = buildPhaseSubtext(kpis as EngagementKpis);
  const dateCaption = formatTimelineCaption(periodStart, targetCloseDate);

  const steps: TimelineStepState[] = RAIL_PHASES.map((railStep) => {
    const stepIdx = phaseIndex(railStep.key);
    const isDone = isClosed || stepIdx < currentIdx;
    const isActive = !isClosed && stepIdx === currentIdx;
    const isFuture = !isDone && !isActive;

    return {
      key: railStep.key,
      label: railStep.label,
      step: railStep.step,
      subtext: subtext[railStep.key],
      isDone,
      isActive,
      isFuture,
    };
  });

  return (
    <Card className="min-w-0 gap-0 py-0">
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-foreground">
            Engagement timeline
          </h2>
          {dateCaption ? (
            <p className="shrink-0 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
              {dateCaption}
            </p>
          ) : null}
        </div>

        <nav aria-label="Engagement timeline">
          <div
            role="list"
            className="flex w-full min-w-0 items-start overflow-x-auto"
          >
            {steps.map((step, index) => (
              <Fragment key={step.key}>
                <TimelineStepColumn step={step} />
                {index < steps.length - 1 ? (
                  <TimelineConnector isComplete={step.isDone} />
                ) : null}
              </Fragment>
            ))}
          </div>
        </nav>
      </div>
    </Card>
  );
}
