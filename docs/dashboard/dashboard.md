# Dashboard — Complete UI Rebuild Specification

> **Purpose:** Self-contained, pixel-level rebuild spec for `/dashboard` — the CO **org risk command center** (home screen).  
> **Audience:** Engineers or agents rebuilding this screen in **any** codebase with **no** access to other repos, legacy apps, or tribal knowledge.  
> **Scope:** UI only — layouts, copy, tokens, motion, chart algorithms, KPI drill-downs. No auth, no backend, no live polling.  
> **Design name:** **Risk pulse** — industrial risk-desk home that answers *what needs attention now* — not a vanity metrics wall.

**Definition of the module:** The Dashboard is the CO landing page after login (`/` redirects here). It surfaces org-wide SLA health, line workload pressure (IDR vs ADR), review flow momentum (24h), phase risk distribution, active engagements at a glance, and a 24-hour activity feed. Every primary visual links to filtered engagement lists, inbox, or engagement overview.

**Architecture:** RSC page loads `OrgDashboard` via extended `getDashboardApi()` (or `buildOrgDashboardViewModel()` over dummy aggregates). Pure CSS/SVG visuals — **no chart library**. Presentation only.

**Tech stack (source repo):** Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn **radix-mira** · `motion` v12 via `@/lib/motion` · `lucide-react` icons.

**Companion docs:** [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) · [`lib/motion/ANIMATION.md`](../../lib/motion/ANIMATION.md) · [`docs/inbox/inbox.md`](../inbox/inbox.md) · [`docs/remediation/remediation.md`](../remediation/remediation.md) · [`docs/engagement-overview/overview.md`](../engagement-overview/overview.md) · phase plan [`development-plan/09-co-inbox-dashboard.md`](../../../development-plan/09-co-inbox-dashboard.md) · v1 design [`itex-v1/docs/superpowers/specs/2026-06-03-dashboard-risk-command-center-design.md`](../../../itex-v1/docs/superpowers/specs/2026-06-03-dashboard-risk-command-center-design.md).

---

## 0. How to use this document

1. Read §1–§3 (constraints, route, layout philosophy).  
2. Copy design tokens (§4) and motion rules (§5) — **read §4.5 premium UI** carefully.  
3. Implement types and loader per §6 — extend `lib/types/dashboard.ts`, `lib/api/dashboard.ts`.  
4. Implement every algorithm in §7 verbatim in `dashboard-helpers.ts`.  
5. Build each UI block per §8 — every label, class, empty state, and drill-down href is specified.  
6. Follow file layout §9; wire accessibility §10.  
7. Verify against §11 checklist.  
8. Track build progress with §12 tasks.

---

## 1. Hard constraints

| Rule | Detail |
|---|---|
| **UI only** | No HTTP endpoints, DB schema, or server actions. |
| **Read-only data** | `getDashboardApi()` → full `OrgDashboard`. May aggregate `views.engagementsList`, optional `views.orgDashboard`, and engagement `overview.recentActivity` slices. |
| **No chart library** | Stacked bars, ring gauge, and flow strips are **CSS/SVG only** (v1 parity). |
| **No Recharts / D3 / Chart.js** | Forbidden. |
| **CO-only (production)** | Teams redirect to `/my-plate`. UI-only build: no auth gate. |
| **No live updates** | No websockets, polling, or notification bell. |
| **No date range picker** | 24h activity window is fixed (v1). |
| **No export** | Out of scope. |
| **Drill-down hrefs** | KPI tiles and health chips link to `/engagements?status=active&urgency=…` (documented in §8). |
| **My Plate dashboard** | `views.myPlate.dashboard` is **team** home — separate spec; do not merge into CO dashboard. |
| **Dummy data** | Do not mutate `Data.json` at runtime. Optional one-time seed: `views.orgDashboard` for exact chart numbers. |

---

## 2. Routes and navigation map

### 2.1 Primary route

```
/dashboard
```

**Entry paths:**
- App root `/` → redirect `/dashboard`  
- Login success → `/dashboard`  
- Navbar logo → `/dashboard`  
- App shell nav → **Dashboard** (first item)

**Exit paths (quick actions & drill-downs):**

| Control | Target |
|---|---|
| Header **Engagements** | `/engagements` |
| Header **New engagement** | `/engagements/new` |
| Header **Inbox** (optional quick chip) | `/inbox` or `/inbox?tab=review` |
| KPI tiles | filtered `/engagements?…` |
| SLA health chips | urgency filters on engagements list |
| Engagement table row | `/engagements/{id}` |
| View all engagements | `/engagements?status=active` |
| Line workload cards | `/engagements?status=active` |

