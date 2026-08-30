"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { springUi } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { FindingDetail } from "@/lib/types/finding";
import { ACCEPTED_STATUSES } from "@/app/engagements/[id]/report/_components/report-helpers";

type WorkflowMode = "accept" | "dispute" | null;

interface FindingWorkflowPanelProps {
  finding: FindingDetail;
}

export function FindingWorkflowPanel({ finding }: FindingWorkflowPanelProps) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<WorkflowMode>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isTerminal =
    finding.status === "verified" || finding.status === "closed";
  const isAccepted = ACCEPTED_STATUSES.has(finding.status);
  const isDisputed = finding.status === "disputed";

  const canAccept = !isTerminal && !isAccepted && !isDisputed;
  const canDispute = !isTerminal && !isDisputed && finding.status === "draft";

  function cancel() {
    setMode(null);
    setText("");
    setError("");
    setNotice("");
  }

  function validate() {
    if (text.trim().length < 10) {
      setError("Please enter at least 10 characters.");
      return false;
    }
    setError("");
    return true;
  }

  function handleConfirm() {
    if (!validate()) return;
    setNotice("Coming soon");
  }

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
        <CardTitle className="text-sm">Workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-4 sm:px-5">
        {finding.acceptanceRationale ? (
          <div className="rounded-sm border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Accepted · Rationale
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {finding.acceptanceRationale}
            </p>
          </div>
        ) : null}

        {finding.disputeReason ? (
          <div className="rounded-sm border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Disputed · Grounds
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {finding.disputeReason}
            </p>
          </div>
        ) : null}

        {!isTerminal ? (
          <div className="flex flex-wrap gap-2">
            {canAccept ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => {
                  setMode("accept");
                  setText("");
                  setError("");
                  setNotice("");
                }}
              >
                Accept finding
              </Button>
            ) : null}
            {canDispute ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => {
                  setMode("dispute");
                  setText("");
                  setError("");
                  setNotice("");
                }}
              >
                Dispute finding
              </Button>
            ) : null}
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {mode ? (
            <motion.div
              key={mode}
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={reduce ? { duration: 0 } : springUi}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="workflow-text" className="text-xs">
                    {mode === "accept"
                      ? "Acceptance rationale"
                      : "Dispute grounds"}
                  </Label>
                  <Textarea
                    id="workflow-text"
                    rows={3}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    aria-required
                    className={cn("text-xs", controlFocusClass)}
                  />
                  {error ? (
                    <p className="text-[10px] text-destructive">{error}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" onClick={handleConfirm}>
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={cancel}
                  >
                    Cancel
                  </Button>
                  {notice ? (
                    <span className="text-xs text-muted-foreground">
                      {notice}
                    </span>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
