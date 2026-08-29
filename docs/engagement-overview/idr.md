# IDR Workspace — Complete UI Rebuild Specification

> **Purpose:** Self-contained, pixel-level rebuild spec for `/engagements/[id]/idr` and `/engagements/[id]/idr/lines/[lineId]`.  
> **Audience:** Engineers or agents rebuilding this screen in **any** codebase with **no** access to other repos, legacy apps, or tribal knowledge.  
> **Scope:** UI only — layouts, copy, tokens, motion, client state, filter/sort algorithms. No auth, no backend, no API design, no mutations.  
> **Design name:** **Intake rail** — calm triage workspace for the auditor’s initial questionnaire, not a dense legacy analytics dashboard.

**Definition of the screen:** IDR (Initial Document Request) is engagement phase 1. The workspace answers: *Which imported questionnaire am I looking at, which lines still need work, who owns them, and where is SLA pressure?*

**Architecture:** Thin server pages load `IdrDocument[]` + `IdrLineListItem[]` (+ detail on line route). Client components own `?doc=` selection, filters, sort, and dialog UI. Presentation only.

**Tech stack (source repo):** Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn **radix-mira** · `motion` v12 via `@/lib/motion` · `lucide-react` icons (Search, ChevronDown, Plus, ArrowLeft, Upload, X only where noted).

**Companion docs:** [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) · [`lib/motion/ANIMATION.md`](../../lib/motion/ANIMATION.md) · [`docs/ADR/adr.md`](../ADR/adr.md) (shared engagement-tab patterns) · product flow [`docs/Docs/Engagements/01-idr-flow.md`](../../../docs/Docs/Engagements/01-idr-flow.md) (behavior reference only).

---

## 0. How to use this document

1. Read §1–§3 (constraints, routes, page shell).  
2. Copy design tokens (§4) and motion rules (§5).  
3. Implement data types and loader per §6 — use existing `lib/types/idr.ts` + `lib/api/idr.ts`.  
4. Implement every algorithm in §7 verbatim.  
5. Build each UI block per §8 — every label, class, and empty state is specified.  
6. Follow file layout §9; wire client state §10.  
7. Verify against §11 using `eng-rbi-it-exam-fy27`.  
8. Track build progress with §12 tasks.

---

## 1. Hard constraints

| Rule | Detail |
|---|---|
| **UI only** | No HTTP endpoints, DB schema, server actions, Excel import persistence, or line workflow (submit/approve/reject). |
| **Read-only data** | Use existing reads: `listIdrDocumentsApi`, `listIdrLinesApi`, `getIdrLineDetailApi`. Optional: `getEngagementDetailApi` for header code. |
| **Dummy data** | Do not mutate `Data.json` or invent write APIs. |
| **Design system** | Mira density, ring elevation, motion tokens — match ADR workspace and [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md). |
| **No Threads mode** | IDR has **Lines only**. Threads / parent lineage belong on ADR. |
| **No charts** | No Recharts, no donut, no legacy hero charts. Optional collapsed insight drawer uses stat counts + `scaleX` bar only. |
| **Import / create** | UI shells only — validate in client; submit disabled or toast “Coming soon”. |
| **Module name = H1** | Page title is **Initial Document Request** (like ADR uses module name, unlike Overview which uses engagement name). |
| **Business line IDs in URLs** | Routes use `lineId` (e.g. `L-014`), not internal cuid. |

---

## 2. Routes and navigation map

### 2.1 Engagement IDR routes

```
/engagements/{engagementId}/idr                    → IDR workspace (this spec)
/engagements/{engagementId}/idr/lines/{lineId}     → Line detail (read-only)
```

**Entry paths:**
- Engagement subnav → **IDR** tab  
- Overview module card → `/engagements/{id}/idr`  
- ADR line detail parent link → `/engagements/{id}/idr/lines/{parentIdrLineId}`

### 2.2 Engagement sticky subnav (layout chrome)

On **all** `/engagements/[id]/*` routes. IDR content renders **below** subnav.

| Property | Value |
|---|---|
| Position | `sticky top-14 z-40` (navbar is `h-14`) |
| Surface | `border-b border-border/50 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/70` |
| Inner | `mx-auto max-w-7xl overflow-x-auto px-4 py-2 sm:px-6` |
| Track | `flex shrink-0 rounded-lg bg-muted/50 p-0.5` |
| ARIA | `aria-label="Engagement sections"` |

**Tabs (order):** Overview · **IDR** · ADR · Examination · Report · Findings · Remediation

