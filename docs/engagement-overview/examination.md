# Examination Journal — Complete UI Rebuild Specification

> **Purpose:** Self-contained, pixel-level rebuild spec for `/engagements/[id]/examination`.  
> **Audience:** Engineers or agents rebuilding this screen in **any** codebase with **no** access to other repos, legacy apps, or tribal knowledge.  
> **Scope:** UI only — layouts, copy, tokens, motion, client state, display algorithms. No auth, no backend, no API design, no mutations.  
> **Design name:** **Live journal** — calm real-time capture surface for onsite examination rooms, not a dense analytics dashboard.

**Definition of the screen:** Examination is engagement phase 3. The auditor never logs in — BDTS captures every onsite ask in structured form. The journal answers: *Which examination room (thread) am I in, what was asked and answered, how did the auditor react, and where is concern pressure?*

**Architecture:** Thin server page loads threads, asks for active thread, and daily pulse. Client components own `?thread=` selection, capture form UI, and feed rendering. **Single route only** — no ask detail page. Presentation only.

**Tech stack (source repo):** Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn **radix-mira** · `motion` v12 via `@/lib/motion` · `lucide-react` icons (Plus, Search, ChevronDown only where noted).

**Companion docs:** [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) · [`lib/motion/ANIMATION.md`](../../lib/motion/ANIMATION.md) · [`docs/IDR/idr.md`](../IDR/idr.md) · [`docs/ADR/adr.md`](../ADR/adr.md) · product flow [`docs/Docs/Engagements/03-examination-flow.md`](../../../docs/Docs/Engagements/03-examination-flow.md) (behavior reference only).

---

## 0. How to use this document

1. Read §1–§3 (constraints, routes, page shell).  
2. Copy design tokens (§4) and motion rules (§5).  
3. Implement data types and loader per §6 — use existing `lib/types/examination.ts` + `lib/api/examination.ts`.  
4. Implement every algorithm in §7 verbatim.  
5. Build each UI block per §8 — every label, class, and empty state is specified.  
6. Follow file layout §9; wire client state §10.  
7. Verify against §11 using `eng-rbi-it-exam-fy27`.  
8. Track build progress with §12 tasks.

---

## 1. Hard constraints

| Rule | Detail |
|---|---|
| **UI only** | No HTTP endpoints, DB schema, server actions, or ask/thread persistence. |
| **Read-only data** | Use existing reads: `listExaminationThreadsApi`, `listExaminationAsksApi`, `getExaminationDailyPulseApi`, `getEngagementDetailApi`. |
| **Dummy data** | Do not mutate `Data.json` or invent write APIs. |
| **Single route** | No `/examination/asks/[id]` or thread admin routes. Entire module is one page. |
| **Capture / new thread** | UI + client validation only. Submit disabled or toast “Coming soon”. |
| **No charts** | No Recharts, no donut. Pulse rail uses plain KPI numbers + list — no SVG charts. |
| **Module name = H1** | Page title is **Examination** (module name, not engagement name). |
| **No phase gate** | Tab always available regardless of `engagement.phase` (matches product). |
| **Pulse label honesty** | UI label **Today's pulse** but data is **engagement-wide** from `dailyPulse` (legacy behavior — do not filter by calendar day in v1 UI). |

---

## 2. Routes and navigation map

### 2.1 Routes

```
/engagements/{engagementId}/examination    → Examination journal (this spec)
```

**No nested routes.**

**Entry paths:**
- Engagement subnav → **Examination** tab  
- Overview module card → `/engagements/{id}/examination`  
- Overview recent activity (`examination.ask_created`) — stays on overview (no deep link to ask)

### 2.2 Engagement sticky subnav

Same chrome as IDR/ADR (see `engagement-subnav.tsx`).

| Property | Value |
|---|---|
| Position | `sticky top-14 z-40` |
| Active tab | pathname starts with `/engagements/{id}/examination` |

**Tabs:** Overview · IDR · ADR · **Examination** · Report · Findings · Remediation

---

## 3. Page shell and layout

### 3.1 Server page

```tsx
// app/engagements/[id]/examination/page.tsx
import { ExaminationJournal } from "@/app/engagements/[id]/examination/_components/examination-journal";
import {
  getExaminationDailyPulseApi,
  listExaminationAsksApi,
  listExaminationThreadsApi,
} from "@/lib/api/examination";
import { getEngagementDetailApi } from "@/lib/api/engagements";
```

