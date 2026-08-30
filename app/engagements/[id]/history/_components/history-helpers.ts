import type {
  EngagementHistory,
  EngagementHistoryItem,
  EngagementHistoryPageData,
  HistoryCategory,
  HistoryDetailKind,
  HistoryEntityFilter,
  HistoryFilters,
} from "@/lib/types/engagement";

export const HISTORY_PAGE_SIZE = 25;

const WORKFLOW_EVENTS = [
  "line.submitted",
  "line.approved",
  "line.rejected",
  "line.created",
] as const;

const FILES_EVENTS = ["attachment.uploaded", "document.imported"] as const;

const ENGAGEMENT_EVENTS = [
  "engagement.created",
  "engagement.phase_changed",
] as const;

const REMEDIATION_EVENTS = [
  "action_item.created",
  "action_item.status_changed",
] as const;

const EXAMINATION_EVENTS = [
  "examination.ask_created",
  "examination.reaction_set",
] as const;

const FINDINGS_EVENTS = [
  "report.ingested",
  "finding.created",
  "finding.accepted",
  "finding.disputed",
  "finding.verified",
] as const;

export const CATEGORY_CHIPS: { value: HistoryCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "workflow", label: "Workflow" },
  { value: "files", label: "Files" },
  { value: "engagement", label: "Engagement" },
  { value: "examination", label: "Examination" },
  { value: "findings", label: "Findings" },
  { value: "remediation", label: "Remediation" },
];

export const ENTITY_OPTIONS: { value: HistoryEntityFilter; label: string }[] = [
  { value: "all", label: "All entities" },
  { value: "engagement", label: "Engagement" },
  { value: "idr_document", label: "IDR document" },
  { value: "adr_document", label: "ADR document" },
  { value: "idr_line", label: "IDR line" },
  { value: "adr_line", label: "ADR line" },
  { value: "attachment", label: "Attachment" },
  { value: "action_item", label: "Action item" },
  { value: "examination_ask", label: "Examination ask" },
  { value: "audit_report", label: "Audit report" },
  { value: "finding", label: "Finding" },
];

export const CATEGORY_LABELS: Record<HistoryCategory, string> = {
  all: "All categories",
  workflow: "Workflow",
  files: "Files",
  engagement: "Engagement",
  remediation: "Remediation",
  examination: "Examination",
  findings: "Findings",
};

export const ENTITY_LABELS: Record<HistoryEntityFilter, string> = {
  all: "All entities",
  engagement: "Engagement",
  idr_document: "IDR document",
  adr_document: "ADR document",
  idr_line: "IDR line",
  adr_line: "ADR line",
  attachment: "Attachment",
  action_item: "Action item",
  examination_ask: "Examination ask",
  audit_report: "Audit report",
  finding: "Finding",
};

const engagementDateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const eventTimeFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const dayLabelFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function categorizeEventType(eventType: string): HistoryCategory | null {
  if ((WORKFLOW_EVENTS as readonly string[]).includes(eventType)) return "workflow";
  if ((FILES_EVENTS as readonly string[]).includes(eventType)) return "files";
  if ((ENGAGEMENT_EVENTS as readonly string[]).includes(eventType)) return "engagement";
  if ((REMEDIATION_EVENTS as readonly string[]).includes(eventType)) return "remediation";
  if ((EXAMINATION_EVENTS as readonly string[]).includes(eventType)) return "examination";
  if ((FINDINGS_EVENTS as readonly string[]).includes(eventType)) return "findings";
  return null;
}

export function getEventTypesForCategory(
  category: HistoryCategory,
): string[] | undefined {
  switch (category) {
    case "workflow":
      return [...WORKFLOW_EVENTS];
    case "files":
      return [...FILES_EVENTS];
    case "engagement":
      return [...ENGAGEMENT_EVENTS];
    case "remediation":
      return [...REMEDIATION_EVENTS];
    case "examination":
      return [...EXAMINATION_EVENTS];
    case "findings":
      return [...FINDINGS_EVENTS];
    case "all":
    default:
      return undefined;
  }
}

