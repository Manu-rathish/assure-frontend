import { cn } from "@/lib/utils";
import { reactionLabel } from "./examination-helpers";

interface ExaminationAskReactionBadgeProps {
  reaction: string | null;
}

const REACTION_STYLES: Record<string, string> = {
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  probed_further:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  concern:
    "border-destructive/30 bg-destructive/10 text-destructive",
  follow_up:
    "border-primary/30 bg-primary/10 text-primary",
};

const DOT_STYLES: Record<string, string> = {
  accepted: "bg-emerald-500",
  probed_further: "bg-amber-500",
  concern: "bg-destructive",
  follow_up: "bg-primary",
};

export function ExaminationAskReactionBadge({
  reaction,
}: ExaminationAskReactionBadgeProps) {
  const label = reactionLabel(reaction);
  if (!reaction || !label) return null;

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-sm border px-1.5 text-[0.625rem] font-medium",
        REACTION_STYLES[reaction] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          DOT_STYLES[reaction] ?? "bg-muted-foreground",
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}
