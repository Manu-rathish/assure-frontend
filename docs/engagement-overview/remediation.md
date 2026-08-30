# Remediation Hub — Complete UI Rebuild Specification

> **Purpose:** Self-contained, pixel-level rebuild spec for `/engagements/[id]/remediation`, `/engagements/[id]/remediation/[actionItemId]`, and `/engagements/[id]/remediation/findings/[findingCode]`.  
> **Audience:** Engineers or agents rebuilding these screens in **any** codebase with **no** access to other repos, legacy apps, or tribal knowledge.  
> **Scope:** UI only — layouts, copy, tokens, motion, client state, filter/group algorithms. No auth, no backend, no API design, no mutations.  
> **Design name:** **Closeout hub** — calm workspace for corrective action items linked to accepted findings — not a dense legacy dashboard.

**Definition of the module:** Remediation is engagement phase 5 (final). After findings are accepted, BDTS tracks **action items** — owned by teams, optionally assigned, moving through status stages. The hub answers: *Which findings have open remediation work, which action items are overdue, and how far is each finding plan from closed?*

**Architecture:** Thin server pages load `ActionItemListItem[]`, `FindingListItem[]` (for finding register grouping), and detail via `getActionItemDetailApi`. Client components own filters on the flat table and create/status UI shells. Presentation only.

**Tech stack (source repo):** Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn **radix-mira** · `motion` v12 via `@/lib/motion` · `lucide-react` icons (Search, Plus, ArrowLeft, ChevronDown only where noted).

**Companion docs:** [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) · [`lib/motion/ANIMATION.md`](../../lib/motion/ANIMATION.md) · [`docs/report/report.md`](../report/report.md) · [`docs/IDR/idr.md`](../IDR/idr.md) · product flow [`docs/Docs/Engagements/05-remediation-flow.md`](../../../docs/Docs/Engagements/05-remediation-flow.md) (behavior reference only).

---

## 0. How to use this document

1. Read §1–§3 (constraints, routes, page shells).  
2. Copy design tokens (§4) and motion rules (§5).  
3. Implement data types and loaders per §6 — use `lib/types/remediation.ts`, `lib/types/finding.ts`, `lib/api/remediation.ts`, `lib/api/findings.ts`.  
4. Implement every algorithm in §7 verbatim.  
5. Build each UI block per §8 — every label, class, and empty state is specified.  
6. Follow file layout §9; wire client state §10.  
7. Verify against §11 using `eng-rbi-it-exam-fy27`.  
8. Track build progress with §12 tasks.

---

## 1. Hard constraints

| Rule | Detail |
|---|---|
| **UI only** | No HTTP endpoints, DB schema, server actions, or action-item persistence. |
| **Read-only data** | `listActionItemsApi`, `getActionItemDetailApi`, `listFindingsApi`, `getEngagementDetailApi`, `listTeamsApi` (create dialog pickers only). |
| **Dummy data** | Do not mutate `Data.json` or invent write APIs. |
| **Create / status transitions** | UI + client validation only — submit disabled or toast “Coming soon”. |
| **No evidence attachments** | `evidence_captured` is a status label only — no file upload UI. |
| **Finding link by code** | Group items by free-text `findingCode` string match (legacy behavior). Do not require `findingId` FK. |
| **No charts** | Progress uses horizontal `scaleX` / width bars only — no Recharts. |
| **Module name = H1** | Hub H1: **Remediation**. Detail H1: action item `{title}`. |
| **Business IDs in URLs** | `/remediation/AI-001`, `/remediation/findings/F-007`. |
| **Overview KPI note** | Overview may show `actionItemsOpen: 14` / `actionItemsTotal: 16`; seed `remediation.actionItems` has **10** items — use `listActionItemsApi` as source of truth. |
| **Global `/remediation` register** | Out of scope for this doc (engagement tab only). `getRemediationRegisterApi` exists but is cross-engagement — do not build unless separately requested. |

---

## 2. Routes and navigation map

### 2.1 Routes

