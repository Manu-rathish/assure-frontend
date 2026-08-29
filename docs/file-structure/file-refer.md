# Apex Assure Frontend — File Structure Reference

> **Purpose:** Rebuild this project on another machine or codebase with the same folder tree, naming rules, and layering.  
> **Scope:** Directory layout, file placement, import aliases, config files, and data-flow conventions. Not pixel-level UI (see companion docs).  
> **Source of truth:** `assure-frontend` as built through ADR workspace (Aug 2026).  
> **Companion:** [`CLAUDE.md`](../../CLAUDE.md) (conventions), [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) (tokens/UI), [`engagement_refer.md`](./engagement_refer.md) (engagement module UI), [`lib/motion/ANIMATION.md`](../../lib/motion/ANIMATION.md) (motion)

---

## 1. Bootstrap checklist

Use this order when scaffolding a fresh clone on a new system.

| Step | Action |
|---|---|
| 1 | Create Next.js 16 App Router project **without** `src/` |
| 2 | Copy `package.json` deps (React 19, Tailwind v4, shadcn radix-mira, `motion`, `lucide-react`, `@phosphor-icons/react`) |
| 3 | Copy config: `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json` |
| 4 | Create top-level folders: `app/`, `components/`, `lib/`, `docs/ADR/` |
| 5 | Copy `Data.json` to package root; wire `@dummy-data` alias in `tsconfig.json` + `next.config.ts` |
| 6 | Copy `dummy-data.d.ts` for the `@dummy-data` module declaration |
| 7 | Run `npm install`, then `npx shadcn@latest init` (style: **radix-mira**) and add UI primitives to `components/ui/` |
| 8 | Copy `app/globals.css` (design tokens live here — no `tailwind.config`) |
| 9 | Copy `lib/` tree, then `components/` (chrome + navbar), then `app/` routes |
| 10 | `npm run dev` — root `/` redirects to `/dashboard` |

**Package name:** `assure-ui` (in `package.json`). Folder may be named `assure-frontend`.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`app/globals.css` `@theme`; **no** `tailwind.config`) |
| Components | shadcn/ui **radix-mira** (`components/ui/*`) |
| Icons | `lucide-react` (feature UI), `@phosphor-icons/react` (navbar via shadcn config) |
| Motion | `motion` v13 via `@/lib/motion` |
| Fonts | Geist (sans), JetBrains Mono (IDs), Source Serif 4 (loaded in root layout) |
| Data (current) | Static `Data.json` via `lib/data/dummy.ts` |
| Data (future) | Express `/api/v1` — **not** Next `app/api/` for CRUD |
| Query layer | TanStack Query **not installed** — do not add until team decides |

---

## 3. Import aliases

Configured in `tsconfig.json` paths and `components.json` aliases.

| Alias | Resolves to | Use |
|---|---|---|
| `@/*` | package root | All app imports |
| `@/components` | `components/` | Shared UI |
| `@/components/ui` | `components/ui/` | shadcn primitives |
| `@/lib` | `lib/` | API, types, helpers |
| `@/lib/utils` | `lib/utils.ts` | `cn()` helper |
| `@dummy-data` | `Data.json` | Raw JSON (prefer `lib/data/dummy.ts`) |

`next.config.ts` duplicates `@dummy-data` for Turbopack (relative path) and Webpack (absolute).

---

## 4. Top-level tree

```
assure-frontend/                    # or assure-ui/
├── app/                            # Routes, layouts, page-local UI
├── components/                     # Shared UI (chrome, navbar, shadcn)
├── lib/                            # API, types, data, motion, utils
├── docs/
│   └── ADR/                        # Architecture / rebuild references
├── Data.json                       # Dummy data source (large JSON blob)
├── dummy-data.d.ts                 # Module declaration for @dummy-data
├── components.json                 # shadcn config (radix-mira)
├── DESIGN_SYSTEM.md                # Visual tokens and layout rules
├── CLAUDE.md                       # File-placement decision tree
├── AGENTS.md                       # Next.js agent rules (auto-generated block)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── next-env.d.ts
```

