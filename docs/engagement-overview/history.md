# History & Audit Trail — Complete UI Rebuild Specification

> **Purpose:** Self-contained, pixel-level rebuild spec for `/engagements/[id]/history` — the engagement **History & audit trail** screen.  
> **Audience:** Engineers or agents rebuilding this screen in **any** codebase with **no** access to other repos, legacy apps, or tribal knowledge.  
> **Scope:** UI only — layouts, copy, tokens, motion, filter/pagination algorithms, timeline presentation. No auth, no backend, no audit event writes.  
> **Design name:** **Audit ledger** — immutable chronological record of every auditable action on an engagement — not a dashboard widget or org-wide activity feed.

**Definition of the module:** History is the **full-fidelity audit trail** for a single engagement. It answers: *Who did what, when, on which entity — and can I jump to the related line, file, finding, or action item?* It complements (does not replace) the overview **Recent activity** teaser (5 events) and line-detail **Recent audit** sidebars (last 5 events per line).

**Architecture:** Thin RSC page loads `EngagementHistory` via `getEngagementHistoryApi`. Client-side (or RSC + searchParams) applies filter/sort/pagination algorithms ported from v1 `engagement-history.ts`. Presentation only — events are append-only in production; this UI never mutates audit data.

**Tech stack (source repo):** Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn **radix-mira** · `motion` v12 via `@/lib/motion` · `lucide-react` icons.

**Companion docs:** [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) · [`lib/motion/ANIMATION.md`](../../lib/motion/ANIMATION.md) · [`docs/engagement-overview/overview.md`](../engagement-overview/overview.md) · [`docs/IDR/idr.md`](../IDR/idr.md) · [`docs/ADR/engagement_refer.md`](../ADR/engagement_refer.md) · product phase [`development-plan/14-audit-history.md`](../../../development-plan/14-audit-history.md) (behavior reference only).

**Note on overview.md:** The overview spec previously marked History as optional stretch. **This document is authoritative** for the dedicated History route, subnav tab, and full filter/timeline UX. When History is built, update overview §1 to add the History subnav tab and a “View full history” link on the activity feed (§8.6 addendum below).

---

## 0. How to use this document

1. Read §1–§3 (constraints, routes, page shell).  
2. Copy design tokens (§4) and motion rules (§5).  
3. Implement data types and loaders per §6 — use `lib/types/engagement.ts`, `lib/api/engagements.ts`.  
4. Implement every algorithm in §7 verbatim in `history-helpers.ts`.  
5. Build each UI block per §8 — every label, class, empty state, and copy string is specified.  
6. Follow file layout §9; wire URL state §10.  
7. Verify against §11 using `eng-rbi-it-exam-fy27`.  
8. Track build progress with §12 tasks.

---

## 1. Hard constraints

| Rule | Detail |
|---|---|
| **UI only** | No HTTP endpoints, DB schema, server actions, or `appendAuditEvent` writers. |
| **Read-only data** | Single loader: `getEngagementHistoryApi(engagementId)` → `EngagementHistory`. Optional cross-reads for href resolution only: line lists are **not** required if seed items include `lineDisplayId` / pre-built `href`. |
| **Dummy data** | Do not mutate `Data.json` at runtime. Optional **one-time seed expansion**: add `history.allEvents[]` for filter QA (§6.5) — not required for default checklist. |
| **Append-only semantics** | No delete, edit, or “clear history” actions. Copy must say **immutable audit trail**. |
| **No org-wide history** | Route is engagement-scoped only. No `/history` global register. |
| **CO-only page (production)** | v1 restricts full History page to CO role. UI-only build: no auth gates; document intent in §15. |
| **Team line audit** | Teams see **Recent audit** on IDR/ADR line detail only (last 5 events) — not this page. Cross-ref IDR §8 line detail. |
| **Filter via URL** | All filters persist in `searchParams` — shareable/bookmarkable URLs. Category chips use link navigation; advanced filters use GET form. |
| **Client-side filter pipeline** | `getEngagementHistoryApi` ignores query params today. Page runs §7 pipeline on `allEvents ?? history.items` in RSC or client wrapper. |
| **No charts** | SLA health exists in payload but is **not** rendered on History page (v1 parity). |
| **No custom fonts** | Unlike v1 (Newsreader / IBM Plex), use Assure design system typography (`font-semibold`, `font-mono` for timestamps). |
| **`engagement.phase_changed`** | Formatter exists (§7.8) but **no writer** in v1 seed — do not invent events. |
| **Pre-formatted seed messages** | Dummy `history.items` may include `message` strings. On load, prefer seed `message` when present; otherwise run `formatEngagementHistoryMessage`. |

---

## 2. Routes and navigation map

### 2.1 Primary route

```
/engagements/{engagementId}/history?category=&entity=&actor=&from=&to=&q=&sort=&page=
```

**Query parameters:**

| Param | Values | Default |
|---|---|---|
| `category` | `all` · `workflow` · `files` · `engagement` · `remediation` · `examination` · `findings` | `all` |
| `entity` | `all` · `idr_line` · `adr_line` · `attachment` · `idr_document` · `adr_document` · `engagement` · `action_item` · `examination_ask` · `audit_report` · `finding` | `all` |
| `actor` | actor user id or empty | empty (all actors) |
| `from` | ISO date `YYYY-MM-DD` | engagement `periodStart` (effective, not in URL until user sets) |
| `to` | ISO date `YYYY-MM-DD` | end of today (effective) |
| `q` | free text | empty |
| `sort` | `desc` · `asc` | `desc` |
| `page` | positive integer | `1` |

