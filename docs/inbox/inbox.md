# Unified Inbox — Complete UI Rebuild Specification

> **Purpose:** Self-contained, pixel-level rebuild spec for `/inbox` — the CO **Unified Inbox** (cross-engagement work queue).  
> **Audience:** Engineers or agents rebuilding this screen in **any** codebase with **no** access to other repos, legacy apps, or tribal knowledge.  
> **Scope:** UI only — layouts, copy, tokens, motion, tab/filter algorithms, card grid, inline review action shells. No auth, no backend, no line approve/reject persistence.  
> **Design name:** **Work queue** — org-wide triage surface for response work, CO review, and a deferred approvals lane — not My Plate (team view) or the engagement dashboard.

**Definition of the module:** The Inbox aggregates **all active engagements** into three CO-facing queues:

| Tab | Contents | Sort |
|---|---|---|
| **Response** | Open IDR/ADR lines (`assigned` · `in_progress` · `rejected`) **plus** open action items (`open` · `in_progress`) | SLA urgency (overdue first) |
| **Review** | Submitted IDR/ADR lines awaiting CO decision | `submittedAt` desc |
| **Approval** | **Empty stub** — management-response approvals deferred | — |

It answers: *What needs team response org-wide, what is waiting on my review, and how much is overdue?*

**Architecture:** RSC page loads `InboxView` via `getInboxApi()`, normalizes seed shape to v1 semantics (§7.1), derives engagement filter chips client-side, applies URL filters (`tab`, `engagement`, `q`). Card grid presentation with optional inline approve/reject on Review tab (UI shell only).

**Tech stack (source repo):** Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn **radix-mira** · `motion` v12 via `@/lib/motion` · `lucide-react` icons.

**Companion docs:** [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) · [`lib/motion/ANIMATION.md`](../../lib/motion/ANIMATION.md) · [`docs/IDR/idr.md`](../IDR/idr.md) · [`docs/remediation/remediation.md`](../remediation/remediation.md) · [`docs/history/history.md`](../history/history.md) · product phase [`development-plan/09-co-inbox-dashboard.md`](../../../development-plan/09-co-inbox-dashboard.md) · v1 design [`itex-v1/docs/superpowers/specs/2026-06-05-unified-inbox-action-items-design.md`](../../../itex-v1/docs/superpowers/specs/2026-06-05-unified-inbox-action-items-design.md).

---

## 0. How to use this document

1. Read §1–§3 (constraints, route, page shell).  
2. Copy design tokens (§4) and motion rules (§5).  
3. Implement types and loader per §6 — `lib/types/inbox.ts`, `lib/api/inbox.ts`.  
4. Implement every algorithm in §7 verbatim in `inbox-helpers.ts`.  
5. Build each UI block per §8 — every label, class, empty state, and copy string is specified.  
6. Follow file layout §9; wire URL state §10.  
7. Verify against §11 using default dummy inbox seed.  
8. Track build progress with §12 tasks.

---

## 1. Hard constraints

| Rule | Detail |
|---|---|
| **UI only** | No HTTP endpoints, DB schema, or server actions that persist line status. |
| **Read-only loader** | `getInboxApi()` → `InboxView` from `Data.json` `views.inbox`. |
| **Approve / reject** | Review tab shows full inline UI (buttons + reject dialog). Submit → toast **“Coming soon”** or disabled — **no** status mutation in dummy build. |
| **No bulk approve** | One card at a time only (v1 parity). |
| **Approval tab stub** | Always render empty state copy — **ignore** seed `approvalItems` for tab content (v1 returns `[]`). |
| **Action items in Response** | Open action items appear on **Response** tab, not Approval (v1 `fetchOpenActionItems`). Seed may store them under `approvalItems` — normalize in §7.1. |
| **CO-only (production)** | v1 `/inbox` is CO/BDTS only. Teams use `/my-plate`. UI-only build: no auth gates; document intent §15. |
| **No notification bell** | Out of scope (phase 09). |
| **No live updates** | No websockets or polling. |
| **Card grid only** | v1 page uses responsive card grid — not table rows (`InboxItemRow` exists in legacy but is unused on page). |
| **Deep links** | Every row links to engagement-scoped detail (`href` on item). |
| **Global remediation link** | Header **View all action items** → `/remediation` when global register exists (`getRemediationRegisterApi` in repo). |
| **No SlaIndicator component** | Port `computeSlaState` into `inbox-sla-indicator.tsx` (§7.5) — same approach as remediation §4. |
| **Dummy data** | Do not mutate `Data.json` at runtime. |

