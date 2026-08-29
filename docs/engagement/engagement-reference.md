# Engagement Module — UI Rebuild Reference

> **Purpose:** Pixel-faithful rebuild spec for another codebase / Cursor agent.  
> **Scope:** UI only — layouts, copy, tokens, motion, client state, filter logic. No auth, no backend, no API design.  
> **Source of truth:** `assure-frontend` as built through ADR workspace (Aug 2026).  
> **Companion:** `DESIGN_SYSTEM.md`, `lib/motion/ANIMATION.md`, `docs/ADR/adr.md`

---

## 1. What is built vs stub

| Route | Status | Notes |
|---|---|---|
| `/engagements` | **Built** | List + search + status filter + pagination + create dialog (client-only add) |
| `/engagements/[id]` | Stub | H1 only: "Engagement overview" |
| `/engagements/[id]/idr` | Stub | H1 only |
| `/engagements/[id]/adr` | **Built** | Full workspace (this doc’s main body) |
| `/engagements/[id]/adr/lines/[lineId]` | **Built** | Read-only line detail |
| `/engagements/[id]/examination` | Stub | H1 only |
| `/engagements/[id]/report` | Stub | H1 only |
| `/engagements/[id]/findings` | Stub | H1 only |
| `/engagements/[id]/remediation` | Stub | H1 only |

**Engagement chrome (built):** sticky subnav on all `[id]/*` routes via `app/engagements/[id]/layout.tsx`.

---

## 2. Tech stack (match for parity)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19 |
| Styling | Tailwind CSS v4 (`app/globals.css` `@theme`, no `tailwind.config`) |
| Components | shadcn **radix-mira** (`components/ui/*`) |
| Icons | `lucide-react` (Search, ChevronDown, ChevronLeft, ChevronRight, Plus, ArrowLeft) |
| Motion | `motion` v12 (`motion/react`) via shared `@/lib/motion` |
| Fonts | Geist (sans/heading), JetBrains Mono (IDs) |

Assume global app chrome: sticky navbar `h-14` (3.5rem). Engagement subnav sticks at `top-14`.

---

## 3. Design tokens (mandatory)

Copy from `app/globals.css`. Key semantic tokens:

| Token | Light | Use |
|---|---|---|
| `--background` / `--card` | `oklch(0.98 0.01 95.10)` | Page + card |
| `--foreground` | `oklch(0.34 0.03 95.72)` | Body text |
| `--primary` | `oklch(0.62 0.14 39.04)` | Links, bars, focus |
| `--muted` | `oklch(0.955 0.0124 91.52)` | Pill tracks |
| `--border` | `oklch(0.9078 0.0094 106.59)` | Hairlines |
| `--destructive` | `oklch(0.55 0.22 25.33)` | Errors |

**Elevation:** `ring-1 ring-foreground/10` — not drop shadows.  
**Radius:** Mira controls use `rounded-sm`. Pill tracks use `rounded-lg`.  
**Page width:** `max-w-7xl`, padding `p-4 sm:p-6`, section gap `gap-6`.

### Typography roles

| Role | Classes |
|---|---|
| Page H1 | `text-2xl font-bold tracking-tight sm:text-3xl` |
| Page subtitle | `text-muted-foreground` |
| Detail H1 | `text-xl font-semibold leading-tight tracking-tight` |
| Card title | `text-sm font-medium` |
| Meta / captions | `text-xs text-muted-foreground` |
| KPI numbers | `text-2xl font-bold tabular-nums` |
| Line / parent IDs | `font-mono text-xs tabular-nums` |
| Engagement code (meta) | `font-mono text-[0.625rem] text-muted-foreground tabular-nums` |
| Controls | `text-xs/relaxed` |

### Mira primitives (do not restyle to New York density)