Omit params when equal to default (see `buildHistoryHref` §7.11).

### 2.2 Entry paths

| Source | Target |
|---|---|
| Engagement subnav → **History** tab | `/engagements/{id}/history` |
| Overview activity feed → **View full history** link (add when building History) | `/engagements/{id}/history` |
| Overview module card (optional future) | `/engagements/{id}/history` |
| Direct URL / command palette | `/engagements/{id}/history` |

**Not entry paths:** line detail Recent audit (stays on line) · dashboard org feed (out of scope).

### 2.3 Subnav active state

Pathname equals `/engagements/{id}/history` or starts with `/engagements/{id}/history?` → **History** tab active.

**Tab order (update `engagement-subnav.tsx`):**  
Overview · IDR · ADR · Examination · Report · Findings · Remediation · **History**

History is the **last** tab (v1 parity).

### 2.4 Deep links from event rows

| `entityType` | `href` when resolvable |
|---|---|
| `idr_line` | `/engagements/{id}/idr/lines/{entityId}` |
| `adr_line` | `/engagements/{id}/adr/lines/{entityId}` |
| `action_item` | `/engagements/{id}/remediation` (hub — v1 does not deep-link item id) |
| `attachment` | parent line href when `metadata.lineKind` + line id known |
| `finding` | `/engagements/{id}/findings/{findingCode}` when `metadata.findingCode` present |
| `examination_ask` | `/engagements/{id}/examination` |
| `audit_report` | `/engagements/{id}/report` |
| others | no link — plain text message |

---

## 3. Page shell and layout

### 3.1 Server page

```tsx
// app/engagements/[id]/history/page.tsx
import { HistoryView } from "@/app/engagements/[id]/history/_components/history-view";
import { getEngagementHistoryApi } from "@/lib/api/engagements";
import { notFound } from "next/navigation";
import {
  buildEngagementHistoryPageData,
  parseHistoryFilters,
} from "@/app/engagements/[id]/history/_components/history-helpers";

export default async function EngagementHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const rawParams = await searchParams;

  let raw;
  try {
    raw = await getEngagementHistoryApi(id);
  } catch {
    notFound();
  }

  const filters = parseHistoryFilters(rawParams);
  const data = buildEngagementHistoryPageData(id, raw, filters);

  return <HistoryView engagementId={id} data={data} />;
}
```

404 when engagement missing from dummy loader.

### 3.2 Layout shell

Same as other engagement tabs:

```tsx
<main className="min-h-[calc(100dvh-3.5rem-3rem)]">
  <PageReveal className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
    <SectionStagger className="flex flex-col gap-5">
      <HistoryPageHeader … />
      <HistoryFilterBar … />
      <HistoryTimeline … />
    </SectionStagger>
  </PageReveal>
</main>
```

Engagement subnav renders in parent layout — not duplicated here.

### 3.3 Vertical block order

```
Page header (title + immutable trail subtitle)
→ Category chip row (quick filters)
→ Advanced filter form card (entity, actor, dates, search, sort, apply/clear, counts)
→ Chronological feed card (sort toggle + day groups + pagination)
```

### 3.4 Related surfaces (cross-reference — not built in this route)

| Surface | Cap | Data source | Doc |
|---|---|---|---|
| Overview **Recent activity** | 5 newest | `EngagementOverview.recentActivity` | overview §8.6 |
| IDR/ADR line **Recent audit** | 5 newest | `detail.recentAudit` | IDR §8 line detail |
| Dashboard org activity | N/A | out of scope | — |

**Overview addendum (when History ships):** Add footer link on activity feed card:

- Label: `View full history`
- Href: `/engagements/{id}/history`
- Class: `text-xs text-primary hover:underline`

---

## 4. Design tokens

Reuse global tokens from [`docs/IDR/idr.md`](../IDR/idr.md) §4 (cards, borders, muted text, control focus).

### 4.1 History-specific tokens

| Element | Classes |
|---|---|
| Page H2 | `text-2xl font-semibold tracking-tight text-foreground` |
| Subtitle | `max-w-2xl text-sm leading-relaxed text-muted-foreground` |
| Category chips | shadcn `Button` variants: active `secondary` + `shadow-sm`, inactive `outline` · `size="sm"` · `font-medium` |
| Filter form card | `rounded-lg border border-border bg-card px-4 py-3 shadow-sm` |
| Filter labels | `text-[10px] uppercase tracking-wider` |
| Date/search inputs | `h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm shadow-xs` · dates add `font-mono text-xs tabular-nums w-[160px]` |
| Active filter summary | `mt-3 border-t border-border/60 pt-2 text-xs text-muted-foreground` |
| Timeline card | `overflow-hidden rounded-lg border border-border bg-card shadow-sm` |
| Timeline header | `flex items-center justify-between border-b border-border px-4 py-3 sm:px-5` |
| Day group heading | `text-sm font-semibold tracking-tight` |
| Day event count | `font-mono text-[11px] tabular-nums text-muted-foreground` |
| Event time column | `w-[100px] shrink-0 pt-0.5 text-right font-mono text-[12px] tabular-nums text-muted-foreground` |
| Timeline rail dot | `size-2.5 rounded-full` · color per category §4.2 |
| Timeline connector | `w-px flex-1 bg-border` between dots |
| Actor name | `font-medium text-foreground text-[12px]` |
| Category pill | `inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide` |
| Event message | `text-[13px] leading-relaxed text-foreground` |
| Linked message | same + `underline-offset-2 hover:text-primary hover:underline` |
| Detail block | `mt-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground` |