**Active detection:** pathname starts with `/engagements/{id}/idr` (includes line detail).

**Tab link:** `relative flex items-center rounded-md px-3 py-1.5 text-xs font-medium`  
Active: `text-foreground` + sliding pill `layoutId="engagement-subnav-active"`  
Inactive: `text-muted-foreground` + fine-pointer hover to `text-foreground`  
Pill: `absolute inset-0 rounded-md bg-background shadow-sm ring-1 ring-border/60` · `springUi`  
Reduced motion: static active classes on link, no `layoutId`.

---

## 3. Page shell and layout

### 3.1 Server page — workspace

```tsx
// app/engagements/[id]/idr/page.tsx
import { IdrWorkspace } from "@/app/engagements/[id]/idr/_components/idr-workspace";
import { listIdrDocumentsApi, listIdrLinesApi } from "@/lib/api/idr";
import { getEngagementDetailApi } from "@/lib/api/engagements";
```

Load in parallel:
1. `getEngagementDetailApi(id)` → `code` for header (404 if missing engagement)  
2. `listIdrDocumentsApi(id)` → documents  
3. Resolve `activeDocumentId` from `searchParams.doc` or `documents[0]?.id`  
4. If active doc: `listIdrLinesApi(id, { documentId, limit: 500 })`  
5. `listTeamsApi({ limit: 100 })` → teams for create dialog pickers (UI only)

**Never put JSX inside `try/catch`.** Use `notFound()` on 404.

### 3.2 Server page — line detail

```tsx
// app/engagements/[id]/idr/lines/[lineId]/page.tsx
import { getIdrLineDetailApi } from "@/lib/api/idr";
```

`getIdrLineDetailApi(engagementId, lineId)` → 404 on miss.

### 3.3 Main orchestrator (workspace)

```tsx
<main className="min-h-[calc(100dvh-3.5rem-3rem)]">
  <PageReveal className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
    <SectionStagger className="flex flex-col gap-6">
      {/* blocks per §8 */}
    </SectionStagger>
  </PageReveal>
</main>
```

**Vertical order:** Header → Document rail → Lines panel → (optional) Insight drawer.

**Do not re-key `SectionStagger` on filter changes.**

### 3.4 Responsive

| BP | Behavior |
|---|---|
| default | Horizontal scroll document rail; table `overflow-x-auto` |
| `sm` | Header KPI row beside title |
| `lg` | Show Assignee column |
| `xl` | Show SLA column label |

### 3.5 Intake rail principles

One job per band · document rail + lines table = product · no stacked analytics hero · SLA as row accent not a dashboard · purposeful motion · ADR owns traceability UI.

---

## 4. Design tokens (inline — copy into target project)

### 4.1 Semantic colors (light mode reference)

| Token | oklch value | Use |
|---|---|---|
| `--background` / `--card` | `oklch(0.98 0.01 95.10)` | Page + cards |
| `--foreground` | `oklch(0.34 0.03 95.72)` | Body text |
| `--primary` | `oklch(0.62 0.14 39.04)` | Links, progress, focus |
| `--muted` | `oklch(0.955 0.0124 91.52)` | Pill tracks, toolbar bg |
| `--border` | `oklch(0.9078 0.0094 106.59)` | Hairlines |
| `--destructive` | `oklch(0.55 0.22 25.33)` | Overdue accent, rejection |

**SLA accent tokens (if available):** `sla-warn` for due ≤48h, `sla-breach` for overdue, `sla-complete` for approved.  
Fallback: `border-l-primary/50` warn, `border-l-destructive` breach, no border when approved.

**Elevation:** `ring-1 ring-foreground/10` on cards — not drop shadows.  
**Radius:** controls `rounded-sm`; pill tracks `rounded-lg`.  
**Page:** `max-w-7xl`, `p-4 sm:p-6`, section `gap-6`.

### 4.2 Typography

| Role | Classes |
|---|---|
| Page H1 (module name) | `text-2xl font-bold tracking-tight sm:text-3xl` |
| Engagement code (meta) | `font-mono text-[0.625rem] text-muted-foreground tabular-nums` |
| Page subtitle | `text-muted-foreground` |
| Detail H1 (line id) | `text-xl font-semibold leading-tight tracking-tight` |
| Section / card title | `text-sm font-medium` |
| Section description | `text-xs text-muted-foreground` |
| KPI numbers | `text-2xl font-bold tabular-nums` |
| Table header | `text-xs font-medium text-muted-foreground` |
| Line IDs | `font-mono text-xs tabular-nums` |
| Team slug (under name) | `font-mono text-[10px] uppercase text-muted-foreground` |
| Event type (audit) | `font-mono text-[10px] text-muted-foreground uppercase tracking-wide` |
| Controls | `text-xs/relaxed` |