```
/engagements/{engagementId}/remediation                           → Remediation hub
/engagements/{engagementId}/remediation/{actionItemId}              → Action item detail
/engagements/{engagementId}/remediation/findings/{findingCode}      → Per-finding remediation plan
```

**Entry paths:**
- Subnav → **Remediation** tab  
- Overview module card → `/engagements/{id}/remediation`  
- Overview phase rail Remediation step subtext  
- Finding detail remediation card → `/remediation` or finding plan  
- Finding register row → `/remediation/findings/{findingCode}`  
- Flat table row → `/remediation/{actionItemId}`

### 2.2 Subnav active state

Pathname starts with `/engagements/{id}/remediation` → **Remediation** tab active (includes nested routes).

### 2.3 Engagement sticky subnav

Same chrome as other tabs (`sticky top-14 z-40`, pill track, `layoutId="engagement-subnav-active"`).

**Tab order:** Overview · IDR · ADR · Examination · Report · Findings · **Remediation**

---

## 3. Page shell and layout

### 3.1 Server page — Remediation hub

```tsx
// app/engagements/[id]/remediation/page.tsx
import { RemediationHub } from "@/app/engagements/[id]/remediation/_components/remediation-hub";
import { listActionItemsApi } from "@/lib/api/remediation";
import { listFindingsApi } from "@/lib/api/findings";
import { getEngagementDetailApi } from "@/lib/api/engagements";
import { listTeamsApi } from "@/lib/api/teams";
```

Parallel load:
1. `getEngagementDetailApi(id)` → `code` (404 if missing)  
2. `listActionItemsApi(id, { limit: 500 })` → action items  
3. `listFindingsApi(id, { limit: 500 })` → findings (for finding register)  
4. `listTeamsApi({ limit: 100 })` → teams (create dialog UI only)

### 3.2 Server page — Action item detail

```tsx
getActionItemDetailApi(engagementId, actionItemId) → 404 on miss
```

### 3.3 Server page — Finding remediation plan

```tsx
getFindingDetailApi(engagementId, findingCode) + listActionItemsApi filtered client-side by findingCode
```

### 3.4 Layout shell

```tsx
<main className="min-h-[calc(100dvh-3.5rem-3rem)]">
  <PageReveal className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
    <SectionStagger className="flex flex-col gap-6">
      {/* blocks */}
    </SectionStagger>
  </PageReveal>
</main>
```

### 3.5 Hub vertical order

```
Header + Add action item (dialog shell)
→ KPI strip (3 tiles)
→ Finding register table (when any finding has linked items)
→ All action items table (toolbar + flat list)
```

### 3.6 Detail vertical order

```
Back link → Header (title, id, badges, SLA hint)
→ lg:grid: Left (description, status workflow shell)
              Right (ownership card)
```

### 3.7 Finding plan vertical order

```
Breadcrumb → Finding header band → Plan progress bar → Linked action items table
```

---

## 4. Design tokens

Reuse §4 from [`docs/IDR/idr.md`](../IDR/idr.md).

**Action item status badge labels (exact):**

| Status | Label |
|---|---|
| `open` | Open |
| `in_progress` | In progress |
| `evidence_captured` | Evidence captured |
| `verified` | Verified |
| `closed` | Closed |

Badge: `inline-flex items-center gap-1.5 h-5 rounded-sm px-1.5 text-[0.625rem] font-medium bg-muted/60` + status dot color.

**SLA column (no SlaIndicator component in repo):**

| Condition | Display |
|---|---|
| `closed` or `verified` | **Done** · muted |
| overdue open item | **Overdue** · destructive |
| due within 48h | **≤48h** · primary/warn |
| else | **—** |

Optional row left border: `border-l-destructive` when overdue (same as IDR team table).

**Finding register rows:** reuse severity left border from report/findings (`severityRowBorder`).

**Progress bar tones:** 100% → emerald · ≥50% → amber · else → primary/blue.

---

## 5. Motion system

Same tokens as IDR §5.

| Moment | Pattern |
|---|---|
| Page mount | `PageReveal` + `SectionStagger` |
| KPI tiles | optional subtle `SectionItem` stagger |
| Table rows | `listContainer` / `listItem` on first paint |
| Progress bars | `scaleX` or width transition · `duration.barFill` · once on mount |
| Filter change | no remount stagger |