### 4.2 Category rail & pill colors

Extend v1 `audit-display` for all six non-null categories:

| Category | Rail (`bg-*`) | Pill border/bg/text |
|---|---|---|
| `workflow` | `bg-primary` | `border-primary/30 bg-primary/5 text-primary` |
| `files` | `bg-muted-foreground` | `border-border bg-muted/30 text-muted-foreground` |
| `engagement` | `bg-foreground/70` | `border-foreground/20 bg-foreground/5 text-foreground` |
| `remediation` | `bg-sla-warn` | `border-sla-warn/30 bg-sla-warn/5 text-sla-warn` |
| `examination` | `bg-chart-4` or `bg-violet-500` | `border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-300` |
| `findings` | `bg-destructive/80` | `border-destructive/30 bg-destructive/5 text-destructive` |
| unknown / null | `bg-border` | `border-border bg-muted/20 text-muted-foreground` |

### 4.3 Event type pill labels

| `eventType` | Pill text |
|---|---|
| `line.submitted` | Submission |
| `line.approved` | Approval |
| `line.rejected` | Rejection |
| `line.created` | Line created |
| `attachment.uploaded` | File upload |
| `document.imported` | Import |
| `engagement.created` | Engagement |
| `engagement.phase_changed` | Phase change |
| `action_item.created` | Action created |
| `action_item.status_changed` | Status change |
| `examination.ask_created` | Exam ask |
| `examination.reaction_set` | Reaction |
| `report.ingested` | Report |
| `finding.created` | Finding created |
| `finding.accepted` | Accepted |
| `finding.disputed` | Disputed |
| `finding.verified` | Verified |
| default | `eventType` with `.` → ` · ` |

### 4.4 Event icons (`lucide-react`)

Port `getAuditEventIcon` logic:

| Pattern | Icon | Color class |
|---|---|---|
| reject / breach | `XCircleIcon` | `text-destructive` |
| approved | `CheckCircle2Icon` | `text-sla-complete` |
| submitted | `SendIcon` | `text-sla-warn` |
| `line.created` | `PlusCircleIcon` | `text-primary` |
| `document.imported` | `FileUpIcon` | `text-primary` |
| `attachment.uploaded` | `PaperclipIcon` | `text-muted-foreground` |
| `engagement.created` | `FolderPlusIcon` | `text-primary` |
| `action_item.created` | `PlusCircleIcon` | `text-sla-warn` |
| `action_item.status_changed` | `ActivityIcon` | `text-sla-warn` |
| warn / due | `AlertTriangleIcon` | `text-sla-warn` |
| default | `ActivityIcon` | `text-muted-foreground` |

Icon shown `hidden sm:inline-flex` · `size-3.5` · `aria-hidden` · right side of event meta row.

---

## 5. Motion system

Same tokens as IDR §5.

| Moment | Pattern |
|---|---|
| Page mount | `PageReveal` + `SectionStagger` · blocks: header → filters → timeline |
| Category chip tap | `whileTap={tapScale}` on chip links (optional) |
| Filter apply | **No** page remount or re-stagger — URL navigation only |
| Timeline day groups | static on filter change |
| Sort toggle | Link navigation — no animation |
| Pagination | Link navigation |

**Hard rule:** Filter/sort/page changes update list content only — do not re-run `SectionStagger` enter animation.

---

## 6. Data contract

### 6.1 Loader (existing)

```ts
getEngagementHistoryApi(engagementId: string): Promise<EngagementHistory>
```

Returns `requireEngagement(engagementId).history` from dummy store.

### 6.2 Tightened TypeScript interfaces

Add to `lib/types/engagement.ts` (or colocated `history-types.ts` re-exported):

```ts
export const HISTORY_PAGE_SIZE = 25;

export type HistoryCategory =
  | "all"
  | "workflow"
  | "files"
  | "engagement"
  | "remediation"
  | "examination"
  | "findings";

export type HistoryEntityFilter =
  | "all"
  | "engagement"
  | "idr_document"
  | "adr_document"
  | "idr_line"
  | "adr_line"
  | "attachment"
  | "action_item"
  | "examination_ask"
  | "audit_report"
  | "finding";

export type HistoryDetailKind = "reason" | "status" | "title" | "default";

export interface EngagementHistoryItem {
  id: string;
  eventType: string;
  entityType: HistoryEntityFilter extends "all" ? string : HistoryEntityFilter;
  entityId: string;
  createdAt: string; // ISO — parse to Date in helpers
  metadata: Record<string, unknown>;
  actorUserId?: string;
  actorName: string | null;
  category: HistoryCategory | null;
  message: string;
  detail?: string;
  detailKind?: HistoryDetailKind;
  href?: string;
  lineKind?: "idr" | "adr";
  lineDisplayId?: string;
}

export interface HistoryActorOption {
  id: string;
  name: string;
  eventCount: number;
}

export interface HistoryFilters {
  category: HistoryCategory;
  entity: HistoryEntityFilter;
  actorId?: string;
  from?: Date;
  to?: Date;
  q?: string;
  sort: "asc" | "desc";
  page: number;
}

export interface EngagementHistoryPageData {
  engagement: {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    periodStart: string;
  };
  totalEvents: number;
  filterOptions: { actors: HistoryActorOption[] };
  history: {
    items: EngagementHistoryItem[];
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  filters: HistoryFilters;
}
```