**Intentionally absent:** `src/`, top-level `hooks/`, `services/`, `features/`, `modules/`, `pages/`, root `tailwind.config.*`.

Empty `_components/` folders exist under some stub routes (e.g. `admin/_components`, `dashboard/_components`) — reserved for future page-local UI.

---

## 5. Decision tree — where to put new code

| I am adding… | Put it here |
|---|---|
| A new screen / URL | `app/<route>/page.tsx` |
| UI used only by that screen | `app/<route>/_components/<name>.tsx` |
| UI used by 2+ routes | `components/<area>/` |
| A shadcn primitive | `components/ui/` (generate via shadcn CLI) |
| A backend HTTP call (now: dummy read) | `lib/api/<domain>.ts` |
| A TanStack Query hook (later) | `lib/hooks/use-<name>.ts` |
| A shared TypeScript model | `lib/types/<domain>.ts` |
| Domain helpers (filters, mappers) | `lib/<domain>/` or colocated `_components/*.ts` |
| Motion wrappers / tokens | `lib/motion/` |
| A Next.js BFF endpoint (future) | `app/api/<area>/route.ts` — auth/uploads only |

**Rule of thumb:** one route imports it → `_components/`. Two or more routes → `components/` or `lib/`.

---

## 6. Routes — `app/`

### 6.1 Full route tree

```
app/
├── layout.tsx                      # Root: fonts, ThemeProvider, AppChrome, TooltipProvider
├── globals.css                     # Tailwind v4 @theme + CSS variables
├── page.tsx                        # redirect → /dashboard
│
├── login/
│   └── page.tsx
├── change-password/
│   └── page.tsx
│
├── dashboard/
│   └── page.tsx
│
├── inbox/
│   └── page.tsx
│
├── engagements/
│   ├── page.tsx                    # List view (server component → EngagementsView)
│   ├── _components/
│   │   ├── engagements-view.tsx
│   │   └── create-engagement-dialog.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [id]/
│       ├── layout.tsx              # Engagement subnav chrome
│       ├── page.tsx                # Overview (stub)
│       ├── _components/
│       │   └── engagement-subnav.tsx
│       ├── idr/
│       │   └── page.tsx            # Stub
│       ├── adr/
│       │   ├── page.tsx            # Built — full workspace
│       │   ├── _components/
│       │   │   ├── adr-workspace.tsx
│       │   │   ├── adr-workspace-header.tsx
│       │   │   ├── adr-lines-panel.tsx
│       │   │   ├── adr-lines-table.tsx
│       │   │   ├── adr-threads-panel.tsx
│       │   │   ├── adr-thread-item.tsx
│       │   │   ├── adr-document-rail.tsx
│       │   │   ├── adr-insight-drawer.tsx
│       │   │   ├── adr-create-line-dialog.tsx
│       │   │   ├── adr-mode-toggle.tsx
│       │   │   ├── adr-empty-state.tsx
│       │   │   ├── adr-filters.ts
│       │   │   └── adr-thread-chain.ts
│       │   └── lines/
│       │       └── [lineId]/
│       │           ├── page.tsx
│       │           └── _components/
│       │               ├── adr-line-detail-view.tsx
│       │               └── adr-parent-context.tsx
│       ├── examination/
│       │   └── page.tsx            # Stub
│       ├── report/
│       │   └── page.tsx            # Stub
│       ├── findings/
│       │   └── page.tsx            # Stub
│       └── remediation/
│           └── page.tsx            # Stub
│
└── admin/
    ├── page.tsx
    ├── users/
    │   └── page.tsx
    └── teams/
        └── page.tsx
```

### 6.2 Route → status