### 2.2 Urgency query params (engagements list — consumer of dashboard links)

Document these for engagements list implementation:

| Param | Meaning |
|---|---|
| `status=active` | active engagements only |
| `urgency=due48h` | engagements with `dueWithin48h > 0` |
| `urgency=overdue` | engagements with `overdue > 0` |
| `urgency=breach7d` | engagements with SLA breach in last 7 days |

---

## 3. Page shell and layout

### 3.1 Server page

```tsx
// app/dashboard/page.tsx
import { DashboardView } from "@/app/dashboard/_components/dashboard-view";
import { getDashboardApi } from "@/lib/api/dashboard";

export default async function DashboardPage() {
  const dashboard = await getDashboardApi();
  return <DashboardView dashboard={dashboard} />;
}
```

Use `export const dynamic = "force-dynamic"` if reference date must reflect runtime (optional).

### 3.2 Layout shell

```tsx
<main className="min-h-[calc(100dvh-3.5rem)]">
  <PageReveal className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6">
    <SectionStagger className="flex flex-col gap-8">
      {/* sections §3.3 */}
    </SectionStagger>
  </PageReveal>
</main>
```

Max width `max-w-7xl` — command center breathes on large monitors without feeling empty on laptop.

### 3.3 Vertical sections (premium layout)

```
§8.1  Page header + quick actions
§8.2  Attention strip (overdue / review nudges) — Assure enhancement
§8.3  Section 1 — KPI strip panel ("Key metrics")
§8.4  Section 2 — Hero analytics grid
        Row A: SLA health ring (lg:4) + Line workload (lg:8)
        Row B: Review flow (md:6) + Phase risk (md:6)
§8.5  Section 3 — Bottom split (xl:12)
        Active engagements table (xl:7) + Recent activity timeline (xl:5)
```

**Visual rhythm:** Three `SectionStagger` children with classes `dashboard-section-1`, `dashboard-section-2`, `dashboard-section-3` for optional stagger delays (40ms / 80ms / 120ms).

**Design intent:** Top = *numbers & drill-down* · Middle = *risk visualization* · Bottom = *actionable lists*. User never scrolls more than ~1.5 viewports on 1440×900 to see overdue work.

---

## 4. Design tokens

Reuse [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) and IDR §4 for cards, borders, focus.

### 4.1 Dashboard panel chrome (`dashboard-panel.tsx`)

```tsx
// Container
"overflow-hidden rounded-lg border border-border bg-card shadow-xs"

// Header (when title present)
"flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-border bg-muted/40 px-4 py-3"

// Title
"text-sm font-semibold leading-snug text-foreground"

// Description
"mt-0.5 text-xs leading-snug text-muted-foreground"

// Body default
"p-4"
```

Panels use **subtle** `bg-muted/40` headers — not heavy gray blocks.

### 4.2 SLA semantic colors

| Token | Use |
|---|---|
| `--sla-ok` / `text-sla-ok` / `bg-sla-ok` | On track |
| `--sla-warn` | Due ≤48h |
| `--sla-breach` / `text-sla-breach` | Overdue |
| `--sla-complete` | Approved / done |

Ring stroke uses CSS variables: `var(--sla-breach)`, `var(--sla-warn)`, `var(--sla-ok)`.

### 4.3 KPI tile tones (`MetricTile` pattern)

| Tone | When | Value color |
|---|---|---|
| `default` | neutral counts | `text-foreground` |
| `warn` | due48h or breaches7d > 0 | `text-sla-warn` |
| `danger` | overdue > 0 | `text-sla-breach` |

Compact variant: `variant="compact"` · icon `size-3.5` · optional `MetricBar` micro visual.

### 4.4 Chart bar segments

| Segment | Class |
|---|---|
| On track | `bg-sla-ok/70` or `bg-sla-ok/50` |
| Due soon | `bg-sla-warn/80` |
| Overdue | `bg-sla-breach/80` |
| Review intake | `bg-chart-1/75` |
| Empty track | `bg-muted` or `bg-muted-foreground/15` |

Bar animation class: `dashboard-bar-grow` (width transition on mount).

### 4.5 Premium UI — Assure command center (required)

These elevate v1 from functional to **production-grade** without new dependencies:

