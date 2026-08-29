"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import type { AskReaction } from "@/lib/types/examination";
import { REACTIONS } from "./examination-helpers";

interface ExaminationCaptureFormProps {
  defaultAskCode: string;
  canCapture: boolean;
}

export function ExaminationCaptureForm({
  defaultAskCode,
  canCapture,
}: ExaminationCaptureFormProps) {
  const [askCode, setAskCode] = useState(defaultAskCode);
  const [responderName, setResponderName] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [reaction, setReaction] = useState<AskReaction | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  function validate() {
    const next: Record<string, string> = {};
    if (questionText.trim().length < 10) {
      next.questionText = "Question must be at least 10 characters.";
    }
    if (!responderName.trim()) {
      next.responderName = "Responder name is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    if (!validate()) return;
    setNotice("Coming soon");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-border/50 bg-primary/5 p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-primary">Quick capture</span>
        <span className="text-[10px] text-muted-foreground">
          Capture validates here only — save not connected yet
        </span>
      </div>

      <div className="grid gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <Label htmlFor="ask-code" className="text-xs">
              Ask code
            </Label>
            <Input
              id="ask-code"
              value={askCode}
              onChange={(e) => setAskCode(e.target.value)}
              className={cn("h-8 w-24 font-mono text-xs", controlFocusClass)}
              disabled={!canCapture}
            />
          </div>
          <div className="min-w-[10rem] flex-1 space-y-1">
            <Label htmlFor="responder" className="text-xs">
              Responder <span className="text-destructive">*</span>
            </Label>
            <Input
              id="responder"
              value={responderName}
              onChange={(e) => setResponderName(e.target.value)}
              placeholder="Responder name…"
              aria-required
              className={cn("h-8", controlFocusClass)}
              disabled={!canCapture}
            />
            {errors.responderName ? (
              <p className="text-[10px] text-destructive">{errors.responderName}</p>
            ) : null}
          </div>
          <div className="min-w-[12rem] flex-1 space-y-1">
            <Label htmlFor="reference" className="text-xs">
              Reference
            </Label>
            <Input
              id="reference"
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="Reference (IDR line, app…)"
              className={cn("h-8", controlFocusClass)}
              disabled={!canCapture}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="question" className="text-xs">
            Question <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="question"
            rows={2}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="What did the auditor ask?"
            aria-required
            className={cn("text-xs", controlFocusClass)}
            disabled={!canCapture}
          />
          {errors.questionText ? (
            <p className="text-[10px] text-destructive">{errors.questionText}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label htmlFor="response" className="text-xs">
            Response
          </Label>
          <Textarea
            id="response"
            rows={2}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Response provided…"
            className={cn("text-xs", controlFocusClass)}
            disabled={!canCapture}
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-medium">Auditor reaction</span>
          <div
            className="inline-flex rounded-sm bg-muted p-1"
            role="radiogroup"
            aria-label="Auditor reaction"
          >
            {REACTIONS.map((r) => {
              const selected = reaction === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() =>
                    setReaction(selected ? null : r.value)
                  }
                  disabled={!canCapture}
                  className={cn(
                    "rounded-sm px-2.5 py-1 text-[0.625rem] font-medium transition-colors",
                    selected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    controlFocusClass,
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" size="sm" disabled={!canCapture}>
            Save ask
          </Button>
          {notice ? (
            <span className="text-xs text-muted-foreground">{notice}</span>
          ) : !canCapture ? (
            <span className="text-xs text-muted-foreground">Coming soon</span>
          ) : null}
        </div>
      </div>
    </form>
  );
}