Load in parallel:
1. `getEngagementDetailApi(id)` → `code`, `examinationStartDate`, `examinationEndDate`, `auditorName` (404 if missing)  
2. `listExaminationThreadsApi(id)` → threads (sorted by `sortOrder`)  
3. Resolve `activeThreadId` from `searchParams.thread` per §7.1  
4. If active thread: `listExaminationAsksApi(id, { threadId, limit: 500 })`  
5. `getExaminationDailyPulseApi(id)` → pulse (engagement-wide)

Also pass **all asks** (no thread filter, `limit: 500`) for `nextAskCode` suggestion — or compute from flattened `asksByThread` client-side if page passes all thread ask counts only.

**Never put JSX inside `try/catch`.** Use `notFound()` on 404.

### 3.2 Main orchestrator

```tsx
<main className="min-h-[calc(100dvh-3.5rem-3rem)]">
  <PageReveal className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
    <SectionStagger className="flex flex-col gap-6">
      {/* blocks per §8 */}
    </SectionStagger>
  </PageReveal>
</main>
```

### 3.3 Vertical layout

```
SectionItem 1: Journal header (H1, meta, exam window, KPI strip)
SectionItem 2: Thread rail (?thread=)
SectionItem 3 (if threads): lg:grid-cols-[1fr_20rem] gap-6
  ├─ Primary column: Capture form + Ask feed (one Card shell)
  └─ Side column: Pulse rail + Other threads
OR
SectionItem 2 (if no threads): Empty state
```

**Primary column min height:** `min-h-[28rem]` on journal card section.

### 3.4 Responsive

| BP | Behavior |
|---|---|
| default | Single column; pulse + other threads below feed |
| `lg` | Two columns — feed `flex-1`, side rail `w-full lg:w-80 shrink-0` |
| thread rail | Horizontal scroll |

### 3.5 Live journal principles

Capture first · thread rail not legacy underline tabs · reaction color is accent not decoration · pulse stays compact · no edit/delete UI · motion with purpose.

---

## 4. Design tokens

Reuse §4 from [`docs/IDR/idr.md`](../IDR/idr.md) — same semantic tokens, typography roles, Mira primitives.

**Examination-specific accents:**

| Reaction | Badge / border accent | Use |
|---|---|---|
| `accepted` | green (`text-emerald-700`, `border-l-emerald-500`) | Positive closure |
| `probed_further` | amber | Auditor wants more |
| `concern` | destructive / red | Escalation signal |
| `follow_up` | primary / blue | Track later |

Use **left border** on ask rows (`border-l-2`) when reaction set; transparent when null.

**Capture band:** `rounded-sm bg-primary/5 ring-1 ring-primary/10 p-4 sm:p-5` — not heavy neon borders.

---

## 5. Motion system

Same tokens as IDR §5. Additional:

| Moment | Pattern |
|---|---|
| Page mount | `PageReveal` + `SectionStagger` |
| Thread switch | Crossfade feed `opacity` + `y:6` · `duration.enter` · **do not** remount `SectionStagger` |
| Active thread pill | `layoutId="exam-thread-pill"` + `springUi` |
| Ask feed rows | `listContainer` / `listItem` on first paint per thread |
| New ask (future) | N/A in v1 — feed is static from server props |

Filter/search: N/A in v1 (optional stretch: search asks client-side).

---

## 6. Data contract

### 6.1 Loaders (existing)

```ts
listExaminationThreadsApi(engagementId: string): Promise<ExaminationThread[]>
listExaminationAsksApi(engagementId: string, params?: ListExaminationAsksParams): Promise<Page<ExaminationAsk>>
getExaminationDailyPulseApi(engagementId: string): Promise<ExaminationDailyPulse>
getExaminationThreadApi(engagementId: string, threadId: string): Promise<ExaminationThread>
```

```ts
interface ListExaminationAsksParams {
  threadId?: string;
  limit?: number;
  offset?: number;
}
```

### 6.2 TypeScript interfaces (`lib/types/examination.ts`)