| Primitive | Key classes |
|---|---|
| Button | `rounded-sm text-xs/relaxed`, size `sm` for toolbars |
| Card | `rounded-sm bg-card ring-1 ring-foreground/10`, often `py-0 gap-0` for table shells |
| Input | default `h-7`; toolbars use `h-8` with left icon padding `pl-8` |
| Badge | `h-5 rounded-sm text-[0.625rem] font-medium`, `variant="outline"`, `capitalize` on status |
| Dialog overlay | `OVERLAY_BACKDROP_CLASS` = `bg-background/40 backdrop-blur-sm` |
| Table header row | `border-b border-border/40 bg-muted/20 hover:bg-muted/20` |
| Clickable table row | `tableRowClickableClass` + `ROW_HOVER_CLASS` + `border-b` |

---

## 4. Motion system (implement exactly)

Import motion helpers from a single module. Honor `useReducedMotion()` everywhere.

### 4.1 Token values

```ts
easeOut = [0.23, 1, 0.32, 1]
duration = { press: 0.14, hover: 0.16, snappy: 0.22, enter: 0.28, page: 0.3, chart: 0.36 }
springUi = { type: "spring", stiffness: 400, damping: 34 }
stagger = { section: 0.05, sectionDelay: 0.04, list: 0.05, listDelay: 0.02 }
```

### 4.2 Page shell components

**PageReveal** — mount once per route, never keyed on filters:
- Normal: `initial { opacity: 0, y: 8 }` → `animate { opacity: 1, y: 0 }`, `duration.page`, `easeOut`
- Reduced: opacity only, `duration: 0`

**SectionStagger** + **SectionItem** — cascade major vertical blocks:
- Container: `staggerChildren: 0.05`, `delayChildren: 0.04`
- Item normal: `hidden { opacity: 0, y: 10 }` → `show { opacity: 1, y: 0 }`, `duration.enter`, `easeOut`
- Item reduced: opacity fade only

**ChartReveal** — insights inner content on first expand:
- Normal: `opacity 0, y: 10, scale: 0.98` → full, `duration.chart`, `easeOut`
- Reduced: opacity only

### 4.3 List / table rows

**listContainer** + **listItem** on `<motion.tbody>` / `<motion.tr>`:
- Row enter: `opacity 0, y: 10, scale: 0.98` → `1, 0, 1` with `springUi`
- Reduced: opacity only
- `whileTap={tapScale(reduce)}` where `tapScale` returns `{ scale: 0.98 }` or `undefined`

**ROW_HOVER_CLASS** (CSS, fine pointer only):
```
transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out
[@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted/50
[@media(hover:hover)_and_(pointer:fine)]:hover:border-foreground/15
[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-sm
```

Table rows also use `tableRowInteractiveClass` → `hover:bg-primary/10`.

### 4.4 Active pill `layoutId` (sliding indicator)

Used in three places. Pattern:
- Track: `rounded-lg bg-muted/50 p-0.5` (subnav, doc rail) or `rounded-sm bg-muted p-1` (mode toggle)
- Active pill: `motion.span` with `layoutId`, `absolute inset-0`, `bg-background shadow-sm ring-1 ring-border/60` (mode toggle omits ring)
- `transition={springUi}`
- When `useReducedMotion()`: skip `layoutId` pill; apply static `bg-background shadow-sm ring-1 ring-border/60` on active control

| Component | `layoutId` |
|---|---|
| Engagement subnav | `engagement-subnav-active` |
| ADR document rail | `adr-doc-pill` |
| Lines / Threads toggle | `adr-mode-pill` |

### 4.5 Mode crossfade (Lines ↔ Threads)

`AnimatePresence mode="wait" initial={false}` wrapping panel:
- `key={mode}` on inner `motion.div`
- Enter: `opacity: 0, y: 6` → `opacity: 1, y: 0`
- Exit: `opacity: 0, y: -4`
- `duration.enter`, `easeOut`
- Reduced: no offset, `duration: 0`
- **Never** put `key={filters}` on `SectionStagger`

### 4.6 Accordion expand (threads + insights)