function pickString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function parseDateStart(isoDate: string): Date | undefined {
  const parsed = new Date(`${isoDate}T00:00:00.000`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseDateEnd(isoDate: string): Date | undefined {
  const parsed = new Date(`${isoDate}T23:59:59.999`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parsePageParam(value: string | undefined): number {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function isEntityFilter(value: string | undefined): value is HistoryEntityFilter {
  if (!value || value === "all") return value === "all";
  return [
    "engagement",
    "idr_document",
    "adr_document",
    "idr_line",
    "adr_line",
    "attachment",
    "action_item",
    "examination_ask",
    "audit_report",
    "finding",
  ].includes(value);
}

export function parseHistoryFilters(
  params: Record<string, string | string[] | undefined>,
): HistoryFilters {
  const categoryParam = pickString(params.category);
  const entityParam = pickString(params.entity);
  const sortParam = pickString(params.sort);
  const fromParam = pickString(params.from);
  const toParam = pickString(params.to);

  const category: HistoryCategory =
    categoryParam === "workflow" ||
    categoryParam === "files" ||
    categoryParam === "engagement" ||
    categoryParam === "remediation" ||
    categoryParam === "examination" ||
    categoryParam === "findings"
      ? categoryParam
      : "all";

  const entity: HistoryEntityFilter = isEntityFilter(entityParam)
    ? entityParam
    : "all";

  return {
    category,
    entity,
    actorId: pickString(params.actor) || undefined,
    from: fromParam ? parseDateStart(fromParam) : undefined,
    to: toParam ? parseDateEnd(toParam) : undefined,
    q: pickString(params.q)?.trim() || undefined,
    sort: sortParam === "asc" ? "asc" : "desc",
    page: parsePageParam(pickString(params.page)),
  };
}

export function clampHistoryPage(
  page: number,
  totalItems: number,
  pageSize = HISTORY_PAGE_SIZE,
): number {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return Math.min(Math.max(1, page), totalPages);
}

export function metadataRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object") {
    return metadata as Record<string, unknown>;
  }
  return {};
}

function matchesSearch(item: EngagementHistoryItem, q: string): boolean {
  const meta = metadataRecord(item.metadata);
  const lower = q.toLowerCase();
  if (item.eventType.toLowerCase().includes(lower)) return true;
  if (item.message?.toLowerCase().includes(lower)) return true;
  if (item.lineDisplayId?.toLowerCase().includes(lower)) return true;
  if (item.actorName?.toLowerCase().includes(lower)) return true;
  const paths = [
    "lineId",
    "filename",
    "title",
    "actionItemId",
    "comment",
    "findingCode",
    "askCode",
  ] as const;
  for (const key of paths) {
    const v = meta[key];
    if (typeof v === "string" && v.toLowerCase().includes(lower)) return true;
  }
  return false;
}

export function filterHistoryEvents(
  items: EngagementHistoryItem[],
  filters: HistoryFilters,
): EngagementHistoryItem[] {
  let result = items;

  const categoryTypes = getEventTypesForCategory(filters.category);
  if (categoryTypes) {
    result = result.filter((i) => categoryTypes.includes(i.eventType));
  }

  if (filters.entity !== "all") {
    result = result.filter((i) => i.entityType === filters.entity);
  }

  if (filters.actorId) {
    result = result.filter((i) => i.actorUserId === filters.actorId);
  }

  if (filters.from || filters.to) {
    result = result.filter((i) => {
      const t = new Date(i.createdAt).getTime();
      if (filters.from && t < filters.from.getTime()) return false;
      if (filters.to && t > filters.to.getTime()) return false;
      return true;
    });
  }

  if (filters.q) {
    result = result.filter((i) => matchesSearch(i, filters.q!));
  }

  return result;
}

export function sortHistoryEvents(
  items: EngagementHistoryItem[],
  sort: "asc" | "desc",
): EngagementHistoryItem[] {
  return [...items].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return sort === "asc" ? ta - tb : tb - ta;
  });
}

function actorLabel(actorName: string | null): string {
  return actorName ?? "System";
}

function formatFileSize(bytes: unknown): string {
  const n = typeof bytes === "number" ? bytes : Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function buildLineRefDetail(
  lineDisplayId?: string,
  lineKind?: "idr" | "adr",
): string {
  if (!lineDisplayId) return "";
  const kind = lineKind === "adr" ? "ADR" : "IDR";
  return `${kind} ${lineDisplayId}`;
}

function formatMetadataFallback(metadata: Record<string, unknown>): string {
  return Object.entries(metadata)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(" · ");
}

type MessageInput = Pick<
  EngagementHistoryItem,
  "eventType" | "metadata" | "actorName" | "lineDisplayId" | "lineKind"
>;

export function formatEngagementHistoryMessage(item: MessageInput): {
  message: string;
  detail?: string;
  detailKind?: HistoryDetailKind;
} {
  const meta = metadataRecord(item.metadata);
  const actor = actorLabel(item.actorName);
  const lineRef = buildLineRefDetail(
    item.lineDisplayId ??
      (typeof meta.lineId === "string" ? meta.lineId : undefined),
    item.lineKind ??
      (meta.lineKind === "adr" ? "adr" : meta.lineKind === "idr" ? "idr" : undefined),
  );

  switch (item.eventType) {
    case "line.submitted": {
      const comment =
        typeof meta.comment === "string" ? meta.comment.trim() : "";
      return {
        message: `${actor} submitted ${lineRef || "a line"} for review`,
        detail: comment || lineRef || undefined,
        detailKind: comment ? "reason" : "default",
      };
    }
    case "line.approved": {
      const comment =
        typeof meta.comment === "string" ? meta.comment.trim() : "";
      return {
        message: `${actor} approved ${lineRef || "a line"}`,
        detail: comment || lineRef || undefined,
        detailKind: comment ? "reason" : "default",
      };
    }
    case "line.rejected": {
      const comment =
        typeof meta.comment === "string" ? meta.comment.trim() : "";
      return {
        message: `${actor} rejected ${lineRef || "a line"}`,
        detail: comment || undefined,
        detailKind: comment ? "reason" : undefined,
      };
    }
    case "line.created":
      return {
        message: `${actor} created ${lineRef || "a line"}`,
        detail: lineRef || undefined,
        detailKind: "default",
      };
    case "document.imported": {
      const count = Number(meta.count ?? meta.lineCount ?? 1);
      const kind = meta.lineKind === "adr" ? "ADR" : "IDR";
      return {
        message: `${actor} imported ${count} ${kind} line(s) from Excel`,
        detail: `${count} line(s)`,
        detailKind: "default",
      };
    }
    case "attachment.uploaded": {
      const filename =
        typeof meta.filename === "string" ? meta.filename : "a file";
      const suffix = lineRef ? ` on ${lineRef}` : "";
      const size = formatFileSize(meta.sizeBytes ?? meta.size);
      return {
        message: `${actor} uploaded ${filename}${suffix}`,
        detail: size ? `${filename} · ${size}` : filename,
        detailKind: "default",
      };
    }
    case "engagement.created":
      return {
        message: `${actor} created this engagement`,
        detail:
          typeof meta.name === "string"
            ? meta.name
            : typeof meta.code === "string"
              ? meta.code
              : undefined,
        detailKind: "title",
      };
    case "action_item.created": {
      const id =
        typeof meta.actionItemId === "string" ? meta.actionItemId : "action item";
      const title = typeof meta.title === "string" ? meta.title : undefined;
      return {
        message: `${actor} created action item ${id}`,
        detail: title,
        detailKind: title ? "title" : undefined,
      };
    }
    case "action_item.status_changed": {
      const id =
        typeof meta.actionItemId === "string" ? meta.actionItemId : "action item";
      const from = typeof meta.from === "string" ? meta.from : "—";
      const to = typeof meta.to === "string" ? meta.to : "—";
      return {
        message: `${actor} updated action item ${id}`,
        detail: `${from} → ${to}`,
        detailKind: "status",
      };
    }
    case "examination.ask_created": {
      const code =
        typeof meta.askCode === "string" ? meta.askCode : "an examination ask";
      const responder =
        typeof meta.responderName === "string" ? meta.responderName : undefined;
      return {
        message: `${actor} captured Examination Ask ${code}`,
        detail: responder ? `Responder: ${responder}` : undefined,
        detailKind: "default",
      };
    }
    case "examination.reaction_set": {
      const reaction =
        typeof meta.reaction === "string" ? meta.reaction : "updated";
      return {
        message: `${actor} marked examination ask reaction as ${reaction}`,
      };
    }
    case "report.ingested": {
      const fileName =
        typeof meta.fileName === "string"
          ? meta.fileName
          : typeof meta.filename === "string"
            ? meta.filename
            : "report";
      return {
        message: `${actor} ingested report: ${fileName}`,
      };
    }
    case "finding.created": {
      const code =
        typeof meta.findingCode === "string" ? meta.findingCode : "a finding";
      const severity =
        typeof meta.severity === "string" ? meta.severity : undefined;
      return {
        message: `${actor} created finding ${code}`,
        detail: severity,
        detailKind: severity ? "status" : undefined,
      };
    }
    case "finding.accepted": {
      const rationale =
        typeof meta.rationale === "string"
          ? meta.rationale
          : typeof meta.acceptanceRationale === "string"
            ? meta.acceptanceRationale
            : undefined;
      return {
        message: `${actor} accepted a finding`,
        detail: rationale?.slice(0, 200),
        detailKind: rationale ? "reason" : undefined,
      };
    }
    case "finding.disputed": {
      const reason =
        typeof meta.reason === "string"
          ? meta.reason
          : typeof meta.disputeReason === "string"
            ? meta.disputeReason
            : undefined;
      return {
        message: `${actor} disputed a finding`,
        detail: reason?.slice(0, 200),
        detailKind: reason ? "reason" : undefined,
      };
    }
    case "finding.verified":
      return { message: `${actor} verified a finding` };
    case "engagement.phase_changed": {
      const from = typeof meta.from === "string" ? meta.from : "—";
      const to = typeof meta.to === "string" ? meta.to : "—";
      return {
        message: `${actor} advanced engagement phase: ${from} → ${to}`,
        detail: `${from} → ${to}`,
        detailKind: "status",
      };
    }
    default:
      return {
        message: `${actor} — ${item.eventType}`,
        detail: formatMetadataFallback(meta) || undefined,
        detailKind: "default",
      };
  }
}

export function resolveHistoryItemHref(
  engagementId: string,
  item: Pick<
    EngagementHistoryItem,
    "entityType" | "entityId" | "metadata" | "lineKind" | "lineDisplayId"
  >,
): { href?: string; lineKind?: "idr" | "adr"; lineDisplayId?: string } {
  const metadata = metadataRecord(item.metadata);
  const lineDisplayId =
    item.lineDisplayId ??
    (typeof metadata.lineId === "string" ? metadata.lineId : undefined);

  if (item.entityType === "idr_line") {
    return {
      href: `/engagements/${engagementId}/idr/lines/${item.entityId}`,
      lineKind: "idr",
      lineDisplayId,
    };
  }
  if (item.entityType === "adr_line") {
    return {
      href: `/engagements/${engagementId}/adr/lines/${item.entityId}`,
      lineKind: "adr",
      lineDisplayId,
    };
  }
  if (item.entityType === "action_item") {
    return { href: `/engagements/${engagementId}/remediation` };
  }
  if (item.entityType === "finding") {
    const code =
      typeof metadata.findingCode === "string"
        ? metadata.findingCode
        : undefined;
    return code
      ? { href: `/engagements/${engagementId}/findings/${code}` }
      : {};
  }
  if (item.entityType === "examination_ask") {
    return { href: `/engagements/${engagementId}/examination` };
  }
  if (item.entityType === "audit_report") {
    return { href: `/engagements/${engagementId}/report` };
  }
  if (item.entityType === "attachment") {
    const kind = metadata.lineKind === "adr" ? "adr" : "idr";
    const lineId =
      typeof metadata.parentLineId === "string"
        ? metadata.parentLineId
        : typeof metadata.lineEntityId === "string"
          ? metadata.lineEntityId
          : undefined;
    if (lineId) {
      return {
        href: `/engagements/${engagementId}/${kind}/lines/${lineId}`,
        lineKind: kind,
        lineDisplayId,
      };
    }
    return { lineKind: kind, lineDisplayId };
  }
  return {};
}

export function normalizeHistoryItem(
  engagementId: string,
  raw: Record<string, unknown>,
): EngagementHistoryItem {
  const eventType = String(raw.eventType ?? "");
  const lineInfo = resolveHistoryItemHref(engagementId, {
    entityType: String(raw.entityType ?? ""),
    entityId: String(raw.entityId ?? ""),
    metadata: metadataRecord(raw.metadata),
    lineKind: raw.lineKind as "idr" | "adr" | undefined,
    lineDisplayId: raw.lineDisplayId as string | undefined,
  });
  const formatted = formatEngagementHistoryMessage({
    eventType,
    metadata: metadataRecord(raw.metadata),
    actorName: (raw.actorName as string | null) ?? null,
    lineDisplayId: lineInfo.lineDisplayId,
    lineKind: lineInfo.lineKind,
  });

  return {
    id: String(raw.id),
    eventType,
    entityType: String(raw.entityType ?? ""),
    entityId: String(raw.entityId ?? ""),
    createdAt: String(raw.createdAt),
    metadata: metadataRecord(raw.metadata),
    actorUserId: raw.actorUserId as string | undefined,
    actorName: (raw.actorName as string | null) ?? null,
    category:
      (raw.category as HistoryCategory | null) ?? categorizeEventType(eventType),
    message: typeof raw.message === "string" ? raw.message : formatted.message,
    detail: typeof raw.detail === "string" ? raw.detail : formatted.detail,
    detailKind:
      (raw.detailKind as HistoryDetailKind | undefined) ?? formatted.detailKind,
    href: (raw.href as string | undefined) ?? lineInfo.href,
    lineKind: lineInfo.lineKind,
    lineDisplayId: lineInfo.lineDisplayId,
  };
}

export function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildHistoryHref(
  engagementId: string,
  filters: Partial<HistoryFilters>,
): string {
  const base = `/engagements/${engagementId}/history`;
  const params = new URLSearchParams();

  if (filters.category && filters.category !== "all") {
    params.set("category", filters.category);
  }
  if (filters.entity && filters.entity !== "all") {
    params.set("entity", filters.entity);
  }
  if (filters.actorId) {
    params.set("actor", filters.actorId);
  }
  if (filters.from) {
    params.set("from", toDateInputValue(filters.from));
  }
  if (filters.to) {
    params.set("to", toDateInputValue(filters.to));
  }
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.sort && filters.sort !== "desc") {
    params.set("sort", filters.sort);
  }
  if (filters.page && filters.page !== 1) {
    params.set("page", String(filters.page));
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export interface HistoryDayGroup {
  dayKey: string;
  dayLabel: string;
  items: EngagementHistoryItem[];
}

export function groupHistoryByDay(
  items: EngagementHistoryItem[],
): HistoryDayGroup[] {
  const groups = new Map<string, EngagementHistoryItem[]>();

  for (const item of items) {
    const dayKey = item.createdAt.slice(0, 10);
    const bucket = groups.get(dayKey) ?? [];
    bucket.push(item);
    groups.set(dayKey, bucket);
  }

  return Array.from(groups.entries()).map(([dayKey, groupItems]) => ({
    dayKey,
    dayLabel: dayLabelFmt.format(new Date(`${dayKey}T12:00:00`)),
    items: groupItems,
  }));
}

export function getEmptyHistoryMessage(category: HistoryCategory): string {
  switch (category) {
    case "workflow":
      return "No workflow events in this date range.";
    case "files":
      return "No file or import events in this date range.";
    case "engagement":
      return "No engagement events in this date range.";
    case "remediation":
      return "No remediation or action item events in this date range.";
    case "examination":
      return "No examination events in this date range.";
    case "findings":
      return "No findings events in this date range.";
    case "all":
    default:
      return "No audit events match your filters.";
  }
}

export function formatActiveFilterSummary(
  filters: HistoryFilters,
  actorName?: string,
): string {
  const parts: string[] = [];

  if (filters.category !== "all") {
    parts.push(CATEGORY_LABELS[filters.category]);
  }
  if (filters.entity !== "all") {
    parts.push(ENTITY_LABELS[filters.entity]);
  }
  if (filters.actorId && actorName) {
    parts.push(actorName);
  }
  if (filters.from || filters.to) {
    const fromStr = filters.from ? engagementDateFmt.format(filters.from) : "…";
    const toStr = filters.to ? engagementDateFmt.format(filters.to) : "…";
    parts.push(`${fromStr} – ${toStr}`);
  }
  if (filters.q) {
    parts.push(`"${filters.q}"`);
  }
  if (filters.sort === "asc") {
    parts.push("Oldest first");
  }

  return parts.length > 0 ? parts.join(" · ") : "All events in date range";
}

export function formatEngagementDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return engagementDateFmt.format(d);
}

export function formatEventTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return eventTimeFmt.format(d);
}

export function buildEngagementHistoryPageData(
  engagementId: string,
  raw: EngagementHistory,
  filters: HistoryFilters,
): EngagementHistoryPageData {
  const periodStart = new Date(raw.engagement.periodStart);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const effectiveFilters: HistoryFilters = {
    ...filters,
    from: filters.from ?? periodStart,
    to: filters.to ?? endOfToday,
  };

  const source = (raw.allEvents ?? raw.history.items) as Record<
    string,
    unknown
  >[];
  const normalized = source.map((item) =>
    normalizeHistoryItem(engagementId, item),
  );

  const filtered = filterHistoryEvents(normalized, effectiveFilters);
  const sorted = sortHistoryEvents(filtered, effectiveFilters.sort);
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / HISTORY_PAGE_SIZE));
  const safePage = clampHistoryPage(effectiveFilters.page, totalItems);
  const start = (safePage - 1) * HISTORY_PAGE_SIZE;
  const pageItems = sorted.slice(start, start + HISTORY_PAGE_SIZE);

  return {
    engagement: raw.engagement,
    totalEvents: raw.totalEvents,
    filterOptions: {
      actors: (raw.filterOptions.actors ?? []).map((a) => ({
        id: String(a.id),
        name: String(a.name),
        eventCount: Number(a.eventCount ?? 0),
      })),
    },
    history: {
      items: pageItems,
      page: safePage,
      totalPages,
      totalItems,
      pageSize: HISTORY_PAGE_SIZE,
    },
    filters: { ...effectiveFilters, page: safePage },
  };
}

export function buildClearFiltersHref(
  engagementId: string,
  filters: HistoryFilters,
): string {
  return buildHistoryHref(engagementId, {
    from: filters.from,
    to: filters.to,
  });
}
