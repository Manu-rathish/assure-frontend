# Remediation — Complete UI Rebuild Specification

> **Purpose:** Self-contained, pixel-level rebuild spec for all remediation surfaces in assure-frontend: **global register** `/remediation`, **engagement hub** `/engagements/[id]/remediation`, **action item detail**, and **per-finding remediation plan**.  
> **Audience:** Engineers or agents rebuilding these screens in **any** codebase with **no** access to other repos, legacy apps, or tribal knowledge.  
> **Scope:** UI only — layouts, copy, tokens, motion, filter/group algorithms, create/status shells. No auth, no backend, no persistence.  
> **Design name:** **Closeout hub** — calm workspace for corrective action items linked to accepted findings — not a dense legacy dashboard.

**Definition of the module:** Remediation is engagement phase 5 (final). After findings are accepted, BDTS tracks **action items** — owned by teams, optionally assigned, moving through status stages. Surfaces answer:

| Surface | Question |
|---|---|
| **Engagement hub** | Which findings have open remediation work on *this* engagement, and what is the flat item list? |
| **Finding plan** | How far is *this finding’s* plan from closed? |
| **Action item detail** | Who owns it, what stage is it in, what transitions are allowed? |
| **Global register** | What action items exist *org-wide*, filtered by engagement/status/search? |

**Architecture:** Thin RSC pages load via `listActionItemsApi`, `getActionItemDetailApi`, `listFindingsApi`, `getFindingDetailApi`, `getRemediationRegisterApi`, `listTeamsApi`. Client components own URL filters (global register + optional hub table filters). Presentation only.

**Tech stack (source repo):** Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn **radix-mira** · `motion` v12 via `@/lib/motion` · `lucide-react` icons.

**Companion docs:** [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) · [`lib/motion/ANIMATION.md`](../../lib/motion/ANIMATION.md) · [`docs/report/report.md`](../report/report.md) · [`docs/IDR/idr.md`](../IDR/idr.md) · [`docs/inbox/inbox.md`](../inbox/inbox.md) · [`docs/history/history.md`](../history/history.md) · product flow [`docs/Docs/Engagements/05-remediation-flow.md`](../../../docs/Docs/Engagements/05-remediation-flow.md) · phase plan [`development-plan/13-remediation.md`](../../../development-plan/13-remediation.md).

---

## 0. How to use this document

1. Read §1–§3 (constraints, routes, page shells).  
2. Copy design tokens (§4) and motion rules (§5).  
3. Implement data types and loaders per §6.  
4. Implement every algorithm in §7 verbatim in `remediation-helpers.ts`.  
5. Build each UI block per §8 — every label, class, and empty state is specified.  
6. Follow file layout §9; wire client state §10.  
7. Verify against §11 (engagement) and §11B (global register).  
8. Track build progress with §12 tasks.

---

## 1. Hard constraints

| Rule | Detail |
|---|---|
| **UI only** | No HTTP endpoints, DB schema, server actions, or action-item persistence. |
| **Read-only data** | `listActionItemsApi`, `getActionItemDetailApi`, `listFindingsApi`, `getFindingDetailApi`, `getRemediationRegisterApi`, `getEngagementDetailApi`, `listTeamsApi` (create dialog pickers only). |
| **Dummy data** | Do not mutate `Data.json` at runtime. |
| **Create / status transitions** | UI + client validation only — submit disabled or toast **“Coming soon”**. |
| **No evidence attachments** | `evidence_captured` is a status label only — no file upload UI. |
| **Finding link by code** | Group items by free-text `findingCode` string match (legacy). No `findingId` FK required in UI. |
| **No charts** | Progress uses horizontal bars only — no Recharts. |
| **Business IDs in URLs** | `/remediation/AI-001`, `/remediation/findings/F-007`. |
| **CO-only (production)** | v1 CO creates; team updates own-team items via My Plate (out of scope here). |
| **No assignee picker in create** | v1 create dialog has owner team only — assignee stays null in seed. |
| **Overview KPI note** | Overview may show `actionItemsOpen: 14` / `actionItemsTotal: 16`; engagement seed has **10** items — use `listActionItemsApi` as source of truth per engagement. |
| **Register vs engagement counts** | Global register seed has **14** cross-engagement items; RBI engagement has **10** — do not conflate. |
| **Progress metric** | Plan/register progress uses **`closed` only** — not `verified`. “In verification” is a separate KPI. |
| **Finding metadata vs linked items** | Register column `actionItemsOpen/Total` comes from **finding** metadata; progress bar uses **linked action items** count. |
| **No SlaIndicator component** | Use `slaLabel` + optional mini bar (§7.2) or port `computeSlaState` (§7.11). |

---

## 2. Routes and navigation map

### 2.1 Engagement-scoped routes

