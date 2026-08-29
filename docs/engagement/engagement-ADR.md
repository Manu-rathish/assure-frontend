# ADR: Engagement Module — UI Build Specification

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-08-28 |
| **Scope** | UI only — layouts, client state, dummy data, motion. **No auth, no backend, no API design.** |
| **Product** | Apex Assure (`assure-ui`) |
| **Companion docs** | [Design handoff](../design-handoff/design_handoff.md) · [File structure](../file-structure/file-refer.md) · [Engagement UI reference](./engagement-reference.md) |

---

## 1. Context

Apex Assure is being rebuilt as a Next.js 16 App Router frontend. The **Engagement module** is the primary workspace for audit engagements: listing engagements, navigating sub-sections (IDR, ADR, examination, report, findings, remediation), and triaging **Additional Document Requests (ADR)** follow-up lines linked to parent IDR questions.

This ADR is the **single entry point** for building the module. It records architectural decisions, file placement, data flow, build order, and acceptance criteria. Pixel-level screen specs live in [`engagement-reference.md`](./engagement-reference.md). Visual tokens and global chrome live in [`design_handoff.md`](../design-handoff/design_handoff.md). Directory and import conventions live in [`file-refer.md`](../file-structure/file-refer.md).

---

## 2. Goals

| Goal | Success criterion |
|---|---|
| Replicate engagement UI from the reference build | Visual checklist in §12 passes |
| Match Assure design language | Claude light/dark tokens, Mira density, motion rules from design handoff |
| Follow project file structure | All new code placed per §5; no `src/`, `features/`, or top-level `hooks/` |
| Ship without backend | Data from `Data.json` via `lib/api/*`; client-only mutations where noted |
| Defer auth | Hardcode `canCreate: true`; no session gates or role filters in this phase |

---

## 3. Decisions

### 3.1 UI-only phase (no auth, no backend)

**Decision:** Build screens, filters, dialogs, and navigation with static dummy data. Do not implement authentication, Express API calls, server actions, or Next `app/api/` CRUD routes.

**Rationale:** Unblocks visual parity and interaction design before backend integration.

**Consequences:**
- `lib/api/<domain>.ts` reads from `lib/data/dummy.ts` → `Data.json`.
- Create-engagement and add-ADR-line dialogs **validate only**; submit shows a notice, no persistence.
- Submit / approve / reject ADR workflow buttons are **not built**.
- Excel import and runtime ADR document creation are **out of scope**.

### 3.2 Route-owned UI in `_components/`

**Decision:** Page-specific components live under `app/engagements/**/_components/`. Shared chrome (navbar, login) stays in `components/`.

**Rationale:** Matches Next.js App Router conventions documented in [`file-refer.md`](../file-structure/file-refer.md) §5.

**Rule:** One route imports it → `_components/`. Two or more routes → `components/<area>/` or `lib/`.

### 3.3 Thin server pages, fat client views

**Decision:** `page.tsx` files are async server composers: call `lib/api/*`, pass props to a `"use client"` view in `_components/`.

**Rationale:** Keeps data access out of components; preserves swap path to TanStack Query later without changing view props.

**Example:**

```tsx
// app/engagements/page.tsx
import { EngagementsView } from "@/app/engagements/_components/engagements-view";
import { listEngagementsApi } from "@/lib/api/engagements";

export default async function EngagementsPage() {
  const list = await listEngagementsApi({ limit: 500 });
  return <EngagementsView initialItems={list.items} canCreate />;
}
```

**Constraint:** Never call `fetch()` from pages or `_components/` — always use `lib/api/<domain>.ts`.

### 3.4 Engagement subnav in nested layout

**Decision:** `app/engagements/[id]/layout.tsx` renders sticky `EngagementSubnav` for all `[id]/*` child routes.

**Rationale:** Subnav is engagement chrome, not global navbar. Sticks at `top-14` (below global `h-14` navbar).

**Active tab logic:**
- Overview: pathname is `/engagements/{id}` or `/engagements/{id}/`
- Other tabs: pathname equals or starts with `/engagements/{id}/{segment}`

### 3.5 ADR workspace as primary built surface

**Decision:** Within the engagement module, **ADR workspace** (`/engagements/[id]/adr`) is the most complete screen and the reference implementation for filtered tables, document rail, mode toggle, and thread accordion patterns.

**Rationale:** ADR encodes the hardest UI patterns (document switching, Lines ↔ Threads, insights drawer, line detail). Other sub-tabs ship as H1 stubs until their own ADRs.

### 3.6 Design system compliance

**Decision:** All engagement UI must follow the Claude first-paint tokens and Mira component density from [`design_handoff.md`](../design-handoff/design_handoff.md).

