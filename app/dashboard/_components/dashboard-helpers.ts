import type { EngagementListItem } from "@/lib/types/engagement";
import type {
  DashboardLineRisk,
  LineRiskBucket,
  OrgActivityItem,
  OrgDashboard,
  OrgDashboardKpis,
  PhaseRiskItem,
  ReviewFlow,
} from "@/lib/types/dashboard";
import type { DummyData } from "@/lib/types/dummy-data";
import { buildInboxViewModel } from "@/app/inbox/_components/inbox-helpers";

export type SlaVariant = "ok" | "warn" | "breach" | "complete" | "neutral";

const fmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function buildPhaseSummary(engagements: EngagementListItem[]): string {
  const counts = { idr: 0, adr: 0, both: 0, complete: 0 };
  for (const e of engagements) {
    switch (e.phase) {
      case "IDR":
        counts.idr++;
        break;
      case "ADR":
        counts.adr++;
        break;
      case "IDR + ADR":
        counts.both++;
        break;
      default:
        counts.complete++;
        break;
    }
  }
  const parts: string[] = [];
  if (counts.idr) parts.push(`${counts.idr} in IDR`);
  if (counts.adr) parts.push(`${counts.adr} in ADR`);
  if (counts.both) parts.push(`${counts.both} IDR + ADR`);
  if (counts.complete) parts.push(`${counts.complete} complete`);
  return parts.length ? parts.join(" · ") : "No active line work";
}

export function buildLineRisk(summary: {
  open: number;
  dueWithin48h: number;
  overdue: number;
}): LineRiskBucket {
  return {
    open: summary.open,
    onTrack: Math.max(0, summary.open - summary.dueWithin48h - summary.overdue),
    dueWithin48h: summary.dueWithin48h,
    overdue: summary.overdue,
  };
}

export function getSlaHealth(kpis: OrgDashboardKpis) {
  const totalOpen = kpis.openIdrLines + kpis.openAdrLines;
  const onTrack = Math.max(0, totalOpen - kpis.dueWithin48h - kpis.overdue);
  const healthyPct =
    totalOpen > 0 ? Math.round((onTrack / totalOpen) * 100) : 100;
  const tone =
    kpis.overdue > 0
      ? ("danger" as const)
      : kpis.dueWithin48h > 0
        ? ("warn" as const)
        : ("default" as const);
  return { totalOpen, onTrack, healthyPct, tone };
}

export function buildReviewFlow(events: { eventType: string }[]): ReviewFlow {
  const flow: ReviewFlow = {
    intake: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
  };
  for (const event of events) {
    if (event.eventType === "line.created" || event.eventType === "document.imported") {
      flow.intake++;
    } else if (event.eventType === "line.submitted") {
      flow.submitted++;
    } else if (event.eventType === "line.approved") {
      flow.approved++;
    } else if (event.eventType === "line.rejected") {
      flow.rejected++;
    }
  }
  return flow;
}

export function buildPhaseRisk(
  engagements: EngagementListItem[],
): PhaseRiskItem[] {
  const map = new Map<string, PhaseRiskItem>();
  for (const e of engagements) {
    const existing = map.get(e.phase) ?? {
      phase: e.phase,
      activeCount: 0,
      dueWithin48h: 0,
      overdue: 0,
    };
    existing.activeCount++;
    existing.dueWithin48h += e.dueWithin48h;
    existing.overdue += e.overdue;
    map.set(e.phase, existing);
  }
  return [...map.values()].sort((a, b) => {
    const riskA = a.overdue + a.dueWithin48h;
    const riskB = b.overdue + b.dueWithin48h;
    if (riskB !== riskA) return riskB - riskA;
    return a.phase.localeCompare(b.phase);
  });
}