```
/engagements/{engagementId}/remediation                              → Engagement hub
/engagements/{engagementId}/remediation/{actionItemId}                 → Action item detail
/engagements/{engagementId}/remediation/findings/{findingCode}         → Per-finding plan
```

**Entry paths:**
- Subnav → **Remediation** tab  
- Overview module card / phase rail  
- Finding detail remediation card → plan or hub  
- Finding register row → `/remediation/findings/{findingCode}`  
- Flat table / register row → `/remediation/{actionItemId}`  
- Inbox action item card → detail href  
- History event link (action items) → remediation **hub** (not item detail — v1 history behavior)

### 2.2 Global register route

```
/remediation?q=&status=&engagement=
```

| Param | Values | Default |
|---|---|---|
| `q` | free text | empty |
| `status` | `open_all` · `overdue` · `open` · `in_progress` · `evidence_captured` · `verified` · `closed` | all |
| `engagement` | engagement id | all |

**Entry paths:**
- App shell / command palette (future)  
- Inbox header → **View all action items**  
- Global register KPI **Overdue** tile when count > 0 → `?status=overdue`

**Exit paths:** row links → `/engagements/{id}/remediation/{actionItemId}`

### 2.3 Subnav active state

Pathname starts with `/engagements/{id}/remediation` → **Remediation** tab active (includes nested routes).

**Tab order:** Overview · IDR · ADR · Examination · Report · Findings · **Remediation**

### 2.4 Cross-surface links (reference)

| Surface | Link target |
|---|---|
| Inbox Response tab | `item.href` → action item detail |
| Finding detail card | **View plan →** → finding plan |
| Hub flat table Finding col | `/findings/{code}` (findings tab — **not** plan) |
| Finding register Finding col | `/remediation/findings/{code}` (plan) |
| Plan header | **Full detail →** → `/findings/{code}` |
| Detail finding chip | finding plan (optional) or findings detail |

---

## 3. Page shell and layout

### 3.1 Global register page

```tsx
// app/remediation/page.tsx
import { RemediationRegisterView } from "@/app/remediation/_components/remediation-register-view";
import { getRemediationRegisterApi } from "@/lib/api/remediation";
import {
  buildRegisterPageData,
  parseRegisterSearchParams,
} from "@/app/remediation/_components/remediation-register-helpers";
```

Load `getRemediationRegisterApi()` → filter client-side with `parseRegisterSearchParams`.

### 3.2 Engagement hub page

```tsx
// app/engagements/[id]/remediation/page.tsx
import { RemediationHub } from "@/app/engagements/[id]/remediation/_components/remediation-hub";
import { listActionItemsApi } from "@/lib/api/remediation";
import { listFindingsApi } from "@/lib/api/findings";
import { getEngagementDetailApi } from "@/lib/api/engagements";
import { listTeamsApi } from "@/lib/api/teams";
```

Parallel load (404 if engagement missing):
1. `getEngagementDetailApi(id)` → `code`  
2. `listActionItemsApi(id, { limit: 500 })`  
3. `listFindingsApi(id, { limit: 500 })`  
4. `listTeamsApi({ limit: 100 })` — create dialog only

### 3.3 Action item detail page

```tsx
getActionItemDetailApi(engagementId, actionItemId) → 404 on miss
```

### 3.4 Finding remediation plan page

```tsx
getFindingDetailApi(engagementId, findingCode) + listActionItemsApi filtered by findingCode
```

Decode `findingCode` from URL segment (supports encoded codes).

### 3.5 Shared layout shell

```tsx
<main className="min-h-[calc(100dvh-3.5rem-3rem)]">
  <PageReveal className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
    <SectionStagger className="flex flex-col gap-6">
      {/* blocks */}
    </SectionStagger>
  </PageReveal>
</main>
```

Global `/remediation` uses app shell only (no engagement subnav).

### 3.6 Vertical block order

**Global register:** Header → KPI tiles (3) → filter bar → filtered count caption → table

**Engagement hub:** Header + Add action item → KPI strip (3) → finding register (conditional) → all action items panel (toolbar + table)

**Detail:** Back link → header (title, id, badges, SLA) → `lg:grid` left (details, status workflow) · right (ownership)

**Finding plan:** Breadcrumb → header band → plan progress → linked items table

---

## 4. Design tokens

Reuse §4 from [`docs/IDR/idr.md`](../IDR/idr.md).

### 4.1 Action item status badge

| Status | Label (exact) | Dot color |
|---|---|---|
| `open` | Open | `bg-muted-foreground` |
| `in_progress` | In progress | `bg-sla-warn` |
| `evidence_captured` | Evidence captured | `bg-primary` |
| `verified` | Verified | `bg-sla-complete` |
| `closed` | Closed | `bg-sla-complete` |