```ts
interface ExaminationThread {
  id: string;
  name: string;
  auditorLabel: string;
  sortOrder: number;
  askCount: number;
  concernCount: number;
}

interface ExaminationAsk {
  id: string;
  askCode: string;
  askedAt: string;
  responderName: string | null;
  referenceText: string | null;
  questionText: string;
  responseText: string | null;
  reaction: string | null; // accepted | probed_further | concern | follow_up
  idrLineId: string | null;
  idrLineRef: string | null;
  adrLineId: string | null;
  adrLineRef: string | null;
}

interface ExaminationDailyPulse {
  accepted: number;
  probedFurther: number;
  concerns: number;
  followUps: number;
  topConcerns: string[];
}
```

### 6.3 Field → UI mapping

| Field | UI block |
|---|---|
| `threads[]` | Thread rail, Other threads card |
| `thread.name`, `auditorLabel` | Thread pill label |
| `thread.askCount`, `concernCount` | Thread pill badge |
| `asks[]` (active thread) | Ask feed |
| `ask.askCode`, `askedAt` | Feed left column |
| `ask.responderName` | Feed header row |
| `ask.questionText`, `responseText` | Q / R lines |
| `ask.reaction` | Badge + row left border |
| `ask.referenceText` | Mono chip (free text) |
| `ask.idrLineRef` | Link chip → `/idr/lines/{ref}` |
| `ask.adrLineRef` | Link chip → `/adr/lines/{ref}` |
| `dailyPulse` | Pulse rail KPIs + top concerns list |
| `examinationStartDate/EndDate` | Header exam window + Day N |
| `auditorName` | Header meta (optional second line) |
| `overview.kpis.asksTotal` | Header KPI **Total asks** (engagement-wide) |

### 6.4 Reaction vocabulary

| Value | Display label |
|---|---|
| `accepted` | Accepted |
| `probed_further` | Probed further |
| `concern` | Concern |
| `follow_up` | Follow-up |

### 6.5 Seeded test engagement — `eng-rbi-it-exam-fy27`

| Field | Value |
|---|---|
| code | `RBI-IT-EXAM-FY27` |
| examination window | `11 May 2026 – 15 May 2026` |
| auditorName | `RBI DBS Examination Team (Mr. R. Sharma, Mrs. K. Iyer)` |
| overview asksTotal | `8` |
| threads | 2 (see below) |
| dailyPulse | accepted `2` · probedFurther `2` · concerns `1` · followUps `1` |
| topConcerns[0] | Vendor risk reassessment overdue… |

**Thread 1** — `threadrbi100000000000000`  
- Name: **Thread 1 — IT Audit Room** · auditor **Mr. R. Sharma** · askCount `5` · concernCount `1`  
- Loaded asks (3): A-004 (accepted), A-005 (follow_up), A-008 (probed_further, idr L-014)

**Thread 2** — `threadrbi200000000000000`  
- Name: **Thread 2 — Treasury Room** · auditor **Mrs. K. Iyer** · askCount `3` · concernCount `1`  
- Loaded asks (2): A-001 (concern), A-003 (probed_further, idr L-012)

**URL test:** `/engagements/eng-rbi-it-exam-fy27/examination?thread=threadrbi100000000000000`

> Note: `thread.askCount` metadata may exceed loaded ask array length in seed data — display pill counts from thread object; feed length from loaded asks.

---

## 7. Algorithms (implement verbatim)

### 7.1 Active thread resolution

```ts
function resolveActiveThreadId(
  threads: ExaminationThread[],
  threadParam: string | undefined,
): string | null {
  if (threads.length === 0) return null;
  if (threadParam && threads.some((t) => t.id === threadParam)) return threadParam;
  return threads[0].id;
}
```

**URL sync:** thread rail uses `router.replace(/engagements/{id}/examination?thread={threadId}, { scroll: false })`.

### 7.2 Sort asks (feed order)

```ts
function sortAsksByRecency(asks: ExaminationAsk[]) {
  return [...asks].sort(
    (a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime(),
  );
}
```

Newest first in feed.

### 7.3 Time formatting (ask row)

```ts
const FMT_TIME = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
function formatAskTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return FMT_TIME.format(d);
}
```

### 7.4 Examination window + Day N

```ts
const FMT_DATE = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return FMT_DATE.format(d);
}

function formatExamWindow(start: string | null, end: string | null) {
  const a = formatDate(start);
  const b = formatDate(end);
  if (a && b) return `${a} – ${b}`;
  if (a) return `From ${a}`;
  if (b) return `Until ${b}`;
  return null;
}

function computeExamDay(start: string | null, now = Date.now()) {
  if (!start) return null;
  const startMs = new Date(start).getTime();
  if (Number.isNaN(startMs)) return null;
  const day = Math.ceil((now - startMs) / (1000 * 60 * 60 * 24));
  return Math.max(1, day);
}
```