| Route | Status | Notes |
|---|---|---|
| `/` | Built | Redirects to `/dashboard` |
| `/login` | Built | `components/login/login-page.tsx` |
| `/change-password` | Stub | Page shell |
| `/dashboard` | Stub | Page shell |
| `/inbox` | Stub | Page shell |
| `/engagements` | Built | List + filters + create dialog |
| `/engagements/new` | Stub | Page shell |
| `/engagements/[id]` | Stub | Overview H1 only |
| `/engagements/[id]/idr` | Stub | H1 only |
| `/engagements/[id]/adr` | **Built** | Full workspace — see `engagement_refer.md` |
| `/engagements/[id]/adr/lines/[lineId]` | **Built** | Read-only line detail |
| `/engagements/[id]/examination` | Stub | H1 only |
| `/engagements/[id]/report` | Stub | H1 only |
| `/engagements/[id]/findings` | Stub | H1 only |
| `/engagements/[id]/remediation` | Stub | H1 only |
| `/admin` | Stub | Page shell |
| `/admin/users` | Stub | Page shell |
| `/admin/teams` | Stub | Page shell |

### 6.3 Page conventions

- `page.tsx` is a **thin composer**: fetch via `lib/api`, pass props to `_components/`.
- `_components/` prefix (underscore) prevents Next.js from treating the folder as a route segment.
- Nested layouts (e.g. `app/engagements/[id]/layout.tsx`) own section chrome (subnav), not global navbar.
- Global navbar comes from `components/app-chrome.tsx` in root layout.
- No `/history` route — timeline lives on engagement overview.
- No "My Plate" — single Inbox at `/inbox`.

**Example pattern** (`app/engagements/page.tsx`):

```tsx
// Server component: parallel API calls, delegate rendering
import { EngagementsView } from "@/app/engagements/_components/engagements-view";
import { listEngagementsApi } from "@/lib/api/engagements";

export default async function EngagementsPage() {
  const list = await listEngagementsApi({ limit: 500 });
  return <EngagementsView initialItems={list.items} /* … */ />;
}
```

---

## 7. Shared UI — `components/`

```
components/
├── app-chrome.tsx                  # Global navbar wrapper (session + nav filter)
├── theme-provider.tsx              # Dark/light theme context
├── navbar.tsx                      # Main navbar shell
├── navbar/                         # Navbar submodules
│   ├── nav-link.tsx
│   ├── nav-icon-map.ts
│   ├── navbar-logo.tsx
│   ├── navbar-motion.ts
│   ├── navbar-nav-sheet.tsx
│   ├── navbar-section-label.tsx
│   ├── navbar-theme-panel.tsx
│   ├── navbar-user-menu.tsx
│   ├── navbar-user-utils.ts
│   └── get-section-label.ts
├── app-shell/
│   └── nav-items.ts                # NAV_ITEMS constant (Dashboard, Engagements, Inbox, Admin)
├── login/
│   ├── login-page.tsx
│   └── login-form.tsx
└── ui/                             # shadcn primitives ONLY
    ├── alert.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── checkbox.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── focus-styles.ts             # controlFocusClass
    ├── input.tsx
    ├── label.tsx
    ├── popover.tsx
    ├── radio-group.tsx
    ├── scroll-area.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── sheet.tsx
    ├── skeleton.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    └── tooltip.tsx
```

| Folder | Responsibility |
|---|---|
| `components/ui/` | shadcn-generated primitives — do not hand-roll |
| `components/navbar/` | Global navigation chrome |
| `components/app-shell/` | Nav config, shell-level constants |
| `components/login/` | Auth screens (shared across login route) |
| `components/<feature>/` | Cross-route widgets (promote from `_components/` when reused) |

---

## 8. Logic — `lib/`