**A. Page header hierarchy**
- H1: **Dashboard** · `text-2xl font-bold tracking-tight sm:text-3xl`
- Description: `Org risk pulse — jump into overdue work or open an engagement.`
- Meta line (right or below on mobile): `{tenant.name}` · `{formatHeaderDate()}` — e.g. `Nexus Bank India Ltd · 31 August 2026`
- Actions row: **Inbox** outline (optional badge with review count from inbox seed) · **Engagements** outline · **New engagement** primary

**B. Attention strip** (`dashboard-attention-strip.tsx`) — render when `kpis.overdue > 0` OR inbox review count > 0:

Horizontal scroll-safe flex of pill links:

```
⚠ 6 overdue lines org-wide          → /engagements?status=active&urgency=overdue
📋 13 items awaiting review         → /inbox?tab=review
```

Pills: `rounded-full border px-3 py-1 text-xs font-medium` · overdue uses `border-sla-breach/40 bg-sla-breach/5 text-sla-breach` · review uses `border-primary/30 bg-primary/5 text-primary`

**C. Asymmetric hero grid**
- SLA ring gets **accent border** when at risk: `border-sla-breach/30` or `border-sla-warn/30`
- Line workload cards: icon well `size-7 rounded-md bg-primary/10 text-primary` · hover `hover:bg-muted/30`
- Charts use consistent `border-border/60 shadow-sm` on panels

**D. Active engagements table polish**
- Left **risk stripe** `w-0.5 rounded-r` — breach/warn/ok from row overdue/due48h
- Engagement name truncates with `title` tooltip
- **Open** column: mini stacked bar (sm+) + count — see §8.10
- Row height `h-10` — dense but readable

**E. Activity timeline polish**
- Circular icon wells `size-8 rounded-full` with semantic bg tints
- Actor name **semibold** · event pill label from history display helpers
- Relative time right-aligned `text-[11px] tabular-nums`
- Full-height panel on xl (`h-full min-w-0`) aligning with table card

**F. Empty states**
- No engagements: centered `FolderIcon` · **No active engagements** · CTA **New engagement**
- No activity: **No activity yet** · 24h copy

**G. No donut charts for SLA buckets** — health is **score ring** only (v1 design decision).

### 4.6 Typography (dashboard-specific)

| Element | Classes |
|---|---|
| Ring center % | `text-2xl font-medium tabular-nums tracking-tight` |
| Ring label | `text-[10px] uppercase tracking-wider text-muted-foreground` |
| Health chip value | `text-lg font-semibold tabular-nums` |
| Table phase badge | `font-mono text-[10px] rounded bg-muted px-1.5 py-0.5` |
| Activity message | `text-sm leading-snug text-foreground/90 break-words` |

---

## 5. Motion system

Same core tokens as IDR §5 plus dashboard-specific CSS:

| Moment | Pattern |
|---|---|
| Page mount | `PageReveal` + `SectionStagger` · 3 sections |
| KPI tiles | stagger `animationDelay: index * 40ms` |
| Ring segment | `.dashboard-ring-segment` stroke dash animate once |
| Bar segments | `.dashboard-bar-grow` width transition · `duration.barFill` |
| Activity rows | stagger `index * 40ms` on first paint |
| Filter navigation | full page nav — no remount stagger on return |

**Reduced motion:** Instant bar/ring fills · no stagger delays · opacity-only page enter.

**CSS hooks (globals or module):**

```css
.dashboard-bar-grow {
  transition: width var(--motion-bar-fill, 450ms) cubic-bezier(0.23, 1, 0.32, 1);
}
.dashboard-ring-segment {
  transition: stroke-dasharray var(--motion-bar-fill, 450ms) cubic-bezier(0.23, 1, 0.32, 1);
}
@media (prefers-reduced-motion: reduce) {
  .dashboard-bar-grow,
  .dashboard-ring-segment {
    transition: none;
  }
}
```

---

## 6. Data contract

### 6.1 Loader (extend existing)

Current `getDashboardApi()` returns minimal `DashboardSummary`. **Extend** to full `OrgDashboard`:

```ts
getDashboardApi(): Promise<OrgDashboard>
```

**Implementation strategy (pick one):**

1. **Recommended:** Add `views.orgDashboard` to `Data.json` with full payload — loader returns it merged with live `engagementsList` for table rows.  
2. **Fallback:** `buildOrgDashboardViewModel()` in `dashboard-helpers.ts` aggregates from `engagementsList` + summed engagement `overview.kpis` + merged `recentActivity`.

### 6.2 TypeScript interfaces (`lib/types/dashboard.ts`)