`AnimatePresence initial={false}` on body:
- Enter: `height: 0, opacity: 0` → `height: auto, opacity: 1`
- Exit: reverse
- Height uses `springUi`; opacity uses `duration.enter` + `easeOut`
- Chevron rotates `0` → `180deg` with `springUi` (or instant if reduced)

### 4.7 Hard rules

- No enter from `scale(0)` — floor `0.96–0.98`
- No CSS `ease-in` or built-in `ease-out`
- No `transition: all`
- Filter changes animate numbers only — do not re-stagger the page

---

## 5. Routes & navigation

```
/engagements
  └── click row → /engagements/{id}

/engagements/{id}
  ├── layout: EngagementSubnav (sticky)
  ├── /                    → overview stub
  ├── /idr                 → stub
  ├── /adr                 → ADR workspace
  │     ?doc={documentId}  → active document
  │     └── /lines/{lineId} → line detail
  ├── /examination         → stub
  ├── /report              → stub
  ├── /findings            → stub
  └── /remediation         → stub
```

**Subnav active logic:**
- Overview: pathname === `/engagements/{id}` or `/engagements/{id}/`
- Other tabs: pathname === `/engagements/{id}/{segment}` OR starts with `/engagements/{id}/{segment}/`

---

## 6. File structure (source repo)

```
app/engagements/
  page.tsx
  _components/
    engagements-view.tsx
    create-engagement-dialog.tsx
  [id]/
    layout.tsx
    page.tsx                          # stub
    _components/engagement-subnav.tsx
    adr/
      page.tsx
      _components/
        adr-workspace.tsx
        adr-workspace-header.tsx
        adr-document-rail.tsx
        adr-mode-toggle.tsx
        adr-lines-panel.tsx
        adr-lines-table.tsx
        adr-threads-panel.tsx
        adr-thread-item.tsx
        adr-create-line-dialog.tsx
        adr-insight-drawer.tsx
        adr-empty-state.tsx
        adr-filters.ts
        adr-thread-chain.ts
      lines/[lineId]/
        page.tsx
        _components/
          adr-line-detail-view.tsx
          adr-parent-context.tsx
```

---

## 7. Data shapes (UI props)

Wire from any mock JSON. Shapes below are what components expect.

### 7.1 Engagement list item

```ts
interface EngagementListItem {
  id: string;
  code: string;
  name: string;
  status: "active" | "closed" | string;
  leadName: string;
  phase: string;
  openLineCount: number;
  nextDueDate: string | null;  // ISO
  dueWithin48h: number;
  overdue: number;
}
```

### 7.2 ADR document (batch / round — NOT file attachment)

```ts
interface AdrDocument {
  id: string;
  label: string;              // e.g. "ADR-1 — Follow-up round 1"
  receivedDate: string;
  createdAt: string;
  totalLines: number;
  openLines: number;
  closedLines: number;
  lastImportAt?: string | null;
  lastImportRowCount?: number;
}
```

### 7.3 ADR line (list)

```ts
interface AdrLineListItem {
  id: string;
  lineId: string;             // e.g. "A-001"
  questionText: string;
  category: string;
  ownerTeamSlug: string;
  ownerTeamName: string;
  assigneeName: string | null;
  dueDate: string | null;
  status: string;             // assigned | in_progress | submitted | approved | rejected
  parentIdrLineId: string;    // display code e.g. "L-005"
  parentIdrQuestionText: string;
  parentIdrStatus: string;
  parentIdrCategory: string;
}
```

### 7.4 ADR thread

```ts
interface AdrThread {
  parentLineId: string;
  parentQuestionText: string;
  parentCategory: string;
  parentStatus: string;
  lines: AdrLineListItem[];
}
```

### 7.5 ADR line detail

Extends list item plus:

```ts
interface AdrLineDetail extends AdrLineListItem {
  engagementId: string;
  engagementCode: string;
  engagementName: string;
  documentId?: string;
  documentLabel?: string;
  responseText: string | null;
  rejectionComment: string | null;
  submittedAt: string | null;
  submittedByName: string | null;
  attachments: { id?: string; fileName?: string }[];
  recentAudit: { id: string; eventType: string; createdAt: string }[];
}
```