**Test engagement** (if `now` is after 11 May 2026): Day N ≥ 1. Display **Day {n}** next to exam window when `computeExamDay` returns a number.

### 7.5 Suggested next ask code (capture form default)

Engagement-wide max numeric suffix + 1 (matches legacy `nextAskCode` intent):

```ts
function suggestNextAskCode(allAsks: ExaminationAsk[]): string {
  let max = 0;
  for (const ask of allAsks) {
    const match = /^A-(\d+)$/i.exec(ask.askCode.trim());
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `A-${String(max + 1).padStart(3, "0")}`;
}
```

**Test engagement:** loaded asks max A-008 → suggest **A-009**.

Pass `allAsks` from server (flatten all threads) or compute in RSC and pass as prop.

### 7.6 Reaction display config

```ts
type AskReaction = "accepted" | "probed_further" | "concern" | "follow_up";

const REACTIONS: { value: AskReaction; label: string }[] = [
  { value: "accepted", label: "Accepted" },
  { value: "probed_further", label: "Probed further" },
  { value: "concern", label: "Concern" },
  { value: "follow_up", label: "Follow-up" },
];

function reactionLabel(reaction: string | null) {
  if (!reaction) return null;
  return REACTIONS.find((r) => r.value === reaction)?.label ?? reaction.replaceAll("_", " ");
}

function reactionRowBorder(reaction: string | null): string {
  switch (reaction) {
    case "accepted":
      return "border-l-emerald-500";
    case "probed_further":
      return "border-l-amber-500";
    case "concern":
      return "border-l-destructive";
    case "follow_up":
      return "border-l-primary";
    default:
      return "border-l-transparent";
  }
}
```

### 7.7 Header KPIs

```ts
function computeHeaderKpis(
  threads: ExaminationThread[],
  activeAsks: ExaminationAsk[],
  asksTotalFromOverview: number,
  pulse: ExaminationDailyPulse,
) {
  return {
    threads: threads.length,
    totalAsks: asksTotalFromOverview, // engagement-wide from overview KPI
    activeThreadAsks: activeAsks.length,
    concerns: pulse.concerns,
  };
}
```

### 7.8 Capture form validation (UI only)

Required on submit attempt:
- `questionText` — trimmed, min 10 chars  
- `responderName` — trimmed, non-empty  

Optional: `askCode`, `referenceText`, `responseText`, `reaction` (radio)

Submit does **not** call API.

### 7.9 New thread dialog validation (UI only)

Required: `name` — trimmed, min 3 chars  
Optional: `auditorLabel`  
Submit does **not** persist.

---

## 8. UI specification (every block)

### 8.1 Journal header (`examination-journal-header.tsx`)

**Layout:** `flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between`

**Left column:**
1. Meta: `{engagementCode}` — mono `text-[0.625rem] text-muted-foreground`
2. H1: **Examination**
3. Subtitle: **Live journal for onsite auditor asks — BDTS captures questions, responses, and reactions.**
4. Meta line (when dates exist): `{formatExamWindow(start, end)}` · optional **Day {n}** — `text-xs text-muted-foreground`
5. Optional auditor line: `{auditorName}` — `text-xs text-muted-foreground line-clamp-2`

**Right — KPI strip (plain floating, NOT ringed):**

| KPI label | Value |
|---|---|
| Threads | `threads.length` |
| Total asks | `overview.kpis.asksTotal` or sum of thread askCounts |
| This thread | active thread ask count (loaded array length) |
| Concerns | `pulse.concerns` |

**Test engagement:** Threads `2` · Total asks `8` · This thread `3` (Thread 1) · Concerns `1`

**Actions (header or thread rail):** **Add thread** button → opens new-thread dialog (§8.8)

### 8.2 Thread rail (`examination-thread-rail.tsx`)

Mirror ADR document rail pattern; `layoutId="exam-thread-pill"`.

- Wrapper: horizontal scroll
- Track: `flex w-max gap-1 rounded-lg bg-muted/50 p-0.5`, `role="tablist"`, `aria-label="Examination threads"`
- Each thread = `button type="button" role="tab"`:
  - Line 1: `{name}` — `text-xs font-medium`
  - Line 2 (optional): `{auditorLabel}` — `text-[0.625rem] text-muted-foreground`
  - Badge: `{askCount}` mono — `text-[0.625rem] tabular-nums`; if `concernCount > 0` append `· {concernCount} concern` in destructive text