### 4.3 UI primitives

| Primitive | Classes |
|---|---|
| Button (toolbar) | `rounded-sm text-xs/relaxed`, size `sm` |
| Card shell (table) | `rounded-sm bg-card ring-1 ring-foreground/10 py-0 gap-0` |
| Badge (status) | `h-5 rounded-sm text-[0.625rem] font-medium variant="outline" capitalize` |
| Input (search) | `h-8 pl-8` with left `Search` icon |
| Filter chip track | `rounded-sm bg-muted p-1` |
| Active filter chip | `bg-background shadow-sm ring-1 ring-border/60` |
| Dialog overlay | `OVERLAY_BACKDROP_CLASS` from `@/lib/overlay-backdrop` |
| Table header row | `border-b border-border/40 bg-muted/20` |
| Clickable row | `tableRowClickableClass` + `ROW_HOVER_CLASS` + `border-b` |

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
- **listContainer / listItem:** table body on first paint. Row enter `scale:0.98` floor.
- **ROW_HOVER_CLASS:** `transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out` + fine-pointer `hover:bg-muted/50`
- **tapScale:** `{ scale: 0.98 }` unless reduced motion

### 5.3 Sliding pills

| Location | `layoutId` |
|---|---|
| Engagement subnav | `engagement-subnav-active` |
| IDR document rail | `idr-doc-pill` |

Reduced motion → static active classes on active tab/doc.

### 5.4 Insight drawer (optional)

Mirror ADR Insights drawer: `AnimatePresence initial={false}` · height `0→auto` with `springUi` · chevron `0→180deg`. Button `aria-expanded`.

### 5.5 Hard rules

Filter/sort changes update numbers only — **do not** re-stagger page or remount `SectionStagger`.

---

## 6. Data contract (complete)

### 6.1 Loaders (existing — do not add writes)

```ts
listIdrDocumentsApi(engagementId: string): Promise<IdrDocument[]>
listIdrLinesApi(engagementId: string, params?: ListIdrLinesParams): Promise<Page<IdrLineListItem>>
getIdrLineDetailApi(engagementId: string, lineId: string): Promise<IdrLineDetail>
```

```ts
interface ListIdrLinesParams {
  documentId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}
```

### 6.2 TypeScript interfaces (`lib/types/idr.ts`)

```ts
interface IdrDocument {
  id: string;
  label: string;
  receivedDate: string;
  createdAt: string;
  totalLines: number;
  openLines: number;
  closedLines: number;
  lastImportAt: string | null;
  lastImportRowCount: number;
}

interface IdrLineListItem {
  id: string;
  lineId: string;
  questionText: string;
  category: string;
  ownerTeamSlug: string;
  ownerTeamName: string;
  assigneeName: string | null;
  dueDate: string | null;
  status: string;
}

interface IdrLineDetail extends IdrLineListItem {
  engagementId: string;
  engagementCode: string;
  engagementName: string;
  documentId: string;
  documentLabel: string;
  responseText: string | null;
  rejectionComment: string | null;
  submittedAt: string | null;
  submittedByName: string | null;
  postSubmitAmendmentUsed: boolean;
  attachments: Attachment[];
  recentAudit: AuditEvent[];
  permissionsByRole: Record<string, LinePermissions>;
}
```

### 6.3 Field → UI mapping

| Field | UI block |
|---|---|
| `documents[]` | Document rail, KPI “Documents” |
| `document.label`, open/closed counts | Document pill subtext |
| `document.receivedDate` | Document meta (optional in rail tooltip) |
| `lines[]` | Lines table, KPIs, insight drawer |
| `line.lineId` | Table col + detail H1 + URLs |
| `line.questionText` | Table + detail Question card |
| `line.category` | Table + detail Assignment |
| `line.ownerTeamName` / `ownerTeamSlug` | Table Owner cell |
| `line.assigneeName` | Table Assignee (lg+) |
| `line.dueDate` | Table Due + SLA accent |
| `line.status` | Badge + filters |
| `detail.responseText` | Detail Response card |
| `detail.rejectionComment` | Detail Rejection card (when rejected) |
| `detail.attachments` | Detail Attachments list |
| `detail.recentAudit` | Detail Audit timeline |
| `detail.documentId` | Back link `?doc=` preservation |