### 7.6 Team (create dialog)

```ts
interface Team {
  id: string;
  slug: string;
  displayName: string;
}
```

### 7.7 Sample engagement id for testing

`eng-rbi-it-exam-fy27` — has ADR documents, lines, threads, and line details in dummy data.

---

## 8. Screen A — Engagements list (`/engagements`)

### 8.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [PageReveal + SectionStagger]                                │
│  H1 "Engagements" + subtitle                                 │
│  [Create engagement] (if canCreate)                          │
│  ┌─ Card (flex-1, min-h-0) ───────────────────────────────┐ │
│  │ [Search] [active|closed|all pills]                        │ │
│  │ Table: name/code | phase | lead | due | open lines        │ │
│  │ [Pager if > 8 rows]                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Shell:** `main` = `h-[calc(100dvh-3.5rem)] overflow-hidden`  
**Inner:** `PageReveal` + `SectionStagger`, card `flex min-h-0 flex-1 flex-col gap-0 py-0`

### 8.2 Copy

| Element | Text |
|---|---|
| H1 | Engagements |
| Subtitle | Track every audit, its phase, owner, and open IDR/ADR lines. |
| Search placeholder | Search by name, code, or lead… |
| Status filters | active · closed · all (default: **active**) |
| Table headers | Engagement name · Phase · Lead · Due date · Open lines |
| Empty (search) | No engagements match this search. |
| Empty (closed) | No closed engagements. |
| Empty (active) | No active engagements. |
| Empty (all) | No engagements yet. |
| Pager | Page {n} of {total} · Prev · Next |

### 8.3 Table row

- Click → `/engagements/{id}`
- Name: `font-medium`; code below: `font-mono text-[0.625rem] text-muted-foreground`
- Phase: `Badge variant="outline"`
- Due: `formatDueDate` → `{day} {Mon} {year}` UTC, or `—`
- Open lines: `text-right tabular-nums`
- Row animation: `motion.tbody` with `listContainer` / `listItem`; skip re-enter after first paint (`enteredRef` pattern)

### 8.4 Toolbar inside card

- Border bottom: `border-b border-border/50 px-7.5 py-3`
- Search: icon `Search` `size-3.5` at `left-2.5`, input `h-8 pl-8`
- Status pills: `rounded-sm bg-muted p-1`, active = `bg-background text-foreground hover:bg-background`

### 8.5 Pagination

- `PAGE_SIZE = 8`
- Reset page to 1 on search/status change
- Pager footer: `border-t border-border/50 px-7.5 py-2.5`

### 8.6 Create engagement dialog

Optional if rebuilding list only — dialog with form fields (name, type, code, lead, dates, SLA). Submit adds row client-side. Not required for ADR parity.

---

## 9. Screen B — Engagement subnav (layout)

### 9.1 Placement

Sticky bar directly under global navbar:
```
sticky top-14 z-40
border-b border-border/50
bg-background/80
shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]
backdrop-blur-md supports-backdrop-filter:bg-background/70
```

Inner: `mx-auto max-w-7xl overflow-x-auto px-4 py-2 sm:px-6`

### 9.2 Tabs (order fixed)

Overview · IDR · ADR · Examination · Report · Findings · Remediation

### 9.3 Tab link styles

- Track: `flex rounded-lg bg-muted/50 p-0.5`
- Link: `relative rounded-md px-3 py-1.5 text-xs font-medium`
- Inactive: `text-muted-foreground` + fine-pointer hover to foreground
- Active: `text-foreground` + sliding pill (`layoutId="engagement-subnav-active"`)
- `whileTap={tapScale}`

### 9.4 Layout wrapper

```tsx
<div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
  <EngagementSubnav />
  <div className="min-h-0 flex-1">{children}</div>
</div>
```

---