- Active: `aria-selected="true"` + pill `layoutId="exam-thread-pill"`
- Hidden when `threads.length === 0`

### 8.3 Empty state — no threads (`examination-empty-state.tsx`)

Card centered:

- Title: **No examination threads yet**
- Body: **Examination rooms appear here when BDTS opens a journal for onsite sessions. Create the first thread to start capturing asks.**
- Primary **Add thread** opens dialog (UI only)

### 8.4 Journal card shell

Single `Card` wrapping capture + feed: `ring-1 ring-foreground/10 py-0 gap-0 flex flex-col min-h-[28rem]`

### 8.5 Quick capture form (`examination-capture-form.tsx`)

**Band:** top of journal card · `border-b border-border/50 bg-primary/5 p-4 sm:p-5`

**Header row:**
- Label: **Quick capture** — `text-xs font-medium text-primary`
- Hint right: `Capture validates here only — save not connected yet` — `text-[10px] text-muted-foreground`

**Fields (grid):**

| Field | Control | Notes |
|---|---|---|
| Ask code | Input `h-8` · `w-24` | Default `{suggestNextAskCode}` |
| Responder | Input `h-8` · required | placeholder `Responder name…` |
| Reference | Input `h-8` · flex-1 | placeholder `Reference (IDR line, app…)` |
| Question | Textarea · 2 rows · required | placeholder `What did the auditor ask?` |
| Response | Textarea · 2 rows | placeholder `Response provided…` |

**Reaction row:** label **Auditor reaction** + radio pills (§7.6 labels). Use toggle-style ghost buttons in `rounded-sm bg-muted p-1` — one optional selection.

**Submit:** **Save ask** — `Button size="sm"` — disabled with caption **Coming soon** OR toast only on click.

### 8.6 Ask feed (`examination-ask-feed.tsx` + `examination-ask-item.tsx`)

**Empty (active thread, zero asks):**  
`No asks captured yet for this thread.`

**Each ask row** (`border-t border-border/40 px-4 py-4 sm:px-6`):
- Apply `border-l-2` + `reactionRowBorder(reaction)`
- Grid: time column + content column

**Left column (~4rem):**
- `{askCode}` — `font-mono text-xs font-medium`
- `{formatAskTime(askedAt)}` — `font-mono text-[10px] text-muted-foreground`

**Content column:**
1. Row: `{responderName}` · `AskReactionBadge` · optional `{referenceText}` right-aligned mono `text-[10px] text-muted-foreground`
2. Question: `Q ·` prefix muted + `{questionText}` — `text-xs leading-relaxed`
3. Response (if present): `R ·` prefix muted + `{responseText}` — `text-xs leading-relaxed mt-1.5`
4. Trace chips (if refs):
   - IDR: `Link` to `/engagements/{id}/idr/lines/{idrLineRef}` — mono badge `text-primary`
   - ADR: `Link` to `/engagements/{id}/adr/lines/{adrLineRef}`

**No edit, delete, or reaction-change controls.**

### 8.7 Ask reaction badge (`examination-ask-reaction-badge.tsx`)

Small outline badge with dot:
- `accepted` → emerald tint  
- `probed_further` → amber  
- `concern` → destructive  
- `follow_up` → primary  

Classes: `inline-flex items-center gap-1 h-5 rounded-sm text-[0.625rem] font-medium px-1.5`  
Return `null` when reaction is null.

### 8.8 New thread dialog (`examination-new-thread-dialog.tsx`)

Mira `Dialog` · `OVERLAY_BACKDROP_CLASS`

- Title: **Add examination thread**
- Description: **Represents one concurrent auditor room or session. Saving is not connected yet.**

| Field | Required |
|---|---|
| Thread name | yes — placeholder `Thread 1 — IT Audit Room` |
| Auditor label | no — placeholder `Mr. R. Sharma` |

Validate §7.9 · Submit disabled / toast only.

### 8.9 Pulse rail (`examination-pulse-rail.tsx`)

`Card` · `ring-1 ring-foreground/10`

- Title: **Today's pulse**
- Description: `text-xs text-muted-foreground` — **Engagement-wide reaction tallies from seed data.**