### 6.3 Raw dummy shape (`EngagementHistory`)

Current loose type in repo — normalize on load:

```ts
interface EngagementHistory {
  engagement: { id; code; name; createdAt; periodStart };
  slaHealth: SlaHealth; // unused on this page
  totalEvents: number;
  filterOptions: { actors: HistoryActorOption[] };
  history: {
    items: Array<Record<string, unknown>>;
    page; totalPages; totalItems; pageSize;
  };
  filters: { category; entity; sort; page };
  allEvents?: EngagementHistoryItem[]; // optional seed expansion
}
```

### 6.4 Event type catalog (complete)

**Workflow:** `line.submitted` · `line.approved` · `line.rejected` · `line.created`

**Files:** `attachment.uploaded` · `document.imported`

**Engagement:** `engagement.created` · `engagement.phase_changed`

**Remediation:** `action_item.created` · `action_item.status_changed`

**Examination:** `examination.ask_created` · `examination.reaction_set`

**Findings:** `report.ingested` · `finding.created` · `finding.accepted` · `finding.disputed` · `finding.verified`

### 6.5 Field → UI mapping

| Field | UI block |
|---|---|
| `engagement.createdAt` | Header “Engagement started {date}” |
| `totalEvents` | Header event count · filter bar total when filtered count differs |
| `filterOptions.actors` | Actor `<select>` options |
| `history.items` (processed) | Timeline day groups |
| `filters.*` | Chip + form controlled defaults |
| `item.message` | Event row primary text |
| `item.detail` + `detailKind` | Detail block variant |
| `item.href` | Linked message |
| `item.actorName` | Event meta row |
| `item.eventType` | Icon + pill label |
| `item.category` | Rail color + pill (fallback: `categorizeEventType`) |

### 6.6 Seeded test engagement — `eng-rbi-it-exam-fy27`

| Field | Value |
|---|---|
| code | `RBI-IT-EXAM-FY27` |
| `periodStart` | 27 Apr 2026 |
| `engagement.createdAt` | 27 Apr 2026 |
| `totalEvents` | **20** (header count) |
| `filterOptions.actors` | Digvijay Joshi · 8 events |
| Default `history.items` | **8** events (see table) |
| `history.totalItems` (seed) | 8 |
| `history.pageSize` | 25 |
| `history.page` | 1 |
| `history.totalPages` | 1 |

**Default 8 events (newest first when `sort=desc`):**

| # | Date (en-IN) | Time | eventType | Category | Message (seed) |
|---|---|---|---|---|---|
| 1 | 23 Aug 2026 | 12:00 | `line.submitted` | workflow | Line submitted for review · L-004 |
| 2 | 22 Aug 2026 | 12:00 | `line.approved` | workflow | Line approved · L-001 |
| 3 | 21 Aug 2026 | 12:00 | `examination.ask_created` | examination | Examination ask A-008 captured |
| 4 | 20 Aug 2026 | 12:00 | `report.ingested` | findings | Draft audit report registered |
| 5 | 19 Aug 2026 | 16:00 | `finding.accepted` | findings | Finding F-007 accepted |
| 6 | 19 Aug 2026 | 06:00 | `action_item.created` | remediation | Action item AI-001 created |
| 7 | 17 Aug 2026 | 00:00 | `document.imported` | files | IDR document imported |
| 8 | 17 Aug 2026 | 04:00 | `engagement.created` | engagement | Engagement created |

**Day groups (desc):** 23 Aug (1) · 22 Aug (1) · 21 Aug (1) · 20 Aug (1) · 19 Aug (2) · 17 Aug (2) · 16 Aug (1 — engagement.created UTC 16 Aug 22:30 → displays as 17 Aug in en-IN depending on TZ; **accept either 16 or 17 Aug group** for that event).

**Overview recent activity (5 items)** is a **different slice** — do not expect 1:1 match with History first page. Messages differ slightly (overview has richer copy).

---

## 7. Algorithms (implement verbatim)

Colocate in `history-helpers.ts`. Port from v1 `lib/domain/engagement-history.ts` — **client-safe only** (no Prisma).

### 7.1 Constants

```ts
export const HISTORY_PAGE_SIZE = 25;

const WORKFLOW_EVENTS = ["line.submitted","line.approved","line.rejected","line.created"] as const;
const FILES_EVENTS = ["attachment.uploaded","document.imported"] as const;
const ENGAGEMENT_EVENTS = ["engagement.created","engagement.phase_changed"] as const;
const REMEDIATION_EVENTS = ["action_item.created","action_item.status_changed"] as const;
const EXAMINATION_EVENTS = ["examination.ask_created","examination.reaction_set"] as const;
const FINDINGS_EVENTS = ["report.ingested","finding.created","finding.accepted","finding.disputed","finding.verified"] as const;
```

### 7.2 `categorizeEventType(eventType: string): HistoryCategory | null`

Return category for known types; else `null`.

### 7.3 `getEventTypesForCategory(category: HistoryCategory): string[] | undefined`

Return array for specific category; `undefined` for `"all"`.

### 7.4 `parseHistoryFilters(params)`