```
lib/
├── utils.ts                        # cn() — clsx + tailwind-merge
├── overlay-backdrop.ts             # OVERLAY_BACKDROP_CLASS constant
│
├── api/                            # Per-domain data access (dummy now, HTTP later)
│   ├── types.ts                    # Page<T>, ApiSuccess, ApiErrorBody, ApiClientError
│   ├── engagements.ts
│   ├── adr.ts
│   ├── dashboard.ts
│   ├── examination.ts
│   ├── findings.ts
│   ├── idr.ts
│   ├── inbox.ts
│   ├── remediation.ts
│   ├── reports.ts
│   ├── teams.ts
│   └── users.ts
│
├── data/
│   ├── dummy.ts                    # loadDummy(), paginate(), requireEngagement()
│   └── session.ts                  # getDummySessionUser(), isStaffRole()
│
├── types/                          # Shared TypeScript models (no runtime logic)
│   ├── adr.ts
│   ├── dashboard.ts
│   ├── dummy-data.ts               # DummyData, DummyEngagement, DummyViews
│   ├── engagement.ts
│   ├── examination.ts
│   ├── finding.ts
│   ├── idr.ts
│   ├── inbox.ts
│   ├── org.ts                      # Tenant, Team, User
│   └── remediation.ts
│
└── motion/                         # Shared animation system
    ├── index.ts                    # Public exports — import from @/lib/motion
    ├── tokens.ts                   # Durations, easings, variants
    ├── components.tsx              # PageReveal, SectionStagger, SectionItem, …
    └── ANIMATION.md                # Motion usage guide
```

### 8.1 Data flow (current — dummy JSON)

```
page / _components
    → lib/api/<domain>.ts       # Typed async functions (Assess-style signatures)
        → lib/data/dummy.ts     # Reads Data.json via @dummy-data
            → Data.json
```

### 8.2 Data flow (future — real API)

```
page / _components
    → lib/hooks/use-*.ts        # TanStack Query (when adopted)
        → lib/api/<domain>.ts   # Same function signatures; swap internals only
            → lib/api/client.ts # apiRequest → Express /api/v1
```

**API conventions:**

- Functions return unwrapped `T`, not `{ success, data }` envelopes.
- Pagination: `Page<T>` → `{ items, total, limit, offset }`.
- Errors: throw `ApiClientError` with `status`, `code`, `details`.
- Naming: `listXApi(params)`, `getXDetailApi(id)`.
- **Never** call `fetch()` from a component or page.

### 8.3 `Data.json`

- Lives at package root (`assure-frontend/Data.json`).
- Large structured blob: engagements, views, users, teams, per-module data.
- Type shape defined in `lib/types/dummy-data.ts`.
- Access only through `loadDummy()` in `lib/data/dummy.ts` (React `cache()` wrapped).

---

## 9. Documentation — `docs/ADR/`

```
docs/ADR/
├── adr.md                          # ADR workspace notes
├── engagement_refer.md             # Pixel-faithful engagement/ADR UI rebuild spec
└── filestructure-refer.md          # This document
```

Also at package root:

| File | Purpose |
|---|---|
| `DESIGN_SYSTEM.md` | Tokens, typography, spacing, navbar, elevation |
| `CLAUDE.md` | Authoritative file-placement rules (decision tree) |
| `lib/motion/ANIMATION.md` | Motion component usage |

---

## 10. Config files

| File | Role |
|---|---|
| `package.json` | Scripts: `dev`, `build`, `start`, `lint` |
| `tsconfig.json` | `@/*` and `@dummy-data` path aliases; strict mode |
| `next.config.ts` | `@dummy-data` resolve alias (Turbopack + Webpack) |
| `postcss.config.mjs` | `@tailwindcss/postcss` plugin only |
| `eslint.config.mjs` | `eslint-config-next` |
| `components.json` | shadcn: style `radix-mira`, css `app/globals.css`, iconLibrary `phosphor` |
| `dummy-data.d.ts` | `declare module "@dummy-data"` |

No `tailwind.config.js` — Tailwind v4 is CSS-first via `app/globals.css`.

