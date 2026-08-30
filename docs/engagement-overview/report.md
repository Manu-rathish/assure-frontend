# Report & Findings — Complete UI Rebuild Specification

> **Purpose:** Self-contained, pixel-level rebuild spec for `/engagements/[id]/report` and `/engagements/[id]/findings/[findingCode]`.  
> **Audience:** Engineers or agents rebuilding these screens in **any** codebase with **no** access to other repos, legacy apps, or tribal knowledge.  
> **Scope:** UI only — layouts, copy, tokens, motion, client state, filter/sort algorithms. No auth, no backend, no API design, no mutations.  
> **Design name:** **Report deck** — calm register for the auditor’s final report, severity posture, and finding triage — not a dense legacy dashboard.

**Definition of the module:** Report is engagement phase 4. BDTS registers the auditor’s final report, transcribes **findings**, and runs accept/dispute review. The module answers: *What report did we receive, how severe is the finding mix, and where does each finding stand?*

**Architecture:** Thin server pages load `AuditReport[]`, `SeverityStats`, and `FindingListItem[]`. Finding detail uses `getFindingDetailApi`. Client components own filters/sort on the findings register. Accept/dispute is **UI shell only** in assure-frontend v1. Presentation only.

**Tech stack (source repo):** Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn **radix-mira** · `motion` v12 via `@/lib/motion` · `lucide-react` icons (Search, ArrowLeft, Plus, FileText, ChevronDown only where noted).

**Companion docs:** [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) · [`lib/motion/ANIMATION.md`](../../lib/motion/ANIMATION.md) · [`docs/IDR/idr.md`](../IDR/idr.md) · [`docs/ADR/adr.md`](../ADR/adr.md) · product flow [`docs/Docs/Engagements/04-report-flow.md`](../../../docs/Docs/Engagements/04-report-flow.md) (behavior reference only).

---

## 0. How to use this document

1. Read §1–§3 (constraints, routes, page shells).  
2. Copy design tokens (§4) and motion rules (§5).  
3. Implement data types and loaders per §6 — use `lib/types/finding.ts`, `lib/api/reports.ts`, `lib/api/findings.ts`.  
4. Implement every algorithm in §7 verbatim.  
5. Build each UI block per §8 — every label, class, and empty state is specified.  
6. Follow file layout §9; wire client state §10.  
7. Verify against §11 using `eng-rbi-it-exam-fy27`.  
8. Track build progress with §12 tasks.

---

## 1. Hard constraints

| Rule | Detail |
|---|---|
| **UI only** | No HTTP endpoints, DB schema, server actions, report file upload, or finding persistence. |
| **Read-only data** | `listAuditReportsApi`, `getReportSeverityStatsApi`, `listFindingsApi`, `getFindingDetailApi`, `getEngagementDetailApi`. |
| **Dummy data** | Do not mutate `Data.json` or invent write APIs. |
| **Single report screen** | **Report** tab = metadata cards + **full findings register** (search, filters, table). No separate Findings tab or list page. |
| **Accept / dispute** | Workflow panel UI + client validation only — submit disabled or toast “Coming soon”. |
| **No ingest / add finding** | No working PDF upload, no `/report/new-finding` page. Optional disabled buttons for parity with legacy copy. |
| **No charts** | Severity uses horizontal `scaleX` bars only — no Recharts, no donut. |
| **Module name = H1** | Report route H1: **Report**. Findings section uses **h2 Findings** on same page. Detail uses finding code as H1. |
| **Business finding codes in URLs** | `/findings/F-007` — not internal cuid. |
| **Overview KPI note** | Overview may show `findingsTotal: 12`; report module seed has **8** findings — use `listFindingsApi` length as register source of truth. |

---

## 2. Routes and navigation map

### 2.1 Routes