**Non-negotiables for this module:**

| Area | Rule |
|---|---|
| Page shell | `max-w-7xl mx-auto`, `p-4 sm:p-6`, `gap-6` |
| Cards | `rounded-sm`, `ring-1 ring-foreground/10` — not drop shadows |
| Controls | `text-xs/relaxed`, inputs `h-7`, toolbar search `h-8` |
| IDs | `font-mono text-xs tabular-nums` |
| KPI numbers | `text-2xl font-bold tabular-nums` |
| Filtered table card | `gap-0 py-0`, header wash `bg-muted/20 border-b border-border/40` |
| Row hover | `ROW_HOVER_CLASS` + inset primary bar on filtered registers |
| Motion | `@/lib/motion` — PageReveal once per route; no re-stagger on filter change |

### 3.7 Client state stays colocated

**Decision:** Filter, search, sort, mode, and accordion expansion state live in the owning client component — not a global store.

**Rationale:** UI-only phase has no cross-route state requirements. See [`engagement-reference.md`](./engagement-reference.md) §16 for the state map.

### 3.8 URL sync for active ADR document

**Decision:** Active ADR document is driven by `?doc={documentId}` search param. Document rail calls `router.replace(..., { scroll: false })`.

**Rationale:** Deep-linkable document context; back navigation from line detail preserves document selection.

---

## 4. Module map

### 4.1 Routes and build status

| Route | Status | Deliverable |
|---|---|---|
| `/engagements` | **Build** | List + search + status filter + pagination + create dialog |
| `/engagements/[id]` | Stub | H1 "Engagement overview" |
| `/engagements/[id]/idr` | Stub | H1 only |
| `/engagements/[id]/adr` | **Build** | Full workspace |
| `/engagements/[id]/adr/lines/[lineId]` | **Build** | Read-only line detail |
| `/engagements/[id]/examination` | Stub | H1 only |
| `/engagements/[id]/report` | Stub | H1 only |
| `/engagements/[id]/findings` | Stub | H1 only |
| `/engagements/[id]/remediation` | Stub | H1 only |

### 4.2 Navigation tree

```
/engagements
  └── row click → /engagements/{id}

/engagements/{id}
  ├── layout: EngagementSubnav (sticky, top-14)
  ├── /                    → overview (stub)
  ├── /idr                 → stub
  ├── /adr                 → ADR workspace
  │     ?doc={documentId}  → active document batch
  │     └── /lines/{lineId} → line detail (read-only)
  ├── /examination         → stub
  ├── /report              → stub
  ├── /findings            → stub
  └── /remediation         → stub
```

**Subnav tab order (fixed):** Overview · IDR · ADR · Examination · Report · Findings · Remediation

---

## 5. File structure

Place all engagement module code under `app/engagements/` per [`file-refer.md`](../file-structure/file-refer.md) §6.

```
app/engagements/
├── page.tsx
├── _components/
│   ├── engagements-view.tsx
│   └── create-engagement-dialog.tsx
└── [id]/
    ├── layout.tsx
    ├── page.tsx                          # stub — overview
    ├── _components/
    │   └── engagement-subnav.tsx
    ├── adr/
    │   ├── page.tsx
    │   └── _components/
    │       ├── adr-workspace.tsx           # orchestrator
    │       ├── adr-workspace-header.tsx
    │       ├── adr-document-rail.tsx
    │       ├── adr-mode-toggle.tsx
    │       ├── adr-lines-panel.tsx
    │       ├── adr-lines-table.tsx
    │       ├── adr-threads-panel.tsx
    │       ├── adr-thread-item.tsx
    │       ├── adr-create-line-dialog.tsx
    │       ├── adr-insight-drawer.tsx
    │       ├── adr-empty-state.tsx
    │       ├── adr-filters.ts              # pure filter/sort helpers
    │       └── adr-thread-chain.ts
    │   └── lines/
    │       └── [lineId]/
    │           ├── page.tsx
    │           └── _components/
    │               ├── adr-line-detail-view.tsx
    │               └── adr-parent-context.tsx
    ├── idr/page.tsx                        # stub
    ├── examination/page.tsx                # stub
    ├── report/page.tsx                     # stub
    ├── findings/page.tsx                   # stub
    └── remediation/page.tsx                # stub
```

### 5.1 Supporting `lib/` modules