Badge: `inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium` + dot `size-1.5 rounded-full`.

**Transition button labels:** `Mark {formatActionItemStatus(status)}` — e.g. **Mark In progress**, **Mark Closed** (`closed` uses `variant="outline"`).

### 4.2 SLA display (no legacy SlaIndicator)

| Condition | Display |
|---|---|
| `closed` or `verified` | **Done** · muted |
| overdue open item | **Overdue** · destructive |
| due within 48h | **≤48h** · warn/primary |
| else | **—** |

Optional row left border: `border-l-2 border-l-destructive` when overdue.

Optional mini bar (global register parity): 2px track + label from `computeSlaState` §7.11.

### 4.3 Finding register

Severity left border from report/findings (`severityRowBorder`).

Progress bar tones: 100% → emerald/green · ≥50% → amber · else → blue/primary.

### 4.4 KPI tiles

`grid gap-3 sm:grid-cols-3` · value `text-2xl font-bold tabular-nums` · label `text-xs text-muted-foreground`.

Overdue tile: `tone="danger"` when count > 0 · optional href to filtered view.

---

## 5. Motion system

Same tokens as IDR §5.

| Moment | Pattern |
|---|---|
| Page mount | `PageReveal` + `SectionStagger` |
| KPI tiles | optional `SectionItem` stagger |
| Table rows | `listContainer` / `listItem` on first paint |
| Progress bars | width/`scaleX` · `duration.barFill` · once on mount |
| Filter change | no remount stagger |

---

## 6. Data contract

### 6.1 Loaders (existing)

```ts
listActionItemsApi(engagementId, params?: ListActionItemsParams): Promise<Page<ActionItemListItem>>
getActionItemDetailApi(engagementId, actionItemId): Promise<ActionItemDetail>
getRemediationRegisterApi(): Promise<RemediationRegister>
listFindingsApi(engagementId, params?): Promise<Page<FindingListItem>>
getFindingDetailApi(engagementId, findingCode): Promise<FindingDetail>
listTeamsApi(params?): Promise<Page<Team>>
getEngagementDetailApi(engagementId): Promise<EngagementOverview>
```

```ts
interface ListActionItemsParams {
  status?: string;
  findingCode?: string;
  limit?: number;
  offset?: number;
}
```

### 6.2 Action item types (`lib/types/remediation.ts`)

```ts
interface ActionItemListItem {
  id: string;
  actionItemId: string;
  title: string;
  description: string | null;
  findingCode: string | null;
  engagementId: string;
  engagementCode: string;
  engagementName: string;
  ownerTeamName: string;
  assigneeName: string | null;
  dueDate: string | null;
  status: string;
  updatedAt: string;
  createdAt: string;
  permissionsByRole: Record<string, ActionItemPermissions>;
}
```

### 6.3 Global register shape (`views.remediationRegister`)

```ts
interface RemediationRegister {
  items: ActionItemListItem[];
  summary: {
    openCount: number;      // open + in_progress
    overdueCount: number;
    verifiedCount: number;  // evidence_captured + verified
    total: number;
  };
  engagementFilters: Array<{ id: string; code: string; name: string }>;
}
```

**Seed summary:** open **14** · overdue **6** · verified **0** · total **14**  
**Engagement filters in seed:** RBI · TPA · IA-CARDS · CLOUD-ASSURE (4 codes)

### 6.4 Status vocabulary & transitions

```ts
const STATUS_TRANSITIONS: Record<string, string[]> = {
  open: ["in_progress", "closed"],
  in_progress: ["evidence_captured", "verified", "closed"],
  evidence_captured: ["verified", "closed"],
  verified: ["closed"],
  closed: [],
};
```

Shortcuts exist in v1 (e.g. `open` → `closed`, `in_progress` → `verified`) — show all allowed buttons.

### 6.5 Seeded test engagement — `eng-rbi-it-exam-fy27`

**Action items (10 in `remediation.actionItems`):**

| ID | Finding | Status | Owner | Due (notable) |
|---|---|---|---|---|
| AI-001 | F-007 | in_progress | IT Operations | Sep 8 |
| AI-002 | F-007 | open | GRC | Sep 15 |
| AI-003 | F-007 | open | GRC | Sep 22 |
| AI-004 | F-007 | open | SOC | Sep 9 |
| AI-005 | F-001 | open | Cyber Security | **Aug 9 (overdue)** |
| AI-006 | F-001 | open | Cyber Security | Aug 26 |
| AI-007 | F-002 | open | IT Operations | — |
| AI-008 | F-009 | evidence_captured | BCM | — |
| AI-010 | F-012 | in_progress | IT Operations | — |
| AI-238 | — (unlinked) | open | GRC | Aug 27 |