```
/engagements/{engagementId}/report                      → Report deck (metadata + stats + full findings register)
/engagements/{engagementId}/findings                    → Redirect → `/report#findings-register`
/engagements/{engagementId}/findings/{findingCode}      → Finding detail (read-only + workflow shell)
```

**Entry paths:**
- Subnav → **Report**  
- Overview module card → `/report#findings-register`  
- Overview phase rail Report step → `/report`  
- Findings table row → `/findings/{findingCode}`  
- Finding detail back link → `/report#findings-register`

### 2.2 Subnav active states

| Path | Active tab |
|---|---|
| `/engagements/{id}/report` | **Report** |
| `/engagements/{id}/findings/{findingCode}` | **Report** (detail is part of report module) |

`/findings` (list) redirects to report — no Findings tab.

### 2.3 Engagement sticky subnav

Same chrome as other engagement tabs (`sticky top-14 z-40`, pill track, `layoutId="engagement-subnav-active"`).

**Tab order:** Overview · IDR · ADR · Examination · **Report** · Remediation

---

## 3. Page shell and layout

### 3.1 Server page — Report

```tsx
// app/engagements/[id]/report/page.tsx
import { ReportDeck } from "@/app/engagements/[id]/report/_components/report-deck";
import { listAuditReportsApi, getReportSeverityStatsApi } from "@/lib/api/reports";
import { listFindingsApi } from "@/lib/api/findings";
import { getEngagementDetailApi } from "@/lib/api/engagements";
```

Parallel load:
1. `getEngagementDetailApi(id)` → `code` (404 if missing)  
2. `listAuditReportsApi(id)` → audit reports  
3. `getReportSeverityStatsApi(id)` → severity stats  
4. `listFindingsApi(id, { limit: 500 })` → findings (for coverage counts)

### 3.2 Legacy `/findings` redirect

```tsx
// app/engagements/[id]/findings/page.tsx
import { redirect } from "next/navigation";
redirect(`/engagements/${id}/report#findings-register`);
```

### 3.3 Server page — Finding detail

```tsx
// app/engagements/[id]/findings/[findingCode]/page.tsx
import { getFindingDetailApi } from "@/lib/api/findings";
```

`getFindingDetailApi(engagementId, findingCode)` → 404 on miss.

### 3.4 Layout shell (all routes)

```tsx
<main className="min-h-[calc(100dvh-3.5rem-3rem)]">
  <PageReveal className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
    <SectionStagger className="flex flex-col gap-6">
      {/* blocks per §8 */}
    </SectionStagger>
  </PageReveal>
</main>
```

**Do not re-key `SectionStagger` on filter changes.**

### 3.5 Report deck vertical order

```
Header → Summary KPI strip
→ lg:grid 3 cards (`lg:items-start`): Auditor report | Severity distribution | Coverage
→ Findings register (`#findings-register`): section h2 + toolbar + full table
```

### 3.6 Finding detail vertical order

```
Back link + breadcrumb → Header (code, badges, title, controls)
→ lg:grid: Left (description, impact, recommendation, source links)
           Right (workflow shell, remediation summary)
