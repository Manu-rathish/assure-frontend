import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExaminationDailyPulse } from "@/lib/types/examination";
import { cn } from "@/lib/utils";

interface ExaminationPulseRailProps {
  pulse: ExaminationDailyPulse;
}

const STAT_ITEMS = [
  { key: "accepted" as const, label: "Accepted", accent: "text-emerald-600" },
  {
    key: "probedFurther" as const,
    label: "Probed further",
    accent: "text-amber-600",
  },
  { key: "concerns" as const, label: "Concerns", accent: "text-destructive" },
  { key: "followUps" as const, label: "Follow-ups", accent: "text-primary" },
];

export function ExaminationPulseRail({ pulse }: ExaminationPulseRailProps) {
  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
        <CardTitle className="text-sm">Today&apos;s pulse</CardTitle>
        <CardDescription className="text-xs">
          Engagement-wide reaction tallies from seed data.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-4 sm:px-5">
        <div className="grid grid-cols-2 gap-3">
          {STAT_ITEMS.map((item) => (
            <div key={item.key}>
              <div
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  item.accent,
                )}
              >
                {pulse[item.key]}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {pulse.topConcerns.length > 0 ? (
          <div className="mt-4 border-t border-border/40 pt-4">
            <p className="mb-2 text-xs font-medium">
              Top auditor concerns surfacing
            </p>
            <ul className="space-y-2">
              {pulse.topConcerns.map((concern, i) => (
                <li
                  key={i}
                  className="list-inside list-disc text-xs text-muted-foreground"
                >
                  <span className="line-clamp-2">{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