```ts
export interface OrgDashboardKpis {
  activeEngagements: number;
  openIdrLines: number;
  openAdrLines: number;
  dueWithin48h: number;
  overdue: number;
  slaBreaches7d: number;
  phaseSummary: string;
}

export interface LineRiskBucket {
  open: number;
  onTrack: number;
  dueWithin48h: number;
  overdue: number;
}

export interface DashboardLineRisk {
  idr: LineRiskBucket;
  adr: LineRiskBucket;
}

export interface ReviewFlow {
  intake: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface PhaseRiskItem {
  phase: string;
  activeCount: number;
  dueWithin48h: number;
  overdue: number;
}

export interface OrgActivityItem {
  id: string;
  eventType: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  engagementCode: string | null;
  engagementName: string | null;
  actorName: string | null;
  message?: string; // optional preformatted from seed
}

export interface OrgDashboard {
  tenant: Tenant;
  kpis: OrgDashboardKpis;
  lineRisk: DashboardLineRisk;
  reviewFlow: ReviewFlow;
  phaseRisk: PhaseRiskItem[];
  activeEngagements: EngagementListItem[]; // max 8 displayed
  recentActivity: OrgActivityItem[];       // max 12 · last 24h
  attention?: {
    inboxReviewCount?: number;
  };
}
```

Keep legacy `DashboardSummary` as deprecated alias or remove after migration.

### 6.3 Field → UI mapping

| Field | UI block |
|---|---|
| `tenant.name` | Header meta |
| `kpis.*` | KPI strip + SLA ring inputs |
| `kpis.phaseSummary` | Active engagements KPI subtext |
| `lineRisk.idr/adr` | Line workload chart |
| `reviewFlow` | Review flow chart |
| `phaseRisk[]` | Phase mix chart |
| `activeEngagements[]` | Bottom table (slice 8) |
| `recentActivity[]` | Activity timeline |
| `attention.inboxReviewCount` | Attention strip + header Inbox badge |

### 6.4 Seeded aggregates (from `views.engagementsList` — fallback builder)

| Metric | Computed from list |
|---|---|
| `activeEngagements` | count where `status === "active"` → **5** |
| `dueWithin48h` | sum of field → **11** (4+2+2+2+1) |
| `overdue` | sum → **6** (3+1+1+0+1) |
| `openIdrLines` + `openAdrLines` | sum each engagement `overview.kpis.idrOpen/adrOpen` when builder walks engagements — or use seed |

**Suggested seed KPIs for charts (when using `views.orgDashboard`):**

| KPI | Suggested value |
|---|---|
| openIdrLines | ~28 |
| openAdrLines | ~18 |
| slaBreaches7d | ~4–6 |
| phaseSummary | `5 IDR + ADR` (all seed engagements same phase label) |

**Review flow (24h — illustrative):** intake 4 · submitted 6 · approved 3 · rejected 1

**Recent activity:** merge RBI overview `recentActivity` (5 items) + optionally other engagements · sort desc · take 12 · prefer events within 24h of `referenceDate` (`2026-08-25` in Data.json)

**Active table rows:** first **8** of `engagementsList` sorted by risk (`overdue + dueWithin48h` desc, then `nextDueDate` asc).

---

## 7. Algorithms (implement verbatim)

Colocate in `dashboard-helpers.ts`.

### 7.1 `buildPhaseSummary(engagements: EngagementListItem[])`

```ts
function buildPhaseSummary(engagements: EngagementListItem[]): string {
  const counts = { idr: 0, adr: 0, both: 0, complete: 0 };
  for (const e of engagements) {
    switch (e.phase) {
      case "IDR": counts.idr++; break;
      case "ADR": counts.adr++; break;
      case "IDR + ADR": counts.both++; break;
      default: counts.complete++; break;
    }
  }
  const parts: string[] = [];
  if (counts.idr) parts.push(`${counts.idr} in IDR`);
  if (counts.adr) parts.push(`${counts.adr} in ADR`);
  if (counts.both) parts.push(`${counts.both} IDR + ADR`);
  if (counts.complete) parts.push(`${counts.complete} complete`);
  return parts.length ? parts.join(" · ") : "No active line work";
}
```

**Seed:** `5 IDR + ADR`

### 7.2 `buildLineRisk(summary: { open; dueWithin48h; overdue })`