```

---

## 4. Design tokens

Reuse §4 from [`docs/IDR/idr.md`](../IDR/idr.md).

**Severity accents:**

| Severity | Badge tint | Row left border | Distribution dot / bar |
|---|---|---|---|
| `critical` | red | `border-l-red-500` | `bg-red-500` |
| `high` | orange | `border-l-orange-500` | `bg-orange-500` |
| `medium` | amber | `border-l-amber-500` | `bg-amber-500` |
| `low` | blue | `border-l-blue-500` | `bg-blue-500` |
| `observation` | slate | `border-l-slate-400` | `bg-slate-400` |

**Report deck stat tiles** (`ReportStatTile`): used in Auditor report extraction footer only. `size="compact"` · value `text-lg` · label `text-[9px] uppercase`. Coverage card uses compact stat rows instead.

**Status badge labels (exact copy for accepted):**

| Status | Label |
|---|---|
| `draft` | Draft |
| `disputed` | Disputed |
| `accepted` | Accepted · MR drafting |
| `in_remediation` | Remediation |
| `verified` | Verified |
| `closed` | Closed |

Use `ring-1` badge chips — not heavy filled pills.

---

## 5. Motion system

Same tokens as IDR §5.

| Moment | Pattern |
|---|---|
| Page mount | `PageReveal` + `SectionStagger` |
| Severity bars | `scaleX` fill · `duration.barFill` · `origin-left` · `h-2` track · once on mount |
| Table rows | `listContainer` / `listItem` on first paint |
| Filter change | Update counts only — no remount stagger |
| Workflow panel expand | `AnimatePresence` height · `springUi` · `useReducedMotion()` |

---

## 6. Data contract

### 6.1 Loaders (existing)

```ts
listAuditReportsApi(engagementId: string): Promise<AuditReport[]>
getReportSeverityStatsApi(engagementId: string): Promise<SeverityStats>
listFindingsApi(engagementId: string, params?: ListFindingsParams): Promise<Page<FindingListItem>>
getFindingDetailApi(engagementId: string, findingCode: string): Promise<FindingDetail>
```

```ts
interface ListFindingsParams {
  severity?: string;
  status?: string;
  limit?: number;
  offset?: number;
}
```

### 6.2 TypeScript interfaces (`lib/types/finding.ts`)

```ts
interface AuditReport {
  id: string;
  fileName: string;
  storagePath: string | null;
  receivedAt: string;
  pageCount: number | null;
  isDraft: boolean;
  createdAt: string;
}

interface FindingListItem {
  id: string;
  findingCode: string;
  title: string;
  description: string;
  impact: string | null;
  recommendation: string | null;
  severity: string;
  status: string;
  linkedControls: string[];
  targetCloseDate: string | null;
  isRepeat: boolean;
  actionItemsOpen: number;
  actionItemsTotal: number;
  acceptedAt: string | null;
  acceptanceRationale: string | null;
  disputeReason: string | null;
  createdAt: string;
  sourceLinks: FindingSourceLink[];
}

interface FindingSourceLink {
  id: string;
  note: string | null;
  idrLineId: string | null;
  idrLineRef: string | null;
  idrQuestionText: string | null;
  adrLineId: string | null;
  adrLineRef?: string | null;
}

interface SeverityStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  observation: number;
  total: number;
}
```

### 6.3 Finding status vocabulary

| Status | Open for dispute? | Counts as “accepted” for coverage? |
|---|---|---|
| `draft` | yes | no |
| `disputed` | — | no |
| `accepted` | no | yes |
| `in_remediation` | no | yes |
| `verified` | no | yes |
| `closed` | no | yes |

### 6.4 Seeded test engagement — `eng-rbi-it-exam-fy27`

**Audit reports (2):**

| fileName | pages | received | isDraft |
|---|---|---|---|
| `RBI_IT_Exam_Draft_Report_FY27.pdf` | 142 | 18 May 2026 | true |
| `Management_Response_Annexure_v2.docx` | — | 25 May 2026 | false |

**Severity stats:** critical `1` · high `3` · medium `3` · low `1` · observation `0` · total `8`

**Findings (8):** F-001 (critical, accepted) · F-002 (high, accepted) · F-003 (high, disputed) · F-007 (high, in_remediation, repeat, has IDR+ADR source links) · F-009 · F-012 · F-017 · F-020

**Sample detail:** `getFindingDetailApi(..., "F-007")` — PAM retention finding · 4 open action items · ADR source A-001

**Coverage counts (from findings list):**
- Accepted bucket: statuses in `{ accepted, in_remediation, verified, closed }` → **6**
- Disputed: **1** (F-003)
- Repeat: **1** (F-007)

---

## 7. Algorithms (implement verbatim)

### 7.1 Date formatting

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

### 7.2 Coverage counts

```ts
const ACCEPTED_STATUSES = new Set([
  "accepted",
  "in_remediation",
  "verified",
  "closed",
]);

