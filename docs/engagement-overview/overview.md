# Engagement Overview — Complete UI Rebuild Specification

> **Purpose:** Self-contained, pixel-level rebuild spec for `/engagements/[id]`.  
> **Audience:** Engineers or agents rebuilding this screen in **any** codebase with **no** access to other repos, legacy apps, or tribal knowledge.  
> **Scope:** UI only — layouts, copy, tokens, motion, client state, filter/sort algorithms. No auth, no backend, no API design, no mutations.  
> **Design name:** **Command deck** — calm operational dashboard, not a dense legacy metric grid.

**Definition of the screen:** The engagement overview is the **CO command center** for one audit cycle. It answers: *Where is this engagement, how healthy is it, who is behind, and where do I go next?*

**Architecture:** Thin server page loads one `EngagementOverview` object. Client components own team-table filters/sort and the scope accordion. Presentation only.

**Tech stack (source repo):** Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn **radix-mira** · `motion` v12 via `@/lib/motion` · `lucide-react` icons (identity deck: UserRound, Check; toolbar: ChevronDown, Search).

---

## 0. How to use this document

1. Read §1–§3 (constraints, routes, page shell).  
2. Copy design tokens (§4) and motion rules (§5).  
3. Implement data types and loader per §6 — use seeded engagement for fixtures.  
4. Implement every algorithm in §7 verbatim.  
5. Build each UI block per §8 — every label, class, and empty state is specified.  
6. Follow file layout §9; wire client state §10.  
7. Verify against §11 using `eng-rbi-it-exam-fy27`.  
8. Track build progress with §12 tasks.

---

## 1. Hard constraints

| Rule | Detail |
|---|---|
| **UI only** | No HTTP endpoints, DB schema, server actions, or phase-update mutations. |
| **Read-only data** | Single load: `getEngagementDetailApi(engagementId)` → `EngagementOverview`. Optional read-only: `getEngagementHistoryApi` (§10 stretch only). |
| **No `/history` route** | Recent activity lives on overview. Do not add a History subnav tab. |
| **Findings on report** | Link to `/engagements/{id}/report#findings-register` — full register lives on Report tab. |
| **No charts** | No SVG donut, no Recharts on overview. Use stat strips and `scaleX` bars only. |
| **Engagement name = H1** | Unlike ADR (module name as H1), overview uses **engagement name** as page title. |
| **Display-only phase rail** | Users cannot click to change phase. |

---

## 2. Routes and navigation map

### 2.1 Full engagement route tree

```
/engagements                          → list (built elsewhere)
/engagements/{engagementId}           → OVERVIEW (this spec)
/engagements/{engagementId}/idr
/engagements/{engagementId}/adr
/engagements/{engagementId}/adr/lines/{lineId}
/engagements/{engagementId}/examination
/engagements/{engagementId}/report
/engagements/{engagementId}/findings              → redirect to /report#findings-register
/engagements/{engagementId}/findings/{findingCode}
/engagements/{engagementId}/remediation
```

**Entry:** User clicks list row → `/engagements/{id}` with Overview tab active.

### 2.2 Engagement sticky subnav (layout chrome)

On **all** `/engagements/[id]/*` routes. Overview content renders **below** subnav.

| Property | Value |
|---|---|
| Position | `sticky top-14 z-40` (navbar is `h-14`) |
| Surface | `border-b border-border/50 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/70` |
| Inner | `mx-auto max-w-7xl overflow-x-auto px-4 py-2 sm:px-6` |
| Track | `flex shrink-0 rounded-lg bg-muted/50 p-0.5` |
| ARIA | `aria-label="Engagement sections"` |

**Tabs (order, label, href):**

| Segment | Label | href |
|---|---|---|
| `""` | Overview | `/engagements/{id}` |
| `idr` | IDR | `/engagements/{id}/idr` |
| `adr` | ADR | `/engagements/{id}/adr` |
| `examination` | Examination | `/engagements/{id}/examination` |
| `report` | Report | `/engagements/{id}/report` |
| `remediation` | Remediation | `/engagements/{id}/remediation` |

**Active detection:**
- Overview: pathname is `/engagements/{id}` or `/engagements/{id}/`
- Report: also active for `/engagements/{id}/findings/{findingCode}` (detail route)
- Else: exact match or `pathname.startsWith(/engagements/{id}/{segment}/)`

**Tab link:** `relative flex items-center rounded-md px-3 py-1.5 text-xs font-medium`  
Active: `text-foreground` + sliding pill `layoutId="engagement-subnav-active"`  
Inactive: `text-muted-foreground` + fine-pointer hover to `text-foreground`  
Pill: `absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-border/60` · `springUi`  
Reduced motion: static active classes on link, no `layoutId`.

---

## 3. Page shell and layout

### 3.1 Server page

Load `EngagementOverview` via `getEngagementDetailApi(id)`. On missing engagement → 404. **Never put JSX inside `try/catch`.**