```ts
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
  return ["engagement","idr_document","adr_document","idr_line","adr_line",
    "attachment","action_item","examination_ask","audit_report","finding"].includes(value);
}

export function parseHistoryFilters(params: Record<string, string | string[] | undefined>): HistoryFilters {
  const categoryParam = pickString(params.category);
  const entityParam = pickString(params.entity);
  const sortParam = pickString(params.sort);
  const fromParam = pickString(params.from);
  const toParam = pickString(params.to);

  const category: HistoryCategory =
    categoryParam === "workflow" || categoryParam === "files" ||
    categoryParam === "engagement" || categoryParam === "remediation" ||
    categoryParam === "examination" || categoryParam === "findings"
      ? categoryParam : "all";

  const entity: HistoryEntityFilter = isEntityFilter(entityParam) ? entityParam : "all";

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
```

### 7.5 `clampHistoryPage(page, totalItems, pageSize = HISTORY_PAGE_SIZE)`

```ts
const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
return Math.min(Math.max(1, page), totalPages);
```

### 7.6 `filterHistoryEvents(items, filters, options)`

Client-side filter matching v1 `buildWhereClause`:

```ts
function metadataRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object") return metadata as Record<string, unknown>;
  return {};
}

function matchesSearch(item: EngagementHistoryItem, q: string, actorNames: Map<string, string>): boolean {
  const meta = metadataRecord(item.metadata);
  const lower = q.toLowerCase();
  if (item.eventType.toLowerCase().includes(lower)) return true;
  if (item.message?.toLowerCase().includes(lower)) return true;
  if (item.lineDisplayId?.toLowerCase().includes(lower)) return true;
  if (item.actorName?.toLowerCase().includes(lower)) return true;
  const paths = ["lineId","filename","title","actionItemId","comment","findingCode","askCode"] as const;
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
    result = result.filter((i) => matchesSearch(i, filters.q!, new Map()));
  }

  return result;
}
```

### 7.7 `sortHistoryEvents(items, sort)`

```ts
return [...items].sort((a, b) => {
  const ta = new Date(a.createdAt).getTime();
  const tb = new Date(b.createdAt).getTime();
  return sort === "asc" ? ta - tb : tb - ta;
});
```

### 7.8 `formatEngagementHistoryMessage(item)`

Full switch — port verbatim from v1. Input shape:

```ts
Pick<EngagementHistoryItem, "eventType" | "metadata" | "actorName" | "lineDisplayId" | "lineKind">
```

Returns `{ message, detail?, detailKind? }`.

**Cases (all required):**

| Case | Message pattern | Detail |
|---|---|---|
| `line.submitted` | `{actor} submitted {IDR\|ADR} {lineId} for review` | comment → `reason`; else line ref |
| `line.approved` | `{actor} approved {lineRef}` | same |
| `line.rejected` | `{actor} rejected {lineRef}` | comment → `reason` |
| `line.created` | `{actor} created {lineRef}` | line ref |
| `document.imported` | `{actor} imported {count} {IDR\|ADR} line(s) from Excel` | count detail |
| `attachment.uploaded` | `{actor} uploaded {filename} [on lineRef]` | filename · size |
| `engagement.created` | `{actor} created this engagement` | name/code title |
| `action_item.created` | `{actor} created action item {id}` | title → `title` |
| `action_item.status_changed` | `{actor} updated action item {id}` | `{from} → {to}` → `status` |
| `examination.ask_created` | `{actor} captured Examination Ask {code}` | Responder: name |
| `examination.reaction_set` | `{actor} marked examination ask reaction as {reaction}` | — |
| `report.ingested` | `{actor} ingested report: {fileName}` | — |
| `finding.created` | `{actor} created finding {code}` | Severity → `status` |
| `finding.accepted` | `{actor} accepted a finding` | rationale slice → `reason` |
| `finding.disputed` | `{actor} disputed a finding` | reason slice → `reason` |
| `finding.verified` | `{actor} verified a finding` | — |
| `engagement.phase_changed` | `{actor} advanced engagement phase: {from} → {to}` | status detail |
| default | `{actor} — {eventType}` | metadata key:value fallback |

**Helpers inside file:** `formatFileSize`, `buildLineRefDetail`, `formatMetadataFallback`.

### 7.9 `resolveHistoryItemHref(engagementId, item)`

Port v1 `resolveLineHref` (attachment line parent optional — use metadata when no attachment map):

```ts
export function resolveHistoryItemHref(
  engagementId: string,
  item: Pick<EngagementHistoryItem, "entityType" | "entityId" | "metadata" | "lineKind" | "lineDisplayId">,
): { href?: string; lineKind?: "idr" | "adr"; lineDisplayId?: string } {
  const metadata = metadataRecord(item.metadata);
  const lineDisplayId =
    item.lineDisplayId ??
    (typeof metadata.lineId === "string" ? metadata.lineId : undefined);

  if (item.entityType === "idr_line") {
    return { href: `/engagements/${engagementId}/idr/lines/${item.entityId}`, lineKind: "idr", lineDisplayId };
  }
  if (item.entityType === "adr_line") {
    return { href: `/engagements/${engagementId}/adr/lines/${item.entityId}`, lineKind: "adr", lineDisplayId };
  }
  if (item.entityType === "action_item") {
    return { href: `/engagements/${engagementId}/remediation` };
  }
  if (item.entityType === "finding") {
    const code = typeof metadata.findingCode === "string" ? metadata.findingCode : undefined;
    return code ? { href: `/engagements/${engagementId}/findings/${code}` } : {};
  }
  if (item.entityType === "examination_ask") {
    return { href: `/engagements/${engagementId}/examination` };
  }
  if (item.entityType === "audit_report") {
    return { href: `/engagements/${engagementId}/report` };
  }
  if (item.entityType === "attachment") {
    const kind = metadata.lineKind === "adr" ? "adr" : "idr";
    return { lineKind: kind, lineDisplayId };
  }
  return {};
}
```

