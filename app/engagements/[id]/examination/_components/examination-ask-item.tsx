import Link from "next/link";
import { ExaminationAskReactionBadge } from "./examination-ask-reaction-badge";
import {
  formatAskTime,
  reactionRowBorder,
} from "./examination-helpers";
import type { ExaminationAsk } from "@/lib/types/examination";
import { cn } from "@/lib/utils";

interface ExaminationAskItemProps {
  ask: ExaminationAsk;
  engagementId: string;
}

export function ExaminationAskItem({ ask, engagementId }: ExaminationAskItemProps) {
  return (
    <div
      className={cn(
        "border-t border-border/40 border-l-2 px-4 py-4 sm:px-6",
        reactionRowBorder(ask.reaction),
      )}
    >
      <div className="grid grid-cols-[4rem_1fr] gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="font-mono text-xs font-medium">{ask.askCode}</div>
          <div className="font-mono text-[10px] text-muted-foreground tabular-nums">
            {formatAskTime(ask.askedAt)}
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {ask.responderName ? (
              <span className="text-xs font-medium">{ask.responderName}</span>
            ) : null}
            <ExaminationAskReactionBadge reaction={ask.reaction} />
            {ask.referenceText ? (
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {ask.referenceText}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-relaxed">
            <span className="text-muted-foreground">Q ·</span> {ask.questionText}
          </p>
          {ask.responseText ? (
            <p className="mt-1.5 text-xs leading-relaxed">
              <span className="text-muted-foreground">R ·</span>{" "}
              {ask.responseText}
            </p>
          ) : null}
          {(ask.idrLineRef || ask.adrLineRef) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {ask.idrLineRef ? (
                <Link
                  href={`/engagements/${engagementId}/idr/lines/${ask.idrLineRef}`}
                  className="inline-flex rounded-sm border border-primary/30 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary hover:bg-primary/10"
                >
                  {ask.idrLineRef}
                </Link>
              ) : null}
              {ask.adrLineRef ? (
                <Link
                  href={`/engagements/${engagementId}/adr/lines/${ask.adrLineRef}`}
                  className="inline-flex rounded-sm border border-primary/30 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary hover:bg-primary/10"
                >
                  {ask.adrLineRef}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