---

## 6. Data contract

### 6.1 Loaders (existing)

```ts
listActionItemsApi(engagementId: string, params?: ListActionItemsParams): Promise<Page<ActionItemListItem>>
getActionItemDetailApi(engagementId: string, actionItemId: string): Promise<ActionItemDetail>
listFindingsApi(engagementId: string, params?: ListFindingsParams): Promise<Page<FindingListItem>>
getFindingDetailApi(engagementId: string, findingCode: string): Promise<FindingDetail>
```

```ts
interface ListActionItemsParams {
  status?: string;
  findingCode?: string;
  limit?: number;
  offset?: number;
}
```

### 6.2 TypeScript interfaces

**Action item (`lib/types/remediation.ts`):**

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

**Finding (for register grouping — `lib/types/finding.ts`):** use `FindingListItem` fields `findingCode`, `title`, `severity`, `status`, `targetCloseDate`, `actionItemsOpen`, `actionItemsTotal`.

### 6.3 Status vocabulary & transitions (display only)

Allowed transitions (show as disabled buttons on detail — legacy rules):

```ts
const STATUS_TRANSITIONS: Record<string, string[]> = {
  open: ["in_progress", "closed"],
  in_progress: ["evidence_captured", "verified", "closed"],
  evidence_captured: ["verified", "closed"],
  verified: ["closed"],
  closed: [],
};
```

### 6.4 Seeded test engagement — `eng-rbi-it-exam-fy27`

**Action items (10 in `remediation.actionItems`):**

| ID | Finding | Status | Owner |
|---|---|---|---|
| AI-001 | F-007 | in_progress | IT Operations |
| AI-002 | F-007 | open | GRC |
| AI-003 | F-007 | open | GRC |
| AI-004 | F-007 | open | SOC |
| AI-005 | F-001 | open | Cyber Security |
| AI-006 | F-001 | open | Cyber Security |
| AI-007 | F-002 | open | IT Operations |
| AI-008 | F-009 | evidence_captured | BCM |
| AI-010 | F-012 | in_progress | IT Operations |
| AI-238 | — (unlinked) | open | GRC |

**Hub KPIs (from seed list):**
- Open (`open` + `in_progress`): **8**  
- In verification (`evidence_captured` + `verified`): **1**  
- Closed: **0**

**Finding register highlights:**
- F-007: 4 linked items · 0 closed · progress 0% · finding `actionItemsOpen/Total` **4/4**  
- F-001: 2 items · F-009: 1 item (evidence captured) · F-012: 1 item · F-002: 1 item  
- Findings with zero linked items still appear in register with “No action items” progress

**Sample detail:** `getActionItemDetailApi(..., "AI-001")` — PAM retention task · F-007

**Sample plan:** `/remediation/findings/F-007` — 4 items · 0% complete

---

## 7. Algorithms (implement verbatim)

### 7.1 Date formatting

Same as report §7.1 (`formatDate` with `en-IN`).

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
  return items.filter(
    (i) => i.status === "open" || i.status === "in_progress",
  ).length;
}

function countInVerification(items: ActionItemListItem[]) {
  return items.filter(
    (i) => i.status === "evidence_captured" || i.status === "verified",
  ).length;
}

function countClosed(items: ActionItemListItem[]) {
  return items.filter((i) => i.status === "closed").length;
}
```

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

function buildFindingRegisterRows(
  findings: FindingListItem[],
  itemsByCode: Map<string, ActionItemListItem[]>,
) {
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

### 7.5 Finding plan progress

```ts
function planProgress(items: ActionItemListItem[]) {
  const closed = items.filter((i) => i.status === "closed").length;
  const total = items.length;
  const pct = total === 0 ? 0 : Math.round((closed / total) * 100);
  return { closed, total, pct };
}
```

Progress bar width: `${pct}%` or `scaleX(pct/100)`.

### 7.6 Flat table filters

```ts
const ACTION_QUICK_FILTERS = [
  "all",
  "open",
  "overdue",
  "due_48h",
  "unlinked",
] as const;
type ActionQuickFilter = (typeof ACTION_QUICK_FILTERS)[number];