| Path | Responsibility |
|---|---|
| `lib/api/engagements.ts` | `listEngagementsApi`, `getEngagementOverviewApi` |
| `lib/api/adr.ts` | `listAdrDocumentsApi`, `listAdrLinesApi`, `listAdrThreadsApi`, `getAdrLineDetailApi` |
| `lib/api/teams.ts` | `listTeamsApi` — create-dialog team picker |
| `lib/types/engagement.ts` | `EngagementListItem`, overview types |
| `lib/types/adr.ts` | `AdrDocument`, `AdrLineListItem`, `AdrThread`, `AdrLineDetail` |
| `lib/types/org.ts` | `Team` |
| `lib/data/dummy.ts` | `loadDummy()`, `requireEngagement()` |
| `lib/motion/` | `PageReveal`, `SectionStagger`, `SectionItem`, tokens |

### 5.2 Naming conventions

| Kind | Convention | Example |
|---|---|---|
| Route folders | kebab-case | `engagements`, `remediation` |
| Dynamic segments | `[id]`, `[lineId]` | |
| Page-local UI | `_components/<name>.tsx` | `engagements-view.tsx` |
| Component exports | PascalCase | `export function EngagementsView` |
| Pure helpers | kebab-case `.ts` in `_components/` | `adr-filters.ts` |

### 5.3 What not to add

- No `src/`, `features/`, `modules/`, or top-level `hooks/`
- No `app/api/` routes for engagement CRUD
- No TanStack Query until team adopts it
- No barrel `index.ts` except `lib/motion/index.ts`

---

## 6. Data layer (dummy phase)

### 6.1 Flow

```
page.tsx (server)
  → lib/api/<domain>.ts
    → lib/data/dummy.ts
      → Data.json (@dummy-data)
```

### 6.2 API function signatures

Follow Assess-style naming; return unwrapped `T`, throw `ApiClientError` on failure (future).

| Function | Returns |
|---|---|
| `listEngagementsApi({ limit, offset, status? })` | `Page<EngagementListItem>` |
| `getEngagementOverviewApi(id)` | `{ id, code, name, … }` |
| `listAdrDocumentsApi(engagementId)` | `AdrDocument[]` |
| `listAdrLinesApi(engagementId, documentId)` | `AdrLineListItem[]` |
| `listAdrThreadsApi(engagementId)` | `AdrThread[]` |
| `getAdrLineDetailApi(engagementId, lineId)` | `AdrLineDetail` |
| `listTeamsApi()` | `Team[]` |

### 6.3 Type shapes

Full prop contracts are in [`engagement-reference.md`](./engagement-reference.md) §7. Key fields:

**EngagementListItem:** `id`, `code`, `name`, `status`, `leadName`, `phase`, `openLineCount`, `nextDueDate`, `dueWithin48h`, `overdue`

**AdrDocument:** batch/round metadata — `label`, `openLines`, `closedLines`, `totalLines` (not a file attachment)

**AdrLineListItem:** `lineId`, `questionText`, `status`, `parentIdrLineId`, `dueDate`, team/assignee fields

**Test engagement id:** `eng-rbi-it-exam-fy27` — has documents, lines, threads, and line details in `Data.json`.

### 6.4 Shared formatters

```ts
// UTC: "5 Sep 2026" or "—"
formatDueDate(iso: string | null): string

// "in_progress" → "in progress"
statusLabel(s: string): string
```

---

## 7. Screen specifications (summary)

Detailed copy, class strings, and filter rules are in [`engagement-reference.md`](./engagement-reference.md) §8–15. This section records layout intent only.

### 7.1 Engagements list (`/engagements`)

**Shell:** `main` = `h-[calc(100dvh-3.5rem)] overflow-hidden`

**Structure:** PageReveal → SectionStagger → H1 + subtitle + Create button → filtered table card

| Element | Detail |
|---|---|
| H1 | Engagements |
| Subtitle | Track every audit, its phase, owner, and open IDR/ADR lines. |
| Toolbar | Search (`h-8 pl-8`) + status pills (active · closed · all, default **active**) |
| Table columns | Engagement name · Phase · Lead · Due date · Open lines |
| Pagination | `PAGE_SIZE = 8`; footer when > 8 rows |
| Row click | Navigate to `/engagements/{id}` |

**Create dialog:** Form validates; submit adds row client-side only (optional for ADR-only rebuild).

### 7.2 Engagement subnav (layout)

Sticky bar under global navbar:

```
sticky top-14 z-40
border-b border-border/50
bg-background/80 backdrop-blur-md
shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]
```

- Track: `rounded-lg bg-muted/50 p-0.5`
- Active pill: `layoutId="engagement-subnav-active"` with `springUi`
- Layout wrapper: `min-h-[calc(100dvh-3.5rem)] flex-col`

### 7.3 ADR workspace (`/engagements/[id]/adr`)