### 6.4 Line status vocabulary

Display statuses from dummy data (normalize for filters):

| Status | Meaning | Open? | Needs review? |
|---|---|---|---|
| `assigned` | Awaiting team work | yes | no |
| `in_progress` | Team working (seed only; no write path in UI) | yes | no |
| `submitted` | Awaiting CO review | yes | yes |
| `rejected` | CO rejected; team may rework | yes | no |
| `approved` | Terminal closed | no | no |

**Open line:** `status !== "approved"`.

### 6.5 Seeded test engagement — `eng-rbi-it-exam-fy27`

| Field | Value |
|---|---|
| code | `RBI-IT-EXAM-FY27` |
| documents | 1 — **IDR-1 — Initial data request** |
| document id | `idrdocRBIITEXAMFY27IDR1I` |
| totalLines | 20 |
| openLines | 13 |
| closedLines | 7 |
| needs review (submitted) | 4 — L-004, L-005, L-012, L-018 |
| approved | 7 — L-001, L-002, L-003, L-011, L-016, L-017, L-020 |
| rejected | 2 — L-010, L-014 |
| in_progress | 3 — L-006, L-007, L-013 |
| assigned | 4 — L-008, L-009, L-015, L-019 |
| sample detail | `getIdrLineDetailApi(..., "L-005")` — submitted PAM question, Cyber Security |

**URL test:** `/engagements/eng-rbi-it-exam-fy27/idr?doc=idrdocRBIITEXAMFY27IDR1I`

---

## 7. Algorithms (implement verbatim)

### 7.1 Active document resolution

```ts
function resolveActiveDocumentId(
  documents: IdrDocument[],
  docParam: string | undefined,
): string | null {
  if (documents.length === 0) return null;
  if (docParam && documents.some((d) => d.id === docParam)) return docParam;
  return documents[0].id;
}
```

**URL sync:** document rail calls `router.replace(/engagements/{id}/idr?doc={docId}, { scroll: false })`.

### 7.2 Quick filters

```ts
const LINE_QUICK_FILTERS = ["all", "open", "needs_review", "overdue", "due_48h"] as const;
type LineQuickFilter = (typeof LINE_QUICK_FILTERS)[number];

const CLOSED = new Set(["approved"]);

function isLineOpen(line: IdrLineListItem) {
  return !CLOSED.has(line.status);
}
function isNeedsReview(line: IdrLineListItem) {
  return line.status === "submitted";
}
function isOverdue(line: IdrLineListItem, now = Date.now()) {
  if (!line.dueDate || CLOSED.has(line.status)) return false;
  return new Date(line.dueDate).getTime() < now;
}
function isDueWithin48h(line: IdrLineListItem, now = Date.now()) {
  if (!line.dueDate || CLOSED.has(line.status)) return false;
  const due = new Date(line.dueDate).getTime();
  return due >= now && due <= now + 48 * 60 * 60 * 1000;
}
function matchesLineQuickFilter(line, filter, now) { /* switch per ADR adr-filters.ts */ }
```

### 7.3 Search

```ts
function matchesLineSearch(line: IdrLineListItem, search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    line.lineId.toLowerCase().includes(q) ||
    line.questionText.toLowerCase().includes(q) ||
    line.category.toLowerCase().includes(q) ||
    line.ownerTeamName.toLowerCase().includes(q) ||
    line.ownerTeamSlug.toLowerCase().includes(q) ||
    (line.assigneeName?.toLowerCase().includes(q) ?? false)
  );
}
```

### 7.4 Sort

```ts
const LINE_SORTS = ["line_id", "due_date", "status", "team"] as const;
type LineSort = (typeof LINE_SORTS)[number];
// default: "line_id"

function sortLines(lines: IdrLineListItem[], sort: LineSort) {
  const next = [...lines];
  next.sort((a, b) => {
    switch (sort) {
      case "due_date": {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        return aDue - bDue;
      }
      case "status":
        return a.status.localeCompare(b.status);
      case "team":
        return a.ownerTeamName.localeCompare(b.ownerTeamName);
      case "line_id":
      default:
        return a.lineId.localeCompare(b.lineId);
    }
  });
  return next;
}

function filterAndSortLines(lines, search, filter, sort, now = Date.now()) {
  return sortLines(
    lines.filter(
      (line) =>
        matchesLineQuickFilter(line, filter, now) &&
        matchesLineSearch(line, search),
    ),
    sort,
  );
}
```