---

## 2. Routes and navigation map

### 2.1 Primary route

```
/inbox?tab=&engagement=&q=
```

| Param | Values | Default |
|---|---|---|
| `tab` | `response` · `review` · `approval` | `response` (omit param) |
| `engagement` | engagement id | all engagements |
| `q` | free text (lowercased client-side) | empty |

**Tab URL rules (match v1 `InboxTabs`):**
- `response` → omit `tab` param
- `review` → `?tab=review`
- `approval` → `?tab=approval`

Preserve `engagement` and `q` when switching tabs.

### 2.2 Entry paths

| Source | Target |
|---|---|
| App shell nav → **Inbox** | `/inbox` |
| Dashboard deep links (future) | `/inbox?tab=review` |
| Direct URL | `/inbox` |

**Not entry paths:** My Plate (team) · engagement subnav · line detail.

### 2.3 Exit paths (from cards)

| `kind` | Typical `href` |
|---|---|
| `idr` | `/engagements/{id}/idr/lines/{displayId}` |
| `adr` | `/engagements/{id}/adr/lines/{displayId}` |
| `action_item` | `/engagements/{id}/remediation/{displayId}` |

Review **Open** button uses same line URL pattern: `/engagements/{id}/{lineKind}/lines/{lineId}`.

---

## 3. Page shell and layout

### 3.1 Server page

```tsx
// app/inbox/page.tsx
import { InboxView } from "@/app/inbox/_components/inbox-view";
import { getInboxApi } from "@/lib/api/inbox";
import {
  buildInboxPageData,
  parseInboxSearchParams,
} from "@/app/inbox/_components/inbox-helpers";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const params = parseInboxSearchParams(rawParams);
  const raw = await getInboxApi();
  const data = buildInboxPageData(raw, params);

  return <InboxView data={data} params={params} />;
}
```

Wrap client subcomponents (`InboxTabs`, `InboxFilters`, `InboxKpiRow`) in `<Suspense fallback={null}>` when they use `useSearchParams`.

### 3.2 Layout shell

```tsx
<main className="min-h-[calc(100dvh-3.5rem)]">
  <PageReveal className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
    <SectionStagger className="flex flex-col gap-6">
      {/* header → KPI → tabs+filters → card grid */}
    </SectionStagger>
  </PageReveal>
</main>
```

Uses global app shell (navbar with Inbox nav item) — no engagement subnav.

### 3.3 Vertical block order

```
Page header (title, subtitle, “View all action items” action)
→ KPI strip (response · to review · overdue)
→ Tabs row (Response | Review | Approval) + filter bar (search + engagement chips)
→ Card grid OR empty state
```

---

## 4. Design tokens

Reuse global tokens from [`docs/IDR/idr.md`](../IDR/idr.md) §4.

### 4.1 Page header

| Element | Classes |
|---|---|
| H1 | `text-2xl font-semibold tracking-tight` |
| Description | `text-sm text-muted-foreground` |
| Action button | `Button variant="outline" size="sm"` + `ArrowRightIcon size-3.5` |

**Copy:**
- H1: `Inbox`
- Description: `Your cross-engagement work queue · {counts.total} items`

### 4.2 KPI strip (`inbox-kpi-row.tsx`)

Container: `flex flex-wrap items-center gap-4 rounded-lg border bg-card/50 px-4 py-3 text-sm`

Each KPI button: `flex items-center gap-2 rounded-md px-2 py-1` · clickable ones add `hover:bg-muted`

| KPI | Icon | Label suffix | Click → tab |
|---|---|---|---|
| `{counts.response}` | `InboxIcon` | `response` | `response` |
| `{counts.review}` | `ClipboardCheckIcon` | `to review` | `review` |
| `{counts.overdue}` | `AlertCircleIcon` | `overdue` | none (disabled) |

Overdue KPI: when `counts.overdue > 0` → icon + count use `text-destructive`. Overdue is not clickable (`cursor-default`).

### 4.3 Tabs (`inbox-tabs.tsx`)

Use shadcn `Tabs` + `TabsList variant="line"` + `TabsTrigger`.

Tab badge: `inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums`

- Active tab badge: `bg-foreground/10 text-foreground`
- Inactive with items: `bg-muted text-muted-foreground`
- Inactive empty: `bg-muted/50 text-muted-foreground/60`