## 10. Screen C — ADR workspace (`/engagements/[id]/adr`)

### 10.1 Page data loading (UI contract)

On mount, load:
1. `engagementCode` from engagement overview
2. `documents[]` — all ADR batches
3. `threads[]` — all IDR→ADR thread groups (engagement-wide)
4. `lines[]` — lines for **active document** only
5. `teams[]` — for create dialog parent/team pickers

**Active document:** `searchParams.doc` if matches a document id, else `documents[0].id`, else `null`.

**URL sync:** document rail uses `router.replace(/engagements/{id}/adr?doc={docId}, { scroll: false })`.

### 10.2 Vertical layout (top → bottom)

```
SectionItem 1: AdrWorkspaceHeader
SectionItem 2 (if docs): AdrDocumentRail + AdrModeToggle (gap-3)
SectionItem 3 (if docs): Lines panel OR Threads panel (min-h-[28rem])
SectionItem 4 (if docs): AdrInsightDrawer (collapsed default)
OR
SectionItem 2 (if no docs): AdrEmptyState
```

**Main:** `min-h-[calc(100dvh-3.5rem-3rem)]` (accounts for subnav ~3rem)

### 10.3 Header (`AdrWorkspaceHeader`)

**Left column:**
- Meta: `{engagementCode}` — mono 0.625rem muted
- H1: **Additional Document Request**
- Subtitle: **Follow-ups linked to parent IDR lines — trace every auditor ask back to its source.**

**Right column — KPI strip (plain floating, NOT ringed):**
- Layout: `flex gap-4 overflow-x-auto sm:gap-6`
- Each KPI: `min-w-16 shrink-0`
  - Value: `text-2xl font-bold tabular-nums`
  - Label: `text-xs text-muted-foreground`

| KPI label | Value source | Meaning |
|---|---|---|
| Documents | `documents.length` | Count of ADR **batches/rounds** |
| Open lines | lines where `status !== "approved"` | Unclosed follow-ups in active doc |
| Needs review | lines where `status === "submitted"` | Awaiting CO review |
| Overdue | open lines with `dueDate < now` | Past due, not approved |

**Responsive:** `flex-col gap-4 sm:flex-row sm:items-end sm:justify-between`

### 10.4 Document rail (`AdrDocumentRail`)

- Horizontal scroll wrapper
- Track: `flex w-max gap-1 rounded-lg bg-muted/50 p-0.5`, `role="tablist"`
- Each doc = button `role="tab"`:
  - Line 1: `doc.label` — `font-medium`
  - Line 2: `{openLines} open · {closedLines} closed` — `text-[0.625rem] text-muted-foreground tabular-nums`
- Active: `layoutId="adr-doc-pill"` sliding indicator
- Hidden when `documents.length === 0`

### 10.5 Mode toggle (`AdrModeToggle`)

- `rounded-sm bg-muted p-1`, `role="group"`
- Options: **Lines** | **Threads** (default: **Lines**)
- Active pill: `layoutId="adr-mode-pill"` (no ring on pill, only `shadow-sm`)
- On switch to Threads: increment `threadsActivateToken` (triggers default expand once)

### 10.6 Empty state (`AdrEmptyState`)

Card with:
- Title: **No ADR documents yet**
- Body: **Additional Document Requests appear here after follow-up rounds are linked to IDR responses. Nothing to triage for this engagement yet.**

No CTA button.

---

## 11. Lines mode

### 11.1 Panel shell (`AdrLinesPanel`)

Card: `flex min-h-0 flex-1 flex-col gap-0 py-0`

**Toolbar** (`border-b border-border/50 px-4 py-3 sm:px-6`, stacks on mobile):
1. Search — placeholder: **Search lines, parent, team…**
2. Filter chips (ghost buttons in `rounded-sm bg-muted p-1`):
   - All · Open · Needs review · Overdue · Due 48h
3. Sort select (`h-8 w-36`): Line ID · Due date · Status · Parent (default: **Line ID**)
4. **Add line** button (if `canCreate`) — opens dialog

