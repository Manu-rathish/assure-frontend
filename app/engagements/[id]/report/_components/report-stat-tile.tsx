import { cn } from "@/lib/utils";

interface ReportStatTileProps {
  label: string;
  value: string | number;
  valueClassName?: string;
  mono?: boolean;
  className?: string;
  size?: "default" | "compact";
}

export function ReportStatTile({
  label,
  value,
  valueClassName,
  mono = false,
  className,
  size = "default",
}: ReportStatTileProps) {
  const compact = size === "compact";

  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-muted/25",
        compact ? "px-2.5 py-2" : "p-3",
        className,
      )}
    >
      <div
        className={cn(
          "font-bold leading-none tracking-tight tabular-nums",
          compact ? "text-lg" : "text-2xl",
          mono && (compact ? "font-mono text-sm" : "font-mono text-lg sm:text-xl"),
          valueClassName,
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "font-medium uppercase tracking-wider text-muted-foreground",
          compact ? "mt-1 text-[9px]" : "mt-1.5 text-[10px]",
        )}
      >
        {label}
      </div>
    </div>
  );
}