**Review highlight:** when `counts.review > 0` and active tab ≠ `review`, Review tab trigger adds `text-primary`.

### 4.4 Filters (`inbox-filters.tsx`)

Search form: `flex w-full max-w-xs gap-2` · input `h-8 pl-8 text-sm` with `SearchIcon` absolute left.

Engagement chips: `Button size="sm" h-7 text-xs` — active `secondary`, inactive `outline` + `text-muted-foreground`.

Show first **5** engagements by code; remainder as `+{n} more` muted text (non-clickable).

Clear: ghost `h-7` with `XIcon` when engagement or q active.

### 4.5 Inbox card (`inbox-card.tsx`)

```
group relative flex flex-col rounded-lg border bg-card p-4 shadow-sm
hover:border-foreground/15 hover:shadow-md
transition-shadow duration-200
```

**Kind pill:** `font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground`

Labels: `IDR` · `ADR` · `Action`

**Display id link:** `font-mono text-xs text-muted-foreground hover:text-foreground`

**Title link:** `line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary`

**Engagement row:** name `font-medium text-foreground/80` · `·` · code `font-mono text-[10px]`

**Secondary row:** `{label}:` muted · value

**Actions footer:** `mt-4 flex items-center gap-2 border-t pt-3`

### 4.6 SLA mini indicator (`inbox-sla-indicator.tsx`)

2px bar + label below (port v1 `SlaIndicator` without legacy import):

| Variant | Bar class | Text class |
|---|---|---|
| `breach` | `bg-sla-breach` | `text-sla-breach` |
| `warn` | `bg-sla-warn` | `text-sla-warn` |
| `complete` | `bg-sla-complete` | `text-sla-complete` |
| `ok` | `bg-sla-ok` | `text-muted-foreground` |
| `neutral` | `bg-muted-foreground/30` | `text-muted-foreground` |

Container: `min-w-[72px]` · bar track `h-[2px] rounded-full bg-muted` · label `mt-1 text-[11px]`

Optional tooltip with full SLA text (v1 uses tooltip — optional in Assure).

### 4.7 Card grid

`grid gap-4 sm:grid-cols-2 lg:grid-cols-3`

Empty state: centered icon `InboxIcon` + title + description (build inline or shared empty component).

---

## 5. Motion system

Same tokens as IDR §5.

| Moment | Pattern |
|---|---|
| Page mount | `PageReveal` + `SectionStagger` |
| Card grid first paint | `SectionItem` per card OR CSS stagger `animationDelay: min(index * 50, 300)ms` with fade/slide |
| Tab / filter change | **No** page re-stagger — swap card content only |
| KPI click | URL navigation |
| Approve/reject pending | button `disabled` + opacity |

**Hard rule:** Filter/tab changes must not remount `SectionStagger`.

---

## 6. Data contract

### 6.1 Loader (existing)

```ts
getInboxApi(): Promise<InboxView>
```

Returns `loadDummy().views.inbox`.

### 6.2 TypeScript interfaces (`lib/types/inbox.ts`)

```ts
export type InboxItemKind = "idr" | "adr" | "action_item";

export interface InboxItem {
  kind: InboxItemKind;
  internalId: string;
  displayId: string;
  title: string;
  engagementId: string;
  engagementCode: string;
  engagementName: string;
  ownerTeamName: string;
  assigneeName: string | null;
  dueDate: string | null; // ISO
  status: string;
  href: string;
  lineKind?: "idr" | "adr";
  submittedAt?: string;
  submittedByName?: string | null;
}

export interface InboxReviewItem extends InboxItem {
  kind: "idr" | "adr";
  lineKind: "idr" | "adr";
  submittedAt?: string;
  submittedByName?: string | null;
}

export interface InboxCounts {
  response: number;
  review: number;
  approval: number; // always 0 in v1 UI
  overdue: number;
  total: number;
}

export interface InboxView {
  responseItems: InboxItem[];
  reviewItems: InboxReviewItem[];
  approvalItems: InboxItem[]; // seed may populate — UI ignores for Approval tab
  counts: InboxCounts;
}
```

### 6.3 Page data shape (after normalization)

```ts
export type InboxTab = "response" | "review" | "approval";

export interface InboxEngagementFilter {
  id: string;
  code: string;
  name: string;
}

export interface InboxPageData {
  responseItems: InboxItem[];
  reviewItems: InboxReviewItem[];
  approvalItems: InboxItem[]; // always [] for display
  counts: InboxCounts;
  engagementFilters: InboxEngagementFilter[];
  activeTab: InboxTab;
  filteredItems: InboxItem[]; // current tab after engagement + q filters
  query?: string;
  engagementId?: string;
}
```