### 11.2 Filter logic (`adr-filters.ts`)

**Closed status:** only `"approved"`.

| Filter | Rule |
|---|---|
| all | always true |
| open | `status !== "approved"` |
| needs_review | `status === "submitted"` |
| overdue | has dueDate, not approved, `dueDate < now` |
| due_48h | has dueDate, not approved, due in `[now, now+48h]` |

**Search** (case-insensitive) matches any of:
`lineId`, `questionText`, `parentIdrLineId`, `parentIdrQuestionText`, `category`, `ownerTeamName`, `assigneeName`

**Sort:**
- `line_id` — `lineId` localeCompare (default)
- `due_date` — ascending; null due dates last
- `status` — localeCompare
- `parent` — `parentIdrLineId` localeCompare

**Empty messages:**
- Search active: **No lines match these filters.**
- Filter all, no lines: **No ADR lines in this document.**
- Other filters: **No lines match these filters.**

### 11.3 Table (`AdrLinesTable`)

**Columns:** Line · Parent · Question · Category · Owner · Due · Status

**Cell styles:**
- Line ID: `font-mono text-xs tabular-nums`
- Parent: `Link` to `/engagements/{id}/idr/lines/{parentIdrLineId}`, `text-primary`, mono, hover underline; `stopPropagation` on click
- Question: `max-w-64 truncate`
- Due: `formatDueDate` → `5 Sep 2026` (UTC) or `—`
- Status: `Badge outline capitalize`, underscores → spaces

**Row behavior:**
- Click / Enter / Space → `/engagements/{id}/adr/lines/{lineId}`
- `tabIndex={0}`
- Animation: `motion.tbody` initial animate show (list stagger)

**Table padding:** first/last cells `pl-4 pr-4` (sm: `pl-6 pr-6`)

---

## 12. Threads mode

### 12.1 Thread scoping

Before display, filter threads to active document:
```ts
threadsForDocument(threads, new Set(lines.map(l => l.lineId)))
// Keep only child lines whose lineId is in current document; drop empty parents
```

### 12.2 Panel toolbar (`AdrThreadsPanel`)

1. Search — **Search parent or follow-up…**
2. Filters: All · Has open · Has overdue · Multi follow-up
3. Sort (default **Most open**): Parent ID · Most open · Most overdue
4. Buttons: **Expand all** · **Collapse** (`variant="outline" size="sm"`)

### 12.3 Thread filter logic (`adr-thread-chain.ts`)

**Metrics per thread:** `total`, `open` (not approved), `overdue` (open + past due)

| Filter | Rule |
|---|---|
| all | true |
| has_open | open > 0 |
| has_overdue | overdue > 0 |
| multi_followup | total >= 2 |

**Search** matches parent id/question/category OR any child lineId/question/status.

**Sort:**
- `most_open` — descending open, tie parent id
- `most_overdue` — descending overdue, tie parent id
- `parent_line_id` — parent id asc

**Default expand:** on first entry into Threads mode (`activateToken` changes), expand parents where `open > 0 || overdue > 0`. Do not override user toggles on subsequent filter changes.

### 12.4 Thread item (`AdrThreadItem`)

**Header button** (full width):
- Chevron rotates 180° when expanded
- Parent ID mono + parent status badge + metrics: `{total} ADR · {open} open · {overdue} overdue` (0.625rem muted)
- Question: `line-clamp-1 text-xs text-muted-foreground`
- Hot thread (open/overdue) not expanded: `bg-primary/5`
- Hover: `hover:bg-primary/10` (fine pointer)

**Expanded body** (`bg-muted/20`, left indent `sm:pl-12`):
- Full parent question (`text-xs text-foreground`)
- Child list — each child is a card link:
  - `rounded-sm ring-1 ring-foreground/10 bg-card px-3 py-2`
  - Row: lineId mono + status badge + `Due {date}`
  - Question: `line-clamp-2 text-xs text-muted-foreground`
  - Link → `/engagements/{id}/adr/lines/{lineId}`