```ts
function buildLineRisk(summary: { open: number; dueWithin48h: number; overdue: number }): LineRiskBucket {
  return {
    open: summary.open,
    onTrack: Math.max(0, summary.open - summary.dueWithin48h - summary.overdue),
    dueWithin48h: summary.dueWithin48h,
    overdue: summary.overdue,
  };
}
```

Split IDR/ADR totals from summed engagement KPIs or seed `lineRisk`.

### 7.3 SLA health score

```ts
function getSlaHealth(kpis: OrgDashboardKpis) {
  const totalOpen = kpis.openIdrLines + kpis.openAdrLines;
  const onTrack = Math.max(0, totalOpen - kpis.dueWithin48h - kpis.overdue);
  const healthyPct = totalOpen > 0 ? Math.round((onTrack / totalOpen) * 100) : 100;
  const tone = kpis.overdue > 0 ? "danger" : kpis.dueWithin48h > 0 ? "warn" : "default";
  return { totalOpen, onTrack, healthyPct, tone };
}
```

### 7.4 `buildReviewFlow(events: { eventType: string }[])`

Count from 24h audit events:

| eventType | Bucket |
|---|---|
| `line.created`, `document.imported` | intake |
| `line.submitted` | submitted |
| `line.approved` | approved |
| `line.rejected` | rejected |

### 7.5 `buildPhaseRisk(engagements: EngagementListItem[])`

Group by `phase` field · sum `dueWithin48h`, `overdue`, `activeCount` per phase · sort by `(overdue + dueWithin48h)` desc, then phase name asc.

### 7.6 `countSlaBreaches7d(lines)`

For each open line with `dueDate`: count if `dueDate < now` AND `dueDate >= now - 7 days`. Approved lines excluded. Builder may use seed `slaBreaches7d` when line-level data unavailable.

### 7.7 Activity formatters

Port v1 verbatim:

```ts
function formatActivityMessage(item: OrgActivityItem): string {
  if (item.message) return item.message;
  const metadata = item.metadata ?? {};
  const lineId = typeof metadata.lineId === "string" ? metadata.lineId : undefined;
  const engagementLabel = item.engagementCode ?? "engagement";
  switch (item.eventType) {
    case "line.submitted":
      return lineId
        ? `Line ${lineId} submitted for review in ${engagementLabel}.`
        : `Line submitted for review in ${engagementLabel}.`;
    case "line.approved":
      return lineId ? `Line ${lineId} approved in ${engagementLabel}.` : `Line approved in ${engagementLabel}.`;
    case "line.rejected":
      return lineId ? `Line ${lineId} rejected in ${engagementLabel}.` : `Line rejected in ${engagementLabel}.`;
    case "line.created":
      return lineId ? `Line ${lineId} created in ${engagementLabel}.` : `New line created in ${engagementLabel}.`;
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

function formatRelativeTime(iso: string, now = Date.now()): string {
  const diffMs = now - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}
```

### 7.8 Table helpers

```ts
function formatHeaderDate(): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date());
}

function nextSlaLabel(nextDueDate: string | null) {
  if (!nextDueDate) return { label: "—", variant: "secondary" as const };
  const sla = computeSlaState(new Date(nextDueDate), "in_progress");
  if (sla.variant === "breach" || sla.variant === "warn") {
    return { label: sla.label, variant: "outline" as const };
  }
  return { label: formatDate(nextDueDate), variant: "secondary" as const };
}

function engagementRiskTone(e: EngagementListItem) {
  if (e.overdue > 0) return "bg-sla-breach";
  if (e.dueWithin48h > 0) return "bg-sla-warn";
  return "bg-sla-ok";
}
```

Port `computeSlaState` from remediation/inbox helpers (same as v1 `sla.ts`).

### 7.9 `buildOrgDashboardViewModel(dummy: DummyData): OrgDashboard`

Orchestrator:
1. Load `engagementsList` filtered active  
2. Sum KPI fields · build phaseSummary  
3. Load or compute `lineRisk`, `reviewFlow`, `phaseRisk`  
4. Slice `activeEngagements` to 8 by risk sort  
5. Merge recent activity from engagement overviews · filter last 24h · take 12  
6. Attach `tenant` · optional `attention.inboxReviewCount` from `views.inbox.counts.review`

---

## 8. UI specification (every block)

### 8.1 Page header (`dashboard-header.tsx`)

| Element | Spec |
|---|---|
| H1 | Dashboard |
| Description | Org risk pulse — jump into overdue work or open an engagement. |
| Meta | `{tenant.name}` · `{formatHeaderDate()}` |
| Actions | Inbox (outline, optional Badge) · Engagements (outline) · New engagement (primary) |