### 6.4 Tab content rules

| Tab | Source array | Card secondary label | Card secondary value | Actions |
|---|---|---|---|---|
| `response` | `responseItems` | `Team` | `ownerTeamName` | **Open** link button |
| `review` | `reviewItems` | `Submitted by` | `assigneeName` (v1 page) | Approve · Reject · Open |
| `approval` | `[]` (forced) | — | — | empty state only |

### 6.5 Seeded dummy inbox (`Data.json` → `views.inbox`)

**Pre-normalization raw counts:**

| Field | Value |
|---|---|
| `responseItems` | **33** lines (IDR + ADR, multi-engagement) |
| `reviewItems` | **13** submitted lines |
| `approvalItems` | **14** action items (seed bucket — moved to Response by §7.1) |
| `counts` (seed) | response 33 · review 13 · approval 14 · overdue 12 · total 60 |

**Engagements represented:** `RBI-IT-EXAM-FY27` · `TPA-PWC-Q2-26` · `CERT-IN-DIR-FY27` · `IA-CARDS-Q3-26` · `CLOUD-ASSURE-26`

**After normalization (UI targets):**

| Field | Expected |
|---|---|
| `responseItems` | 33 lines + 14 action items = **47** |
| `reviewItems` | **13** |
| `approvalItems` (display) | **0** |
| `counts.approval` | **0** |
| `counts.response` | **47** |
| `counts.total` | **60** (47 + 13 + 0) |
| `counts.overdue` | recompute §7.4 (~**12+** from seed hint) |

**Sample Response lines (RBI):** L-006, L-007, L-010 (rejected), A-002, A-005 (rejected)…

**Sample Review lines (RBI):** L-004, L-005, L-012, L-018, A-001, A-004 — all `submittedAt` 23 Aug 2026

**Sample action items (after merge):** AI-001, AI-003, AI-005 (overdue), AI-101, AI-303…

**Spot-check hrefs:**
- `AI-001` → `/engagements/eng-rbi-it-exam-fy27/remediation/AI-001`
- `L-004` → `/engagements/eng-rbi-it-exam-fy27/idr/lines/L-004`

### 6.6 Field → UI mapping

| Field | UI |
|---|---|
| `kind` | Kind pill |
| `displayId` | Mono link (top of card) |
| `title` | Card title link |
| `engagementName` / `engagementCode` | Meta row |
| `ownerTeamName` | Response secondary |
| `assigneeName` | Review secondary (v1) |
| `dueDate` + `status` | SLA indicator |
| `href` | Open button / title link |
| `lineKind` | Review approve/reject routing |
| `internalId` | Reject dialog id · action payload |

---

## 7. Algorithms (implement verbatim)

Colocate in `inbox-helpers.ts`.

### 7.1 `buildInboxViewModel(raw: InboxView): InboxView`

Normalize seed to v1 semantics:

```ts
export function buildInboxViewModel(raw: InboxView): InboxView {
  // Seed quirk: open action items may live in approvalItems
  const actionItemsFromApproval = raw.approvalItems.filter(
    (item) => item.kind === "action_item",
  );
  const responseItems = sortResponseItems([
    ...raw.responseItems,
    ...actionItemsFromApproval.filter(
      (ai) => !raw.responseItems.some((r) => r.internalId === ai.internalId),
    ),
  ]);

  const reviewItems = sortReviewItems(raw.reviewItems);

  const approvalItems: InboxItem[] = [];

  const counts = computeInboxCounts(responseItems, reviewItems, approvalItems);

  return { responseItems, reviewItems, approvalItems, counts };
}
```

### 7.2 Response sort — SLA urgency (`compareInboxItems`)

Port from v1 `compareMyPlateLines` / `slaUrgencyRank`:

```ts
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export function slaUrgencyRank(dueDate: Date | null): number {
  if (!dueDate) return 3;
  const msUntilDue = dueDate.getTime() - Date.now();
  if (msUntilDue < 0) return 0; // overdue — highest urgency
  if (msUntilDue <= FORTY_EIGHT_HOURS_MS) return 1;
  return 2;
}

export function compareInboxItems(
  a: Pick<InboxItem, "dueDate">,
  b: Pick<InboxItem, "dueDate">,
): number {
  const aDue = a.dueDate ? new Date(a.dueDate) : null;
  const bDue = b.dueDate ? new Date(b.dueDate) : null;
  const rankDiff = slaUrgencyRank(aDue) - slaUrgencyRank(bDue);
  if (rankDiff !== 0) return rankDiff;
  if (!aDue && !bDue) return 0;
  if (!aDue) return 1;
  if (!bDue) return -1;
  return aDue.getTime() - bDue.getTime();
}

export function sortResponseItems(items: InboxItem[]): InboxItem[] {
  return [...items].sort(compareInboxItems);
}
```

### 7.3 Review sort — submitted date desc

```ts
export function sortReviewItems(items: InboxReviewItem[]): InboxReviewItem[] {
  return [...items].sort((a, b) => {
    const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return tb - ta;
  });
}
```

### 7.4 Overdue detection

```ts
const TERMINAL_STATUSES = new Set(["approved", "closed", "verified"]);

export function isInboxItemOverdue(
  item: Pick<InboxItem, "dueDate" | "status">,
  now = Date.now(),
): boolean {
  if (!item.dueDate) return false;
  if (TERMINAL_STATUSES.has(item.status)) return false;
  return new Date(item.dueDate).getTime() < now;
}

export function computeInboxCounts(
  responseItems: InboxItem[],
  reviewItems: InboxReviewItem[],
  approvalItems: InboxItem[],
): InboxCounts {
  const overdue = [...responseItems, ...reviewItems].filter((item) =>
    isInboxItemOverdue(item),
  ).length;

  return {
    response: responseItems.length,
    review: reviewItems.length,
    approval: approvalItems.length,
    overdue,
    total: responseItems.length + reviewItems.length + approvalItems.length,
  };
}
```

### 7.5 SLA state (`computeSlaState`)

Port v1 `lib/domain/sla.ts` for card indicator:

```ts
export type SlaVariant = "ok" | "warn" | "breach" | "complete" | "neutral";

export function computeSlaState(
  dueDate: Date | null,
  status: string,
): { variant: SlaVariant; width: number; label: string } {
  if (status === "approved") {
    return { variant: "complete", width: 100, label: "Done" };
  }
  if (!dueDate) {
    return { variant: "neutral", width: 0, label: "—" };
  }

  const msUntilDue = dueDate.getTime() - Date.now();

  if (msUntilDue < 0) {
    const hoursOverdue = Math.max(1, Math.round(Math.abs(msUntilDue) / 3_600_000));
    return {
      variant: "breach",
      width: 96,
      label:
        hoursOverdue < 24
          ? `${hoursOverdue}h overdue`
          : `${Math.round(hoursOverdue / 24)}d overdue`,
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

  if (hoursLeft <= 48) {
    return { variant: "warn", width, label };
  }
  return { variant: "ok", width, label };
}
```

**Card SLA status input:**

```ts
function slaStatusForItem(item: InboxItem): string {
  if (item.kind === "action_item") {
    return item.status === "closed" || item.status === "verified"
      ? "approved"
      : "in_progress";
  }
  return item.status;
}
```

Review cards always pass `status: "submitted"` to SLA indicator (v1).

### 7.6 Engagement filter list

Derive from normalized items (no separate API in assure):

```ts
export function deriveInboxEngagementFilters(
  items: InboxItem[],
): InboxEngagementFilter[] {
  const map = new Map<string, InboxEngagementFilter>();
  for (const item of items) {
    if (!map.has(item.engagementId)) {
      map.set(item.engagementId, {
        id: item.engagementId,
        code: item.engagementCode,
        name: item.engagementName,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}
```

Include engagements from **response + review** items only.

### 7.7 Search filter

Client-side on active tab items (v1 page):

```ts
export function matchesInboxSearch(item: InboxItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.displayId.toLowerCase().includes(q) ||
    item.title.toLowerCase().includes(q) ||
    item.engagementCode.toLowerCase().includes(q) ||
    item.engagementName.toLowerCase().includes(q) ||
    item.ownerTeamName.toLowerCase().includes(q)
  );
}
```

### 7.8 URL helpers