**Hub KPIs:**
- Open (`open` + `in_progress`): **8**  
- In verification (`evidence_captured` + `verified`): **1**  
- Closed: **0**

**Finding register:** F-007 (4 items, 0% progress, 4/4 open/total metadata) · F-001 (2) · F-009 (1) · F-012 (1) · F-002 (1) · findings with zero linked items still listed

**Sample detail:** `AI-001` — PAM retention · description present · F-007 chip

**Sample plan:** `/remediation/findings/F-007` — 4 items · 0% complete

---

## 7. Algorithms (implement verbatim)

Colocate engagement helpers in `remediation-helpers.ts`; global register in `remediation-register-helpers.ts` (or shared file).

### 7.1 Date formatting

```ts
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "Not set";
  return formatDate(iso);
}
```

Tables use `formatDate`; detail ownership **Target date** uses `formatDateTime` with **Not set** for null.

### 7.2 Overdue & SLA helpers

```ts
const TERMINAL_STATUSES = new Set(["closed", "verified"]);

function isActionItemOverdue(item: ActionItemListItem, now = Date.now()) {
  if (!item.dueDate || TERMINAL_STATUSES.has(item.status)) return false;
  return new Date(item.dueDate).getTime() < now;
}

function isDueWithin48h(item: ActionItemListItem, now = Date.now()) {
  if (!item.dueDate || TERMINAL_STATUSES.has(item.status)) return false;
  const due = new Date(item.dueDate).getTime();
  return due >= now && due <= now + 48 * 60 * 60 * 1000;
}

function slaLabel(item: ActionItemListItem, now = Date.now()) {
  if (TERMINAL_STATUSES.has(item.status)) return "Done";
  if (isActionItemOverdue(item, now)) return "Overdue";
  if (isDueWithin48h(item, now)) return "≤48h";
  return "—";
}

function slaRowAccent(item: ActionItemListItem, now = Date.now()) {
  if (isActionItemOverdue(item, now)) return "border-l-2 border-l-destructive";
  if (isDueWithin48h(item, now)) return "border-l-2 border-l-primary/50";
  return "";
}
```

### 7.3 Hub KPI counts

```ts
function countOpenWork(items: ActionItemListItem[]) {
  return items.filter((i) => i.status === "open" || i.status === "in_progress").length;
}

function countInVerification(items: ActionItemListItem[]) {
  return items.filter((i) => i.status === "evidence_captured" || i.status === "verified").length;
}

function countClosed(items: ActionItemListItem[]) {
  return items.filter((i) => i.status === "closed").length;
}
```

**Note:** `countInVerification` ≠ finding metadata `actionItemsOpen` (which includes `evidence_captured` in findings domain).

### 7.4 Group items by finding code

```ts
function groupItemsByFindingCode(items: ActionItemListItem[]) {
  const map = new Map<string, ActionItemListItem[]>();
  const unlinked: ActionItemListItem[] = [];
  for (const item of items) {
    if (item.findingCode) {
      const group = map.get(item.findingCode) ?? [];
      group.push(item);
      map.set(item.findingCode, group);
    } else {
      unlinked.push(item);
    }
  }
  return { map, unlinked };
}

function buildFindingRegisterRows(findings: FindingListItem[], itemsByCode: Map<string, ActionItemListItem[]>) {
  return findings.map((finding) => {
    const items = itemsByCode.get(finding.findingCode) ?? [];
    const closed = items.filter((i) => i.status === "closed").length;
    return { finding, items, closedCount: closed };
  });
}

function hasFindingLinks(rows: ReturnType<typeof buildFindingRegisterRows>) {
  return rows.some((r) => r.items.length > 0);
}
```

**Unlinked items** (e.g. AI-238): appear in flat table only — not under a finding row.

### 7.5 Finding plan progress

```ts
function planProgress(items: ActionItemListItem[]) {
  const closed = items.filter((i) => i.status === "closed").length;
  const total = items.length;
  const pct = total === 0 ? 0 : Math.round((closed / total) * 100);
  return { closed, total, pct };
}

function progressBarTone(pct: number) {
  if (pct === 100) return "bg-green-500";
  if (pct >= 50) return "bg-amber-400";
  return "bg-blue-400";
}
```

### 7.6 Engagement hub flat table filters (Assure enhancement)

v1 engagement hub has **no** client filters on flat table; Assure adds toolbar filters for usability:

```ts
const ACTION_QUICK_FILTERS = ["all", "open", "overdue", "due_48h", "unlinked"] as const;

function matchesActionFilter(item: ActionItemListItem, filter: ActionQuickFilter, now = Date.now()) {
  switch (filter) {
    case "open": return item.status === "open" || item.status === "in_progress";
    case "overdue": return isActionItemOverdue(item, now);
    case "due_48h": return isDueWithin48h(item, now);
    case "unlinked": return !item.findingCode;
    default: return true;
  }
}

function matchesActionSearch(item: ActionItemListItem, search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    item.actionItemId.toLowerCase().includes(q) ||
    item.title.toLowerCase().includes(q) ||
    (item.findingCode?.toLowerCase().includes(q) ?? false) ||
    item.ownerTeamName.toLowerCase().includes(q) ||
    (item.assigneeName?.toLowerCase().includes(q) ?? false)
  );
}
```

Default sort: `actionItemId` localeCompare ascending.

### 7.7 Create dialog helpers

```ts
function suggestNextActionItemId(items: ActionItemListItem[]) {
  let max = 0;
  for (const item of items) {
    const match = /^AI-(\d+)$/i.exec(item.actionItemId.trim());
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `AI-${String(max + 1).padStart(3, "0")}`;
}
```

**Test engagement:** max numeric **238** → suggest **AI-239**.

**Validation (UI only):**
- `actionItemId` required · pattern `^AI-[A-Z0-9-]+$`  
- `title` min 5 chars  
- `ownerTeamSlug` / `ownerTeamId` required  
- Optional: `findingCode`, `description`, `dueDate`

### 7.8 Status helpers

```ts
function getAllowedTransitions(status: string) {
  return STATUS_TRANSITIONS[status] ?? [];
}

function formatActionItemStatus(status: string): string {
  const labels: Record<string, string> = {
    open: "Open",
    in_progress: "In progress",
    evidence_captured: "Evidence captured",
    verified: "Verified",
    closed: "Closed",
  };
  return labels[status] ?? status;
}
```

### 7.9 Global register summary

```ts
function summarizeActionItemRegister(items: ActionItemListItem[], now = Date.now()) {
  const openCount = items.filter((i) => i.status === "open" || i.status === "in_progress").length;
  const overdueCount = items.filter((i) => isActionItemOverdue(i, now)).length;
  const verifiedCount = items.filter(
    (i) => i.status === "evidence_captured" || i.status === "verified",
  ).length;
  return { openCount, overdueCount, verifiedCount, total: items.length };
}
```

Prefer seed `summary` when displaying unfiltered register; recompute when verifying algorithms.

### 7.10 Global register filter (`filterRegisterItems`)

Port v1 `filterActionItems`:

```ts
type RegisterStatusFilter =
  | "open_all"
  | "overdue"
  | "open"
  | "in_progress"
  | "evidence_captured"
  | "verified"
  | "closed";

function filterRegisterItems(
  items: ActionItemListItem[],
  options: { q?: string; status?: RegisterStatusFilter; engagementId?: string },
  now = Date.now(),
) {
  const query = options.q?.trim().toLowerCase();

  return items.filter((item) => {
    if (options.engagementId && item.engagementId !== options.engagementId) return false;

    if (options.status === "open_all") {
      if (item.status !== "open" && item.status !== "in_progress") return false;
    } else if (options.status === "overdue") {
      if (!isActionItemOverdue(item, now)) return false;
    } else if (options.status && item.status !== options.status) {
      return false;
    }

    if (!query) return true;

    return (
      item.actionItemId.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query) ||
      item.engagementCode.toLowerCase().includes(query) ||
      item.engagementName.toLowerCase().includes(query) ||
      item.ownerTeamName.toLowerCase().includes(query) ||
      (item.findingCode?.toLowerCase().includes(query) ?? false)
    );
  });
}
```

**Sort (register default):** `dueDate` asc (nulls last), then `actionItemId` asc — match v1 DB order approximately on dummy data.

### 7.11 Optional SLA mini bar (`computeSlaState`)

For global register parity with v1 `SlaIndicator`:

```ts
function computeSlaState(dueDate: Date | null, status: string) {
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
      label: hours < 24 ? `${hours}h overdue` : `${Math.round(hours / 24)}d overdue`,
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
```

**Assure improvement:** map `verified`/`closed` action item statuses to `"approved"` before calling (inbox card pattern) — avoids false overdue bars.

### 7.12 `actionItemHref`

```ts
function actionItemHref(engagementId: string, actionItemId: string) {
  return `/engagements/${engagementId}/remediation/${actionItemId}`;
}
```

---

## 8. UI specification (every block)

### 8.1 Global register header

**H1:** Remediation  
**Description:** `Cross-engagement action item tracker · {openCount} open · {verifiedCount} in verification · {overdueCount} overdue`

Use `summary` from seed or `summarizeActionItemRegister`.

### 8.2 Global register KPI tiles

| Label | Value | Notes |
|---|---|---|
| Open action items | `openCount` | |
| Overdue | `overdueCount` | danger tone · href `/remediation?status=overdue` when >0 · footer **View overdue** |
| Total tracked | `total` | all items count |