**Empty:** **No IDR → ADR threads for this document.** (or filter variant)

---

## 13. Add line dialog (`AdrCreateLineDialog`)

**Trigger:** Button `size="sm"` with Plus icon — **Add line**

**Title:** Add ADR line  
**Description:** Every follow-up must link to a parent IDR line. Saving is not connected yet — this dialog validates the form only.

| Field | Required | Control |
|---|---|---|
| Parent IDR line | yes | Select — shows `{lineId}` mono + question truncated 48 chars |
| Question | yes | Textarea `min-h-20` |
| Category | yes | Input |
| Owner team | yes | Select from teams |
| Assignee | no | Input |
| Due date | no | `type="date"` |

**Validation errors** (`text-xs text-destructive`):
- Select a parent IDR line.
- Enter the follow-up question.
- Enter a category.
- Select an owner team.

**Submit:** button label **Validate** — on success shows notice: **Save will be available when the API is connected.** (no persistence)

**Footer:** Cancel (outline) · Validate

---

## 14. Insights drawer (`AdrInsightDrawer`)

Collapsed by default. Card `gap-0 py-0`.

**Header button:**
- Title: **Insights**
- Subtitle: **Status mix and SLA pressure for the active document**
- Chevron rotates on open

**Expanded content** (ChartReveal on first open only):
- Summary line: `{open} open · {needsReview} needs review · {overdue} overdue · {total} total`
- Status breakdown: label + count + horizontal bar (`h-1.5 bg-muted`, fill `bg-primary`, `scaleX(count/max)`)
- Side note card: **Use Lines for triage and Threads to verify every follow-up still traces to its parent IDR question.**

---

## 15. Screen D — ADR line detail (`/engagements/[id]/adr/lines/[lineId]`)

### 15.1 Layout (SectionStagger)

1. **Header block**
   - Ghost link: ← **Back to ADR** → `/engagements/{id}/adr?doc={documentId}` if known
   - H1: `{lineId}` mono inside detail H1
   - Status badge
   - Meta: `{engagementCode} · {documentLabel}`

2. **Parent context card** (`AdrParentContext`)
   - Label: **IDR → ADR lineage**
   - **Follow-up to IDR** `{parentIdrLineId}` (link to IDR line route)
   - Badges: parent status + parent category
   - Parent question text (muted xs)

3. **Two-column grid** (`md:grid-cols-2`)
   - Card **Question** — full question text
   - Card **Assignment** — key/value rows: Category, Owner, Assignee (`—` if null), Due

4. **Two-column grid**
   - Card **Response** — text or **No response yet.**; submitted meta; rejection in destructive
   - Card **Attachments** — list mono filenames or **No attachments.**

5. **Full width**
   - Card **Recent audit** — eventType mono + date, or **No audit events.**

**No workflow buttons** (submit/approve/reject).

---

## 16. Client state summary

| State | Location | Initial |
|---|---|---|
| `mode` | adr-workspace | `"lines"` |
| `threadsActivateToken` | adr-workspace | `0` |
| `search`, `filter`, `sort` | lines-panel | `""`, `"all"`, `"line_id"` |
| `search`, `filter`, `sort` | threads-panel | `""`, `"all"`, `"most_open"` |
| `expandedIds` | threads-panel | `Set` — seeded on token bump |
| `open`, `revealed` | insight-drawer | `false`, `false` |
| dialog form | create-dialog | empty; reset on close |

---

## 17. Date formatting (shared)

```ts
// UTC display: "{day} {Mon} {year}" or "—"
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
formatDueDate(iso) => `${getUTCDate()} ${MONTHS[getUTCMonth()]} ${getUTCFullYear()}`
statusLabel(s) => s.replaceAll("_", " ")
```

---

## 18. Component tree (ADR workspace)