export function formatActivityMessage(item: OrgActivityItem): string {
  if (item.message) return item.message;
  const metadata = item.metadata ?? {};
  const lineId =
    typeof metadata.lineId === "string" ? metadata.lineId : undefined;
  const engagementLabel = item.engagementCode ?? "engagement";
  switch (item.eventType) {
    case "line.submitted":
      return lineId
        ? `Line ${lineId} submitted for review in ${engagementLabel}.`
        : `Line submitted for review in ${engagementLabel}.`;
    case "line.approved":
      return lineId
        ? `Line ${lineId} approved in ${engagementLabel}.`
        : `Line approved in ${engagementLabel}.`;
    case "line.rejected":
      return lineId
        ? `Line ${lineId} rejected in ${engagementLabel}.`
        : `Line rejected in ${engagementLabel}.`;
    case "line.created":
      return lineId
        ? `Line ${lineId} created in ${engagementLabel}.`
        : `New line created in ${engagementLabel}.`;
    case "document.imported":
      return `Document imported in ${engagementLabel}.`;
    case "attachment.uploaded":
      return typeof metadata.filename === "string"
        ? `Attachment ${metadata.filename} uploaded in ${engagementLabel}.`
        : `Attachment uploaded in ${engagementLabel}.`;
    case "engagement.created":
      return `Engagement ${engagementLabel} created.`;
    default:
      return `${item.eventType.replaceAll(".", " ")} in ${engagementLabel}.`;
  }
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const diffMs = now - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatHeaderDate(): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return fmt.format(d);
}

export function computeSlaState(
  dueDate: Date | null,
  status: string,
): { variant: SlaVariant; width: number; label: string } {
  if (status === "approved" || status === "closed") {
    return { variant: "complete", width: 100, label: "Done" };
  }
  if (!dueDate) return { variant: "neutral", width: 0, label: "—" };
  const msUntilDue = dueDate.getTime() - Date.now();
  if (msUntilDue < 0) {
    const hours = Math.max(1, Math.round(Math.abs(msUntilDue) / 3_600_000));
    return {
      variant: "breach",
      width: 96,
      label:
        hours < 24 ? `${hours}h overdue` : `${Math.round(hours / 24)}d overdue`,
    };
  }
  const hoursLeft = Math.max(1, Math.round(msUntilDue / 3_600_000));
  const width = Math.min(96, Math.max(8, 100 - (hoursLeft / 120) * 100));
  const label =
    hoursLeft < 48
      ? hoursLeft < 24
        ? `${hoursLeft}h`
        : `${Math.round(hoursLeft / 24)}d`
      : `${Math.round(hoursLeft / 24)}d`;
  if (hoursLeft <= 48) return { variant: "warn", width, label };
  return { variant: "ok", width, label };
}

export function nextSlaLabel(nextDueDate: string | null) {
  if (!nextDueDate) return { label: "—", variant: "secondary" as const };
  const sla = computeSlaState(new Date(nextDueDate), "in_progress");
  if (sla.variant === "breach" || sla.variant === "warn") {
    return { label: sla.label, variant: "outline" as const };
  }
  return { label: formatDate(nextDueDate), variant: "secondary" as const };
}

export function engagementRiskTone(e: EngagementListItem) {
  if (e.overdue > 0) return "bg-sla-breach";
  if (e.dueWithin48h > 0) return "bg-sla-warn";
  return "bg-sla-ok";
}

function sortActiveEngagements(
  engagements: EngagementListItem[],
): EngagementListItem[] {
  return [...engagements].sort((a, b) => {
    const riskA = a.overdue + a.dueWithin48h;
    const riskB = b.overdue + b.dueWithin48h;
    if (riskB !== riskA) return riskB - riskA;
    const dateA = a.nextDueDate ? new Date(a.nextDueDate).getTime() : Infinity;
    const dateB = b.nextDueDate ? new Date(b.nextDueDate).getTime() : Infinity;
    return dateA - dateB;
  });
}

function allocateStreamRisk(
  idrOpen: number,
  adrOpen: number,
  dueWithin48h: number,
  overdue: number,
): DashboardLineRisk {
  const total = idrOpen + adrOpen;
  if (total === 0) {
    const empty = buildLineRisk({ open: 0, dueWithin48h: 0, overdue: 0 });
    return { idr: empty, adr: empty };
  }
  const idrDue48h = Math.round((dueWithin48h * idrOpen) / total);
  const idrOverdue = Math.round((overdue * idrOpen) / total);
  return {
    idr: buildLineRisk({
      open: idrOpen,
      dueWithin48h: idrDue48h,
      overdue: idrOverdue,
    }),
    adr: buildLineRisk({
      open: adrOpen,
      dueWithin48h: dueWithin48h - idrDue48h,
      overdue: overdue - idrOverdue,
    }),
  };
}