### 8.3 Global register filter bar (`remediation-register-filter-bar.tsx`)

**Search form:** placeholder `Search action item…` · **Search** button · param `q`

**Engagement chips:** **All engagements** + each from `engagementFilters` · param `engagement`

**Status chips:**

| Label | param `status` |
|---|---|
| All statuses | (omit) |
| Open | `open_all` |
| In progress | `in_progress` |
| Overdue | `overdue` |
| Verified | `verified` |
| Closed | `closed` |

**Gap vs server:** `evidence_captured` accepted in URL but no chip in v1 — optional chip **Evidence captured**.

When any filter active: `Showing {filtered.length} of {total} action items` · `text-xs text-muted-foreground`

### 8.4 Global register table

**Columns:** ID · Action item · Engagement · Owner · Target · Status · SLA

| Cell | Content |
|---|---|
| ID | mono link → detail |
| Action item | title link · subline `Finding {code}` when set |
| Engagement | name + code mono |
| Owner | team · assignee subline when set |
| Target | `formatDate(dueDate)` |
| Status | status badge |
| SLA | mini bar §7.11 or `slaLabel` |

**Empty:** `No action items yet. Create them from an engagement Remediation tab.`

Row hover: `hover:bg-muted/40` · `h-11`

### 8.5 Engagement hub header (`remediation-hub-header.tsx`)

**Left:**
1. Meta `{engagementCode}` mono  
2. H1 **Remediation**  
3. Subtitle `{findings.length} findings · {items.length} action items · {openCount} open`

**Right:** **Add action item** → create dialog §8.12

### 8.6 Hub KPI strip

| Label | Value |
|---|---|
| Open | `countOpenWork` |
| In verification | `countInVerification` |
| Closed | `countClosed` |

**Test:** 8 · 1 · 0

### 8.7 Finding register (`remediation-finding-register.tsx`)

Section: **Finding register** · uppercase tracking label

Render when `hasFindingLinks(rows)`.

| Column | Cell |
|---|---|
| Finding | `{findingCode}` link → **plan** |
| Title | clipped · link → plan |
| Severity | badge |
| Progress | mini bar · `No action items` when empty group |
| Items open / total | `{finding.actionItemsOpen} / {finding.actionItemsTotal}` center mono |
| Target close | `formatDate(targetCloseDate)` |

Row: severity left border.

### 8.8 All action items panel

Section: **All action items**

**Toolbar (Assure):** search · chips **All · Open · Overdue · Due 48h · Unlinked** · count caption

**Columns:** ID · Action item · Finding · Owner · Assignee (hidden `<lg`) · Target · Status · SLA

| Finding cell | Link to `/findings/{code}` — **findings tab**, not plan |
| Unlinked | `—` |

**Empty:** `No action items for this engagement yet.`  
**Filtered empty:** `No action items match these filters.` + **Clear filters**

### 8.9 Action item detail

**Back:** `← Back to remediation` → hub

**Header:**
- H1 `{title}` · `text-2xl font-semibold`
- Meta `{actionItemId}` mono
- Badges: status · **Finding {code}** chip (link to plan optional) · SLA text

**Details card** (when description): heading **Details** · body `whitespace-pre-wrap`

**Status workflow card:** §8.10

**Ownership card:**

| Label | Value |
|---|---|
| Owner team | `{ownerTeamName}` |
| Assignee | name or **Unassigned** |
| Target date | `formatDateTime(dueDate)` |
| Engagement | name + code |
| Updated | `formatDate(updatedAt)` optional |

### 8.10 Status workflow shell (`remediation-status-actions.tsx`)

Intro: **Advance this action item through remediation stages.**

Buttons: one per `getAllowedTransitions(status)` · label **Mark {status label}** · `closed` → outline · all **disabled** / toast in UI-only mode.

When no transitions: **This action item is closed.**

Team variant copy (My Plate — out of scope): *Move this item through remediation — pick the next stage when ready.*

### 8.11 Finding remediation plan

**Breadcrumb:** Remediation / `{findingCode}`

**Header band:** code mono bold · severity badge · finding status badge · title · **Full detail →** → findings detail

**Plan progress card:**
- **Plan progress** · `{closed} of {total} action items closed`
- Full-width bar + 0% — **{pct}% complete** — 100% labels
- At 100%: green callout **All action items closed — finding is ready to be verified in the Findings tab.**  
  (Assure IA — v1 said “Report tab”)

**Table title:** Action items for `{findingCode}` · header right **Target close · {date}**

Columns: ID · Action item · Owner · Target · Status · SLA

**Empty:** `No action items linked to this finding yet.`

### 8.12 Create dialog (`remediation-create-dialog.tsx`)