### 7.5 KPI strip (active document lines)

```ts
function computeLineKpis(lines: IdrLineListItem[], now = Date.now()) {
  return {
    total: lines.length,
    open: lines.filter(isLineOpen).length,
    needsReview: lines.filter(isNeedsReview).length,
    overdue: lines.filter((l) => isOverdue(l, now)).length,
  };
}
```

Header KPI **Documents** uses `documents.length` (engagement-wide), not per-doc.

### 7.6 SLA row accent (left border)

```ts
function slaRowAccent(line: IdrLineListItem, now = Date.now()): string {
  if (line.status === "approved") return "";
  if (isOverdue(line, now)) return "border-l-2 border-l-destructive";
  if (isDueWithin48h(line, now)) return "border-l-2 border-l-primary/50";
  return "";
}
```

Optional SLA column (xl): show text **Overdue** / **≤48h** / **—** / **Done** using same logic.

### 7.7 Status label

```ts
function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}
```

### 7.8 Date formatting

```ts
const fmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return fmt.format(d);
}
```

Use UTC date parts if matching ADR (`getUTCDate` / `getUTCMonth`) for due dates — stay consistent with `adr-filters.ts`.

### 7.9 Insight aggregates (optional drawer)

From current `lines` prop (client-side):

```ts
function statusCounts(lines: IdrLineListItem[]) {
  const counts: Record<string, number> = {};
  for (const line of lines) {
    counts[line.status] = (counts[line.status] ?? 0) + 1;
  }
  return counts;
}
```

Render as stat strip: `{approved} approved · {submitted} submitted · …`  
Optional bar: approved share `scaleX(approved / total)`.

### 7.10 Create dialog validation (UI only)

Required: `lineId` (pattern `^[A-Z][A-Z0-9-]*$`, max 16), `questionText` (min 20 chars), `category`, `ownerTeamSlug`.  
Optional: `assigneeName`, `dueDate`.  
Submit does **not** persist.

---

## 8. UI specification (every block)

### 8.1 Workspace header (`idr-workspace-header.tsx`)

**Structure** (`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between`):

**Left column:**
1. Meta: `{engagementCode}` — `font-mono text-[0.625rem] text-muted-foreground tabular-nums`
2. H1: **Initial Document Request**
3. Subtitle: **Auditor questionnaire lines for this engagement — triage ownership, due dates, and review queue.**

**Right column — KPI strip (plain floating, NOT ringed):**
- Layout: `flex gap-4 overflow-x-auto sm:gap-6`
- Each KPI: `min-w-16 shrink-0` · value `text-2xl font-bold tabular-nums` · label `text-xs text-muted-foreground`

| KPI label | Value |
|---|---|
| Documents | `documents.length` |
| Open lines | open lines in **active document** |
| Needs review | submitted count in active doc |
| Overdue | overdue open lines in active doc |

**Test engagement (active doc):** Documents `1` · Open `13` · Needs review `4` · Overdue depends on `now` (expect ≥2 from L-010, L-014 rejected).

### 8.2 Document rail (`idr-document-rail.tsx`)

Mirror ADR document rail; swap `layoutId` to **`idr-doc-pill`**.

- Wrapper: horizontal scroll
- Track: `flex w-max gap-1 rounded-lg bg-muted/50 p-0.5`, `role="tablist"`, `aria-label="IDR documents"`
- Each doc = `button type="button" role="tab"`:
  - Line 1: `{label}` — `text-xs font-medium`
  - Line 2: `{openLines} open · {closedLines} closed` — `text-[0.625rem] text-muted-foreground tabular-nums`
- Active tab: `aria-selected="true"` + sliding pill `layoutId="idr-doc-pill"`
- Hidden when `documents.length === 0`

**Test engagement pill text:**  
**IDR-1 — Initial data request**  
`13 open · 7 closed`

### 8.3 Empty state — no documents (`idr-empty-state.tsx`)

Card (`ring-1 ring-foreground/10`, padding `p-6 sm:p-8`, centered text):

- Title: **No IDR documents yet**
- Body: **Initial Document Requests appear here after the auditor questionnaire is imported. Nothing to triage for this engagement yet.**

No CTA that implies working import. Optional muted note: `Import will be available when API is connected.`

### 8.4 Lines panel (`idr-lines-panel.tsx`)