---

## 11. Naming conventions

| Kind | Convention | Example |
|---|---|---|
| Route folders | kebab-case, match URL | `change-password`, `remediation` |
| Dynamic segments | `[id]`, `[lineId]` | `app/engagements/[id]/` |
| Page-local UI folder | `_components/` | `app/engagements/_components/` |
| Component files | kebab-case | `engagements-view.tsx` |
| Component exports | PascalCase | `export function EngagementsView` |
| API modules | plural domain noun | `lib/api/engagements.ts` |
| Type modules | singular domain noun | `lib/types/engagement.ts` |
| Hooks (future) | `use-<name>.ts` | `lib/hooks/use-engagements.ts` |
| Pure helpers in routes | kebab-case `.ts` | `adr-filters.ts`, `adr-thread-chain.ts` |

No barrel `index.ts` files except `lib/motion/index.ts` (intentional public API).

---

## 12. Global app chrome

Rendered in `app/layout.tsx`:

```
<html> → <body>
  ThemeProvider
    TooltipProvider
      AppChrome          ← components/app-chrome.tsx → Navbar
      {children}         ← route pages
```

- Navbar height: `h-14` (3.5rem). Engagement subnav sticks at `top-14`.
- Nav items from `components/app-shell/nav-items.ts`.
- Staff-only items filtered via `lib/data/session.ts` (`Admin` requires staff role).
- Login route uses full-page layout from `components/login/` (no special route group).

---

## 13. Suggested rebuild order

Rebuild layers bottom-up so imports resolve at each step.

1. **Config + tokens** — `package.json`, tsconfig, next/postcss/eslint config, `globals.css`, `lib/utils.ts`
2. **shadcn primitives** — `components/ui/*` via CLI (`components.json`)
3. **Types + data** — `lib/types/*`, `Data.json`, `lib/data/dummy.ts`, `lib/api/types.ts`
4. **API layer** — `lib/api/*` (all domain modules)
5. **Motion** — `lib/motion/*`
6. **Chrome** — `theme-provider`, `navbar/*`, `app-chrome`, `app-shell/nav-items`
7. **Root layout** — `app/layout.tsx`, `app/page.tsx` (redirect)
8. **Stub routes** — all `page.tsx` shells so navigation works
9. **Built features** — login, engagements list, ADR workspace (use `engagement_refer.md`)
10. **Docs** — copy `DESIGN_SYSTEM.md`, `CLAUDE.md`, `docs/ADR/*`

---

## 14. What not to do

- Do not add `src/`.
- Do not add top-level `features/`, `modules/`, `services/`, or `hooks/`.
- Do not put route-only UI in `components/` — use `_components/`.
- Do not call `fetch()` from pages or components — use `lib/api`.
- Do not add Next `app/api/` routes for engagement/IDR/ADR CRUD (goes to Express).
- Do not install TanStack Query until the team decides.
- Do not create `tailwind.config.*` — tokens live in `globals.css`.
- Do not restructure folders to look "more enterprise" — match this tree.

---

## 15. Future additions (planned, not built)

| Addition | Location |
|---|---|
| TanStack Query hooks | `lib/hooks/use-*.ts` |
| HTTP client | `lib/api/client.ts` |
| Auth BFF | `app/api/auth/[...all]/route.ts` |
| Upload BFF | `app/api/uploads/…` |
| Auth gate | `proxy.ts` (Next 16 — not `middleware.ts`) |

---

## 16. Pre-merge checklist

- [ ] New URL has `app/<route>/page.tsx`
- [ ] Page-only widgets live in `_components/`, shared widgets in `components/`
- [ ] Data access goes through `lib/api/<domain>.ts`
- [ ] Types live in `lib/types/`, not inline in pages
- [ ] No new top-level folder without team agreement
- [ ] No `fetch()` in components
- [ ] shadcn additions go through CLI into `components/ui/`