function countAccepted(findings: FindingListItem[]) {
  return findings.filter((f) => ACCEPTED_STATUSES.has(f.status)).length;
}
function countDisputed(findings: FindingListItem[]) {
  return findings.filter((f) => f.status === "disputed").length;
}
function countRepeat(findings: FindingListItem[]) {
  return findings.filter((f) => f.isRepeat).length;
}
function countInRemediation(findings: FindingListItem[]) {
  return findings.filter((f) => f.status === "in_remediation").length;
}
function countPendingReview(findings: FindingListItem[]) {
  return findings.filter((f) => f.status === "draft").length;
}
function sumOpenActionItems(findings: FindingListItem[]) {
  return findings.reduce((sum, f) => sum + f.actionItemsOpen, 0);
}
function countOverdueFindings(findings: FindingListItem[], now = Date.now()) {
  return findings.filter((f) => {
    if (!f.targetCloseDate) return false;
    const due = new Date(f.targetCloseDate).getTime();
    if (Number.isNaN(due)) return false;
    return due < now && f.status !== "verified" && f.status !== "closed";
  }).length;
}
```

### 7.3 Severity bar width

```ts
const SEVERITY_ORDER = [
  "critical",
  "high",
  "medium",
  "low",
  "observation",
] as const;

function severityBarScale(count: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, count / total));
}
```

Render: `transform: scaleX(severityBarScale(count, stats.total))` on inner bar.

### 7.4 Findings sort (register default)

```ts
const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  observation: 4,
};

function sortFindingsDefault(findings: FindingListItem[]) {
  return [...findings].sort((a, b) => {
    const sa = SEVERITY_RANK[a.severity] ?? 99;
    const sb = SEVERITY_RANK[b.severity] ?? 99;
    if (sa !== sb) return sa - sb;
    return a.findingCode.localeCompare(b.findingCode);
  });
}
```

### 7.5 Findings filters

```ts
const FINDING_QUICK_FILTERS = [
  "all",
  "accepted",
  "disputed",
  "open_remediation",
  "critical_high",
] as const;
type FindingQuickFilter = (typeof FINDING_QUICK_FILTERS)[number];

function matchesFindingFilter(f: FindingListItem, filter: FindingQuickFilter) {
  switch (filter) {
    case "accepted":
      return ACCEPTED_STATUSES.has(f.status);
    case "disputed":
      return f.status === "disputed";
    case "open_remediation":
      return f.status === "in_remediation" || f.actionItemsOpen > 0;
    case "critical_high":
      return f.severity === "critical" || f.severity === "high";
    case "all":
    default:
      return true;
  }
}

function matchesFindingSearch(f: FindingListItem, search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    f.findingCode.toLowerCase().includes(q) ||
    f.title.toLowerCase().includes(q) ||
    f.description.toLowerCase().includes(q) ||
    f.linkedControls.some((c) => c.toLowerCase().includes(q))
  );
}

