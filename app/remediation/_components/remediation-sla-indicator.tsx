import { cn } from "@/lib/utils";
import type { SlaVariant } from "./remediation-register-helpers";

const VARIANT_BAR: Record<SlaVariant, string> = {
  breach: "bg-sla-breach",
  warn: "bg-sla-warn",
  complete: "bg-sla-complete",
  ok: "bg-sla-ok",
  neutral: "bg-muted-foreground/30",
};

const VARIANT_TEXT: Record<SlaVariant, string> = {
  breach: "text-sla-breach",
  warn: "text-sla-warn",
  complete: "text-sla-complete",
  ok: "text-muted-foreground",
  neutral: "text-muted-foreground",
};

interface RemediationSlaIndicatorProps {
  variant: SlaVariant;
  width: number;
  label: string;
}

export function RemediationSlaIndicator({
  variant,
  width,
  label,
}: RemediationSlaIndicatorProps) {
  return (
    <div className="min-w-[72px]">
      <div className="h-[2px] rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", VARIANT_BAR[variant])}
          style={{ width: `${width}%` }}
        />
      </div>
      <p
        className={cn(
          "mt-1 text-right text-[11px] tabular-nums",
          VARIANT_TEXT[variant],
        )}
      >
        {label}
      </p>
    </div>
  );
}