### 3.2 Main orchestrator

```tsx
<main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 min-h-[calc(100dvh-3.5rem-3rem)]">
```

Wrap in `PageReveal` → `SectionStagger` → `SectionItem` per block. **Do not re-key `SectionStagger` on filter changes.**

**Vertical order:** Header card → Engagement timeline card → Module cards → Team panel → (SLA | Activity) grid → Scope drawer.

### 3.3 Responsive

| BP | Behavior |
|---|---|
| default | 1-col cards; horizontal scroll phase rail |
| `sm` | module grid `grid-cols-2` |
| `lg` | module `grid-cols-3`; SLA+activity `grid-cols-2` |
| table | `overflow-x-auto`; hide Closed `<md`; hide Due `<lg` |

### 3.4 Command deck principles

Identity header card · horizontal engagement timeline stepper with connector lines (not pill tabs) · six link cards · team table full width · scope collapsed at bottom · purposeful motion · **no SVG donut SLA chart**.

---

## 4. Design tokens (inline — copy into target project)

### 4.1 Semantic colors (light mode reference)

| Token | oklch value | Use |
|---|---|---|
| `--background` / `--card` | `oklch(0.98 0.01 95.10)` | Page + cards |
| `--foreground` | `oklch(0.34 0.03 95.72)` | Body text |
| `--primary` | `oklch(0.62 0.14 39.04)` | Links, progress bars, focus |
| `--muted` | `oklch(0.955 0.0124 91.52)` | Pill tracks, toolbar bg |
| `--border` | `oklch(0.9078 0.0094 106.59)` | Hairlines |
| `--destructive` | `oklch(0.55 0.22 25.33)` | Overdue counts, late accents |

**SLA accent tokens (if available):** `sla-warn` for due ≤48h, `sla-breach` for overdue, `sla-complete` for done phase steps. Fallback: `text-primary/70` warn, `text-destructive` breach.

**Elevation:** `ring-1 ring-foreground/10` on cards — not drop shadows.  
**Radius:** controls `rounded-sm`; pill tracks `rounded-lg`.  
**Page:** `max-w-7xl`, `p-4 sm:p-6`, section `gap-6`.

### 4.2 Typography

| Role | Classes |
|---|---|
| Page H1 (engagement name) | `text-2xl font-bold tracking-tight sm:text-3xl` |
| Engagement code | `font-mono text-[0.625rem] text-muted-foreground tabular-nums uppercase` |
| Subtitle / meta | `text-sm text-muted-foreground` |
| Section title | `text-sm font-medium` |
| Section description | `text-xs text-muted-foreground` |
| KPI / card primary number | `text-2xl font-bold tabular-nums` |
| Table header | `text-xs font-medium text-muted-foreground` |
| Table cell numbers | `font-mono text-xs tabular-nums` |
| Team slug (under name) | `font-mono text-[10px] uppercase text-muted-foreground` |
| Event type | `font-mono text-[10px] text-muted-foreground` |
| Controls | `text-xs/relaxed` |

### 4.3 UI primitives

| Primitive | Classes |
|---|---|
| Button (toolbar) | `rounded-sm text-xs/relaxed`, size `sm` |
| Card shell | `rounded-sm bg-card ring-1 ring-foreground/10 py-0 gap-0` (table cards) |
| Badge | `h-5 rounded-sm text-[0.625rem] font-medium variant="outline" capitalize` |
| Input (search) | `h-8 pl-8` with left `Search` icon |
| Filter chip track | `rounded-sm bg-muted p-1` |
| Active filter chip | `bg-background shadow-sm ring-1 ring-border/60` |
| Table header row | `border-b border-border/40 bg-muted/20` |
| Row hover | `hover:bg-primary/10` on interactive rows |

---

## 5. Motion system (implement exactly)

Honor `useReducedMotion()` everywhere. No CSS `ease-in`, no `transition: all`, no enter from `scale(0)`.

### 5.1 Token values

```ts
easeOut = [0.23, 1, 0.32, 1]
duration = { press: 0.14, hover: 0.16, snappy: 0.22, enter: 0.28, page: 0.3, chart: 0.36, barFill: 0.45 }
springUi = { type: "spring", stiffness: 400, damping: 34 }
stagger = { section: 0.05, sectionDelay: 0.04, list: 0.05, listDelay: 0.02 }
```

### 5.2 Page + sections

- **PageReveal:** `opacity 0, y:8` → `1,0` · `duration.page` · `easeOut`. Reduced: opacity only.
- **SectionStagger / SectionItem:** stagger `0.05`, delay `0.04`; item `y:10` → `0`. Mount once per route.
- **listContainer / listItem:** for module cards, activity list, table body on first paint. Row enter `scale:0.98` floor.
- **ROW_HOVER_CLASS:** `transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out` + fine-pointer `hover:bg-muted/50`
- **tapScale:** `{ scale: 0.98 }` unless reduced motion