Layout: `flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`

### 8.2 Attention strip (`dashboard-attention-strip.tsx`)

Render when overdue > 0 or inboxReviewCount > 0.

Pills as §4.5B — full width scroll `overflow-x-auto` with `gap-2`.

### 8.3 KPI strip (`dashboard-kpi-strip.tsx`)

Wrapped in `DashboardPanel`:
- Title: **Key metrics**
- Description: Click any metric to drill into filtered engagements
- Body: `grid gap-2 sm:grid-cols-2 lg:grid-cols-3` of compact `MetricTile`s

**Six KPIs (exact config):**

| Key | Label | href | Icon | Tone rule |
|---|---|---|---|---|
| activeEngagements | Active engagements | `/engagements?status=active` | FolderIcon | default |
| openIdrLines | Open IDR lines | `/engagements?status=active` | FileTextIcon | default |
| openAdrLines | Open ADR lines | `/engagements?status=active` | MessageSquareIcon | default |
| dueWithin48h | Due ≤ 48h | `/engagements?status=active&urgency=due48h` | ClockIcon | warn if >0 |
| overdue | Overdue | `/engagements?status=active&urgency=overdue` | AlertTriangleIcon | danger if >0 |
| slaBreaches7d | SLA breaches (7d) | `/engagements?status=active&urgency=breach7d` | ActivityIcon | warn if >0 |

Subtexts:
- Active: `{phaseSummary}`
- Open IDR: badge `{dueWithin48h} due ≤ 48h` when >0, else "Across active engagements"
- Open ADR: "Across active engagements"
- Due ≤48h: "Urgent SLA window"
- Overdue: "Past due date"
- Breaches 7d: "Recently overdue open lines"

Each tile includes `MetricBar` micro bar · `tooltip` string per v1 kpi-strip.

### 8.4 SLA health ring (`dashboard-sla-health-ring.tsx`)

Panel title **SLA health** · description **On-track share of open lines**

**SVG ring:** viewBox `0 0 144 144` · radius 54 · stroke 14 · rotate -90° · dash = `(healthyPct/100) * circumference`

Center: `{healthyPct}%` + label **healthy**

**Four link chips (2×2 grid):**

| Label | Value source | href |
|---|---|---|
| On track | computed onTrack | `/engagements?status=active` |
| Due ≤ 48h | kpis.dueWithin48h | urgency=due48h |
| Overdue | kpis.overdue | urgency=overdue |
| Breaches 7d | kpis.slaBreaches7d | urgency=breach7d |

Footer: `{totalOpen} open line(s) across active engagements`

Panel border accent when tone warn/danger §4.5C.

### 8.5 Line workload chart (`dashboard-line-workload-chart.tsx`)

Panel **Line workload** · **SLA pressure by workstream**

Two link cards — **IDR lines** · **ADR lines**:
- Icon well + open count + `{risk} at risk` (due48h + overdue)
- `RiskStack` horizontal segmented bar
- Legend: `{onTrack} on track` · `{dueWithin48h} due` · `{overdue} overdue`

### 8.6 Review flow chart (`dashboard-review-flow-chart.tsx`)

Panel **Review flow** · **Intake to decisions · last 24h**

Top: composite horizontal bar (4 segment colors)  
Bottom: 2×2 grid of steps — Intake · Submitted · Approved · Rejected — each with icon, count, micro bar vs max step value.

Icons: FilePlus2 · Send · CheckCircle2 · XCircle

Empty total: muted full-width bar track.

### 8.7 Phase mix chart (`dashboard-phase-mix-chart.tsx`)

Panel **Phase risk** · `{total} active engagement(s)`

List rows per phase:
- Label + `{risk} risk · {activeCount} active`
- Stacked bar warn+overdue portions; if risk 0, show ok sliver

Empty: `No active engagements`

### 8.8 Active engagements table (`dashboard-engagements-table.tsx`)

Section header:
- Title: **Active engagements**
- Description: Open line counts and next SLA
- Action: **View all →** `/engagements?status=active`

**Columns:**

| Header | Width | Cell |
|---|---|---|
| Engagement | 36% | risk stripe + name link + code mono |
| Phase | 14% | phase badge mono |
| Lead | 18% hidden md+ | leadName truncate |
| Next SLA | 16% | label colored by breach/warn |
| Open | 16% right | OpenLinesBar §8.10 |

**Empty:** EmptyState with FolderIcon · **No active engagements** · New engagement CTA