function filterAndSortFindings(
  findings: FindingListItem[],
  search: string,
  filter: FindingQuickFilter,
) {
  return sortFindingsDefault(
    findings.filter(
      (f) => matchesFindingFilter(f, filter) && matchesFindingSearch(f, search),
    ),
  );
}
```

### 7.6 Severity / status display helpers

Colocate in `finding-display.ts`:

```ts
function severityLabel(severity: string) { /* Critical, High, … */ }
function statusLabel(status: string) { /* use STATUS table §4 */ }
function severityRowBorder(severity: string) { /* SEVERITY_LEFT_BORDER map */ }
```

### 7.7 Workflow shell validation (UI only)

Accept mode: rationale trimmed, min 10 chars.  
Dispute mode: reason trimmed, min 10 chars.  
Submit does **not** persist.

### 7.8 Latest report for header subtitle

```ts
function latestReport(reports: AuditReport[]) {
  return [...reports].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  )[0];
}
```

---

## 8. UI specification (every block)

### 8.1 Report header (`report-deck-header.tsx`)

**Left:**
1. Meta: `{engagementCode}` — mono `text-[0.625rem] text-muted-foreground`
2. H1: **Report**
3. Subtitle (dynamic):
   - If reports exist: `{latest.fileName} received · {findings.length} findings transcribed · {accepted} accepted · {disputed} disputed`
   - Else: **No audit report registered yet**

**Right — actions:** none in v1 (no Register report button).

### 8.2 Auditor report card (`report-documents-card.tsx`)

`Card` · title **Auditor's report** · description *Registered report artifacts and extraction summary*

**Empty:** `No report registered yet. Report metadata will appear here after ingest is connected.`

**Each report row** (`rounded-lg border border-border/50 bg-muted/20 p-3 flex gap-3`):
- File icon cell: `FileText` lucide icon in tinted square — PDF `bg-red-500/10 text-red-600`, DOC `bg-blue-500/10 text-blue-600`
- `{fileName}` — `text-sm font-medium truncate`
- Meta: `{pageCount} pages · ` when set · `Received {formatDate(receivedAt)}`
- Draft badge: inline chip **Draft** (`border-amber-200 bg-amber-50 text-amber-700`) — not inline warn text

**Footer extraction strip** — shared `ReportStatTile` × 3 in `grid grid-cols-3 gap-2` above `border-t`:

| Label | Value |
|---|---|
| Extracted | `findings.length` |
| Accepted | `countAccepted` · `text-emerald-600` |
| Disputed | `countDisputed` · `text-amber-600` |

### 8.3 Severity distribution card (`report-severity-card.tsx`)

Title: **Severity distribution** · description *Finding mix across severity bands*

**Header right:** mono pill `{stats.total} total` when findings exist.

**Empty:** `No findings yet.`

**Per severity** (SEVERITY_ORDER) — stacked row layout (not cramped inline pill + bar):

1. **Label row:** colored dot (`size-2 rounded-full`) + `{severityLabel}` left · mono count right (`text-xs font-semibold tabular-nums`)
2. **Bar row:** track `h-2 bg-muted/70 rounded-full` · fill with severity color · `scaleX` per §7.3 · `opacity-30` when count is 0

Dot colors: critical red · high orange · medium amber · low blue · observation slate.

Muted label/count when count is 0.

**Test engagement:** Critical 1 · High 3 · Medium 3 · Low 1 · Obs 0

### 8.4 Coverage card (`report-coverage-card.tsx`)

Title: **Coverage** · description *Triage posture — acceptance, dispute, and remediation load*

**Layout:** compact stat rows (matches severity card). Card uses natural height (`lg:items-start` on parent grid) — no vertical stretch gap.

**Core metric rows** (`flex justify-between` · `py-2` · `border-b border-border/40`):

| Label | Source | Accent |
|---|---|---|
| Findings total | `findings.length` | — |
| Accepted for MR | `countAccepted` | emerald when > 0 |
| Disputed | `countDisputed` | amber when > 0 |
| In remediation | `countInRemediation` | primary when > 0 |
| Repeat findings | `countRepeat` | amber when > 0 |
| Open action items | `sumOpenActionItems` | — |

**Conditional rows** (only when > 0):
- **Past due date** — `countOverdueFindings` · destructive
- **Pending review** — `countPendingReview` (draft status)

**Engagement footer** (`rounded-md bg-muted/30 px-3 py-2`):
- Label: **Engagement** · `text-[10px] uppercase`
- Value: `{engagementCode}` · `font-mono text-xs truncate`

**Test engagement (`eng-rbi-it-exam-fy27`):** total 8 · accepted 6 · disputed 2 · in remediation 1 · repeat 1 · open action items 9

### 8.5 Findings register panel (`report-findings-panel.tsx`)

Embedded on report page — `id="findings-register"` · `scroll-mt-24` for hash deep links.

**Section header:**
- **h2:** Findings
- Subtitle: **Register of auditor findings — review severity, dispute or accept, and trace sources to IDR and ADR.**
- **Add finding** — primary `Button size="sm"` with `Plus` icon · click → alert “Coming soon” (not disabled)

**Body:** reuses `FindingsToolbar` + `FindingsTable` from `findings/_components/` (shared filters §7.5).

**Card shell:** same as former standalone register — `py-0 gap-0 ring-1 ring-foreground/10`.

### 8.6 Findings toolbar (`findings-toolbar.tsx`)

`border-b border-border/50 px-4 py-3 sm:px-6` · layout matches IDR lines panel toolbar.

1. **Search** — `placeholder="Search code, title, controls…"` · `aria-label="Search findings"` · `max-w-xs`
2. **Filter rail** — segmented track `rounded-lg bg-muted/50 p-0.5` · `role="tablist"` · horizontal scroll on narrow viewports  
   - Options: **All** · **Accepted** · **Disputed** · **In remediation** · **Critical / High**  
   - Active tab: `bg-background shadow-sm ring-1 ring-border/60` · inactive: `text-muted-foreground`  
   - Same visual pattern as IDR `idr-lines-panel` filters (not solid primary fill chips)
3. **Count caption** (right): `{visible.length} of {total} findings`

**Filtered empty:** `No findings match these filters.` + **Clear filters**

### 8.7 Findings table (`findings-table.tsx`)

**Card shell:** `py-0 gap-0 ring-1 ring-foreground/10`

**Layout:** `w-full table-fixed` with `<colgroup>` — ID `4.5rem` · Finding flex (no width) · Severity `6.5rem` · Controls `9rem` · Status `9.5rem` · Due `6.5rem` (right edge). Table stretches full card width; Finding column absorbs remaining space.

**Columns:**

| Header | Cell |
|---|---|
| ID | `{findingCode}` mono · link primary |
| Finding | `{title}` line-clamp-2 · repeat badge if `isRepeat` · `min-w-0` |
| Severity | severity badge |
| Controls | `{linkedControls.join(", ")}` or `—` · mono `text-[10px]` · truncate |
| Status | status badge · `text-right` · `flex justify-end` |
| Due | `formatDate(targetCloseDate)` · `text-right` · `pr-4 sm:pr-6` · last column |

**Row:**
- `severityRowBorder(severity)` as `border-l-2`
- Navigate to `/engagements/{id}/findings/{findingCode}`
- `tableRowClickableClass` + `ROW_HOVER_CLASS`

**Empty register:** `No findings transcribed yet.`

### 8.8 Finding detail view (`finding-detail-view.tsx`)

**Breadcrumb:** `Findings / {findingCode}` — link Findings → `/report#findings-register`