### 5.3 Sliding pills

| Location | `layoutId` |
|---|---|
| Engagement subnav | `engagement-subnav-active` |
| Overview phase rail | `overview-phase-pill` |

Reduced motion → static `bg-background shadow-sm ring-1 ring-border/60` on active item.

### 5.4 Scope accordion

Mirror ADR Insights drawer: `AnimatePresence initial={false}` · height `0→auto` with `springUi` · chevron `0→180deg`. Button `aria-expanded`.

### 5.5 Hard rules

Filter/sort changes update numbers only — **do not** re-stagger page or remount `SectionStagger`.

---

## 6. Data contract (complete)

### 6.1 Loader

```ts
async function getEngagementDetailApi(engagementId: string): Promise<EngagementOverview>
```

Returns one object per engagement. No writes. 404 when id unknown.

### 6.2 TypeScript interfaces

```ts
interface EngagementKpis {
  idrOpen: number;
  idrClosed: number;
  adrOpen: number;
  adrClosed: number;
  dueWithin48h: number;
  overdue: number;
  asksTotal: number;
  findingsTotal: number;
  findingsBySeverity: Record<string, number>; // keys: critical, high, medium, low, observation
  actionItemsOpen: number;
  actionItemsTotal: number;
}

interface TeamLineBucket {
  total: number;
  approved: number;
  open: number;
}

interface TeamCompletionRow {
  teamId: string;
  teamSlug: string;
  teamName: string;
  total: number;        // idr.total + adr.total
  approved: number;     // idr.approved + adr.approved (display label "Closed")
  open: number;
  completionPct: number; // round(approved/total*100) or 0
  idr: TeamLineBucket;
  adr: TeamLineBucket;
  dueWithin48h: number;
  overdue: number;
}

interface SlaHealth {
  healthyPct: number;   // 0–100
  onTrack: number;
  dueWithin48h: number;
  overdue: number;
  totalOpen: number;
}

interface RecentActivityItem {
  id: string;
  eventType: string;    // e.g. "line.approved", "finding.accepted"
  createdAt: string;    // ISO 8601
  actorName: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface EngagementOverview {
  id: string;
  code: string;
  name: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  leadUserId: string;
  leadName: string;
  leadEmail: string;
  slaProfile: string;
  status: string;       // e.g. "active"
  phase: string;        // see §7.1 phase normalization
  notes: string | null;
  auditorName: string | null;
  examinationStartDate: string | null;
  examinationEndDate: string | null;
  targetCloseDate: string | null;
  appsInScope: string[];
  frameworksInScope: string[];
  createdAt: string;
  kpis: EngagementKpis;
  teamCompletion: TeamCompletionRow[];
  slaHealth: SlaHealth;
  recentActivity: RecentActivityItem[]; // API returns up to 10, newest first
}
```

### 6.3 Field → UI mapping

| Field | UI block |
|---|---|
| `code`, `name`, `type`, `leadName`, `periodStart/End`, `status`, `phase`, `targetCloseDate` | Header (§8.1) + timeline caption (§8.2) |
| `kpis` | Timeline subtext (§8.2) + module cards |
| `teamCompletion` | Team table |
| `slaHealth` | SLA band |
| `recentActivity` | Activity feed |
| `auditorName`, examination dates, apps, frameworks, `notes` | Scope drawer |

### 6.4 Seeded test engagement — `eng-rbi-it-exam-fy27`

Use this fixture for dev and QA. Expected rendered values:

| Field | Value |
|---|---|
| code | `RBI-IT-EXAM-FY27` |
| name | `RBI IT Examination — FY27` |
| type | `RBI IT Exam` |
| leadName | `Digvijay Joshi` |
| status | `active` |
| phase | `remediation` (normalize lowercase → active step = Remediation) |
| period | `27 Apr 2026 – 22 Apr 2027` |
| target close | `30 Sep 2026` |
| kpis.idr | 13 open, 7 closed |
| kpis.adr | 7 open, 1 closed |
| kpis.asksTotal | 8 |
| kpis.findingsTotal | 12 (critical 1, high 4) |
| kpis.actionItems | 14 open / 16 total |
| slaHealth | 75% healthy; onTrack 13; due48h 4; overdue 3; totalOpen 20 |
| teamCompletion | 10 teams (see §11) |
| recentActivity | 5 events (not 10 — render all provided) |
| auditorName | `RBI DBS Examination Team (Mr. R. Sharma, Mrs. K. Iyer)` |
| appsInScope | 8 apps (NBIL-APP-1001 … 1008) |
| frameworksInScope | RBI-ITGRC, RBI-DPSC, RBI-BQCS, SEBI-CSCRF |
| notes | `null` → hide notes block inside drawer |

---

## 7. Algorithms (implement verbatim)

### 7.1 Phase normalization and rail state