- Title: **Add action item**
- Description: **Track corrective work for this engagement. Saving is not connected yet.** (Assure) / v1: *Track a remediation task for this engagement.*

| Field | Required | Placeholder |
|---|---|---|
| ID | yes | `AI-004` · default suggested id |
| Finding | no | `F-007` |
| Title | yes | Describe the remediation action… |
| Details | no | Change request, dependencies, evidence notes… |
| Owner team | yes | Select team… |
| Target date | no | date input |

Buttons: **Cancel** · **Create action item** (toast only)

### 8.13 Copy deck (exact strings)

| Context | Copy |
|---|---|
| Hub H1 | Remediation |
| Global description | Cross-engagement action item tracker · … |
| Add action item | Add action item |
| Finding register | Finding register |
| All action items | All action items |
| Plan progress | Plan progress |
| 100% callout | All action items closed — finding is ready to be verified in the Findings tab. |
| Back link | Back to remediation |
| Full finding link | Full detail → |
| Workflow intro | Advance this action item through remediation stages. |
| Closed terminal | This action item is closed. |
| Register empty | No action items yet. Create them from an engagement Remediation tab. |
| Plan empty | No action items linked to this finding yet. |
| Unassigned | Unassigned |
| Target not set | Not set |

---

## 9. File structure

```
app/remediation/
  page.tsx
  _components/
    remediation-register-view.tsx
    remediation-register-filter-bar.tsx
    remediation-register-table.tsx
    remediation-register-helpers.ts

app/engagements/[id]/remediation/
  page.tsx
  _components/
    remediation-hub.tsx
    remediation-hub-header.tsx
    remediation-kpi-strip.tsx
    remediation-finding-register.tsx
    remediation-items-panel.tsx
    remediation-items-table.tsx
    remediation-create-dialog.tsx
    remediation-helpers.ts
    remediation-status-badge.tsx
    remediation-status-actions.tsx
    remediation-sla-display.tsx
  [actionItemId]/
    page.tsx
    _components/
      remediation-item-detail-view.tsx
  findings/
    [findingCode]/
      page.tsx
      _components/
        remediation-finding-plan-view.tsx

lib/api/remediation.ts              # EXISTING
lib/api/findings.ts                 # EXISTING
lib/types/remediation.ts            # EXISTING
```

Reuse severity/status badge helpers from findings/report when available — else duplicate minimal maps in `remediation-helpers.ts`.

**Do not:** add `lib/remediation/` top-level domain folder · top-level `components/action-items/` · My Plate routes in this task.

---

## 10. Client state and accessibility

### 10.1 Client state

| State | Owner | Default |
|---|---|---|
| `search` | hub items panel / register via URL `q` | `""` |
| `filter` | hub items panel | `"all"` |
| `createOpen` | hub | `false` |
| Register filters | URL `q`, `status`, `engagement` | — |

```tsx
type RemediationHubProps = {
  engagementId: string;
  engagementCode: string;
  items: ActionItemListItem[];
  findings: FindingListItem[];
  teams: Team[];
  canCreate: boolean;
};
```

`canCreate` from `permissionsByRole.co.canCreate` or default true in UI-only CO build.

### 10.2 Accessibility

- Tables: row links keyboard accessible · Enter → detail  
- Search `aria-label="Search action items"`  
- Filter chips `aria-pressed`  
- Dialog labelled fields · focus trap  
- Progress bars: `role="progressbar"` + `aria-valuenow` when used  
- Reduced motion: instant bar fills  
- Focus: `controlFocusClass`

### 10.3 Scope — in / out

**In:** global register · engagement hub · finding register · flat table · detail · finding plan · create/status shells · SLA display · inbox/register cross-links.

**Out:** backend persistence · My Plate team detail · evidence file upload · finding verify workflow · engagement phase automation · notification bell · assignee picker in create.

---

## 11. Verification checklist — engagement (`eng-rbi-it-exam-fy27`)

| # | Check | Expected |
|---|---|---|
| 1 | `/remediation` hub loads | No errors |
| 2 | Subnav | Remediation active |
| 3 | Subtitle | 8 findings · 10 action items · 8 open |
| 4 | KPIs | Open 8 · In verification 1 · Closed 0 |
| 5 | Finding register | F-007 row · 0% progress · 4/4 metadata |
| 6 | Flat table | 10 rows · AI-238 unlinked |
| 7 | Filter Unlinked | Shows AI-238 only |
| 8 | Filter Overdue | Shows AI-005 (due Aug 9) |
| 9 | Row AI-001 | Detail · in_progress · F-007 |
| 10 | Status buttons | Allowed transitions · disabled/toast |
| 11 | Plan F-007 | 4 items · 0% · item links |
| 12 | Finding col link | F-007 → `/findings/F-007` |
| 13 | Register row link | F-007 → plan route |
| 14 | Create dialog | Validates · no persist |
| 15 | Motion | Page enter once · no filter re-stagger |