**Header band:**
- `{findingCode}` mono · severity badge · status badge · repeat badge if set
- H1: `{title}` — `text-xl font-semibold leading-tight tracking-tight`
- Control chips row: linked controls as outline badges
- Target close (when set): right-aligned mono date

**Left column cards:**

| Card | Content |
|---|---|
| Description | `{description}` |
| Impact | `{impact}` or omit card |
| Recommendation | `{recommendation}` or omit card |
| Source linkage | Only if `sourceLinks.length > 0` — see §8.10 |

**Right column:**

| Card | Content |
|---|---|
| Workflow | §8.11 shell |
| Remediation | `{actionItemsOpen}` open / `{actionItemsTotal}` total · link **View plan →** `/engagements/{id}/remediation` (stub OK) · if all closed show green hint *All action items closed — finding is ready to be verified.* · if `acceptedAt` show *Accepted {date}* |

**Back link:** **Back to findings** → `/report#findings-register`

### 8.10 Source linkage rows

Per `sourceLinks[]`:

```
[ IDR · L-005 ]  optional note or idrQuestionText
[ ADR · A-001 ]  optional note
```

- IDR chip: `Link` → `/engagements/{id}/idr/lines/{idrLineRef}` when ref present
- ADR chip: `Link` → `/engagements/{id}/adr/lines/{adrLineRef}`
- Body text: `note ?? idrQuestionText ?? —` · `text-xs text-muted-foreground`