### 7.10 `normalizeHistoryItem(engagementId, raw): EngagementHistoryItem`

```ts
export function normalizeHistoryItem(
  engagementId: string,
  raw: Record<string, unknown>,
): EngagementHistoryItem {
  const eventType = String(raw.eventType ?? "");
  const lineInfo = resolveHistoryItemHref(engagementId, {
    entityType: String(raw.entityType ?? ""),
    entityId: String(raw.entityId ?? ""),
    metadata: raw.metadata,
    lineKind: raw.lineKind as "idr" | "adr" | undefined,
    lineDisplayId: raw.lineDisplayId as string | undefined,
  });
  const formatted = formatEngagementHistoryMessage({
    eventType,
    metadata: raw.metadata,
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
    category: (raw.category as HistoryCategory | null) ?? categorizeEventType(eventType),
    message: typeof raw.message === "string" ? raw.message : formatted.message,
    detail: typeof raw.detail === "string" ? raw.detail : formatted.detail,
    detailKind: (raw.detailKind as HistoryDetailKind | undefined) ?? formatted.detailKind,
    href: (raw.href as string | undefined) ?? lineInfo.href,
    lineKind: lineInfo.lineKind,
    lineDisplayId: lineInfo.lineDisplayId,
  };
}
```

### 7.11 `buildHistoryHref(engagementId, filters: Partial<HistoryFilters>)`

Build URL — omit default params:

- Skip `category` when `all`
- Skip `entity` when `all`
- Skip `sort` when `desc`
- Skip `page` when `1`
- Include `actor`, `from`, `to`, `q` when set

### 7.12 `groupHistoryByDay(items)`

Group **already paginated page items** by UTC date key `createdAt.slice(0,10)`.

Day label: `Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" })`.

Preserve item order within group (do not re-sort inside group).

### 7.13 `getEmptyHistoryMessage(category: HistoryCategory)`

| Category | Message |
|---|---|
| `workflow` | No workflow events in this date range. |
| `files` | No file or import events in this date range. |
| `engagement` | No engagement events in this date range. |
| `remediation` | No remediation or action item events in this date range. |
| `examination` | No examination events in this date range. |
| `findings` | No findings events in this date range. |
| `all` / default | No audit events match your filters. |

### 7.14 `formatActiveFilterSummary(filters, actorName?)`

Build `" · "`-joined summary:

- Category label when not `all`
- Entity label when not `all`
- Actor name when `actorId` set
- Date range `{from} – {to}` with `…` for missing bound
- `"q"` in quotes when search set
- `Oldest first` when `sort === "asc"`
- Default text: `All events in date range`

Entity/category label maps — port `ENTITY_LABELS` and `CATEGORY_LABELS` from v1.

### 7.15 `buildEngagementHistoryPageData(engagementId, raw, filters)`

Orchestrator:

```ts
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

  const source = (raw.allEvents ?? raw.history.items) as Record<string, unknown>[];
  const normalized = source.map((item) => normalizeHistoryItem(engagementId, item));

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
```

### 7.16 Clear filters behavior

**Clear** link href = `buildHistoryHref(engagementId, { from: filters.from, to: filters.to })` — resets category, entity, actor, q, sort, page but **keeps effective date range** (periodStart → today). Matches v1.

---

## 8. UI specification

### 8.1 Page header (`history-page-header.tsx`)

**H2:** `History & audit trail`

**Subtitle (single line):**

```
Immutable audit trail · {totalEvents} event(s) captured · Engagement started {formatEngagementDate(createdAt)}
```

- `formatEngagementDate`: `en-IN` · `day: 2-digit, month: short, year: numeric`
- Pluralize `event` vs `events`

**Test engagement:** `Immutable audit trail · 20 events captured · Engagement started 27 Apr 2026`

### 8.2 Category chip row (`history-filter-bar.tsx` — part 1)

Seven links in `flex flex-wrap gap-2`:

| Value | Label |
|---|---|
| `all` | All |
| `workflow` | Workflow |
| `files` | Files |
| `engagement` | Engagement |
| `examination` | Examination |
| `findings` | Findings |
| `remediation` | Remediation |

Each link: `buildHistoryHref(engagementId, { ...filters, category, page: 1 })`.

Active chip: `variant="secondary"` + `shadow-sm`.

### 8.3 Advanced filter form (`history-filter-bar.tsx` — part 2)

**Form:** `method="get"` · `action=/engagements/{id}/history`

Hidden input: `category` = current category.

**Fields row** (`flex flex-wrap items-end gap-3`):

| Field | id | name | Control |
|---|---|---|---|
| Entity | `history-entity` | `entity` | `<select>` · ENTITY_OPTIONS |
| Actor | `history-actor` | `actor` | `<select>` · empty option `All actors` · `{name} ({eventCount})` |
| From | `history-from` | `from` | `<input type="date">` · default `filters.from` |
| To | `history-to` | `to` | `<input type="date">` · default `filters.to` |
| Search | `history-q` | `q` | `<input type="search">` · placeholder `Line id, file, actor…` |
| Sort | `history-sort` | `sort` | `<select>` · Newest first (`desc`) · Oldest first (`asc`) |

**Actions:**
- **Apply** — `Button type="submit" size="sm" className="h-9"`
- **Clear** — ghost link to clearHref §7.16

**Count line** (right-aligned, wraps on mobile):

```
Showing {showingStart}–{showingEnd} of {totalItems} ({totalEvents} total)
```