```ts
export function parseInboxSearchParams(
  params: Record<string, string | string[] | undefined>,
): { tab: InboxTab; engagementId?: string; q?: string } {
  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const tabParam = pick(params.tab);
  const tab: InboxTab =
    tabParam === "review" || tabParam === "approval" ? tabParam : "response";

  const engagementId = pick(params.engagement)?.trim() || undefined;
  const q = pick(params.q)?.trim().toLowerCase() || undefined;

  return { tab, engagementId, q };
}

export function buildInboxHref(options: {
  tab?: InboxTab;
  engagementId?: string;
  q?: string;
}): string {
  const params = new URLSearchParams();
  if (options.tab && options.tab !== "response") {
    params.set("tab", options.tab);
  }
  if (options.engagementId) {
    params.set("engagement", options.engagementId);
  }
  if (options.q) {
    params.set("q", options.q);
  }
  const qs = params.toString();
  return qs ? `/inbox?${qs}` : "/inbox";
}
```

### 7.9 `buildInboxPageData(raw, params)`

```ts
export function buildInboxPageData(
  raw: InboxView,
  params: ReturnType<typeof parseInboxSearchParams>,
): InboxPageData {
  const normalized = buildInboxViewModel(raw);
  const allForFilters = [...normalized.responseItems, ...normalized.reviewItems];
  const engagementFilters = deriveInboxEngagementFilters(allForFilters);

  const tabItems =
    params.tab === "review"
      ? normalized.reviewItems
      : params.tab === "approval"
        ? normalized.approvalItems
        : normalized.responseItems;

  let filteredItems = tabItems;

  if (params.engagementId) {
    filteredItems = filteredItems.filter(
      (item) => item.engagementId === params.engagementId,
    );
  }

  if (params.q) {
    filteredItems = filteredItems.filter((item) =>
      matchesInboxSearch(item, params.q!),
    );
  }

  return {
    ...normalized,
    engagementFilters,
    activeTab: params.tab,
    filteredItems,
    query: params.q,
    engagementId: params.engagementId,
  };
}
```

### 7.10 Open line statuses (reference)

**Response lines:** `assigned` · `in_progress` · `rejected`

**Review lines:** `submitted`

**Response action items:** `open` · `in_progress`

---

## 8. UI specification

### 8.1 Page header (`inbox-header.tsx`)

| Element | Copy / behavior |
|---|---|
| H1 | `Inbox` |
| Description | `Your cross-engagement work queue · {counts.total} items` |
| Action | Link `View all action items` → `/remediation` · outline sm button · `ArrowRightIcon` |

If `/remediation` route not built yet, link still renders (page may 404 until global register ships).

### 8.2 KPI row (`inbox-kpi-row.tsx`)

Three KPI buttons per §4.2. Clicking **response** or **to review** navigates with `buildInboxHref` preserving `engagement` + `q`.

### 8.3 Tabs (`inbox-tabs.tsx`)

| Tab | Label | Badge count |
|---|---|---|
| `response` | Response | `counts.response` |
| `review` | Review | `counts.review` |
| `approval` | Approval | `counts.approval` (always **0**) |

`onValueChange` → router.push with updated tab param.

### 8.4 Filters (`inbox-filters.tsx`)

**Search form:**
- Placeholder: `Search items…`
- Submit on form submit (preventDefault → push `q`)
- `defaultValue={currentQuery}`

**Engagement chips:**
- **All** — clears engagement filter
- Up to 5 codes from `engagementFilters`
- `+N more` when >5

**Clear** — removes `engagement` and `q` params

### 8.5 Empty states

| Tab | Title | Description |
|---|---|---|
| `response` | Nothing awaiting response | Open lines and action items assigned to teams will appear here. |
| `review` | No items to review | Team members submit lines for your review from their My Plate. |
| `approval` | No approvals pending | Management response approvals will appear here in a future release. |

**Search empty (any tab):**
- Title: `No matching items`
- Description: `No items match "{q}"`

### 8.6 Card grid (`inbox-card-grid.tsx`)

When `filteredItems.length === 0` → empty state §8.5.

Else → responsive grid §4.7 mapping each item to `InboxCard`.

Pass `style={{ animationDelay: \`${Math.min(index * 50, 300)}ms\` }}` for stagger.

### 8.7 Inbox card (`inbox-card.tsx`)

Structure per §4.5.

**Top row:** kind pill + displayId link (left) · SLA indicator (right)

**Title:** linked to `item.href`

**Engagement meta:** `{engagementName} · {engagementCode}`

**Secondary row:**
- Response: `Team: {ownerTeamName}`
- Review: `Submitted by: {assigneeName ?? "—"}`

**Actions footer:**

| Tab | Actions |
|---|---|
| Response | **Open** outline sm → `item.href` |
| Review | **Approve** primary sm · **Reject** outline sm · **Open** ghost sm (external link icon) |
| Approval | none |