**Test F-007:** IDR L-005 link + ADR A-001 link (from seed `sourceLinks`).

### 8.11 Workflow panel shell (`finding-workflow-panel.tsx`)

`Card` · title **Workflow**

When status not `verified` / `closed`:
- Buttons: **Accept finding** (green outline) · **Dispute finding** (amber outline)
- Click opens inline `Textarea` + **Confirm** / **Cancel**
- Confirm disabled with **Coming soon** or toast — **no persist**

When `acceptanceRationale` set: green read-only box **Accepted · Rationale**  
When `disputeReason` set: amber read-only box **Disputed · Grounds**

Hide accept button when already in accepted bucket; hide dispute when `disputed`.

### 8.12 Copy deck (exact strings)

| Context | Copy |
|---|---|
| Report H1 | Report |
| Findings H1 | Findings |
| Report subtitle (empty) | No audit report registered yet |
| Auditor card title | Auditor's report |
| Severity card | Severity distribution |
| Coverage card | Coverage |
| Findings subtitle | Register of auditor findings — review severity, dispute or accept, and trace sources to IDR and ADR. |
| Workflow title | Workflow |
| Accept CTA | Accept finding |
| Dispute CTA | Dispute finding |
| Accepted status | Accepted · MR drafting |
| Back link | Back to findings |

---

## 9. File structure

```
app/engagements/[id]/
  report/
    page.tsx
    _components/
      report-deck.tsx
      report-deck-header.tsx
      report-documents-card.tsx
      report-severity-card.tsx
      report-coverage-card.tsx
      report-stat-tile.tsx           # shared metric tile
      report-findings-panel.tsx      # full register on report page
      report-helpers.ts
  findings/
    page.tsx                         # redirect → /report#findings-register
    _components/                     # shared toolbar, table, filters, display
      findings-toolbar.tsx
      findings-table.tsx
      finding-display.ts             # badges, borders, labels
      findings-filters.ts
    [findingCode]/
      page.tsx
      _components/
        finding-detail-view.tsx
        finding-workflow-panel.tsx
        finding-source-links.tsx

lib/api/reports.ts                   # EXISTING
lib/api/findings.ts                  # EXISTING
lib/types/finding.ts                 # EXISTING
```

**Do not:** add `lib/report/`, `components/findings/`, Next API routes, or `/report/new-finding` page.

---

## 10. Client state and accessibility

### 10.1 Client state

| State | Owner | Default |
|---|---|---|
| `search` | findings register | `""` |
| `filter` | findings register | `"all"` |
| `workflowMode` | detail panel | `null` |

```tsx
type ReportDeckProps = {
  engagementId: string;
  engagementCode: string;
  reports: AuditReport[];
  stats: SeverityStats;
  findings: FindingListItem[];
};

type FindingsRegisterProps = {
  engagementId: string;
  engagementCode: string;
  findings: FindingListItem[];
};
```

### 10.2 Accessibility

- Tables: sortable headers as buttons where applicable · `aria-sort` optional
- Search: `aria-label="Search findings"`
- Filter rail: `role="tablist"` / `role="tab"` / `aria-selected`
- Severity bars: decorative — pair with visible numeric counts
- Workflow textarea: labelled · required fields marked
- Reduced motion: bar fills instant; no stagger remount on filter
- Focus: `controlFocusClass` on controls

### 10.3 Scope — in / out

**In:** report deck, findings register, finding detail, severity bars, source links, workflow UI shell.

**Out:** backend; report PDF upload/storage; finding create; accept/dispute persistence; verify/close transitions; add source link UI; `/report/new-finding` route.

---

## 11. Verification checklist (`eng-rbi-it-exam-fy27`)