**Canonical phase order (full lifecycle):**
```ts
const PHASE_ORDER = ["planning", "idr", "adr", "examination", "report", "remediation", "closed"];
```

**Rail steps shown (5 only):**
```ts
const RAIL_PHASES = [
  { key: "idr", label: "IDR" },
  { key: "adr", label: "ADR" },
  { key: "examination", label: "Examination" },
  { key: "report", label: "Report" },
  { key: "remediation", label: "Remediation" },
];
```

**Normalize `overview.phase` before lookup:**
1. `trim().toLowerCase()`
2. If value contains `"idr"` and `"adr"` (e.g. `"idr + adr"`) → treat as `"adr"` (IDR step done, ADR active)
3. If not in `PHASE_ORDER` → treat index as `-1` (no active rail step; all future)

```ts
function phaseIndex(phase: string): number {
  return PHASE_ORDER.indexOf(normalizePhase(phase));
}
```

**Per rail step `p.key`:**
```ts
const currentIdx = phaseIndex(overview.phase);
const isClosed = normalizePhase(overview.phase) === "closed";
const stepIdx = phaseIndex(p.key);
const isDone = isClosed || stepIdx < currentIdx;
const isActive = !isClosed && stepIdx === currentIdx;
```

**Rail index and track fill:** removed — connector colour is per-segment (`isDone` on preceding step).

**Visual states (horizontal stepper nodes):**
- **done:** `size-8 rounded-sm bg-emerald-600` + white `Check`; label `text-emerald-600`; connector after step = `bg-emerald-600`
- **active:** `size-8 rounded-sm bg-primary text-primary-foreground` + step number; label `text-primary`; connector after step = `bg-border`
- **future:** `size-8 rounded-sm bg-background ring-1 ring-border` + grey number; label `text-muted-foreground`; connector after step = `bg-border`

### 7.2 Phase subtext (`buildPhaseSubtext(kpis)`)

Only set when denominator > 0 (or total > 0 for remediation):

```ts
const subtext: Record<string, string> = {};
const idrTotal = kpis.idrOpen + kpis.idrClosed;
if (idrTotal > 0) subtext.idr = `${kpis.idrClosed} of ${idrTotal} closed`;
const adrTotal = kpis.adrOpen + kpis.adrClosed;
if (adrTotal > 0) subtext.adr = `${kpis.adrClosed} of ${adrTotal} closed`;
if (kpis.asksTotal > 0) subtext.examination = `${kpis.asksTotal} asks`;
if (kpis.findingsTotal > 0) subtext.report = `${kpis.findingsTotal} findings`;
if (kpis.actionItemsTotal > 0) subtext.remediation = `${kpis.actionItemsOpen} open`;
return subtext;
```

**Example for test engagement:** IDR `7 of 20 closed` · ADR `1 of 8 closed` · Examination `8 asks` · Report `12 findings` · Remediation `14 open`.

### 7.3 Date formatting

```ts
const fmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
formatDate(iso) => fmt.format(new Date(iso))
formatPeriod(start, end) => `${formatDate(start)} – ${formatDate(end)}`
```

Phase timeline date caption (§8.2): `formatTimelineCaption(periodStart, targetCloseDate)` → `{formatDate(periodStart)} · Target close {formatDate(targetCloseDate)}` (omit start segment when `periodStart` missing).

### 7.4 Module card content

Grid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`. Each card is `<Link href={...}><Card className={ROW_HOVER_CLASS} /></Link>`.

| # | Title | href | Primary display | Secondary line |
|---|---|---|---|---|
| 1 | IDR | `/engagements/{id}/idr` | `{idrOpen}` as large number, label "open" | `{idrOpen} open · {idrTotal} total` where `idrTotal = idrOpen+idrClosed` |
| 2 | ADR | `/engagements/{id}/adr` | `{adrOpen}` open | `{adrOpen} open · {adrTotal} total` |
| 3 | Examination | `.../examination` | `{asksTotal}` | `Examination asks` (static) |
| 4 | Findings | `.../report#findings-register` | `{findingsTotal}` | If critical/high > 0: `{critical} critical · {high} high`; else `Findings recorded` |
| 5 | Remediation | `.../remediation` | `{actionItemsOpen}` | `{actionItemsOpen} open · {actionItemsTotal} total` |
| 6 | SLA risk | `#sla-band` or `button` scroll | `{dueWithin48h}` due ≤48h | `{overdue} overdue` — if overdue > 0 add `ring-destructive/30` on card |

Card interior padding: `p-4 sm:p-5`. Title: `text-sm font-medium`. Number: `text-2xl font-bold tabular-nums`. Secondary: `text-xs text-muted-foreground`.

### 7.5 Team table — filter