```
AdrWorkspace
├── PageReveal
│   └── SectionStagger
│       ├── SectionItem → AdrWorkspaceHeader
│       ├── [if no docs] SectionItem → AdrEmptyState
│       └── [if docs]
│           ├── SectionItem
│           │   ├── AdrDocumentRail
│           │   └── AdrModeToggle
│           ├── SectionItem
│           │   └── AnimatePresence (mode crossfade)
│           │       ├── AdrLinesPanel
│           │       │   ├── toolbar (search, filters, sort, dialog)
│           │       │   └── AdrLinesTable
│           │       └── AdrThreadsPanel
│           │           ├── toolbar
│           │           └── AdrThreadItem × N
│           └── SectionItem → AdrInsightDrawer
```

---

## 19. Visual reference checklist

Use this to verify parity after rebuild:

- [ ] Page max-width 7xl, padding 4/6, gap 6
- [ ] Cards use ring not shadow
- [ ] All controls `text-xs` density (Mira)
- [ ] Mono font on all line/parent IDs
- [ ] KPI strip is plain numbers (no ring container)
- [ ] Subnav pill slides with spring between tabs
- [ ] Doc rail pill slides when switching documents
- [ ] Mode toggle pill slides Lines ↔ Threads
- [ ] Lines/Threads crossfade ~280ms easeOut
- [ ] Table rows stagger in on first paint
- [ ] Thread accordion height spring + chevron rotate
- [ ] Insights collapsed by default; ChartReveal on first expand
- [ ] Reduced motion: no y-offset, no layoutId pills (static active bg)
- [ ] Parent links go to IDR line route (may be stub target)
- [ ] Line row links go to ADR detail route
- [ ] Create dialog validates but does not save
- [ ] Empty states use exact copy from §10.6, §11.2, §12.4

---

## 20. Explicitly out of scope

Do not implement when rebuilding UI-only parity:

- Authentication / session / role gates (hardcode `canCreate: true` if needed)
- Backend APIs, Prisma, server actions
- Excel import
- Submit / approve / reject workflow
- Runtime create ADR document
- IDR / Overview / Examination / Report / Findings / Remediation tab content (stubs OK)
- Navbar internals (assume existing shell with `h-14`)

---

## 21. Suggested build order (another agent)

1. Motion tokens + PageReveal / SectionStagger / tapScale / ROW_HOVER_CLASS
2. Engagement subnav + layout
3. ADR page shell + header + KPIs
4. Document rail + mode toggle
5. Lines panel (filters + table)
6. Threads panel (accordion)
7. Insight drawer
8. Create dialog (UI only)
9. Line detail + parent context
10. Engagements list (if full module parity)
11. Run visual checklist §19

---

## 22. Source file index

| UI piece | File |
|---|---|
| Subnav | `app/engagements/[id]/_components/engagement-subnav.tsx` |
| Layout | `app/engagements/[id]/layout.tsx` |
| ADR page | `app/engagements/[id]/adr/page.tsx` |
| Workspace orchestrator | `app/engagements/[id]/adr/_components/adr-workspace.tsx` |
| Header | `adr-workspace-header.tsx` |
| Document rail | `adr-document-rail.tsx` |
| Mode toggle | `adr-mode-toggle.tsx` |
| Lines | `adr-lines-panel.tsx`, `adr-lines-table.tsx` |
| Threads | `adr-threads-panel.tsx`, `adr-thread-item.tsx` |
| Filters | `adr-filters.ts`, `adr-thread-chain.ts` |
| Dialog | `adr-create-line-dialog.tsx` |
| Insights | `adr-insight-drawer.tsx` |
| Empty | `adr-empty-state.tsx` |
| Detail | `adr/lines/[lineId]/_components/adr-line-detail-view.tsx` |
| Parent band | `adr-parent-context.tsx` |
| List | `app/engagements/_components/engagements-view.tsx` |
| Motion | `lib/motion/tokens.ts`, `lib/motion/components.tsx` |
| Design tokens | `DESIGN_SYSTEM.md`, `app/globals.css` |
