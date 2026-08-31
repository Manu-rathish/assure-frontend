import { cn } from "@/lib/utils";

interface DashboardPanelProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  borderAccent?: string;
}

export function DashboardPanel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  borderAccent,
}: DashboardPanelProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-xs",
        borderAccent,
        className,
      )}
    >
      {title ? (
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-border bg-muted/40 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-snug text-foreground">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-3 sm:p-4", bodyClassName)}>{children}</div>
    </div>
  );
}