**Card shell:** `flex min-h-0 flex-1 flex-col gap-0 py-0 ring-1 ring-foreground/10` · `min-h-[28rem]` on section wrapper.

**Toolbar** (`border-b border-border/50 px-4 py-3 sm:px-6` · stacks on mobile):

1. **Search** — `placeholder="Search lines, team, category…"` · `aria-label="Search IDR lines"` · `min-w-[12rem] flex-1 max-w-xs` · left `Search` icon
2. **Filter chips** in `rounded-sm bg-muted p-1`:
   - **All** · **Open** · **Needs review** · **Overdue** · **Due 48h**
3. **Sort** — native `<select>` or shadcn `Select`, `h-8 w-36`:
   - Line ID (default) · Due date · Status · Team
4. **Actions** (when `canCreate`):
   - **Import** — `Button variant="outline" size="sm"` · opens disabled dialog or shows toast *Import will be available when API is connected.*
   - **Add line** — `Button size="sm"` · opens create dialog

**Filtered empty:** centered `No lines match these filters.` + **Clear filters** button (resets search + filter to all).

**Document with zero lines:** `No lines in this document yet.`

### 8.5 Lines table (`idr-lines-table.tsx`)

**Columns:**

| Header | Sort | Responsive | Cell |
|---|---|---|---|
| Line | line_id | always | `{lineId}` mono · primary link color on hover |
| Question | — | always | `line-clamp-2` · full text in `title` tooltip |
| Category | — | always | `{category}` |
| Owner | team | always | `{ownerTeamName}` + slug below |
| Assignee | — | hidden `<lg` | `{assigneeName}` or `—` |
| Due | due_date | always | `formatDate(dueDate)` mono |
| Status | status | always | `Badge variant="outline" capitalize` |
| SLA | — | hidden `<xl` | text: Done / Overdue / ≤48h / — |

**Row behavior:**
- Apply `slaRowAccent(line)` as left border class on `<tr>`
- Entire row navigates to `/engagements/{id}/idr/lines/{lineId}`
- `tableRowClickableClass` + `ROW_HOVER_CLASS` + `listContainer`/`listItem` on first paint
- Line ID cell: `stopPropagation` not needed (whole row clicks)

**Question clip:** max 2 lines; do not truncate line ID.

### 8.6 Create line dialog (`idr-create-line-dialog.tsx`)

Mira `Dialog` · overlay `OVERLAY_BACKDROP_CLASS`

- Title: **Add IDR line**
- Description: **Manual lines validate here only. Saving is not connected yet — this dialog checks the form.**

| Field | Required | Control |
|---|---|---|
| Line ID | yes | Input · placeholder `L-021` |
| Question | yes | Textarea · min 20 chars helper |
| Category | yes | Input or Select · e.g. Gov, Cyber, Tech |
| Owner team | yes | Select from `teams[]` |
| Assignee | no | Input |
| Due date | no | Input type="date" |

Inline errors with destructive text. Primary **Save** disabled with caption **Coming soon** OR toast on click — **no Data.json write**.

### 8.7 Import dialog shell (`idr-import-dialog.tsx`) — optional

Single-step placeholder:
- Title: **Import IDR lines**
- Body: **Excel import will validate against the IDR template. Connection to the import API is not available in this build.**
- Disabled **Choose file** + link text **Template: idr-lines.xlsx** (non-functional OK)

Can fold into Import button toast instead to save scope.

### 8.8 Insight drawer (`idr-insight-drawer.tsx`) — optional

Collapsed by default under lines panel.

- Toggle: **Document insights** · `aria-expanded`
- Description: **Status mix for the active document — not affected by table filters.**
- Body: stat strip from §7.9 + optional `scaleX` approved bar
- **No pie/donut charts**

Side note (inside drawer): **Use the lines table for triage. ADR follow-ups link back to these parent questions.**

### 8.9 Line detail view (`idr-line-detail-view.tsx`)

**Layout:** same shell as ADR detail (`PageReveal`, `max-w-7xl`, `gap-6`).

**Top band:**
- Back link: **Back to IDR** → `/engagements/{id}/idr?doc={documentId}` when known
- H1: mono `{lineId}` + status `Badge`
- Meta: `{engagementCode} · {documentLabel}`

**Cards (read-only):**