```ts
type TeamFilter = "all" | "needs_attention" | "incomplete" | "complete";

function filterTeamRows(rows, filter, search) {
  let out = rows;
  const q = search.trim().toLowerCase();
  if (q) {
    out = out.filter(r => `${r.teamName} ${r.teamSlug}`.toLowerCase().includes(q));
  }
  if (filter === "needs_attention") {
    out = out.filter(r => r.overdue > 0 || r.dueWithin48h > 0);
  } else if (filter === "incomplete") {
    out = out.filter(r => r.open > 0);
  } else if (filter === "complete") {
    out = out.filter(r => r.open === 0 && r.total > 0);
  }
  return out;
}
```

### 7.6 Team table — sort

```ts
type SortKey = "teamName"|"total"|"approved"|"open"|"completionPct"|"dueWithin48h"|"overdue";
type Sort = { key: SortKey; direction: "asc"|"desc" };

const DEFAULT_SORT: Sort = { key: "completionPct", direction: "asc" }; // worst completion first

function toggleSort(prev, key): Sort {
  if (prev.key === key) return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
  const direction = key === "overdue" ? "desc" : key === "teamName" ? "asc" : "asc";
  return { key, direction };
}

// Tie-breakers after primary compare:
// 1. If primary !== "overdue": sort overdue DESC
// 2. Always: teamName localeCompare ASC
```

### 7.7 Team table — footer totals (`sumTeamRows`)

Sum **visible** rows only: `total`, `approved`, `open`, `dueWithin48h`, `overdue`.  
Team label cell: if search/filter active → `{visible.length} of {all.length}`; else → `{all.length} teams`.  
Done % column in footer: **empty**. Due/Late: show sum or `—` when 0.

### 7.8 Done column tooltip

On hover/focus of Done % cell, tooltip text:
```ts
function formatBucketFraction(bucket) {
  return bucket.total > 0 ? `${bucket.approved}/${bucket.total}` : "—";
}
// "IDR {idr} · ADR {adr}"  e.g. "IDR 1/4 · ADR 0/4"
```

Progress bar in Done column: fill `scaleX(completionPct/100)`, track `h-1.5 rounded-full bg-muted`, fill `bg-primary/70 origin-left`.

### 7.9 Row SLA accent (left border)

| Condition | Class |
|---|---|
| `overdue > 0` | `border-l-2 border-l-destructive` (or `border-l-sla-breach`) |
| `overdue === 0 && dueWithin48h > 0` | `border-l-2 border-l-primary/50` (or `border-l-sla-warn`) |

### 7.10 Activity feed

Render `recentActivity` in API order (newest first). Cap display at `min(length, 10)`. No pagination in v1.

### 7.11 Scope drawer visibility

```ts
const hasScope = !!(auditorName || appsInScope.length || frameworksInScope.length || examinationStartDate);
const showDrawer = hasScope || !!notes;
```

---

## 8. UI specification (every block)

### 8.1 Header (`overview-header.tsx`)

Standalone `Card` in `overview-view.tsx` (not shared with timeline).

**Header surface:** `relative px-5 py-5 sm:px-6 sm:py-6` with subtle gradient overlay `bg-linear-to-br from-primary/5 via-transparent to-muted/25` (decorative, `aria-hidden`).

**Layout:** `flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between`

**Left column (identity):**

1. **Top row** (`flex flex-wrap items-center justify-between gap-3`):
   - Code: `{code}` · `font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase tabular-nums`
   - Badge group (`flex flex-wrap gap-2`):
     - Status: `{status}` · `Badge variant="outline" capitalize` + `statusBadgeClass(status)`
     - Phase: `{phase}` · `Badge variant="outline" capitalize` + `phaseBadgeClass(phase)`

2. **H1:** `{name}` · `text-2xl font-bold tracking-tight text-balance sm:text-3xl`

3. **Meta row** (`flex flex-wrap gap-x-4 gap-y-2`):
   - `{type}` with `UserRound` icon · `text-sm text-muted-foreground`
   - `Lead: {leadName}` with `UserRound` icon · same classes

**Right column (dates)** — `flex shrink-0 flex-wrap gap-2 sm:gap-3 lg:flex-col`:

Date stat pills (`rounded-md bg-background/80 px-3 py-2 ring-1 ring-foreground/8`):
- Label: `text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase`
- Value: `font-mono text-xs tabular-nums`
- **Period:** `{formatPeriod(periodStart, periodEnd)}`
- **Target close** (when set): `{formatDate(targetCloseDate)}`

No edit button. No icon metric grid.

### 8.2 Engagement timeline (`overview-phase-rail.tsx`)

Display-only horizontal 5-step stepper in its own `Card` (`p-4 sm:p-5`, `ring-1 ring-foreground/10`). **Not clickable.**

**Props:** `EngagementTimelineProps` — `phase`, `periodStart?`, `targetCloseDate?`, `kpis` (subset per §7.2).

**Header row** (`flex items-center justify-between gap-4 mb-4`):
- Left: `Engagement timeline` · `text-sm font-medium text-foreground`
- Right: `formatTimelineCaption(periodStart, targetCloseDate)` · `font-mono text-[11px] text-muted-foreground tabular-nums`