### 8.8 Review actions (`inbox-card-actions.tsx`) — UI shell

Client component with local state.

**Approve button:**
- Icon `CheckIcon` · label `Approve`
- `disabled` when pending
- `onClick` → toast `Coming soon` (UI-only) OR call stub that does not mutate data

**Reject button:**
- Opens `Dialog`
- Title: `Reject line {lineId}`
- Description: `Provide a comment so the response team knows what to fix.`
- Textarea label: `Rejection comment` · placeholder `Explain what needs to change…`
- Footer: **Cancel** · **Reject line** (destructive, disabled when comment empty or pending)

**Open button:**
- Link `/engagements/{engagementId}/{lineKind}/lines/{lineId}`
- Ghost sm · `ExternalLinkIcon` · label `Open`

**Error line:** `{error}` in `text-xs text-destructive` · `role="alert"` when validation fails locally.

**Production target (document only):** wire to `approveLineAction` / `rejectLineAction` from IDR line workflow — then `router.refresh()`.

Props:

```ts
{
  engagementId: string;
  lineKind: "idr" | "adr";
  internalId: string;
  lineId: string; // displayId
}
```

Only render when `activeTab === "review"` && `item.lineKind` is set.

### 8.9 Kind pill (`inbox-kind-pill.tsx`)

| kind | Label |
|---|---|
| `idr` | IDR |
| `adr` | ADR |
| `action_item` | Action |

---

## 9. File structure

```
app/inbox/
  page.tsx                          # RSC loader + buildInboxPageData
  _components/
    inbox-view.tsx                  # orchestrator (can be client for suspense boundaries)
    inbox-header.tsx
    inbox-kpi-row.tsx               # client — useSearchParams
    inbox-tabs.tsx                  # client
    inbox-filters.tsx               # client
    inbox-card-grid.tsx
    inbox-card.tsx
    inbox-card-actions.tsx          # client — review approve/reject shell
    inbox-kind-pill.tsx
    inbox-sla-indicator.tsx
    inbox-helpers.ts                # §7 algorithms
```

**Existing nav:** `components/app-shell/nav-items.ts` already includes `{ label: "Inbox", href: "/inbox", icon: "inbox" }`.

**Do not:** add `lib/inbox/` top-level domain folder · team-facing inbox · notification bell · bulk actions.

**Import style:**

```tsx
import { getInboxApi } from "@/lib/api/inbox";
import { buildInboxPageData, parseInboxSearchParams } from "./_components/inbox-helpers";
```

---

## 10. Client state, URL sync, accessibility

### 10.1 URL as source of truth

All navigation via `router.push(buildInboxHref(...))` — tabs, KPI clicks, engagement chips, search, clear.

Do not store tab/filter in React state except transient dialog fields (reject comment).

### 10.2 Accessibility

| Element | Requirement |
|---|---|
| Tabs | `role="tablist"` via shadcn Tabs · badge counts readable |
| KPI buttons | `type="button"` · overdue KPI `disabled` |
| Search | `aria-label="Search inbox items"` |
| Engagement chips | discernible active state (secondary variant) |
| Cards | title links descriptive · kind pill visible text |
| Reject dialog | labelled textarea · focus trap · destructive action disabled until comment |
| Empty states | heading + description — not alert role |
| Approve/Reject | loading disables buttons |

### 10.3 Scope — in / out

**In:** `/inbox` page · three tabs · KPI strip · filters · card grid · SLA display · review action shells · deep links · header remediation link.

**Out:** Dashboard (same phase doc, separate build) · My Plate · team inbox · Approval tab real data · push notifications · bulk approve · table layout variant · auth redirects · `/remediation` register implementation (link only).

---

## 11. Verification checklist (default dummy seed)