### 8.9 Activity timeline (`dashboard-activity-timeline.tsx`)

Panel **Recent activity** · **Last 24 hours** · `bodyClassName="p-0"`

Each row:
- Icon well (audit icon + semantic bg)
- Actor semibold · event pill · relative time
- Message paragraph

Empty: **No activity yet** · Submissions, approvals, and other events from the last 24 hours will show up here.

Reuse `getAuditEventIcon` + `getHistoryEventTypePill` from history audit display helpers.

### 8.10 Open lines mini bar (`OpenLinesBar`)

Inline in table — `hidden sm:block` bar `w-12 h-1.5` with ok/warn/breach segments + count `w-5 text-right tabular-nums`.

```tsx
const onTrack = Math.max(0, count - dueWithin48h - overdue);
const total = Math.max(count, 1);
// segment widths as percentages
```

### 8.11 Copy deck

| Context | Copy |
|---|---|
| H1 | Dashboard |
| Description | Org risk pulse — jump into overdue work or open an engagement. |
| Key metrics | Key metrics |
| KPI drill hint | Click any metric to drill into filtered engagements |
| SLA health | SLA health |
| Line workload | Line workload |
| Review flow | Review flow |
| Phase risk | Phase risk |
| Active engagements | Active engagements |
| View all | View all → |
| Recent activity | Recent activity |
| 24h window | Last 24 hours |
| No engagements | No active engagements |
| No engagements body | Create an engagement to start tracking IDR and ADR lines. |
| No activity | No activity yet |

---

## 9. File structure

```
app/dashboard/
  page.tsx
  loading.tsx                    # optional skeleton
  _components/
    dashboard-view.tsx           # orchestrator
    dashboard-header.tsx
    dashboard-attention-strip.tsx
    dashboard-kpi-strip.tsx
    dashboard-sla-health-ring.tsx
    dashboard-line-workload-chart.tsx
    dashboard-review-flow-chart.tsx
    dashboard-phase-mix-chart.tsx
    dashboard-engagements-table.tsx
    dashboard-activity-timeline.tsx
    dashboard-panel.tsx
    dashboard-open-lines-bar.tsx
    dashboard-helpers.ts

lib/api/dashboard.ts             # EXTEND getDashboardApi
lib/types/dashboard.ts           # EXTEND OrgDashboard types
```

Optional: `app/dashboard/dashboard.css` for bar/ring animation utilities.

**Do not:** add chart npm packages · top-level `components/dashboard/` outside app route · team My Plate in this route.

---

## 10. Client state and accessibility

### 10.1 Client state

Dashboard is **fully server-rendered** — no client filter state. Links navigate to engagements/inbox with query params.

Optional client: none required.

### 10.2 Accessibility

| Element | Requirement |
|---|---|
| SLA ring SVG | `role="img"` · `aria-label={`SLA health: ${healthyPct}% healthy`}` |
| KPI links | entire tile clickable · visible focus ring |
| Table | semantic `<table>` · row links on engagement name |
| Activity | `<time dateTime={iso}>` · list semantics |
| Attention pills | descriptive link text (not icon-only) |
| Reduced motion | §5 rules |
| Color | overdue/breach never color-only — include counts/text |

### 10.3 Scope — in / out

**In:** full CO command center · all v1 charts/table/activity · premium attention strip · drill-down links.

**Out:** team My Plate home · custom date ranges · export · notification center · realtime · engagement creation form logic (link only).

---

## 11. Verification checklist

| # | Check | Expected |
|---|---|---|
| 1 | `/dashboard` loads | No stub H1 only |
| 2 | Redirect `/` | Lands on dashboard |
| 3 | Nav | Dashboard active |
| 4 | Header | Tenant name + date visible |
| 5 | KPI strip | 6 tiles with tooltips + bars |
| 6 | Active engagements KPI | **5** · subtext mentions IDR + ADR |
| 7 | Overdue KPI | **6** · danger tone · links to urgency=overdue |
| 8 | Due 48h KPI | **11** · warn when >0 |
| 9 | SLA ring | Shows % healthy + 4 chips |
| 10 | Line workload | IDR + ADR cards with stacked bars |
| 11 | Review flow | 4 steps + composite bar |
| 12 | Phase risk | Rows for seed phases |
| 13 | Engagements table | Up to 8 rows · RBI first by risk |
| 14 | Risk stripe | Red on RBI row (3 overdue) |
| 15 | Open mini bar | Visible sm+ on table |
| 16 | Activity feed | Shows RBI recent events with relative time |
| 17 | Attention strip | Visible when overdue or review >0 |
| 18 | Inbox pill | Links to `/inbox?tab=review` |
| 19 | New engagement | Links to `/engagements/new` |
| 20 | Motion | Single page enter · bar fill once |
| 21 | Reduced motion | No bar animation |
| 22 | Empty states | Correct copy when arrays empty |
| 23 | No chart libs | package.json unchanged |
| 24 | Read-only | No API writes |