**Stepper track** (`flex items-start w-full overflow-x-auto` inside `<nav aria-label="Engagement timeline">` · `role="list"`):

Five steps: IDR → ADR → Examination → Report → Remediation (`RAIL_PHASES` with `step: 1–5`).

Each step (`role="listitem"`): icon box → label → subtext, center-aligned. Connector between steps: `h-px flex-1`, green (`bg-emerald-600`) when preceding step `isDone`, else `bg-border`. Last step has no trailing connector.

| State | Icon box | Label | Connector after |
|---|---|---|---|
| **done** | `size-8 rounded-sm bg-emerald-600` + white `Check` | `text-xs font-medium text-emerald-600` | green |
| **active** | `size-8 rounded-sm bg-primary text-primary-foreground` + step number | `text-xs font-medium text-primary` | grey |
| **future** | `size-8 rounded-sm bg-background ring-1 ring-border` + grey number | `text-xs font-medium text-muted-foreground` | grey |

Subtext: `font-mono text-[10px] text-muted-foreground mt-0.5 tabular-nums` from `buildPhaseSubtext(kpis)`.

**Accessibility:** `aria-current="step"` on active step; `aria-label` on each step includes label + status + subtext. No `button` / `Link`.

**Test engagement (`eng-rbi-it-exam-fy27`, phase `remediation`):** steps 1–4 done (checkmarks); Remediation active with `14 open`.

### 8.3 Module cards — see §7.4

Stagger with `listContainer`/`listItem` on mount only.

### 8.4 Team completion panel

**Card header:**
- Title: `Team completion`
- Description: `Line item progress by owning team`

**Toolbar** (`flex flex-wrap items-center gap-2 p-3 sm:px-4 border-b border-border/40`):
- Search: `placeholder="Search teams…"` · `aria-label="Search teams"` · width `min-w-[12rem] flex-1 max-w-xs`
- Filter chips: `All` | `Attention` | `Incomplete` | `Complete` (values per §7.5)

**Table columns:**

| Header | Sort key | Tooltip | Responsive | Cell |
|---|---|---|---|---|
| Team | teamName | Owning team for assigned line items. | always | Name `line-clamp-2` + slug below |
| Total | total | All IDR and ADR lines owned by this team. | always | mono number |
| Closed | approved | Lines with approved status. | hidden `<md` | mono, `text-emerald-600` or default |
| Open | open | Lines not yet approved. | always | mono |
| Done | completionPct | Share approved. Hover for IDR/ADR split. | always | `{pct}%` + progress bar |
| Due | dueWithin48h | Open lines due within 48 hours. | hidden `<lg` | `—` if 0 else warn color |
| Late | overdue | Open lines past due date. | always | `—` if 0 else destructive color |

**Sortable headers:** click toggles sort; show `↑`/`↓` on active column.

**Empty states:**
- `teams.length === 0`: `No line items assigned to teams yet.`
- filtered empty: `No teams match this filter.` + button `Clear filters` (resets search + filter to all)

**Footer row:** `font-medium` · sums per §7.7

**No row click navigation.**

**Default visible order for test data (completionPct asc):** VAPT, BCM, Cards, Vendor Mgmt, Cyber, Treasury IT, IT Ops, SOC, GRC, HR — verify Vendor Mgmt has overdue accent (2).

### 8.5 SLA band (`overview-sla-band.tsx`)

**Root:** `id="sla-band"` on card wrapper for scroll target from SLA risk module card.

**Card title:** `SLA health`  
**Description:** `Open line SLA posture across IDR and ADR`

**Primary stat:** `{healthyPct}%` large + label `on track` (`text-xs text-muted-foreground`)

**Stat strip (wrap):**  
`{onTrack} on track · {dueWithin48h} due ≤48h · {overdue} overdue · {totalOpen} total open`

**Optional health bar:** full-width `h-2 bg-muted rounded-full` · inner `bg-primary` · `transform: scaleX(healthyPct/100)` · `transition` `barFill` duration

**Test engagement:** `75%` · `13 on track · 4 due ≤48h · 3 overdue · 20 total open`

**No donut chart.**

### 8.6 Activity feed (`overview-activity-feed.tsx`)

**Card title:** `Recent activity`  
**Description:** `Latest events on this engagement`

**List:** `divide-y divide-border/40` · each item `py-3 px-4 sm:px-6`

Per item:
1. `eventType` — `font-mono text-[10px] text-muted-foreground uppercase tracking-wide`
2. `message` — `text-xs text-foreground mt-0.5`
3. Meta — `text-[11px] text-muted-foreground mt-1` · `{actorName} · {formatDate(createdAt)}`

**Empty:** `No recent activity.`