function collectRecentActivity(
  data: DummyData,
  referenceDate: Date,
): OrgActivityItem[] {
  const cutoff = referenceDate.getTime() - 24 * 60 * 60 * 1000;
  const items: OrgActivityItem[] = [];

  for (const engagement of data.engagements) {
    const overview = engagement.overview as
      | {
          recentActivity?: Array<{
            id: string;
            eventType: string;
            createdAt: string;
            actorName: string;
            message: string;
            metadata?: Record<string, unknown>;
          }>;
        }
      | undefined;

    for (const activity of overview?.recentActivity ?? []) {
      const t = new Date(activity.createdAt).getTime();
      if (t >= cutoff && t <= referenceDate.getTime()) {
        items.push({
          id: activity.id,
          eventType: activity.eventType,
          createdAt: activity.createdAt,
          metadata: activity.metadata ?? {},
          engagementCode: engagement.code,
          engagementName: engagement.name,
          actorName: activity.actorName,
          message: activity.message,
        });
      }
    }
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 12);
}

function collectReviewEvents(
  data: DummyData,
  referenceDate: Date,
): { eventType: string }[] {
  const cutoff = referenceDate.getTime() - 24 * 60 * 60 * 1000;
  const events: { eventType: string }[] = [];

  for (const engagement of data.engagements) {
    const historyItems = engagement.history?.history?.items ?? [];
    for (const item of historyItems) {
      const createdAt = String(item.createdAt ?? "");
      const t = new Date(createdAt).getTime();
      if (t >= cutoff && t <= referenceDate.getTime()) {
        events.push({ eventType: String(item.eventType) });
      }
    }
  }

  return events;
}

export function buildOrgDashboardViewModel(data: DummyData): OrgDashboard {
  const referenceDate = new Date(data.referenceDate ?? Date.now());
  const active = data.views.engagementsList.filter((e) => e.status === "active");
  const seed = data.views.orgDashboard;

  let openIdrLines = 0;
  let openAdrLines = 0;
  for (const engagement of data.engagements) {
    const kpis = (
      engagement.overview as { kpis?: { idrOpen?: number; adrOpen?: number } }
    )?.kpis;
    openIdrLines += kpis?.idrOpen ?? 0;
    openAdrLines += kpis?.adrOpen ?? 0;
  }

  const dueWithin48h = active.reduce((sum, e) => sum + e.dueWithin48h, 0);
  const overdue = active.reduce((sum, e) => sum + e.overdue, 0);

  const kpis: OrgDashboardKpis = {
    activeEngagements: active.length,
    openIdrLines: seed?.kpis?.openIdrLines ?? openIdrLines,
    openAdrLines: seed?.kpis?.openAdrLines ?? openAdrLines,
    dueWithin48h: seed?.kpis?.dueWithin48h ?? dueWithin48h,
    overdue: seed?.kpis?.overdue ?? overdue,
    slaBreaches7d: seed?.kpis?.slaBreaches7d ?? overdue,
    phaseSummary: buildPhaseSummary(active),
  };

  const lineRisk =
    seed?.lineRisk ??
    allocateStreamRisk(
      kpis.openIdrLines,
      kpis.openAdrLines,
      kpis.dueWithin48h,
      kpis.overdue,
    );

  const reviewEvents = collectReviewEvents(data, referenceDate);
  let reviewFlow = buildReviewFlow(reviewEvents);
  const reviewTotal =
    reviewFlow.intake +
    reviewFlow.submitted +
    reviewFlow.approved +
    reviewFlow.rejected;
  if (reviewTotal === 0 && seed?.reviewFlow) {
    reviewFlow = seed.reviewFlow;
  } else if (reviewTotal === 0) {
    reviewFlow = { intake: 4, submitted: 6, approved: 3, rejected: 1 };
  }

  const phaseRisk = seed?.phaseRisk ?? buildPhaseRisk(active);
  const activeEngagements = sortActiveEngagements(active).slice(0, 8);
  const recentActivity =
    seed?.recentActivity ?? collectRecentActivity(data, referenceDate);

  const inbox = buildInboxViewModel(data.views.inbox);

  return {
    tenant: data.tenant,
    kpis,
    lineRisk,
    reviewFlow,
    phaseRisk,
    activeEngagements,
    recentActivity,
    attention: {
      inboxReviewCount:
        seed?.attention?.inboxReviewCount ?? inbox.counts.review,
    },
  };
}