---

## 12. Implementation tasks

### Task 1: Types + loader

**Files:** `lib/types/dashboard.ts`, `lib/api/dashboard.ts`, `dashboard-helpers.ts`

- [ ] Extend `OrgDashboard` · `buildOrgDashboardViewModel` · optional `views.orgDashboard` seed

### Task 2: Panel + helpers

**Files:** `dashboard-panel.tsx`, `dashboard-helpers.ts`

- [ ] §7 formatters · SLA health · phase/review builders

### Task 3: Header + attention strip

**Files:** `dashboard-header.tsx`, `dashboard-attention-strip.tsx`

- [ ] §8.1–§8.2 · premium layout

### Task 4: KPI strip

**File:** `dashboard-kpi-strip.tsx`

- [ ] §8.3 · six tiles · MetricBar

### Task 5: Analytics grid

**Files:** sla ring, line workload, review flow, phase mix

- [ ] §8.4–§8.7 · CSS animations

### Task 6: Bottom row

**Files:** engagements table, activity timeline, open lines bar

- [ ] §8.8–§8.10

### Task 7: Page orchestration

**Files:** `page.tsx`, `dashboard-view.tsx`, optional `loading.tsx`

- [ ] §3 layout · SectionStagger sections

### Task 8: QA

- [ ] §11 · contrast · keyboard · lint

---

## 13. Definition of done

- [ ] `/dashboard` is a polished **Risk pulse** command center — not placeholder  
- [ ] All v1 visuals present: KPI strip, SLA ring, 3 chart panels, table, 24h activity  
- [ ] Premium Assure enhancements: attention strip, asymmetric grid, table stripes, icon wells  
- [ ] Every KPI/chip links to correct filtered engagements URL  
- [ ] CSS-only charts — zero new chart dependencies  
- [ ] Motion §5 with reduced-motion fallback  
- [ ] §11 checklist passes on dummy seed  
- [ ] UI-only — no backend  
- [ ] Buildable from **this document alone**

---

## 14. Build order

1. Types + `buildOrgDashboardViewModel` + extend API  
2. `dashboard-panel` + header  
3. KPI strip (validates data pipeline)  
4. SLA ring + line workload (hero row)  
5. Review flow + phase risk  
6. Engagements table + open lines bar  
7. Activity timeline  
8. Attention strip + final polish + §11 QA  

**First visual slice:** Header + KPI strip + SLA ring — proves premium tone before charts.

---

## 15. Agent notes

**User asked for premium UI:** §4.5 is **required**, not optional polish. The dashboard is the product’s first impression after login — invest in spacing (`gap-8`), panel headers, risk color discipline, and the attention strip.

**Minimal API today:** `getDashboardApi()` only sums `engagementsList` — extend before building charts or seed `views.orgDashboard`.

**IDR/ADR split:** List items only expose combined `openLineCount`. Sum `overview.kpis.idrOpen/adrOpen` per engagement in builder, or use seed `lineRisk`.

**Review flow vs activity feed:** Review flow counts **event types** in 24h window; activity feed shows **formatted messages** — related but different data.

**Inbox integration:** Load `views.inbox.counts.review` (13 after normalization) for attention strip — cross-read only, don’t duplicate inbox UI.

**Phase labels in seed:** All five engagements use `"IDR + ADR"` — phase risk chart shows one row with aggregated risk.

**`nextDueDate` on RBI:** `2026-08-18` — may show warn/breach in Next SLA column depending on reference date.

**History / overview activity:** Dashboard org feed is **24h org-wide** — not the same 5-item cap on single engagement overview.

**Team dashboard:** `myPlate.dashboard` in Data.json is for `/my-plate` — do not render on CO `/dashboard`.

**No `@/components/dashboard` top-level folder** — colocate under `app/dashboard/_components/` per Assure route colocation pattern.

**Loading skeleton (optional):** Pulse placeholders matching 3-section layout improves perceived performance — gray bars for KPI row, ring circle, table rows.