Omit `({totalEvents} total)` when `totalItems === totalEvents`.

Where:
- `showingStart = totalItems === 0 ? 0 : (page-1)*pageSize + 1`
- `showingEnd = min(page*pageSize, totalItems)`

**Active filters footer:**

```
Active filters: {activeSummary} · Date range defaults to engagement period through today
```

Use `formatActiveFilterSummary`.

**Form remount key:** join filter fields with `|` — ensures controlled defaults update on navigation (v1 `formKey` pattern).

### 8.4 Chronological feed card (`history-timeline.tsx`)

**Outer:** §4.1 timeline card classes.

**Header row:**
- **H3:** `Chronological feed` · `text-sm font-semibold`
- **Sort toggle (right):**
  - Label: `Newest first` or `Oldest first` · `font-mono text-[12px] text-muted-foreground`
  - Link button ghost sm: icon `ArrowDownUpIcon` + `Sort`
  - href: toggle sort, reset `page: 1`
  - `title`: `Show oldest first` / `Show newest first`

**Body** (`px-4 py-5 sm:px-5`):

- **Empty:** centered `py-8 text-sm text-muted-foreground` · `getEmptyHistoryMessage(category)`
- **Non-empty:** `space-y-8` of day groups

**Pagination:** `HistoryPagination` §8.7 at card footer · `showCount={false}` (count lives in filter bar).

### 8.5 Day group (`history-day-group.tsx`)

```tsx
<section>
  <div className="mb-3 flex items-baseline gap-2 border-b border-border/60 pb-2">
    <h3>{dayLabel}</h3>
    <span>— {items.length} event(s)</span>
  </div>
  <div className="divide-y divide-border/40">
    {items.map(...HistoryEventRow)}
  </div>
</section>
```

### 8.6 Event row (`history-event-row.tsx`)

**Layout:** `flex gap-4 py-3`

**Column 1 — time:** `<time dateTime={iso}>` · `formatEventTime` · `en-IN` · day omitted (time only): `hour: 2-digit, minute: 2-digit` with `day: 2-digit, month: short` — **use v1 format:**

```ts
Intl.DateTimeFormat("en-IN", {
  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
})
```

**Column 2 — rail:** dot + vertical line except last in group.

**Column 3 — content:**

Meta row (`flex flex-wrap items-center gap-2 text-[12px]`):
1. Actor — `{actorName ?? "System"}`
2. Separator `·` · `aria-hidden`
3. Category pill — event type pill label §4.3
4. Icon — sm+ only

Message row — link if `href` else paragraph.

Detail block — switch on `detailKind`:

| Kind | Prefix |
|---|---|
| `reason` | **Reason:** |
| `status` | **Status:** (mono value) |
| `title` | **Title:** (action items) + quoted detail |
| `default` | plain detail |

### 8.7 Pagination (`history-pagination.tsx`)

Port v1 `TablePagination`:

- Hide entirely when `totalItems <= pageSize`
- Footer: `flex items-center justify-end gap-2 border-t border-border px-4 py-3`
- **Previous** / **Next** outline sm buttons · disabled when at bounds
- Center: `Page {page} of {totalPages}`
- Links via `buildHistoryHref(engagementId, { ...filters, page })`

### 8.8 Audit display helpers (`history-audit-display.ts`)

Export:
- `getAuditEventIcon`
- `getHistoryEventCategory` — extend for examination + findings event types (map to category for rail/pill)
- `getHistoryCategoryRailClass`
- `getHistoryCategoryPillClass`
- `getHistoryEventTypePill`

---

## 9. File structure

```
app/engagements/[id]/
  history/
    page.tsx                              # RSC — load + parse + build page data
    _components/
      history-view.tsx                    # client shell if needed (optional — can be RSC-only)
      history-page-header.tsx
      history-filter-bar.tsx
      history-timeline.tsx
      history-day-group.tsx
      history-event-row.tsx
      history-pagination.tsx
      history-helpers.ts                  # §7 algorithms
      history-audit-display.ts            # §4.3–4.4 icons/pills
  _components/
    engagement-subnav.tsx                 # MODIFY — add History tab
```

**Do not:** add `lib/history/` top-level domain folder · new write APIs · org-wide routes.

**Import style:**

```tsx
import { getEngagementHistoryApi } from "@/lib/api/engagements";
import { buildEngagementHistoryPageData, parseHistoryFilters } from "./_components/history-helpers";
```

**Optional shared pagination:** If other modules need it, promote `history-pagination.tsx` → `components/ui/table-pagination.tsx` — same API as v1.

---

## 10. Client state, URL sync, accessibility

### 10.1 URL as source of truth

- Category chips → `<Link href>` (full navigation)
- Filter form → GET submit
- Sort toggle → `<Link>`
- Pagination → `<Link>`
- No React `useState` for filter values except optional optimistic UI — **avoid**; prefer full RSC refresh on param change.

### 10.2 Accessibility

| Element | Requirement |
|---|---|
| Category chips | `aria-current="page"` on active chip |
| Form labels | `htmlFor` on all inputs |
| Search | `aria-label="Search audit events"` |
| Sort link | `title` describes toggle direction |
| Timeline | day groups use `<section>` with visible headings |
| Event times | semantic `<time dateTime>` |
| Pagination | disabled buttons not focus-trapped · link alternatives |
| Empty state | not `role="alert"` — informational only |
| Focus | `controlFocusClass` on inputs per design system |

### 10.3 Scope — in / out