---

## 11B. Verification checklist — global register

| # | Check | Expected |
|---|---|---|
| 1 | `/remediation` loads | No errors |
| 2 | Description | 14 open · 0 in verification · 6 overdue (seed summary) |
| 3 | KPI tiles | Match summary |
| 4 | Overdue tile | Links to `?status=overdue` when overdue > 0 |
| 5 | Search PAM | Finds AI-001 |
| 6 | Engagement chip RBI | Filters to RBI items |
| 7 | Status Open | Only open + in_progress |
| 8 | Row AI-001 | Links to RBI detail |
| 9 | Finding subline | Shows on linked items |
| 10 | Filter caption | Showing X of 14 when filtered |
| 11 | Empty register | Correct copy (if items array empty) |
| 12 | Inbox header link | Navigates from inbox → register |

---

## 12. Implementation tasks

### Task 1: Shared helpers

**Files:** `remediation-helpers.ts`, `remediation-register-helpers.ts`

- [ ] §7 algorithms · status badge · href helper

### Task 2: Global register

**Files:** `app/remediation/page.tsx`, register view/filter/table

- [ ] §8.1–§8.4 · §11B

### Task 3: Engagement hub load

**Files:** `remediation/page.tsx`, `remediation-hub.tsx`

- [ ] §3.2 · props wiring

### Task 4: Hub chrome

**Files:** header, KPI strip, create dialog

- [ ] §8.5–§8.6 · §8.12

### Task 5: Finding register

**File:** `remediation-finding-register.tsx`

- [ ] §8.7 · §7.4

### Task 6: All action items

**Files:** items panel + table

- [ ] §8.8 · §7.6

### Task 7: Action item detail

**Files:** `[actionItemId]/page.tsx`, detail view, status actions

- [ ] §8.9–§8.10

### Task 8: Finding plan

**Files:** `findings/[findingCode]/page.tsx`, plan view

- [ ] §8.11

### Task 9: QA

- [ ] §11 + §11B · design system · lint

---

## 13. Definition of done

- [ ] Global `/remediation` register fully functional (read-only)  
- [ ] Engagement hub is full Closeout workspace (not stub H1)  
- [ ] Finding register + flat table on dummy data  
- [ ] Detail + finding plan routes work  
- [ ] Create + status UI shells without persistence  
- [ ] SLA/overdue display without legacy SlaIndicator import  
- [ ] Inbox **View all action items** lands on register  
- [ ] Visuals match Assure design system  
- [ ] UI-only — zero backend work  
- [ ] Buildable from **this document alone**

---

## 14. Build order

1. Shared helpers + status badge  
2. Global register (inbox link target)  
3. Engagement hub header + KPIs + create dialog  
4. Finding register + flat table  
5. Detail route + status workflow shell  
6. Finding plan route  
7. §11 + §11B verification

**First slice:** Global register + engagement hub tables on `eng-rbi-it-exam-fy27`.

---

## 15. Agent notes

**Two item sources:** Engagement pages use `listActionItemsApi(engagementId)`. Global register uses `getRemediationRegisterApi().items` (14 cross-engagement rows). Counts may differ from a single engagement list.

**Open definition inconsistency (document, don’t “fix” seed):**
- Hub header KPI / register open: `open` + `in_progress`  
- Finding metadata `actionItemsOpen`: includes `evidence_captured`  
- Inbox response queue: `open` + `in_progress` only

**Progress vs verification:** Progress bars count **`closed`** only. `evidence_captured` / `verified` items contribute to **In verification** KPI, not progress numerator.

**Link targets differ by table:** Finding register → **plan**; flat table Finding column → **findings detail** (v1 parity).

**History deep links:** Action item audit events link to remediation **hub**, not item detail.

**Manual remediation path:** Accepting a finding does not auto-create action items — seed pre-links via `findingCode`.

**Status shortcuts:** UI shows all edges in `STATUS_TRANSITIONS` including skip paths (`open`→`closed`, etc.).

**Team My Plate:** Separate route `/my-plate/action-items/...` mirrors detail with different back link — not in this doc.

**Permissions:** Seed includes `permissionsByRole` — gate create button on `co.canCreate` when auth arrives; default visible in UI-only.

**Register summary.total:** Seed says 14 while engagement RBI list has 10 — both correct in their scope.

**Colocate helpers** in route `_components/` — no `lib/remediation/` domain folder.

**Duplicate doc:** Prior copy lived at `docs/engagement-remediation/remediation.md` — **`docs/remediation/remediation.md` is canonical.**