**Stat grid** (`grid grid-cols-2 gap-3`):

| Label | Value source | Accent |
|---|---|---|
| Accepted | `pulse.accepted` | emerald number optional |
| Probed further | `pulse.probedFurther` | amber |
| Concerns | `pulse.concerns` | destructive |
| Follow-ups | `pulse.followUps` | primary |

Values: `text-2xl font-bold tabular-nums` · labels `text-[10px] uppercase tracking-wider text-muted-foreground`

**Top concerns** (when `topConcerns.length > 0`):
- Divider `border-t border-border/40`
- Label: **Top auditor concerns surfacing**
- Bulleted list · `text-xs text-muted-foreground` · truncate long text with `line-clamp-2`

### 8.10 Other threads (`examination-other-threads.tsx`)

`Card` — only when `threads.filter(t => t.id !== activeThreadId).length > 0`

- Title: **Other threads**
- Each row: `{name}` · `{askCount} asks` · concern suffix if `concernCount > 0` · **Open →** link `?thread={id}`

### 8.11 Copy deck (exact strings)

| Context | Copy |
|---|---|
| H1 | Examination |
| Subtitle | Live journal for onsite auditor asks — BDTS captures questions, responses, and reactions. |
| Quick capture | Quick capture |
| Save disabled hint | Coming soon |
| Empty threads | No examination threads yet |
| Empty asks | No asks captured yet for this thread. |
| Pulse title | Today's pulse |
| Top concerns label | Top auditor concerns surfacing |
| Add thread | Add thread |
| Back / detail | N/A (single page) |

---

## 9. File structure

```
app/engagements/[id]/
  examination/
    page.tsx                              # MODIFY — thin RSC → ExaminationJournal
    _components/
      examination-journal.tsx             # client orchestrator
      examination-journal-header.tsx
      examination-thread-rail.tsx
      examination-capture-form.tsx
      examination-ask-feed.tsx
      examination-ask-item.tsx
      examination-ask-reaction-badge.tsx
      examination-pulse-rail.tsx
      examination-other-threads.tsx
      examination-new-thread-dialog.tsx
      examination-empty-state.tsx
      examination-helpers.ts              # pure helpers (colocated)

lib/api/examination.ts                    # EXISTING — read only
lib/types/examination.ts                  # EXISTING — reuse
```

**Do not:** add `lib/examination/`, `components/examination/`, nested ask routes, or write APIs.

**Import style:**

```tsx
import { ExaminationJournal } from "@/app/engagements/[id]/examination/_components/examination-journal";
import {
  getExaminationDailyPulseApi,
  listExaminationAsksApi,
  listExaminationThreadsApi,
} from "@/lib/api/examination";
```

---

## 10. Client state and accessibility

### 10.1 Client state

| State | Owner | Default |
|---|---|---|
| `newThreadOpen` | journal | `false` |
| `captureReaction` | capture form | `null` |
| (optional) feed search | feed | `""` |

```tsx
type ExaminationJournalProps = {
  engagementId: string;
  engagementCode: string;
  examinationStartDate: string | null;
  examinationEndDate: string | null;
  auditorName: string | null;
  asksTotal: number;
  threads: ExaminationThread[];
  activeThreadId: string | null;
  asks: ExaminationAsk[];
  allAsks: ExaminationAsk[];
  pulse: ExaminationDailyPulse;
  canCapture: boolean;
};
```

`canCapture`: UI gate (e.g. CO role) — still no write API.

### 10.2 Accessibility

- Thread rail: `role="tablist"` / `role="tab"` / `aria-selected`
- Capture form: labelled inputs · `aria-required` on required fields
- Reaction pills: radio group with `aria-label="Auditor reaction"`
- Feed: semantic list (`ul`/`li` or `role="list"`)
- Dialogs: focus trap · Esc close
- Reduced motion: respect `useReducedMotion()`
- Focus: `controlFocusClass` on controls

### 10.3 Scope — in / out

**In:** full journal UI per §8; subnav; motion; responsive; dummy reads; IDR/ADR trace links.

**Out:** backend; ask/thread persistence; edit/delete asks; `setReactionAction`; FK pickers for IDR/ADR lines; finding source linking; inbox; charts; ask detail route.

---

## 11. Verification checklist (`eng-rbi-it-exam-fy27`)