**Load on mount:** engagement code, documents[], threads[], lines[] for active doc, teams[]

**Vertical stack:**
1. `AdrWorkspaceHeader` — H1 "Additional Document Request" + KPI strip (Documents, Open lines, Needs review, Overdue)
2. `AdrDocumentRail` + `AdrModeToggle` (Lines | Threads)
3. Lines panel **or** Threads panel (`min-h-[28rem]`)
4. `AdrInsightDrawer` (collapsed default)
5. **Or** `AdrEmptyState` when no documents

**Mode crossfade:** `AnimatePresence mode="wait"`; key on `mode`, not filters.

### 7.4 ADR line detail (`/engagements/[id]/adr/lines/[lineId]`)

Read-only dossier: back link, line ID header, parent context card, question/assignment grid, response/attachments grid, recent audit card. **No workflow buttons.**

---

## 8. Motion requirements

Implement via `@/lib/motion`. Honor `useReducedMotion()` everywhere.

| Pattern | Rule |
|---|---|
| PageReveal | Once per route; `opacity 0→1, y 8→0`, 300ms easeOut |
| SectionStagger | Major blocks only; never keyed on filters |
| List rows | `listContainer` / `listItem` on first paint; `enteredRef` to skip re-enter |
| Sliding pills | `layoutId` on subnav, doc rail, mode toggle; static bg when reduced motion |
| Threads accordion | Height spring + chevron 0→180° |
| Insights drawer | `ChartReveal` on first expand only |
| Filter change | Animate counts/bars only — **no page re-stagger** |

Token values and `ROW_HOVER_CLASS` are in [`engagement-reference.md`](./engagement-reference.md) §4.

---

## 9. Dependencies (prerequisites)

Build these layers **before** engagement screens, in order per [`file-refer.md`](../file-structure/file-refer.md) §13:

| Step | Artifact |
|---|---|
| 1 | Config, `globals.css` tokens, `lib/utils.ts` |
| 2 | shadcn primitives in `components/ui/*` |
| 3 | `lib/types/*`, `Data.json`, `lib/data/dummy.ts` |
| 4 | `lib/api/engagements.ts`, `lib/api/adr.ts`, `lib/api/teams.ts` |
| 5 | `lib/motion/*` |
| 6 | Global chrome: `components/navbar/*`, `app-chrome.tsx` |
| 7 | Stub routes under `app/engagements/[id]/*` for navigation |

**Required shadcn primitives:** Button, Input, Textarea, Select, Label, Card, Table, Dialog, Badge, Tabs, Separator, Skeleton, ScrollArea, Tooltip.

**Icons (Lucide):** Search, ChevronDown, ChevronLeft, ChevronRight, Plus, ArrowLeft.

---

## 10. Build order

Execute in this sequence so imports resolve at each step:

| Phase | Task | Files |
|---|---|---|
| **0** | Stub all engagement routes + subnav layout | `[id]/layout.tsx`, stub `page.tsx` files |
| **1** | Motion + shared formatters | `lib/motion/*`, date helpers |
| **2** | API + types | `lib/api/engagements.ts`, `lib/api/adr.ts`, `lib/types/*` |
| **3** | Engagement subnav | `engagement-subnav.tsx` |
| **4** | ADR page shell | `adr/page.tsx`, `adr-workspace.tsx`, `adr-workspace-header.tsx` |
| **5** | Document rail + mode toggle | `adr-document-rail.tsx`, `adr-mode-toggle.tsx` |
| **6** | Lines mode | `adr-filters.ts`, `adr-lines-panel.tsx`, `adr-lines-table.tsx` |
| **7** | Threads mode | `adr-thread-chain.ts`, `adr-threads-panel.tsx`, `adr-thread-item.tsx` |
| **8** | Insights + empty state | `adr-insight-drawer.tsx`, `adr-empty-state.tsx` |
| **9** | Create line dialog | `adr-create-line-dialog.tsx` |
| **10** | Line detail | `adr-line-detail-view.tsx`, `adr-parent-context.tsx` |
| **11** | Engagements list | `engagements-view.tsx`, `create-engagement-dialog.tsx` |
| **12** | Visual checklist | §12 below |

---

## 11. Out of scope (this ADR)

Do **not** implement in the UI-only phase:

- Authentication, session, role gates
- Backend APIs, Prisma, server actions
- Excel import for ADR documents
- Submit / approve / reject workflow
- Runtime create ADR document
- IDR, Overview, Examination, Report, Findings, Remediation tab content (stubs only)
- Navbar internals (assume existing `h-14` shell)

---

## 12. Acceptance checklist