| Card title | Content |
|---|---|
| Question | `{questionText}` · `text-xs leading-relaxed` |
| Assignment | Category · Owner team · Assignee (or Unassigned) · Due date |
| Response | `{responseText}` or *No response recorded yet.* |
| Rejection | Only if `status === "rejected"` and `rejectionComment` — destructive border accent |
| Attachments | List `fileName` or *No attachments.* |
| Recent activity | `recentAudit` newest first · event type mono · message · date |

**Do not render:** Submit, Approve, Reject, Upload, Amend buttons (even if `permissionsByRole` says true).

**Test line L-014:** rejected · patch compliance question · rejection comment if present in seed.

### 8.10 Copy deck (exact strings)

| Context | Copy |
|---|---|
| Module H1 | Initial Document Request |
| Subtitle | Auditor questionnaire lines for this engagement — triage ownership, due dates, and review queue. |
| Empty (no docs) | No IDR documents yet |
| Empty body | Initial Document Requests appear here after the auditor questionnaire is imported. Nothing to triage for this engagement yet. |
| Filter empty | No lines match these filters. |
| Clear filters | Clear filters |
| Back link | Back to IDR |
| Create title | Add IDR line |

---

## 9. File structure

```
app/engagements/[id]/
  layout.tsx                              # (existing) subnav wrapper
  _components/
    engagement-subnav.tsx                 # (existing)
  idr/
    page.tsx                              # MODIFY — thin RSC → IdrWorkspace
    _components/
      idr-workspace.tsx                   # client orchestrator
      idr-workspace-header.tsx
      idr-document-rail.tsx
      idr-lines-panel.tsx
      idr-lines-table.tsx
      idr-create-line-dialog.tsx
      idr-import-dialog.tsx               # optional
      idr-empty-state.tsx
      idr-insight-drawer.tsx              # optional
      idr-filters.ts                      # pure helpers (colocated)
    lines/
      [lineId]/
        page.tsx                          # NEW — thin RSC → detail view
        _components/
          idr-line-detail-view.tsx

lib/api/idr.ts                            # EXISTING — read only
lib/types/idr.ts                          # EXISTING — reuse
```

**Do not:** add `lib/idr/`, `components/idr/`, or Next `app/api/` routes.

**Import style:**

```tsx
import { IdrWorkspace } from "@/app/engagements/[id]/idr/_components/idr-workspace";
import { listIdrDocumentsApi, listIdrLinesApi } from "@/lib/api/idr";
```

---

## 10. Client state and accessibility

### 10.1 Client state (workspace)

| State | Owner | Default |
|---|---|---|
| `search` | lines panel | `""` |
| `filter` | lines panel | `"all"` |
| `sort` | lines panel | `"line_id"` |
| `createOpen` | lines panel | `false` |
| `insightOpen` | insight drawer | `false` |

```tsx
type IdrWorkspaceProps = {
  engagementId: string;
  engagementCode: string;
  documents: IdrDocument[];
  activeDocumentId: string | null;
  lines: IdrLineListItem[];
  canCreate: boolean;
  teams: Team[];
};
```

`canCreate`: UI gate only (e.g. session role `co` or `admin`) — still no write API.

### 10.2 Accessibility

- Subnav: `aria-label="Engagement sections"`; active tab `aria-current="page"` (optional)
- Document rail: `role="tablist"` / `role="tab"` / `aria-selected`
- Search: `aria-label="Search IDR lines"`
- Filter chips: `aria-pressed` on active chip
- Table rows: keyboard Enter/Space navigates to detail
- Insight drawer: `aria-expanded` + `aria-controls`
- Dialogs: focus trap, Esc close, labelled fields
- Reduced motion: all animations respect `useReducedMotion()`
- Focus: `controlFocusClass` on interactive controls

### 10.3 Scope — in / out

**In:** full IDR workspace + line detail per §8; subnav; motion; responsive; dummy reads.

**Out:** backend/API changes; Excel import persistence; submit/approve/reject; inbox / My Plate; auth enforcement beyond UI gates; charts; Threads mode; ADR implementation.

---

## 11. Verification checklist (use `eng-rbi-it-exam-fy27`)