function matchesActionFilter(
  item: ActionItemListItem,
  filter: ActionQuickFilter,
  now = Date.now(),
) {
  switch (filter) {
    case "open":
      return item.status === "open" || item.status === "in_progress";
    case "overdue":
      return isActionItemOverdue(item, now);
    case "due_48h":
      return isDueWithin48h(item, now);
    case "unlinked":
      return !item.findingCode;
    case "all":
    default:
      return true;
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

### 7.7 Next action item ID suggestion (create dialog)

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

**Test engagement:** max AI-238 → suggest **AI-239** (or parse numeric max correctly — AI-238 → 238, next AI-239).

### 7.8 Create dialog validation (UI only)

Required: `actionItemId` (pattern `^AI-[A-Z0-9-]+$` or `^AI-\d+$`), `title` (min 5 chars), `ownerTeamSlug`.  
Optional: `description`, `findingCode`, `dueDate`.  
Submit does not persist.

### 7.9 Allowed transitions helper

```ts
function getAllowedTransitions(status: string) {
  return STATUS_TRANSITIONS[status] ?? [];
}
```

---

## 8. UI specification (every block)

### 8.1 Hub header (`remediation-hub-header.tsx`)

**Layout:** `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`

**Left:**
1. Meta: `{engagementCode}` — mono `text-[0.625rem] text-muted-foreground`
2. H1: **Remediation**
3. Subtitle: `{findings.length} findings · {items.length} action items · {openCount} open`

**Right:** **Add action item** button → opens create dialog (§8.8)

### 8.2 KPI strip (`remediation-kpi-strip.tsx`)

Three plain floating tiles (NOT ringed card — match ADR/report KPI style):

| Label | Value |
|---|---|
| Open | `countOpenWork` |
| In verification | `countInVerification` |
| Closed | `countClosed` |

Each: `text-2xl font-bold tabular-nums` + `text-xs text-muted-foreground` label.

**Test engagement:** Open **8** · In verification **1** · Closed **0**

### 8.3 Finding register (`remediation-finding-register.tsx`)

Section label: **Finding register** — `text-xs font-medium uppercase tracking-wide text-muted-foreground`

Render when `hasFindingLinks(rows)`.

**Table columns:**

| Header | Cell |
|---|---|
| Finding | `{findingCode}` link → `/remediation/findings/{code}` |
| Title | clipped title · same link |
| Severity | severity badge (reuse from finding-display) |
| Progress | mini bar · closed/linked count · `0%` when no items |
| Items open / total | `{finding.actionItemsOpen} / {finding.actionItemsTotal}` mono center |
| Target close | `formatDate(targetCloseDate)` |

**Row:** severity left border.

**No items linked:** progress cell **No action items** · items column `0 / {actionItemsTotal}` from finding metadata.

### 8.4 All action items panel (`remediation-items-panel.tsx` + table)

Section label: **All action items**

**Toolbar:** search · filter chips **All · Open · Overdue · Due 48h · Unlinked** · count caption

**Table columns:**

| Header | Cell |
|---|---|
| ID | `{actionItemId}` mono · link to detail |
| Action item | `{title}` line-clamp-2 |
| Finding | link to `/findings/{code}` or `/remediation/findings/{code}` · or `—` |
| Owner | `{ownerTeamName}` |
| Assignee | hidden `<lg` · name or Unassigned |
| Target | `formatDate(dueDate)` |
| Status | status badge |
| SLA | `slaLabel(item)` |

**Row:** optional `slaRowAccent(item)` · navigate to `/remediation/{actionItemId}`

**Empty:** `No action items for this engagement yet.`

**Filtered empty:** `No action items match these filters.` + **Clear filters**

### 8.5 Create dialog (`remediation-create-dialog.tsx`)

Mira `Dialog` · `OVERLAY_BACKDROP_CLASS`

- Title: **Add action item**
- Description: **Track corrective work for this engagement. Saving is not connected yet.**

| Field | Required |
|---|---|
| ID | yes · default `{suggestNextActionItemId}` · placeholder `AI-011` |
| Title | yes |
| Finding | no · placeholder `F-007` |
| Owner team | yes · Select from teams |
| Description | no · Textarea |
| Due date | no · date input |

Validate §7.8 · Submit disabled / toast only.

### 8.6 Action item detail (`remediation-item-detail-view.tsx`)

**Back:** **Back to remediation** → `/engagements/{id}/remediation`

**Header:**
- H1: `{title}` — `text-xl font-semibold leading-tight tracking-tight`
- Meta: `{actionItemId}` mono
- Badges: status · optional **Finding {findingCode}** chip linking to finding plan · SLA text (Overdue / ≤48h)

**Left column:**
- **Details** card — `{description}` or omit if null
- **Status workflow** card — §8.7

**Right column — Ownership card:**

| Label | Value |
|---|---|
| Owner team | `{ownerTeamName}` |
| Assignee | `{assigneeName}` or Unassigned |
| Target date | `{formatDate(dueDate)}` |
| Engagement | `{engagementName}` · `{engagementCode}` mono |
| Updated | `{formatDate(updatedAt)}` optional |

### 8.7 Status workflow shell (`remediation-status-actions.tsx`)

Card body copy: **Advance this action item through remediation stages.**

Render one `Button size="sm"` per allowed transition from `getAllowedTransitions(currentStatus)`:
- Labels use `formatActionItemStatus` (Open → In progress, etc.)
- **Closed** transition uses `variant="outline"`
- All buttons **disabled** with caption **Coming soon** OR toast on click — no persist

When `closed`: `This action item is closed.`

### 8.8 Finding remediation plan (`remediation-finding-plan-view.tsx`)

**Breadcrumb:** Remediation / `{findingCode}`

**Header band** (`Card`):
- `{findingCode}` · severity badge · finding status badge
- `{finding.title}` — `text-base font-semibold`
- Link **Full detail →** `/findings/{findingCode}`

**Plan progress card:**
- Label **Plan progress** · `{closed} of {total} action items closed`
- Full-width bar · pct label · 0% — 100% captions
- When pct === 100: green callout **All action items closed — finding is ready to be verified in the Findings tab.**

**Table:** same columns as §8.4 minus Finding column · title **Action items for {findingCode}** · target close in header right

### 8.9 Copy deck (exact strings)

| Context | Copy |
|---|---|
| Hub H1 | Remediation |
| Add action item | Add action item |
| Finding register | Finding register |
| All action items | All action items |
| Plan progress | Plan progress |
| 100% callout | All action items closed — finding is ready to be verified in the Findings tab. |
| Back link | Back to remediation |
| Full finding link | Full detail → |
| Workflow intro | Advance this action item through remediation stages. |
| Closed terminal | This action item is closed. |

---

## 9. File structure

```
app/engagements/[id]/
  remediation/
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
      remediation-status-actions.tsx
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
lib/api/findings.ts                 # EXISTING (register grouping)
lib/types/remediation.ts            # EXISTING
```

Reuse severity/status badge helpers from `findings/_components/finding-display.ts` when built — or duplicate minimal maps in `remediation-helpers.ts`.

**Do not:** add `lib/remediation/`, top-level `components/action-items/`, or global `/remediation` page in this task.

---

## 10. Client state and accessibility

### 10.1 Client state

| State | Owner | Default |
|---|---|---|
| `search` | items panel | `""` |
| `filter` | items panel | `"all"` |
| `createOpen` | hub | `false` |

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

### 10.2 Accessibility

- Tables: keyboard row navigation Enter → detail
- Search `aria-label="Search action items"`
- Filter chips `aria-pressed`
- Dialog labelled fields · focus trap
- Progress bars: `aria-valuenow` / `aria-valuemin` / `aria-valuemax` when using role="progressbar"
- Reduced motion: instant bar fills
- Focus: `controlFocusClass`

### 10.3 Scope — in / out

**In:** hub, finding register, flat table, detail, finding plan, create/status UI shells, SLA display.

**Out:** backend; persistence; global remediation register; My Plate; inbox; evidence files; finding verify; engagement phase close automation.

---

## 11. Verification checklist (`eng-rbi-it-exam-fy27`)

| # | Check | Expected |
|---|---|---|
| 1 | `/remediation` loads | No errors |
| 2 | Subnav | Remediation active |
| 3 | Subtitle | 8 findings · 10 action items · 8 open |
| 4 | KPIs | Open 8 · In verification 1 · Closed 0 |
| 5 | Finding register | F-007 row · 0% progress · 4/4 items |
| 6 | Flat table | 10 rows · AI-238 unlinked |
| 7 | Filter Unlinked | Shows AI-238 only |
| 8 | Filter Overdue | Shows past-due open items (e.g. AI-005 due Aug 9) |
| 9 | Row AI-001 | Detail · in_progress · F-007 chip |
| 10 | Status buttons | Show allowed transitions · disabled |
| 11 | Plan F-007 | 4 items · 0% · links to item details |
| 12 | Finding link | F-007 chip → `/findings/F-007` or plan |
| 13 | Create dialog | Validates · no persist |
| 14 | Motion | Page enter · table stagger once |
| 15 | No backend | No new APIs or Data.json writes |

---

## 12. Implementation tasks

### Task 1: Hub page load

**Files:** `remediation/page.tsx`, `remediation-hub.tsx`, `remediation-helpers.ts`

- [ ] RSC loaders §3.1 · props wiring

### Task 2: Hub chrome

**Files:** `remediation-hub-header.tsx`, `remediation-kpi-strip.tsx`, `remediation-create-dialog.tsx`

- [ ] §8.1–§8.2 · create dialog §8.5

### Task 3: Finding register

**File:** `remediation-finding-register.tsx`

- [ ] §8.3 · grouping §7.4

### Task 4: All action items

**Files:** `remediation-items-panel.tsx`, `remediation-items-table.tsx`

- [ ] §8.4 · filters §7.6

### Task 5: Action item detail

**Files:** `[actionItemId]/page.tsx`, `remediation-item-detail-view.tsx`, `remediation-status-actions.tsx`

- [ ] §8.6–§8.7

### Task 6: Finding plan

**Files:** `findings/[findingCode]/page.tsx`, `remediation-finding-plan-view.tsx`

- [ ] §8.8

### Task 7: QA

- [ ] §11 · design system parity · lint

---

## 13. Definition of done

- [ ] `/remediation` hub is full Closeout workspace (not stub H1)
- [ ] Finding register + flat table on dummy data
- [ ] Detail + finding plan routes work
- [ ] Create + status UI shells without persistence
- [ ] SLA/overdue display without legacy SlaIndicator component
- [ ] Visuals match Assure design system
- [ ] UI-only — zero backend work
- [ ] Buildable from **this document alone**

---

## 14. Build order

1. Task 1 → 2 (header + KPIs)  
2. Task 3 → 4 (tables)  
3. Task 5 → 6 (detail routes)  
4. Task 7 QA  

**First slice:** Tasks 1–4 on `eng-rbi-it-exam-fy27`.

---

## 15. Agent notes

- **Manual remediation path:** Accepting a finding does **not** auto-create action items — seed data is pre-linked by `findingCode`.
- **`actionItemsOpen` on finding** may differ from linked item count in seed — show finding metadata in register column; compute progress bar from **linked items list** only.
- **Overview KPI `14 open`** ≠ seed list length — do not “fix” seed; document and use API counts.
- **Unlinked items** (AI-238) appear only in flat table, not under a finding row.
- **Status workflow** mirrors legacy transition graph but stays non-persisting in assure-frontend v1.
- **No SlaIndicator** in repo — use `slaLabel` + optional row accent (§7.2).
- Reuse finding severity badges from report/findings implementation when available.
- Colocate helpers in `remediation-helpers.ts` — no `lib/remediation/`.
- Finding plan “verified in Findings tab” copy replaces legacy “Report tab” to match assure-frontend IA (Findings owns dispute/accept).