**In:** full History page · subnav tab · filter/pagination/timeline · message formatters · deep links · overview “View full history” link (coordination).

**Out:** backend audit writers · event delete/edit · org history · SLA band on this page · team role History access · exporting CSV · real-time websocket updates.

---

## 11. Verification checklist (`eng-rbi-it-exam-fy27`)

| # | Check | Expected |
|---|---|---|
| 1 | `/history` loads | No errors · 404 for bad engagement id |
| 2 | Subnav | **History** tab active · 8 tabs total |
| 3 | Header | `20 events captured` · started `27 Apr 2026` |
| 4 | Default list | 8 events · newest first |
| 5 | Day groups | Multiple days · event counts in headings |
| 6 | Category Workflow | 2 events (submitted + approved) |
| 7 | Category Examination | 1 event (A-008) |
| 8 | Category Findings | 2 events (report + finding) |
| 9 | Category Remediation | 1 event (AI-001) |
| 10 | Category Files | 1 import event |
| 11 | Category Engagement | 1 created event |
| 12 | Actor filter | Digvijay Joshi shows all 8 |
| 13 | Search `L-004` | 1 workflow event |
| 14 | Sort asc | Oldest first · engagement.created near top |
| 15 | Empty filter | Set `q=zzzzz` → empty message |
| 16 | Clear | Resets q/category · keeps date range |
| 17 | Count line | `Showing 1–8 of 8 (20 total)` |
| 18 | Active summary | `All events in date range` when defaults |
| 19 | Event row | Actor · pill · time · message visible |
| 20 | Line link | IDR line events link to `/idr/lines/{entityId}` when href resolved |
| 21 | Pagination hidden | 8 items ≤ 25 page size |
| 22 | Motion | Page enter once · no re-stagger on filter |
| 23 | Read-only | No delete/edit controls |
| 24 | Overview link | “View full history” navigates here (when added) |

---

## 12. Implementation tasks

### Task 1: Route + data pipeline

**Files:** `history/page.tsx`, `history-helpers.ts`

- [ ] `parseHistoryFilters` · `buildEngagementHistoryPageData` §7
- [ ] `normalizeHistoryItem` + formatters §7.8–7.10

### Task 2: Audit display helpers

**File:** `history-audit-display.ts`

- [ ] Icons §4.4 · pills §4.3 · category colors §4.2 incl. examination/findings

### Task 3: Page header

**File:** `history-page-header.tsx`

- [ ] §8.1 copy + date format

### Task 4: Filter bar

**File:** `history-filter-bar.tsx`

- [ ] Category chips §8.2 · form §8.3 · clear behavior §7.16

### Task 5: Timeline

**Files:** `history-timeline.tsx`, `history-day-group.tsx`, `history-event-row.tsx`

- [ ] §8.4–8.6 · sort toggle · empty states

### Task 6: Pagination

**File:** `history-pagination.tsx`

- [ ] §8.7 · hide when single page

### Task 7: Subnav + overview link

**Files:** `engagement-subnav.tsx`, `overview-activity-feed.tsx`

- [ ] History tab last · overview footer link §3.4

### Task 8: Types cleanup

**File:** `lib/types/engagement.ts`

- [ ] Tighten `EngagementHistoryItem` optional `allEvents` on raw type

---

## 13. Definition of done

- [ ] `/engagements/[id]/history` renders full audit ledger per §8  
- [ ] All §7 algorithms ported with unit-test parity (optional vitest)  
- [ ] All 7 category filters + entity/actor/date/search/sort/page work via URL  
- [ ] Timeline groups by day · event rows show actor, pill, message, optional detail/link  
- [ ] Pagination appears when >25 filtered items  
- [ ] History subnav tab added  
- [ ] Overview “View full history” link added  
- [ ] No write paths · no org route · CO-only documented for production  
- [ ] §11 checklist passes on `eng-rbi-it-exam-fy27`  
- [ ] Motion follows §5 · Assure tokens §4 (no v1 custom fonts)

---

## 14. Recommended build order

1. `history-helpers.ts` — algorithms + tests  
2. `history-audit-display.ts`  
3. `history/page.tsx` + header  
4. Filter bar (chips + form)  
5. Timeline + day group + event row  
6. Pagination  
7. Subnav tab + overview link  
8. Full §11 verification pass

---

## 15. Agent notes

**Overview doc conflict:** [`overview.md`](../engagement-overview/overview.md) §1 said “No `/history` route”. This spec **adds** the route intentionally — update overview when implementing.

**`totalEvents` vs `items.length`:** Header always shows `totalEvents` (20). Filter bar may show filtered subset (8). This matches v1 when not all events are in dummy page slice.

**Seed expansion:** To test pagination, add 26+ rows to `history.allEvents` in `Data.json` — optional, not blocking v1 parity.

**Message formatting:** Overview `recentActivity` uses hand-written messages; History may use seed `message` or formatter — slight copy differences are OK.

**Team users:** Do not link History in team-facing nav when auth arrives; line detail audit remains team-visible.

**Phase changed:** UI must render formatter output if event ever appears in seed; do not add seed writer.

**Timezone:** en-IN day grouping uses local TZ from runtime — accept ±1 day boundary for UTC evening timestamps (noted in §6.6).

**Finding links:** Require `metadata.findingCode` for deep link; seed `finding.accepted` may lack code — link optional.

**Production API future:** Replace `buildEngagementHistoryPageData` client filter with server-side `GET /history?...` — keep same URL param contract and UI components unchanged.