| # | Check | Expected |
|---|---|---|
| 1 | `/inbox` loads | No errors · stub page replaced |
| 2 | Nav | Inbox active in app shell |
| 3 | Header | `60 items` total after normalization (47+13) |
| 4 | KPI row | response **47** · review **13** · overdue **>0** (destructive if overdue) |
| 5 | Tabs | Response · Review · Approval visible with badges |
| 6 | Response grid | Cards for lines + action items · AI-001 visible |
| 7 | Kind pills | IDR / ADR / Action labels |
| 8 | Open link | AI-001 → `/engagements/.../remediation/AI-001` |
| 9 | Review tab | 13 cards · L-004, L-005, A-001 present |
| 10 | Review actions | Approve · Reject · Open on review cards |
| 11 | Reject dialog | Requires comment · Reject line disabled when empty |
| 12 | Approve click | Toast / no persistence (UI-only) |
| 13 | Approval tab | Empty stub copy about future MR approvals |
| 14 | Approval badge | **0** |
| 15 | Search `PAM` | Filters cards · or empty message with quoted query |
| 16 | Engagement chip | `RBI-IT-EXAM-FY27` filters to RBI items only |
| 17 | Clear filters | Resets engagement + q |
| 18 | KPI click review | Navigates to `?tab=review` |
| 19 | Review tab highlight | Primary text when review count > 0 on other tabs |
| 20 | SLA indicator | Overdue items show breach styling (e.g. L-010, AI-005) |
| 21 | Sort | Overdue response items appear before later-due items |
| 22 | Header link | View all action items → `/remediation` |
| 23 | Motion | Page enter once · no re-stagger on tab change |
| 24 | Read-only | Approve/reject do not mutate Data.json |

---

## 12. Implementation tasks

### Task 1: Helpers + normalization

**File:** `inbox-helpers.ts`

- [ ] §7.1–7.9 · unit tests for sort, overdue, search

### Task 2: SLA indicator

**File:** `inbox-sla-indicator.tsx`

- [ ] §7.5 · §4.6 bar + label

### Task 3: Page load

**Files:** `page.tsx`, `inbox-view.tsx`

- [ ] §3.1 wiring · Suspense boundaries

### Task 4: Header + KPI

**Files:** `inbox-header.tsx`, `inbox-kpi-row.tsx`

- [ ] §8.1–§8.2

### Task 5: Tabs + filters

**Files:** `inbox-tabs.tsx`, `inbox-filters.tsx`

- [ ] §8.3–§8.4 · URL sync

### Task 6: Card grid

**Files:** `inbox-card-grid.tsx`, `inbox-card.tsx`, `inbox-kind-pill.tsx`

- [ ] §8.6–§8.7 · §8.9

### Task 7: Review actions

**File:** `inbox-card-actions.tsx`

- [ ] §8.8 approve/reject/open shell

### Task 8: Replace stub page

**File:** `app/inbox/page.tsx`

- [ ] Remove placeholder `<h1>Inbox</h1>` only shell

---

## 13. Definition of done

- [ ] `/inbox` renders full Work queue per §8  
- [ ] Three tabs with correct empty states · Approval always stub  
- [ ] Response includes lines + action items (normalized seed)  
- [ ] Review shows inline approve/reject/open (UI-only submit)  
- [ ] KPI strip + engagement/search filters via URL  
- [ ] Card grid with SLA indicators and deep links  
- [ ] §11 checklist passes on default dummy seed  
- [ ] Motion §5 · tokens §4 · no backend writes  

---

## 14. Recommended build order

1. `inbox-helpers.ts` + tests (sort, overdue, normalize)  
2. `inbox-sla-indicator.tsx` + `inbox-kind-pill.tsx`  
3. `page.tsx` + `inbox-view.tsx` + header  
4. KPI row + tabs + filters (URL wiring)  
5. Card grid + card  
6. Review card actions dialog  
7. Full §11 verification pass  

---

## 15. Agent notes

**Seed vs v1:** `Data.json` stores open action items under `approvalItems` and sets `counts.approval: 14`. v1 code forces `approvalItems = []` and puts action items in Response. **Always run `buildInboxViewModel`** — do not render seed approval tab data.

**`submittedByName` vs `assigneeName`:** Seed includes both on review items. v1 card uses `assigneeName` for “Submitted by” — match v1 page for pixel parity.

**Global `/remediation`:** API `getRemediationRegisterApi` exists; route may not. Header link matches v1; register doc is separate scope.

**My Plate distinction:** Teams see assigned work on `/my-plate` — different sort buckets and hrefs. Do not merge implementations.

**Dashboard:** Phase 09 pairs inbox with dashboard — dashboard is **not** part of this doc.

**E2E reference:** v1 `e2e/unified-inbox.spec.ts` — tabs, approval stub copy, AI-001 navigation.

**Future Approval tab:** When management-response approvals ship, replace empty array + stub copy — keep tab slot and badge pattern.

**Href line ids:** Seed uses display ids in paths (`/lines/L-004`) — match seed `href` strings exactly; do not swap to internalId in links.