| # | Check | Expected |
|---|---|---|
| 1 | `/report` loads | No console errors |
| 2 | Report subnav | Report tab active on `/report` |
| 3 | Header subtitle | Draft PDF name · 8 findings · 6 accepted · 1 disputed |
| 4 | Report cards | 2 report rows · severity bars match stats |
| 5 | Coverage | Accepted 6 · Disputed 2 · In remediation 1 · Open actions 9 |
| 6 | `/report#findings-register` | Full findings table · 8 rows · filters work |
| 7 | Filter Disputed | Shows F-003 only |
| 8 | Filter Critical/High | Shows 4 findings |
| 9 | Row click F-007 | Detail loads · in_remediation · repeat badge |
| 10 | Source links | IDR/ADR chips link out |
| 11 | Workflow | Accept/dispute forms validate · no persist |
| 12 | Remediation card | 4 open / 4 total on F-007 |
| 13 | Search `PAM` | Surfaces F-007 |
| 14 | Empty engagement | Use engagement with empty report/findings |
| 15 | Motion | Page enter · bar fill · table stagger once |
| 16 | No backend | No new APIs or Data.json writes |

---

## 12. Implementation tasks

### Task 1: Report page load + deck

**Files:** `report/page.tsx`, `report-deck.tsx`, `report-helpers.ts`

- [ ] RSC loader §3.1
- [ ] Layout shell §3.4–3.5

### Task 2: Report cards

**Files:** `report-deck-header.tsx`, `report-documents-card.tsx`, `report-severity-card.tsx`, `report-coverage-card.tsx`

- [ ] §8.1–§8.4 · severity `scaleX` bars

### Task 3: Findings register

**Files:** `findings/page.tsx`, `findings-register.tsx`, `findings-toolbar.tsx`, `findings-table.tsx`, `findings-filters.ts`, `finding-display.ts`

- [ ] §8.6–§8.8 · filters §7.5

### Task 4: Finding detail

**Files:** `findings/[findingCode]/page.tsx`, `finding-detail-view.tsx`, `finding-source-links.tsx`, `finding-workflow-panel.tsx`

- [ ] §8.9–§8.11 · read-only + workflow shell

### Task 5: Subnav polish

- [ ] `/findings/{code}` highlights **Report** tab · `/findings` redirects to report

### Task 6: QA

- [ ] §11 checklist · design system · lint

---

## 13. Definition of done

- [ ] `/report` is a full Report deck (not stub H1)
- [ ] `/report` includes full findings register with search/filters
- [ ] `/findings/[findingCode]` detail with source links + workflow shell
- [ ] Severity bars use `scaleX` only — no chart library
- [ ] Accept/dispute UI validates but does not persist
- [ ] Visuals match Assure design system (ADR/IDR parity)
- [ ] UI-only — zero backend work
- [ ] Buildable from **this document alone**

---

## 14. Build order

1. Task 1 → 2 (report deck reviewable)  
2. Task 3 (findings register)  
3. Task 4 (detail)  
4. Task 5 → 6 QA  

**First slice:** Report deck on `eng-rbi-it-exam-fy27`.

---

## 15. Agent notes

- **Single report screen:** metadata cards + full findings register on one route. `/findings` list redirects to `#findings-register`.
- **Overview module card** links to `/report#findings-register`.
- **Legacy v1** had a separate Findings tab; Assure v1 consolidates on Report for simpler IA.
- **Accepted · MR drafting** label is intentional product copy — do not shorten to “Accepted”.
- **`storagePath` is always null** in seed — no download button in v1.
- **Do not implement** `/report/new-finding` — optional **Add finding** button on findings section (UI shell only).
- **Workflow panel** mirrors legacy behavior visually but must not call server actions in assure-frontend v1.
- Colocate helpers in route `_components/` — no `lib/report/` or top-level `components/findings/`.
- Source link type lacks examination ask fields in `lib/types/finding.ts` — render IDR/ADR only unless types extended later.