Use after each screen ships. Full detail in [`engagement-reference.md`](./engagement-reference.md) §19.

### Layout and tokens

- [ ] Page `max-w-7xl`, padding `p-4 sm:p-6`, section `gap-6`
- [ ] Cards use `ring-1 ring-foreground/10`, not drop shadows
- [ ] Controls use Mira density (`text-xs/relaxed`, `h-7` inputs, `h-8` toolbar search)
- [ ] Mono font on all line/parent/engagement codes
- [ ] KPI strip is plain numbers — no ring container

### Navigation

- [ ] Subnav sticks at `top-14`; pill slides between tabs
- [ ] Row click on list → `/engagements/{id}`
- [ ] ADR doc rail syncs `?doc=` param
- [ ] Line row → `/engagements/{id}/adr/lines/{lineId}`
- [ ] Parent links → `/engagements/{id}/idr/lines/{parentIdrLineId}` (stub target OK)

### ADR workspace

- [ ] Document rail pill slides on switch
- [ ] Mode toggle pill slides Lines ↔ Threads
- [ ] Lines/Threads crossfade ~280ms easeOut
- [ ] Filter chips and search work per `adr-filters.ts` / `adr-thread-chain.ts`
- [ ] Thread accordion expands with height spring; default expand on first Threads entry
- [ ] Insights collapsed by default; ChartReveal on first expand
- [ ] Empty states use exact copy from reference doc
- [ ] Create dialog validates; shows API-not-connected notice on success

### Motion and a11y

- [ ] PageReveal runs once per route — not on filter change
- [ ] Table rows stagger on first paint only
- [ ] Reduced motion: no y-offset, static active pill backgrounds
- [ ] Table rows: `tabIndex={0}`, Enter/Space navigates
- [ ] Focus-visible rings on interactive controls

### Data and structure

- [ ] No `fetch()` in components — only `lib/api/*`
- [ ] Types in `lib/types/`, not inline in pages
- [ ] Page-only UI in `_components/`
- [ ] Test data loads for `eng-rbi-it-exam-fy27`

---

## 13. Future work (not this ADR)

| Addition | Location | Trigger |
|---|---|---|
| TanStack Query hooks | `lib/hooks/use-*.ts` | Team adopts query layer |
| HTTP client | `lib/api/client.ts` | Express `/api/v1` ready |
| Auth gate | `proxy.ts` | Auth BFF shipped |
| IDR workspace ADR | `docs/engagement/idr-ADR.md` | IDR UI scoped |
| Overview / examination / report / findings / remediation ADRs | `docs/engagement/` | Per-tab UI scoped |

When backend lands, **swap internals** of `lib/api/*` only — view component props and file tree stay unchanged.

---

## 14. References

| Document | Use when |
|---|---|
| [`engagement-reference.md`](./engagement-reference.md) | Copy strings, class names, filter logic, component tree |
| [`design_handoff.md`](../design-handoff/design_handoff.md) | Global tokens, typography, navbar, filtered-table patterns |
| [`file-refer.md`](../file-structure/file-refer.md) | Where to put files, import aliases, data flow |
| `DESIGN_SYSTEM.md` (package root) | Quick token lookup |
| `lib/motion/ANIMATION.md` | Motion component usage |

### Source file index

| UI piece | File |
|---|---|
| Engagements list | `app/engagements/_components/engagements-view.tsx` |
| Create dialog | `app/engagements/_components/create-engagement-dialog.tsx` |
| Subnav | `app/engagements/[id]/_components/engagement-subnav.tsx` |
| Layout | `app/engagements/[id]/layout.tsx` |
| ADR workspace | `app/engagements/[id]/adr/_components/adr-workspace.tsx` |
| ADR header | `adr-workspace-header.tsx` |
| Document rail | `adr-document-rail.tsx` |
| Mode toggle | `adr-mode-toggle.tsx` |
| Lines panel/table | `adr-lines-panel.tsx`, `adr-lines-table.tsx` |
| Threads panel/item | `adr-threads-panel.tsx`, `adr-thread-item.tsx` |
| Filters | `adr-filters.ts`, `adr-thread-chain.ts` |
| Create line dialog | `adr-create-line-dialog.tsx` |
| Insights | `adr-insight-drawer.tsx` |
| Empty state | `adr-empty-state.tsx` |
| Line detail | `adr/lines/[lineId]/_components/adr-line-detail-view.tsx` |
| Parent context | `adr-parent-context.tsx` |

---

*End of ADR. For pixel-faithful rebuild details, always defer to [`engagement-reference.md`](./engagement-reference.md) and [`design_handoff.md`](../design-handoff/design_handoff.md).*