| # | Check | Expected |
|---|---|---|
| 1 | Route loads | `/engagements/eng-rbi-it-exam-fy27/examination` — no errors |
| 2 | Subnav | Examination tab active |
| 3 | Header | Code `RBI-IT-EXAM-FY27` · H1 **Examination** · window **11 May 2026 – 15 May 2026** |
| 4 | KPIs | Threads `2` · Total asks `8` |
| 5 | Thread rail | Two pills · Thread 1 active by default |
| 6 | `?thread=` | URL sync · Thread 2 shows A-001 concern ask |
| 7 | Feed order | Newest first (A-008 before A-004 on Thread 1) |
| 8 | Reactions | Badges + left borders match reaction type |
| 9 | Trace link | A-008 shows **L-014** → IDR line detail |
| 10 | Pulse | accepted 2 · concerns 1 · top concern listed |
| 11 | Other threads | Shows Thread 2 when Thread 1 active |
| 12 | Capture form | Validates required fields · does not persist |
| 13 | New thread dialog | Opens · validates · does not persist |
| 14 | Empty engagement | Engagement with empty `threads[]` → empty state |
| 15 | Motion | Page enter · thread pill · feed stagger once |
| 16 | No backend | No new APIs or Data.json writes |

---

## 12. Implementation tasks

### Task 1: Page load + orchestrator

**Files:** `examination/page.tsx`, `examination-journal.tsx`, `examination-empty-state.tsx`

- [ ] RSC loader per §3.1
- [ ] Pass props to client journal
- [ ] Empty threads → empty state

### Task 2: Header + thread rail

**Files:** `examination-journal-header.tsx`, `examination-thread-rail.tsx`, `examination-new-thread-dialog.tsx`

- [ ] Header copy + KPIs §8.1
- [ ] Thread rail `layoutId="exam-thread-pill"` + `?thread=` sync
- [ ] New thread dialog §8.8

### Task 3: Helpers

**File:** `examination-helpers.ts`

- [ ] §7.1–§7.9 pure functions

### Task 4: Capture form

**File:** `examination-capture-form.tsx`

- [ ] Layout §8.5 · validation §7.8 · no persist

### Task 5: Ask feed

**Files:** `examination-ask-feed.tsx`, `examination-ask-item.tsx`, `examination-ask-reaction-badge.tsx`

- [ ] Feed §8.6 · badges §8.7 · IDR/ADR links

### Task 6: Side rail

**Files:** `examination-pulse-rail.tsx`, `examination-other-threads.tsx`

- [ ] Pulse §8.9 · other threads §8.10

### Task 7: QA

- [ ] §11 checklist · lint · design system parity with ADR/IDR

---

## 13. Definition of done

- [ ] `/engagements/[id]/examination` is a full Live journal (not stub H1)
- [ ] Thread rail + ask feed + pulse rail on dummy data
- [ ] Capture + new thread UI shells without mutations
- [ ] Reactions, trace links, and exam window display correctly
- [ ] Visuals match Assure design system — not itex-v1 clone
- [ ] Motion per §5; reduced-motion safe
- [ ] UI-only — zero backend work
- [ ] Another engineer can build from **this document alone**

---

## 14. Build order

1. Task 1 → 2 (header + thread rail)  
2. Task 3 → 5 (helpers + feed)  
3. Task 4 (capture form)  
4. Task 6 (side rail)  
5. Task 7 QA  

**First reviewable slice:** Tasks 1–2 + 5 on `eng-rbi-it-exam-fy27` (read-only journal).

---

## 15. Agent notes

- **Single page module** — unlike IDR (line detail) and ADR (line detail + threads mode). All UX lives on one route.
- **Thread vs document rail:** Same interaction model as ADR `?doc=` but query param is `?thread=`.
- **askCount on thread** may differ from loaded ask array length in seed — show both faithfully (pill vs feed count).
- **Today's pulse** is engagement-wide in data — keep label but add description footnote (§8.9) so users are not misled.
- **nextAskCode** is not an API in assure-frontend — compute client-side via §7.5 from `allAsks`.
- **Legacy quick capture** used heavy primary border — Assure v1 uses subtle `bg-primary/5` band per design system.
- **Do not** use browser `prompt()` for new thread — use Mira Dialog.
- IDR/ADR line ref chips are **links** when `idrLineRef` / `adrLineRef` present — improves cross-module navigation built in ADR.
- Colocate helpers in `examination-helpers.ts`; no `lib/examination/`.
