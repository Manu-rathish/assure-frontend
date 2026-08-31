import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Clock,
  FileText,
  Folder,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgDashboardKpis } from "@/lib/types/dashboard";
import { DashboardPanel } from "./dashboard-panel";

interface DashboardKpiStripProps {
  kpis: OrgDashboardKpis;
}

type KpiTone = "default" | "warn" | "danger";

function MetricBar({ pct, tone }: { pct: number; tone: KpiTone }) {
  return (
    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "dashboard-bar-grow h-full rounded-full",
          tone === "danger"
            ? "bg-sla-breach/80"
            : tone === "warn"
              ? "bg-sla-warn/80"
              : "bg-primary/60",
        )}
        style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
      />
    </div>
  );
}

function MetricTile({
  label,
  value,
  subtext,
  href,
  icon: Icon,
  tone = "default",
  barPct = 35,
  tooltip,
}: {
  label: string;
  value: number;
  subtext: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: KpiTone;
  barPct?: number;
  tooltip: string;
}) {
  return (
    <Link
      href={href}
      title={tooltip}
      className="group flex h-full flex-col rounded-lg border border-border/60 bg-background/50 p-2.5 transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground xl:text-xs">{label}</p>
          <p
            className={cn(
              "mt-0.5 text-xl font-bold tabular-nums sm:mt-1 sm:text-2xl",
              tone === "danger"
                ? "text-sla-breach"
                : tone === "warn"
                  ? "text-sla-warn"
                  : "text-foreground",
            )}
          >
            {value}
          </p>
          <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
            {subtext}
          </p>
        </div>
        <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <MetricBar pct={barPct} tone={tone} />
    </Link>
  );
}

export function DashboardKpiStrip({ kpis }: DashboardKpiStripProps) {
  const totalOpen = kpis.openIdrLines + kpis.openAdrLines;

  const tiles = [
    {
      key: "active",
      label: "Active engagements",
      value: kpis.activeEngagements,
      subtext: kpis.phaseSummary,
      href: "/engagements?status=active",
      icon: Folder,
      tone: "default" as const,
      barPct: 40,
      tooltip: "View all active engagements",
    },
    {
      key: "idr",
      label: "Open IDR lines",
      value: kpis.openIdrLines,
      subtext:
        kpis.dueWithin48h > 0
          ? `${kpis.dueWithin48h} due ≤ 48h`
          : "Across active engagements",
      href: "/engagements?status=active",
      icon: FileText,
      tone: "default" as const,
      barPct: totalOpen > 0 ? (kpis.openIdrLines / totalOpen) * 100 : 40,
      tooltip: "Open IDR lines across active engagements",
    },
    {
      key: "adr",
      label: "Open ADR lines",
      value: kpis.openAdrLines,
      subtext: "Across active engagements",
      href: "/engagements?status=active",
      icon: MessageSquare,
      tone: "default" as const,
      barPct: totalOpen > 0 ? (kpis.openAdrLines / totalOpen) * 100 : 40,
      tooltip: "Open ADR lines across active engagements",
    },
    {
      key: "due48h",
      label: "Due ≤ 48h",
      value: kpis.dueWithin48h,
      subtext: "Urgent SLA window",
      href: "/engagements?status=active&urgency=due48h",
      icon: Clock,
      tone: (kpis.dueWithin48h > 0 ? "warn" : "default") as KpiTone,
      barPct: totalOpen > 0 ? (kpis.dueWithin48h / totalOpen) * 100 : 20,
      tooltip: "Engagements with lines due within 48 hours",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: kpis.overdue,
      subtext: "Past due date",
      href: "/engagements?status=active&urgency=overdue",
      icon: AlertTriangle,
      tone: (kpis.overdue > 0 ? "danger" : "default") as KpiTone,
      barPct: totalOpen > 0 ? (kpis.overdue / totalOpen) * 100 : 15,
      tooltip: "Engagements with overdue open lines",
    },
    {
      key: "breaches",
      label: "SLA breaches (7d)",
      value: kpis.slaBreaches7d,
      subtext: "Recently overdue open lines",
      href: "/engagements?status=active&urgency=breach7d",
      icon: Activity,
      tone: (kpis.slaBreaches7d > 0 ? "warn" : "default") as KpiTone,
      barPct: totalOpen > 0 ? (kpis.slaBreaches7d / totalOpen) * 100 : 15,
      tooltip: "SLA breaches in the last 7 days",
    },
  ];

  return (
    <DashboardPanel
      title="Key metrics"
      description="Click any metric to drill into filtered engagements"
      bodyClassName="p-3 sm:p-4"
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map(({ key, ...tile }) => (
          <MetricTile key={key} {...tile} />
        ))}
      </div>
    </DashboardPanel>
  );
}