**Test engagement — 5 items (newest first):**
1. `action_item.status_changed` — Action item AI-001 moved to in_progress — Digvijay Joshi · 25 Aug 2026
2. `finding.accepted` — Finding F-007 accepted… — 24 Aug 2026
3. `examination.ask_created` — Examination ask A-008… — 22 Aug 2026
4. `line.approved` — IDR line L-003 approved — 21 Aug 2026
5. `document.imported` — ADR-1 imported with 8 follow-up lines — 20 Aug 2026

### 8.7 Scope drawer (`overview-scope-drawer.tsx`)

**Collapsed default.** Mirror ADR Insights accordion pattern.

**Toggle button:** full width `flex justify-between px-4 py-3 sm:px-6`  
- Title: `Scope & notes`  
- Subtitle: `Auditor, examination window, apps, frameworks`  
- ChevronDown rotates 180° when open

**Expanded content** (`px-4 pb-4 sm:px-6 space-y-4 text-xs`):

| Label | Content |
|---|---|
| Auditor | `{auditorName}` or omit row |
| Examination window | `{formatDate(examStart)} – {formatDate(examEnd)}` when both set |
| Apps in scope | section label + flex wrap of outline badges per app |
| Frameworks | section label + badges |
| Notes | only if `notes` non-null — `text-xs leading-relaxed whitespace-pre-wrap` |

**Test engagement:** shows auditor, exam window `11 May 2026 – 15 May 2026`, 8 apps, 4 frameworks; **no notes block**.

---

## 9. File structure

```
app/engagements/[id]/
  page.tsx                              # MODIFY — thin RSC → OverviewView
  _components/
    engagement-subnav.tsx               # (existing)
    overview-view.tsx                   # client orchestrator
    overview-header.tsx                 # identity + badges + meta
    overview-phase-rail.tsx             # horizontal phase track
    overview-module-cards.tsx           # 6 link cards grid
    overview-team-panel.tsx             # toolbar + table wrapper
    overview-team-table.tsx             # sortable table
    overview-sla-band.tsx               # stat strip
    overview-activity-feed.tsx            # recent events list
    overview-scope-drawer.tsx           # collapsed scope + notes
    overview-helpers.ts                 # dates, subtext, KPI formatters (colocated)
```

**Do not:** add `lib/overview/`, `components/engagements/` top-level folder, or new API write methods.

**Import style:**

```tsx
// app/engagements/[id]/page.tsx
import { OverviewView } from "@/app/engagements/[id]/_components/overview-view";
import { getEngagementDetailApi } from "@/lib/api/engagements";
```

---

## 10. Client state and accessibility

### 10.1 Client state

| State | Owner | Default |
|---|---|---|
| `search` | `overview-team-panel` | `""` |
| `filter` | team panel | `"all"` |
| `sort` | team panel | `{ key: "completionPct", direction: "asc" }` |
| `scopeOpen` | scope drawer | `false` |

Props sketch:
```tsx
type OverviewViewProps = { overview: EngagementOverview };
```

### 10.2 Accessibility

- Subnav: `aria-label="Engagement sections"`; active tab inferred from link `aria-current="page"` (optional enhancement).
- Sortable headers: `<button type="button">` with `aria-sort="ascending|descending|none"`.
- Search: `aria-label="Search teams"`.
- Scope drawer: toggle `aria-expanded`; panel `id` linked via `aria-controls`.
- Module cards: entire card is one link — descriptive `aria-label` e.g. `IDR, 13 open lines`.
- Tooltips on Done column: use `title` attribute or Radix Tooltip — must be keyboard-focusable.
- Reduced motion: all animations respect `prefers-reduced-motion` via `useReducedMotion()`.
- Focus rings: use shared `controlFocusClass` on interactive controls.

### 10.3 Scope — in / out

**In:** full overview UI per §8; engagement subnav; motion; responsive; read-only dummy data.

**Out:** backend/API changes; edit engagement; auth/role gates; donut/charts; `/history` route; paginated history (§12 Task 9 optional); other tab implementations.

---

## 11. Verification checklist (use `eng-rbi-it-exam-fy27`)

| # | Check | Expected |
|---|---|---|
| 1 | Route loads | No error; Overview subnav active |
| 2 | Header | H1 `RBI IT Examination — FY27`; code `RBI-IT-EXAM-FY27` |
| 3 | Badges | `active`, `remediation` (capitalized) |
| 4 | Period | `27 Apr 2026 – 22 Apr 2027` |
| 5 | Engagement timeline | Remediation active; IDR–Report done (emerald checks); green connectors between done steps |
| 6 | Timeline caption | `27 Apr 2026 · Target close 30 Sep 2026` |
| 7 | IDR card | 13 open · 20 total → links to `/idr` |
| 8 | Findings card | `1 critical · 4 high` |
| 9 | Team default sort | VAPT first (0%), GRC/HR last (100%) |
| 10 | Vendor row accent | Left border destructive (2 overdue) |
| 11 | SLA band | 75% · 13/4/3/20 strip |
| 12 | Activity | 5 events, newest first |
| 13 | Scope drawer | Collapsed; expands with auditor + 8 apps + 4 frameworks |
| 14 | Motion | Page enter + stagger; no re-stagger on filter |
| 15 | No backend | Zero write APIs |