| # | Check | Expected |
|---|---|---|
| 1 | Route loads | `/engagements/eng-rbi-it-exam-fy27/idr` — no console errors |
| 2 | Subnav | IDR tab active on workspace + line detail |
| 3 | Header | Code `RBI-IT-EXAM-FY27` · H1 **Initial Document Request** |
| 4 | KPIs | Documents `1` · Open `13` · Needs review `4` |
| 5 | Document rail | One pill · `13 open · 7 closed` · `?doc=` sync |
| 6 | Table rows | 20 lines default · L-001 approved · L-005 submitted |
| 7 | Filter Needs review | Shows 4 submitted lines only |
| 8 | Filter Overdue | Includes rejected L-010, L-014 (relative to today) |
| 9 | Search `PAM` | Surfaces L-005 |
| 10 | Row click | Navigates to `/idr/lines/L-005` |
| 11 | Detail | Question + assignment + response read-only |
| 12 | Back link | Returns to workspace with `?doc=` |
| 13 | ADR link target | From ADR parent cell → IDR line detail loads |
| 14 | Create dialog | Validates · does not persist |
| 15 | Motion | Page enter + row stagger; filters don’t remount stagger |
| 16 | Empty engagement | Use engagement with no `idr.documents` — empty state |
| 17 | No backend | No new API routes or Data.json writes |

---

## 12. Implementation tasks

### Task 1: Page load + shell

**Files:** `idr/page.tsx`, `idr/_components/idr-workspace.tsx`, `idr-empty-state.tsx`

- [ ] Thin RSC loads APIs per §3.1
- [ ] `PageReveal` / `SectionStagger` shell
- [ ] Empty documents → `IdrEmptyState`

### Task 2: Header + document rail

**Files:** `idr-workspace-header.tsx`, `idr-document-rail.tsx`

- [ ] Header copy per §8.1
- [ ] KPIs from §7.5
- [ ] Document rail `layoutId="idr-doc-pill"` + `?doc=` sync

### Task 3: Filter helpers

**File:** `idr-filters.ts`

- [ ] Implement §7.2–§7.8 verbatim
- [ ] Reuse patterns from `adr-filters.ts` where identical

### Task 4: Lines panel + table

**Files:** `idr-lines-panel.tsx`, `idr-lines-table.tsx`

- [ ] Toolbar per §8.4
- [ ] Table columns per §8.5
- [ ] SLA row accent per §7.6
- [ ] Row navigation to line detail

### Task 5: Create dialog (UI shell)

**File:** `idr-create-line-dialog.tsx`

- [ ] Fields + validation per §8.6
- [ ] No persist on submit

### Task 6: Line detail

**Files:** `idr/lines/[lineId]/page.tsx`, `idr-line-detail-view.tsx`

- [ ] `getIdrLineDetailApi` + not-found
- [ ] Read-only cards per §8.9
- [ ] Back link preserves `?doc=`

### Task 7: Insight drawer (optional)

**File:** `idr-insight-drawer.tsx`

- [ ] Collapsed default · §8.8 aggregates

### Task 8: QA

- [ ] §11 checklist
- [ ] Lint clean · light/dark spot-check
- [ ] Match `DESIGN_SYSTEM.md` — not itex-v1 clone

---

## 13. Definition of done

- [ ] `/engagements/[id]/idr` is a full Intake rail workspace (not stub H1)
- [ ] `/engagements/[id]/idr/lines/[lineId]` read-only detail works
- [ ] Document rail + lines table + filters on dummy data
- [ ] KPI strip + SLA accents + status badges
- [ ] Create/import UI shells without mutations
- [ ] Visuals match Assure design system and ADR tab parity
- [ ] Motion per §5; reduced-motion safe
- [ ] UI-only — zero backend work
- [ ] Another engineer can build from **this document alone**

---

## 14. Build order

1. Task 1 → 2 (first reviewable: header + doc rail)  
2. Task 3 → 4 (lines table)  
3. Task 5 → 6 (dialogs + detail)  
4. Task 7 optional → Task 8 QA  

**First reviewable slice:** Tasks 1–4 on `eng-rbi-it-exam-fy27`.

---

## 15. Agent notes

- **IDR vs ADR:** IDR is root questionnaire lines — **no Parent column**, **no Threads mode**. Reuse ADR table/filter patterns; delete ADR-only fields.
- **IDR vs Overview:** Overview uses engagement **name** as H1; IDR uses module name **Initial Document Request**.
- **Line detail URLs** are linked from ADR — must work even if IDR workspace is built after ADR.
- **`in_progress`** appears in seed data; display as-is with badge — do not invent workflow UI.
- **Approved** = closed for counts; overview KPIs use `idrClosed` / open split aligned with this table.
- **Import:** legacy itex-v1 had `ExcelUploadWizard` — in assure-frontend v1, stub only per hard constraints.
- Colocate helpers in `idr-filters.ts`; do not add `lib/idr/`.
- Keep copy professional and short — exact strings in §8.10.