### 11.1 Team table — full expected rows (test engagement)

Default sort `completionPct asc`. Footer totals over all 10 teams: **Total 28 · Closed 8 · Open 20 · Due 4 · Late 3**.

| Team | Total | Closed | Open | Done% | Due | Late | Accent |
|---|---:|---:|---:|---:|---:|---:|---|
| VAPT | 1 | 0 | 1 | 0 | — | — | — |
| BCM | 1 | 0 | 1 | 0 | — | — | — |
| Cards Technology | 1 | 0 | 1 | 0 | — | — | — |
| Vendor Management | 4 | 0 | 4 | 0 | — | 2 | breach |
| Cyber Security | 8 | 1 | 7 | 13 | 2 | 1 | breach |
| Treasury IT | 3 | 1 | 2 | 33 | 1 | — | warn |
| IT Operations | 5 | 2 | 3 | 40 | 1 | — | warn |
| SOC | 2 | 1 | 1 | 50 | — | — | — |
| GRC | 2 | 2 | 0 | 100 | — | — | — |
| HR / People Systems | 1 | 1 | 0 | 100 | — | — | — |

Done tooltip example (Cyber Security): `IDR 1/4 · ADR 0/4`.

### 11.2 SLA band element id

Root of SLA card: `id="sla-band"` so SLA risk module card can scroll into view.

---

## 12. Implementation tasks

### Task 1: Overview page data load

**Files:** `page.tsx`, `overview-view.tsx`

- [ ] `page.tsx` loads `getEngagementDetailApi`, 404 on missing, no JSX in `try/catch`
- [ ] Pass `overview` to `OverviewView`
- [ ] Verify `/engagements/eng-rbi-it-exam-fy27`

### Task 2: Header + engagement timeline

**Files:** `overview-helpers.ts`, `overview-header.tsx`, `overview-phase-rail.tsx`, `overview-view.tsx`

- [ ] Implement §7.1–§7.3 helpers incl. `formatTimelineCaption`, badge classes
- [ ] Header card (§8.1) + timeline card (§8.2) as separate `SectionItem`s
- [ ] Horizontal stepper with connector lines; display-only
- [ ] `PageReveal` + `SectionStagger`

### Task 3: Module link cards

**Files:** `overview-module-cards.tsx`

- [ ] Six cards per §7.4 / §8.3
- [ ] `Link` + `ROW_HOVER_CLASS` + stagger on mount

### Task 4: Team completion table

**Files:** `overview-team-panel.tsx`, `overview-team-table.tsx`

- [ ] Toolbar + columns per §8.4
- [ ] Algorithms §7.5–§7.9 in `overview-helpers.ts`
- [ ] Footer totals; `motion.tbody` without remount on filter

### Task 5: SLA band + activity feed

**Files:** `overview-sla-band.tsx`, `overview-activity-feed.tsx`

- [ ] §8.5 + §8.6 in `lg:grid-cols-2` band

### Task 6: Scope drawer

**Files:** `overview-scope-drawer.tsx`

- [ ] §8.7 accordion; conditional §7.11

### Task 7: Orchestrator

- [ ] Compose §3.2 order; `engagementId` on cards

### Task 8: QA

- [ ] §11 checklist; lint clean; light/dark spot-check

### Task 9 (optional): Expanded history

- [ ] `getEngagementHistoryApi` read-only expand — not required for done

---

## 13. Definition of done

- [ ] `/engagements/[id]` is a full Command deck dashboard (not stub H1)
- [ ] Every §8 block implemented with §7 algorithms
- [ ] Six module cards deep-link to correct routes (stubs OK)
- [ ] Team table: search, four filters, seven sortable columns, footer, IDR/ADR tooltip
- [ ] SLA stat strip only — no donut
- [ ] Activity + scope drawer per spec
- [ ] Motion per §5; reduced-motion safe
- [ ] UI-only — zero backend work
- [ ] Another engineer can build from **this document alone**

---

## 14. Build order

1. Task 1 → 2 → 3 (first reviewable: identity + rail + cards)  
2. Task 4 (team table)  
3. Task 5 → 6 → 7  
4. Task 8 QA  

---

## 15. Agent notes

- Engagement **name** is H1 here; ADR workspace uses module name as H1 — do not swap.
- Use field `approved` in data/API; UI column label is **Closed**.
- `TeamCompletion` may be loose in types — narrow locally to `TeamCompletionRow` (§6.2).
- SLA risk card is not a navigation tab — scroll to `#sla-band` or omit href.
- Module cards use **cards**, not ADR-style floating KPI numbers.
- Keep all user-facing copy exactly as specified in §8 (professional, short).
