# Design Handoff Document

**Product:** Apex Assess (`assess-ui-alpha`)  
**Purpose:** Visual design contract for replicating this UI in another project. Business logic is documented only where it changes layout, chrome, or interaction.  
**Source of truth:** Implementation in this repository. Do not invent tokens.  
**Default visual theme documented here:** first-paint Claude palette baked into `app/globals.css` (`:root` / `.dark`). Users may switch color palettes at runtime; replicate **Claude + light/dark** unless the new project requires the full picker.

**Evidence labels used throughout**

| Label | Meaning |
| --- | --- |
| **Confirmed** | Taken directly from source (CSS variables, component classes, motion tokens). |
| **Observed** | Visible in implementation (repeated class combinations) but not named as a token. |
| **Derived** | Computed from confirmed values (OKLCH → HEX/RGB/HSL; `calc()` radius). |
| **Inferred** | Repeated pattern without an explicit token. |
| **Unknown** | Cannot be determined from source. |

HEX/RGB/HSL for OKLCH tokens are **Derived** via standard OKLCH → sRGB conversion. Prefer the OKLCH values in CSS.

---

## 1. Executive Summary

Apex Assess is a **dense, card-based cybersecurity dashboard** with a **warm Claude-orange primary**, **warm-neutral surfaces**, and **compact shadcn/Radix controls**. It is **not** a sidebar-app: primary navigation is a **sticky top bar** (desktop segmented pill nav; mobile left sheet). Content pages sit in a **max-width 80rem (`max-w-7xl`)** column with **16px / 24px** page padding and **24px** section gaps.

Visual personality:

- Compact enterprise density: `text-xs` / `text-sm`, control height **28px** (`h-7`) by default, toolbar controls **32px** (`h-8`).
- Small radii on product chrome (`rounded-sm` ≈ **6px**), larger radii on login and chat.
- Soft elevation: hairline borders (`border-border/40–60`), inset highlights, almost no heavy drop shadows on cards.
- Semantic color for risk (Critical/High/Medium/Low) is **Tailwind hue classes** and **HSL chart constants**, not the theme `--primary`.
- Motion is a first-class system (`@/lib/motion`): fast ease-out enters, stagger on first paint only, `prefers-reduced-motion` honored.
- Light and dark modes, plus a runtime color-theme picker (Claude default + Neutral/Stone/… bases + 17 accent palettes).

**Do not** copy login/chat rounding and type size into register tables. Those surfaces are intentional exceptions.

---

## 2. Design Language Overview

| Attribute | What the UI actually does | Confidence |
| --- | --- | --- |
| Category | Data-heavy security console / dashboard | Observed |
| Density | Compact; 6-up KPI grids on large screens | Confirmed |
| Geometry | Mostly small radius (`rounded-sm`); pills in navbar, chat, canvas docks | Confirmed |
| Surfaces | Cards on a matching page background; cards use `ring-1 ring-foreground/10` or `border-border/60` | Confirmed |
| Color | Warm paper neutrals + terracotta primary (`oklch(0.62 0.14 39.04)` light) | Confirmed |
| Contrast | Muted labels, bold tabular KPI numbers | Observed |
| Navigation | Top sticky bar, no persistent sidebar (chat and analytics add in-page rails) | Confirmed |
| Iconography | Lucide (nav, pages) + Phosphor (shadcn primitives, some analytics) | Confirmed |
| Motion | Crisp, ≤300ms UI enters; charts 560–720ms | Confirmed |
| Theme | Light / dark / system; optional color palettes | Confirmed |

**Apparent principles (supported by UI):** dashboard-oriented, data-heavy, compact, card-based, restrained motion, themeable primary, semantic risk color, frosted chrome on overlays.

---

## 3. Technology & Styling Architecture

Replicate the **visual result**, not necessarily this stack. Architecture is documented so tokens map cleanly.

| Layer | Implementation | Confidence |
| --- | --- | --- |
| Framework | Next.js App Router, React 19 | Confirmed |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`), no `tailwind.config.js` | Confirmed |
| Tokens | CSS variables on `:root` / `.dark`; `@theme inline` maps them to Tailwind colors | Confirmed |
| Components | shadcn **radix-mira**, `baseColor: "neutral"`, `cssVariables: true` | Confirmed (`components.json`) |
| Primitives | Radix UI (`radix-ui` package) | Confirmed |
| Variants | `class-variance-authority` | Confirmed |
| Class merge | `clsx` + `tailwind-merge` (`cn()`) | Confirmed |
| Icons | `@phosphor-icons/react` (configured icon library) + `lucide-react` (most app chrome) | Confirmed |
| Motion | `motion` (Motion One / Framer Motion) + `tw-animate-css` | Confirmed |
| Charts | Recharts + `components/ui/chart.tsx` | Confirmed |
| Toasts | Sonner | Confirmed |
| Dates | `react-day-picker` Calendar | Confirmed |
| Graph canvas | `@xyflow/react` | Confirmed |
| Fonts | `next/font/google`: Geist, Geist Mono, Source Serif 4, JetBrains Mono | Confirmed |

**Global CSS behaviors (Confirmed, `app/globals.css`):**

- `html { font-sans; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }`
- `body { bg-background text-foreground select-none; }`
- Universal `* { border-border; outline-primary/50; }`
- Text selection disabled globally except `input`, `textarea`, `[contenteditable]`, `pre`, `code`, and `[data-selectable]`
- Selectable surfaces use `color-mix(in oklch, var(--primary) 38%, transparent)` selection highlight
- WebKit scrollbar: 10×10px, thumb `var(--border)`, hover `var(--muted-foreground)`, fully rounded thumb
- Utility `animate-shimmer`: 1.6s ease-in-out infinite gradient on muted
- Utility `no-scrollbar`: hide overflow scrollbars

**Theme application (Confirmed):**

- `localStorage` keys: `apex-theme` (`light` | `dark` | `system`), `apex-color-theme` (palette name)
- Before-interactive script sets `.dark` on `<html>` to avoid flash
- Default color theme name: `"claude"`
- Claude variables are **baked into `globals.css`**. `claude.ts` is applied only after a non-default palette is chosen (or when switching back). **Light `--destructive` and chart tokens in `claude.ts` do not match `globals.css`.** Replicate **`globals.css`** for first paint.

---

## 4. Global Design System

### 4.1 Colors

Use semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`) rather than raw HEX in product UI. Semantic **risk** colors are the exception (Tailwind hues / HSL chart map).

#### 4.1.1 Light mode — Claude first paint (`:root` in `globals.css`)

**Confirmed OKLCH. Derived HEX/RGB/HSL.**

| Token | OKLCH (Confirmed) | HEX (Derived) | RGB (Derived) | HSL (Derived) | Where used |
| --- | --- | --- | --- | --- | --- |
| `--background` | `oklch(0.98 0.01 95.10)` | `#faf8f1` | `250, 248, 241` | `47 47% 96%` | Page canvas, navbar frost base |
| `--foreground` | `oklch(0.34 0.03 95.72)` | `#3d3826` | `61, 56, 38` | `47 23% 19%` | Primary text |
| `--card` | `oklch(0.98 0.01 95.10)` | `#faf8f1` | `250, 248, 241` | `47 47% 96%` | Card surface (same as background) |
| `--card-foreground` | `oklch(0.19 0.00 106.59)` | `#141414` | `20, 20, 20` | `0 0% 8%` | Card titles / body |
| `--popover` | `oklch(1.00 0 0)` | `#ffffff` | `255, 255, 255` | `0 0% 100%` | Menus, dialogs, selects |
| `--popover-foreground` | `oklch(0.27 0.02 98.94)` | `#29271b` | `41, 39, 27` | `51 21% 13%` | Popover text |
| `--primary` | `oklch(0.62 0.14 39.04)` | `#cb6441` | `203, 100, 65` | `15 57% 53%` | Primary buttons, logo “Assess”, focus ring, links |
| `--primary-foreground` | `oklch(1.00 0 0)` | `#ffffff` | `255, 255, 255` | `0 0% 100%` | Text on primary |
| `--secondary` | `oklch(0.92 0.01 92.99)` | `#e7e4dd` | `231, 228, 221` | `42 17% 89%` | Secondary buttons, badge secondary |
| `--secondary-foreground` | `oklch(0.43 0.02 98.60)` | `#525044` | `82, 80, 68` | `51 9% 29%` | Text on secondary |
| `--muted` | `oklch(0.955 0.0124 91.52)` | `#f3f0e7` | `243, 240, 231` | `45 33% 93%` | Washes, tab list, skeleton, nav cluster |
| `--muted-foreground` | `oklch(0.61 0.01 97.42)` | `#85837d` | `133, 131, 125` | `45 3% 51%` | Captions, placeholders, inactive nav |
| `--accent` | `oklch(0.92 0.01 92.99)` | `#e7e4dd` | `231, 228, 221` | `42 17% 89%` | Same as secondary (light) |
| `--accent-foreground` | `oklch(0.27 0.02 98.94)` | `#29271b` | `41, 39, 27` | `51 21% 13%` | Accent text |
| `--destructive` | `oklch(0.55 0.22 25.33)` | `#d40923` | `212, 9, 35` | `352 92% 43%` | Errors, destructive buttons, overdue |
| `--border` | `oklch(0.9078 0.0094 106.59)` | `#e1e1da` | `225, 225, 218` | `60 10% 87%` | Default border, scrollbars |
| `--input` | `oklch(0.76 0.02 98.35)` | `#b4b1a3` | `180, 177, 163` | `49 10% 67%` | Input/select border |
| `--ring` | `oklch(0.62 0.14 39.04)` | `#cb6441` | `203, 100, 65` | `15 57% 53%` | Focus ring (matches primary) |
| `--sidebar` | `oklch(0.97 0.01 98.88)` | `#f7f5ee` | `247, 245, 238` | `47 36% 95%` | Defined; no persistent app sidebar |
| `--sidebar-foreground` | `oklch(0.36 0.01 106.65)` | `#3e3e38` | `62, 62, 56` | `60 5% 23%` | Sidebar token |
| `--sidebar-primary` | `oklch(0.62 0.14 39.04)` | `#cb6441` | same as primary | same | Sidebar token |
| `--sidebar-primary-foreground` | `oklch(0.99 0 0)` | `#fcfcfc` | ~252,252,252 | ~0 0% 99% | Sidebar token |
| `--sidebar-accent` | `oklch(0.2221 0 0)` | `#1b1b1b` | `27, 27, 27` | `0 0% 11%` | Defined; unusual dark accent on light |
| `--sidebar-accent-foreground` | `oklch(0.33 0 0)` | `#353535` | `53, 53, 53` | `0 0% 21%` | Sidebar token |
| `--sidebar-border` | `oklch(0.94 0 0)` | `#ebebeb` | `235, 235, 235` | `0 0% 92%` | Sidebar token |
| `--sidebar-ring` | `oklch(0.77 0 0)` | `#b4b4b4` | `180, 180, 180` | `0 0% 71%` | Sidebar token |

**Light chart tokens in `globals.css` (Confirmed HEX, not OKLCH):**

| Token | Value | Usage |
| --- | --- | --- |
| `--chart-1` | `#e76f51` | Theme chart series 1 (terracotta) |
| `--chart-2` | `#2a9d8f` | Theme chart series 2 (teal) |
| `--chart-3` | `#264653` | Theme chart series 3 (ink) |
| `--chart-4` | `#e9c46a` | Theme chart series 4 (gold) |
| `--chart-5` | `#f4a261` | Theme chart series 5 (sand) |

Dashboard **severity/status** charts do **not** use `--chart-*`. They use `lib/charts/constants.ts` (see §4.1.4).

#### 4.1.2 Dark mode — Claude first paint (`.dark` in `globals.css`)

| Token | OKLCH (Confirmed) | HEX (Derived) | RGB (Derived) | HSL (Derived) | Where used |
| --- | --- | --- | --- | --- | --- |
| `--background` | `oklch(0.27 0.00 106.64)` | `#262626` | `38, 38, 38` | `0 0% 15%` | Page |
| `--foreground` | `oklch(0.81 0.01 93.01)` | `#c3c1ba` | `195, 193, 186` | `47 7% 75%` | Text |
| `--card` | `oklch(0.27 0.00 106.64)` | `#262626` | `38, 38, 38` | `0 0% 15%` | Cards |
| `--card-foreground` | `oklch(0.98 0.01 95.10)` | `#faf8f1` | `250, 248, 241` | `47 47% 96%` | Card text |
| `--popover` | `oklch(0.31 0.00 106.60)` | `#303030` | `48, 48, 48` | `0 0% 19%` | Menus (slightly lifted) |
| `--popover-foreground` | `oklch(0.92 0.00 106.48)` | `#e4e4e4` | `228, 228, 228` | `0 0% 89%` | Menu text |
| `--primary` | `oklch(0.67 0.13 38.76)` | `#d87757` | `216, 119, 87` | `15 62% 59%` | Primary actions |
| `--primary-foreground` | `oklch(1.00 0 0)` | `#ffffff` | `255, 255, 255` | `0 0% 100%` | On primary |
| `--secondary` | `oklch(0.98 0.01 95.10)` | `#faf8f1` | `250, 248, 241` | `47 47% 96%` | Secondary fill (light on dark) |
| `--secondary-foreground` | `oklch(0.31 0.00 106.60)` | `#303030` | `48, 48, 48` | `0 0% 19%` | On secondary |
| `--muted` | `oklch(0.22 0.00 106.71)` | `#1b1b1b` | `27, 27, 27` | `0 0% 11%` | Washes |
| `--muted-foreground` | `oklch(0.77 0.02 99.07)` | `#b7b5a6` | `183, 181, 166` | `53 11% 68%` | Captions |
| `--accent` | `oklch(0.21 0.01 95.42)` | `#1a1813` | `26, 24, 19` | `43 16% 9%` | Accent wash |
| `--accent-foreground` | `oklch(0.97 0.01 98.88)` | `#f7f5ee` | `247, 245, 238` | `47 36% 95%` | Accent text |
| `--destructive` | `oklch(0.64 0.21 25.33)` | `#f14444` | `241, 68, 68` | `0 86% 61%` | Errors |
| `--border` | `oklch(0.36 0.01 106.89)` | `#3e3e38` | `62, 62, 56` | `60 5% 23%` | Borders |
| `--input` | `oklch(0.43 0.01 100.22)` | `#51504a` | `81, 80, 74` | `51 5% 30%` | Input border |
| `--ring` | `oklch(0.67 0.13 38.76)` | `#d87757` | same as primary | same | Focus |
| `--sidebar` | `oklch(0.24 0.00 67.71)` | `#1f1f1f` | `31, 31, 31` | `0 0% 12%` | Sidebar token |
| `--sidebar-foreground` | `oklch(0.81 0.01 93.01)` | `#c3c1ba` | same as fg | same | Sidebar token |
| `--sidebar-primary` | `oklch(0.33 0 0)` | `#353535` | `53, 53, 53` | `0 0% 21%` | Sidebar token |
| `--sidebar-primary-foreground` | `oklch(0.99 0 0)` | `#fcfcfc` | ~252 | ~99% | Sidebar token |
| `--sidebar-accent` | `oklch(0.17 0.00 106.62)` | `#0f0f0f` | `15, 15, 15` | `0 0% 6%` | Sidebar token |
| `--sidebar-accent-foreground` | `oklch(0.81 0.01 93.01)` | `#c3c1ba` | same as fg | same | Sidebar token |
| `--sidebar-border` | `oklch(0.94 0 0)` | `#ebebeb` | `235, 235, 235` | `0 0% 92%` | Token (very light on dark — rarely used in chrome) |
| `--sidebar-ring` | `oklch(0.77 0 0)` | `#b4b4b4` | `180, 180, 180` | `0 0% 71%` | Sidebar token |

**Dark chart tokens in `globals.css` (Confirmed HEX):**

| Token | Value |
| --- | --- |
| `--chart-1` | `#3b82f6` |
| `--chart-2` | `#2eb88a` |
| `--chart-3` | `#e89b3f` |
| `--chart-4` | `#b565d8` |
| `--chart-5` | `#e63e6d` |

#### 4.1.3 Interaction tints (Confirmed, `components/ui/focus-styles.ts`)

These are **opacities of `--primary`**, not separate hex tokens.

| Pattern | Class | Usage |
| --- | --- | --- |
| Control focus border | `focus-visible:border-primary` | Inputs, buttons, selects |
| Control focus ring | `focus-visible:ring-2 focus-visible:ring-primary/30` | Same |
| Invalid border | `aria-invalid:border-destructive` | Forms |
| Invalid ring | `aria-invalid:ring-2 aria-invalid:ring-destructive/20` (dark: `/40`) | Forms |
| Menu hover/focus | `hover:bg-primary/10 hover:text-foreground` | Dropdown/select items |
| Table row hover | `hover:bg-primary/10` | Default `TableRow` |
| Table row selected | `data-[state=selected]:bg-primary/15` | Selected rows |
| Table detail sub-row | `bg-primary/5` | Expanded detail |
| Interactive surface | `hover:bg-primary/10` | Cards/lists inside tables |

**Primary button hover (Confirmed):** `hover:bg-primary/80`  
**Ghost / outline hover (Confirmed):** `hover:bg-primary/10`  
**Active (buttons, Confirmed):** `active:not-aria-[haspopup]:translate-y-px` (1px press)  
**Disabled (Confirmed):** `disabled:opacity-50` + `pointer-events-none`

#### 4.1.4 Semantic risk / status colors (Confirmed)

**Charts — `lib/charts/constants.ts` (HSL Confirmed; HEX Derived):**

| Name | HSL | HEX (Derived) | Usage |
| --- | --- | --- | --- |
| Critical | `hsl(0 84% 60%)` | `#ef4343` | Severity, Open status, danger |
| High | `hsl(25 95% 53%)` | `#f97415` | Severity / High criticality |
| Medium | `hsl(38 92% 50%)` | `#f59f0a` | Severity / warning / In Progress (charts) |
| Low | `hsl(142 71% 45%)` | `#21c45d` | Severity / positive / Remediated (charts) |
| Info / Standard | `hsl(215 14% 60%)` | `#8b97a7` | Info, Standard criticality, Risk Accepted (charts) |
| False Positive | `hsl(262 83% 68%)` | `#9b6af1` | Status chart only |
| Exception | `hsl(199 89% 55%)` | `#26b2f2` | Status chart only |
| CHART_ACCENT | `hsl(221 83% 60%)` | `#447aee` | Accent series |
| CHART_POSITIVE | `hsl(142 71% 45%)` | `#21c45d` | Positive |
| CHART_WARNING | `hsl(38 92% 50%)` | `#f59f0a` | Warning |
| CHART_DANGER | `hsl(0 84% 60%)` | `#ef4343` | Danger |

**Finding-age buckets (Confirmed, dashboard):**

| Bucket | HSL |
| --- | --- |
| 0–7 days | `hsl(142 71% 45%)` |
| 8–30 days | `hsl(160 84% 39%)` → HEX Derived `#10b77f` |
| 31–60 days | `hsl(38 92% 50%)` |
| 61–90 days | `hsl(25 95% 53%)` |
| 90+ days | `hsl(0 84% 60%)` |

**Badge / meta classes (`lib/assessments/constants.ts`) — Confirmed Tailwind classes.** HEX for named hues is from **Tailwind v4 default palette** (not this repo’s CSS).

Finding severity badges:

| Status | Classes |
| --- | --- |
| Critical | `bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/40` |
| High | `bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/40` |
| Medium | `bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40` |
| Low | `bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/40` |
| Info | `bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/40` |

Remediation status badges (`border-0`):

| Status | Classes |
| --- | --- |
| Open | `bg-red-500/10 text-red-600 dark:text-red-400` |
| In Progress | `bg-blue-500/10 text-blue-500` |
| Remediated | `bg-emerald-500/10 text-emerald-500` |
| Risk Accepted | `bg-amber-500/10 text-amber-500` |
| False Positive | `bg-muted text-muted-foreground` |
| Exception | `bg-purple-500/10 text-purple-600 dark:text-purple-400` |

Assessment status:

| Status | Badge | Dot |
| --- | --- | --- |
| Planned / Active | `bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20` | `bg-amber-500` |
| In Progress | `bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20` | `bg-blue-500` |
| Completed | `bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20` | `bg-green-500` |

Assessment type dots/badges: VA blue, PT red, EPT orange, CA green, Greybox purple, WiFi teal — all `bg-{hue}-500/10 text-{hue}-700 dark:text-{hue}-400 border-{hue}-500/20` and `bg-{hue}-500` dots.

Asset status (Observed in `assets-table.tsx`): Active green, Inactive slate (same pattern as Info).

Role badges (user menu): Admin purple, CISO blue, InfoSec emerald, Team Member orange — `/10` fill, `/30` border.

Situation banner (dashboard):

| Level | Card | Badge |
| --- | --- | --- |
| Healthy | `border-emerald-500/25 bg-emerald-500/[0.04]` | emerald badge |
| Needs attention | `border-amber-500/30 bg-amber-500/[0.05]` | amber badge |
| Critical | `border-destructive/35 bg-destructive/[0.05]` | red badge |

**Tailwind hue HEX (default palette, for replication of badge fills):** red-500 `#ef4444`, orange-500 `#f97316`, amber-500 `#f59e0b`, green-500 `#22c55e`, emerald-500 `#10b981`, blue-500 `#3b82f6`, purple-500 `#a855f7`, teal-500 `#14b8a6`, slate-500 `#64748b`, slate-400 `#94a3b8`.

#### 4.1.5 Success / warning / info as theme tokens

| Role | Token | Note |
| --- | --- | --- |
| Success | **Not a CSS variable** | Use emerald/green classes or `CHART_POSITIVE` |
| Warning | **Not a CSS variable** | Use amber classes or `CHART_WARNING` |
| Info | **Not a CSS variable** | Use slate / `hsl(215 14% 60%)` |
| Error | `--destructive` | Confirmed |

#### 4.1.6 Overlay / frost (Confirmed)

| Token / class | Value | Usage |
| --- | --- | --- |
| Overlay | `bg-background/40 backdrop-blur-sm` | Dialogs, sheets (`OVERLAY_BACKDROP_CLASS`) |
| Navbar | `bg-background/80` + `supports-backdrop-filter:bg-background/70` + `backdrop-blur-md` | Sticky header |
| Navbar inset line | `shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]` | Top highlight |
| Canvas glass | `border-border/60 bg-card/70 shadow-lg backdrop-blur-md` | Floating canvas chrome |
| Login card | `bg-card/80 backdrop-blur-xl border-border shadow-2xl` | Auth card |
| Analytics workspace | `bg-card/40` + inset highlight `hsl(var(--foreground)/0.04)` | Builder shell |

#### 4.1.7 Palette picker (do not invent)

Available names (Confirmed `palette-names.ts`): Brand `claude`; Base `neutral stone zinc mauve olive mist taupe`; Accent `amber blue cyan emerald fuchsia green indigo lime orange pink purple red rose sky teal violet yellow`.

Replicating the **picker UI** is optional. Replicating **Claude light/dark** is required.

**Known divergence (Confirmed):** `app/themes/claude.ts` light `--destructive` is `oklch(0.19 0.00 106.59)` (near-black) and chart tokens are OKLCH, unlike `globals.css`. First paint uses `globals.css`.

---

### 4.2 Typography

#### Font families (Confirmed, `app/layout.tsx` + `@theme`)

| Role | Family | CSS variable | Tailwind | Fallback |
| --- | --- | --- | --- | --- |
| UI sans | Geist | `--font-geist` → `--font-sans` | `font-sans` | Next/font supplies stack; extra fallback **Unknown** beyond Geist |
| Mono (themed) | JetBrains Mono | `--font-jetbrains-mono` → `--font-mono` | `font-mono` | Next/font stack |
| Mono (loaded, unused in `@theme`) | Geist Mono | `--font-geist-mono` | not mapped in `@theme` | Loaded on `<html>` |
| Serif (loaded) | Source Serif 4 | `--font-source-serif-4` | `--font-source-serif-4` in theme | **No `font-serif` utility mapping observed in product classes** |

Weights loaded: Geist 100–900; JetBrains Mono 100–800; Source Serif 4 200–900.

**`font-heading`:** used on card/dialog titles. `@theme inline` does **not** define `--font-heading`. **Inferred:** shadcn’s imported CSS maps heading → sans (Geist). Do **not** assume Source Serif 4 is the heading face unless you verify computed style.

**Global:** `html` has `antialiased`. Body uses `font-sans`.

#### Hierarchy (Confirmed classes + Tailwind v4 default px)

Tailwind mapping used: `text-[0.625rem]`=10px, `text-xs`=12px, `text-sm`=14px, `text-base`=16px, `text-lg`=18px, `text-xl`=20px, `text-2xl`=24px, `text-3xl`=30px. `text-xs/relaxed` = 12px with `line-height: 1.625`. `leading-none` = 1; `leading-tight` = 1.25; `leading-snug` = 1.375; `leading-relaxed` = 1.625.

| Element | Font | Size | Weight | Line height | Letter spacing | Usage | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Display / page H1 | Geist | `text-2xl` 24px; `sm:text-3xl` 30px | `font-bold` (700) | default (~1.25 via tracking-tight) | `tracking-tight` (−0.025em) | Findings / Assets / Assessments titles | Confirmed |
| Login slide title | Geist | `text-2xl` 24px | `font-semibold` (600) | `leading-tight` | `tracking-tight` | Login carousel | Confirmed |
| Detail H1 | Geist | `text-xl` 20px | `font-semibold` | `leading-tight` | `tracking-tight` | Asset / assessment headers | Confirmed |
| Access-denied H1 | Geist | `text-lg` 18px | `font-semibold` | default | default | Analytics permission | Confirmed |
| Logo wordmark | Geist | `text-base` 16px / `sm:text-lg` 18px | `font-semibold` | default | `tracking-tight` | Navbar; “Apex” muted, “Assess” primary | Confirmed |
| Login brand | Geist | `text-xl` 20px desktop; `text-lg` + `uppercase` mobile | `font-bold` | default | `tracking-tight` | Login panes | Confirmed |
| H2 section | Geist | `text-sm` 14px | `font-medium` (500) | default | default | “Key Risk Indicators” | Confirmed |
| Card title | `font-heading` / Geist | `text-sm` 14px | `font-medium` | default | default | `CardTitle` | Confirmed |
| Dialog title | `font-heading` | `text-sm` 14px | `font-medium` | default | default | `DialogTitle` | Confirmed |
| Detail panel title | Geist | `text-base` 16px | `font-semibold` | `leading-snug` | `tracking-tight` | Finding details | Confirmed |
| Detail section title | Geist | `text-sm` 14px | `font-semibold` | `leading-none` | default | Finding cards | Confirmed |
| Saved report name | `font-heading` | `text-[17px]` | `font-semibold` | `leading-[1.2]` | `tracking-[-0.02em]` | Analytics list | Confirmed |
| Body | Geist | `text-sm` 14px | 400 | `leading-relaxed` | default | Descriptions; finding body | Confirmed |
| Body compact | Geist | `text-xs` 12px | 400 | `relaxed` (1.625) | default | Cards, dialogs, tables | Confirmed |
| Card description | Geist | `text-xs/relaxed` | 400 | 1.625 | default | `CardDescription`, muted | Confirmed |
| Caption / helper | Geist | `text-xs` 12px | 400 | default | default | Form helper, KPI captions | Confirmed |
| Field label | Geist | `text-xs/relaxed` | `font-medium` | `leading-none` | default | `Label` | Confirmed |
| Detail field label | Geist | `text-sm` | `font-medium` | `leading-none` | default | Finding metadata | Confirmed |
| Button | Geist | `text-xs/relaxed` (default); `xs` size `text-[0.625rem]` | `font-medium` | relaxed | none; `whitespace-nowrap` | All `Button` variants | Confirmed |
| Nav link | Geist | `text-sm` 14px | `font-medium` | default | default | Top nav / sheet | Confirmed |
| Mobile section label | Geist | `text-xs` | `font-medium` | default | `tracking-wide` | Navbar beside hamburger | Confirmed |
| Table head | Geist | `text-[11px]` | `font-medium` | default | default | Filtered registers (`FILTERED_TABLE_HEAD_CLASS`) | Confirmed |
| Default table head | Geist | `text-xs` + `h-10` | `font-medium` | default | default | Primitive `TableHead` | Confirmed |
| Table cell | Geist | `text-xs` (table) / `text-sm` in many cells | 400 | default | default | Mixed; IDs often `font-mono tabular-nums` | Observed |
| Badge | Geist | `text-[0.625rem]` 10px | `font-medium` | default | default | `Badge`; some headers use `text-xs` | Confirmed |
| Filter count | Geist | `text-[10px]` | default | default | `tabular-nums` | Filter badge | Confirmed |
| KPI number | Geist | `text-2xl` 24px | `font-bold` | default | default + `tabular-nums` | `METRIC_VALUE_CLASS` | Confirmed |
| Detail KPI value | Geist | `text-sm` | `font-semibold` | default | `tabular-nums` | Compact KPI row | Confirmed |
| Chart empty note | Geist | `text-[11px]` | `font-medium` (title) / 400 (desc) | `leading-snug` | `tracking-[0.02em]` | Ghost charts | Confirmed |
| Chat body | Geist | `text-[15px]` | 400 | `leading-relaxed` | `tracking-[-0.01em]` | Bubbles, composer | Confirmed |
| Chat empty subtitle | Geist | `text-[15px]` | 400 | `leading-relaxed` | `tracking-[0.01em]` | Empty chat | Confirmed |
| Theme group label | Geist | `text-[11px]` | `font-medium` | default | `tracking-wide` | Appearance panel | Confirmed |
| Notification time | Geist | `text-[10px]` | 400 | default | default | Bell dropdown | Confirmed |
| Shortcut | Geist | `text-xs` | 400 | default | `tracking-widest` | Dropdown shortcut | Confirmed |
| Mono IDs | JetBrains Mono | `text-xs` typical | `font-medium` or 400 | default | default | Assessment/asset/finding IDs | Confirmed |
| Alert title | Geist | inherit `text-sm` | `font-semibold` | default | `tracking-tight` | Alerts | Confirmed |
| Alert description | Geist | `text-xs/relaxed` | 400 | relaxed | default | Alerts | Confirmed |

**Text transform:** login mobile brand `uppercase`. Nav/buttons otherwise sentence case. **No global capitalize.**

---

### 4.3 Spacing

**Base unit:** Tailwind v4 default **4px** (`0.25rem`). No custom `--spacing` scale in `@theme`. **Confirmed** by absence of override + class usage.

Observed scale (only values used in chrome):

```text
1  = 4px     gap-1, p-1, space-y-1
1.5 = 6px    gap-1.5, p-1.5
2  = 8px     gap-2, p-2, space-y-2
2.5 = 10px   gap-2.5, p-2.5, py-2.5
3  = 12px    gap-3, p-3, space-y-3
3.5 = 14px   (icon sizes more than layout)
4  = 16px    gap-4, p-4, page padding mobile
5  = 20px    px-5 table inset sm
6  = 24px    gap-6, p-6, page padding sm+, section stack
8  = 32px    py-8 empty
10 = 40px    p-10 login left, empty states
14 = 56px    navbar h-14, login left xl p-14
16 = 64px    empty py-16
```

| Context | Value | Confidence |
| --- | --- | --- |
| Page padding (dashboard/registers) | `p-4` 16px → `sm:p-6` 24px | Confirmed |
| Page max width | `max-w-7xl` = 80rem = **1280px** + `mx-auto` | Confirmed |
| Section vertical gap | `gap-6` 24px (`flex flex-col gap-6`) | Confirmed |
| Detail pages | `p-4` + `space-y-3` breadcrumb stack; inner `space-y-4` | Confirmed |
| Analytics page | `p-3` / `sm:p-4`; inner `gap-3`; full viewport height | Confirmed |
| Approvals | `p-4 md:p-6` | Confirmed |
| Card default | `py-4` + header/content `px-4`; gap-4 | Confirmed |
| Card sm | `py-3` `px-3` gap-3 | Confirmed |
| Filtered table header | `py-3` + `px-4 sm:px-5` | Confirmed |
| Filtered toolbar strip | `py-2.5` + same inset | Confirmed |
| Filtered footer | `py-2` | Confirmed |
| Table cell (filtered) | `px-3 py-2.5`; first/last + edge inset | Confirmed |
| Table cell (primitive) | `p-2`; head `h-10 px-2` | Confirmed |
| Form field stack | `space-y-2` (`FormItem`); login fields `space-y-4` | Confirmed |
| Form control gap | Radio group `gap-3`; labels `gap-2` | Confirmed |
| Dialog padding | `p-4`; header `gap-1`; footer `gap-2` | Confirmed |
| Dialog inner gap | `gap-4` on content grid | Confirmed |
| Navbar inner | `px-4 sm:px-6`; `gap-2` mobile, `lg:gap-6`; nav cluster `gap-5` | Confirmed |
| Nav pill | `p-0.5` on muted track; links `px-3 py-2.5` | Confirmed |
| Grid gaps | Charts/KPI `gap-4` or `gap-6` | Confirmed |
| Filter grid | `gap-2` | Confirmed |

---

### 4.4 Layout

**Shell (Confirmed):**

```text
html/body (min-h-full flex-col)
 └── sticky header h-14 z-50 (hidden on /login)
 └── main children (no extra wrapper)
```

There is **no** app sidebar, **no** app footer. Chat / analytics / canvas add **in-page** side structure.

| Token | Value | Confidence |
| --- | --- | --- |
| Navbar height | `h-14` = **56px** (`3.5rem`) | Confirmed |
| Content max | `max-w-7xl` (1280px), centered | Confirmed |
| Full-bleed pages | Chat, Analytics, Canvas: `h-[calc(100vh-3.5rem)]` or `100dvh` | Confirmed |
| Grid | CSS grid via Tailwind; 2-col charts at `md`; KPI 2/3/5/6 at sm/md/lg | Confirmed |
| Alignment | Page titles left; actions right (`sm:flex-row sm:justify-between`) | Confirmed |
| Cards | Full width of column; 2-col `md:grid-cols-2 gap-6` | Confirmed |

**No custom container query breakpoints in `@theme`.** Container queries exist on card header (`@container/card-header`) for internal card layout.

---

### 4.5 Borders

| Property | Value | Usage | Confidence |
| --- | --- | --- | --- |
| Width | `1px` default (`border`) | Almost all | Confirmed |
| Width | `2px` | Mobile section label `border-l-2 border-primary/80` | Confirmed |
| Width | `3px` | Destructive alert left rail `border-l-[3px]` | Confirmed |
| Style | solid | Default | Confirmed |
| Style | dashed | Empty reports `border-dashed` | Confirmed |
| Color | `border-border` | Default | Confirmed |
| Color | `border-border/30`–`/60` | Tables, cards, toolbar | Confirmed |
| Color | `border-input` | Form controls | Confirmed |
| Color | `border-transparent` | Buttons default | Confirmed |
| Color | `ring-1 ring-foreground/10` | Cards, dialogs, popovers (instead of heavy border) | Confirmed |
| Color | `ring-1 ring-border/60` | Active nav pill | Confirmed |

**Filtered table cards** use `border border-border/60` and **`ring-0`** so overflow clipping does not cut rings.

---

### 4.6 Border Radius

**Base (Confirmed):** `--radius: 0.625rem` (**10px**).

**Theme scale (Confirmed formula, Derived px):**

```text
radius-sm  = calc(var(--radius) * 0.6)  = 6px
radius-md  = calc(var(--radius) * 0.8)  = 8px
radius-lg  = var(--radius)             = 10px
radius-xl  = calc(var(--radius) * 1.4)  = 14px
radius-2xl = calc(var(--radius) * 1.8)  = 18px
radius-3xl = calc(var(--radius) * 2.2)  = 22px
radius-4xl = calc(var(--radius) * 2.6)  = 26px
```

| Utility | ≈ px | Where |
| --- | --- | --- |
| `rounded-sm` | 6px | Buttons, inputs, cards, badges, dialogs, tables chrome, avatars (primitive) |
| `rounded-md` | 8px | Nav links, search field, filter trigger, theme chips, KPI card links (`rounded-xl` on dashboard KPI **wrapper**) |
| `rounded-lg` | 10px | Nav cluster track, login inputs/buttons, some dialogs, user avatar button `rounded-full` |
| `rounded-xl` | 14px | Login icon tiles, canvas pills, chat history button, saved-reports empty icon well |
| `rounded-full` | pill | Scrollbar thumb, badges on bell, chat composer, radio, avatars in navbar (override) |
| `rounded-[1.25rem]` | 20px | Chat user bubbles (`rounded-br-md` on trailing corner) |

**Product rule:** registers and forms = **6px**. Marketing/login and chat = **larger**. Canvas docks = **14px pills**.

---

### 4.7 Shadows

**Confirmed in `globals.css`:**

```text
shadow-2xs / shadow-xs = 0 1px 3px oklch(0 0 0 / 0.05)
shadow-sm / shadow     = 0 1px 3px / 0.10, 0 1px 2px -1px / 0.10
shadow-md              = 0 1px 3px / 0.10, 0 2px 4px -1px / 0.10
shadow-lg              = 0 1px 3px / 0.10, 0 4px 6px -1px / 0.10
shadow-xl              = 0 1px 3px / 0.10, 0 8px 10px -1px / 0.10
shadow-2xl             = 0 1px 3px / 0.25
```

| Elevation | Usage |
| --- | --- |
| none | Filtered table cards (`shadow-none`), most dashboard cards (ring only) |
| `shadow-sm` | Active nav pill, selected theme chip, row hover (`ROW_HOVER_CLASS`) |
| `shadow-md` | Select/dropdown/popover content, chat composer |
| `shadow-lg` | Dropdown submenus, sheets, canvas glass |
| `shadow-xl` | Chart tooltips |
| `shadow-2xl` | Login card |
| `shadow-md shadow-primary/10` | Login submit (hover `/20`) |
| `shadow-lg shadow-primary/20` | Login logo tile |
| Inset 3px primary | Filtered table row hover: `inset_3px_0_0_0_hsl(var(--primary)/0.85)` |
| Inset top 1px white | Navbar / saved report cards |

**KPI cards:** no extra shadow; `hover:bg-muted/40`.

---

### 4.8 Icons

| Library | Usage | Confidence |
| --- | --- | --- |
| Lucide | Navbar, page headers, stats, filters, most actions | Confirmed |
| Phosphor | shadcn Button/Select/Dialog/Checkbox/Radio/Calendar carets; analytics export; empty reports | Confirmed |
| Emoji | Asset tool-coverage labels only (`🛡️` etc.) — **do not** treat as system icons | Confirmed |

**Sizes (Confirmed):**

| Size | Class | Typical use |
| --- | --- | --- |
| 10px | `size-2.5` / `h-2.5` | Badge icons, radio inner |
| 12px | `h-3 w-3` | Tiny (clear filters X) |
| 14px | `h-3.5 w-3.5` / `size-3.5` | Nav icons, toolbar, button default SVG, press actions `strokeWidth={2.25}` |
| 16px | `h-4 w-4` / `size-4` | Bell, sheet close, KPI card icons, checkbox check |
| 20px | `h-5 w-5` | Menu trigger, logo (mobile), hamburger |
| 24px | `h-6 w-6` | Logo sm+, login slide icon |
| 32px | `size-8` | Chat empty / list empty |
| 40px | `h-10 w-10` | Finding empty, access denied, reports empty |

**Stroke:** Lucide default ~2; action icons often `strokeWidth={2.25}`; chat settings `1.75`; send `2.5`. Phosphor dialog X has no extra weight (library default).

**Logo:** Lucide `Shield` in primary color; not a bitmap logo.

**Avatars:** `Avatar` primitive `size-8` (32px), `rounded-sm` by default; navbar overrides `rounded-full`. Fallback: `bg-primary text-xs text-primary-foreground` initials.

---

### 4.9 Motion & Transitions

Canonical file: `lib/motion/tokens.ts` + `lib/motion/ANIMATION.md`. **Confirmed.**

**Personality:** crisp security dashboard — fast, restrained. Beauty from correctness, not spectacle.

**Hard rules:**

1. High-frequency UI (filters, typing): no page re-stagger.
2. Enter easing: `easeOut = [0.23, 1, 0.32, 1]` (`cubic-bezier(0.23, 1, 0.32, 1)`). Never CSS `ease-in` for product enters. (Sheet primitive still uses `ease-in-out` — replicate sheet as implemented.)
3. Never enter from `scale(0)`. Floor `0.96–0.98`.
4. GPU: opacity + transform only. Heat bars use `scaleX`, not `width`.
5. Honor `useReducedMotion()`: drop y/scale; instant opacity; disable Recharts animation.
6. Hover only on fine pointers (`@media (hover:hover) and (pointer:fine)`).
7. Press: `scale(0.97–0.98)`; toolbar `PRESS_CLASS` is **0.97 / 100ms**.
8. UI enters ≤ ~300ms. Recharts 560ms (bar) / 720ms (pie).

**Duration tokens (seconds):**

| Token | Value | Use |
| --- | --- | --- |
| `duration.press` | 0.14 | Press |
| `duration.hover` | 0.16 | Hover lift |
| `duration.snappy` | 0.22 | Small UI / section label |
| `duration.enter` | 0.28 | Section / card |
| `duration.page` | 0.30 | Page shell |
| `duration.chart` | 0.36 | Chart surface |
| `duration.barFill` | 0.45 | Heat bar |

**Curves:** `easeOut` as above; `easeInOut = [0.77, 0, 0.175, 1]`.

**Springs:** `springUi` stiffness 400 damping 34; `springHover` 480 / 32 / mass 0.7.

**Stagger:** section 0.05 + delay 0.04; list 0.05 + delay 0.02.

**Page enter:** opacity 0→1, y 8→0, 300ms easeOut.

**Section item:** opacity 0→1, y 10→0, 280ms.

**List item:** opacity + y 10 + scale 0.98 → 1 via springUi.

**Row hover CSS (`ROW_HOVER_CLASS` / `CHART_ROW_HOVER_CLASS`):** 150ms background/border/shadow; hover `bg-muted/50`, `border-foreground/15`, `shadow-sm`. Optional motion `y: -1.5`.

**Do not animate (Confirmed):** posture KPI strip, findings-per-assessment ranked rows, workload-by-assignee, SLA strips, criticality legend bars, keyboard chrome, remount stagger on filter change.

**CSS extras:** `animate-shimmer` 1.6s; `Loader2 animate-spin`; dialog `duration-100` fade + zoom-in-95; dropdown fade/zoom-in-95 + slide-from-side-2; sheet open 500ms / close 300ms; login carousel 500ms opacity/translate.

**Navbar active pill:** shared `layoutId="apex-nav-active"` + `springUi` (skipped if reduced motion → static fill).

**Chat rail:** width 248 ↔ 52, spring `bounce: 0, duration: 0.4`.

**Canvas:** node 450ms, viewport 450ms cubic, chevron 300ms ease-in-out.

---

### 4.10 Breakpoints

No custom screens in `@theme`. **Confirmed Tailwind v4 defaults:**

| Name | Width |
| --- | --- |
| `sm` | 40rem / 640px |
| `md` | 48rem / 768px |
| `lg` | 64rem / 1024px |
| `xl` | 80rem / 1280px |
| `2xl` | 96rem / 1536px |

**How this product uses them (Observed):**

- `sm`: page padding 24px; title 30px; 2-col KPI; filter grids 3-col; login still single column until `lg`.
- `md`: 2-col chart grids; 3-col KPI; approvals padding; chat history button hidden (`md:hidden` inverse).
- `lg`: **desktop navbar** (sheet hidden, inline nav shown); findings master-detail 30% list; analytics horizontal panes; asset KPI 5-col; dashboard KPI 6-col; login split pane.

---

## 5. Navigation System

### 5.1 Top navigation (primary)

**Confirmed `components/navbar.tsx`.** Hidden on `/login`.

| Spec | Value |
| --- | --- |
| Position | `sticky top-0 z-50 w-full` |
| Height | 56px (`h-14`) |
| Background | `bg-background/80 backdrop-blur-md` (70% with `supports-backdrop-filter`) |
| Border | `border-b border-border/50` |
| Highlight | inset 1px `oklch(1 0 0 / 0.06)` |
| Padding | `px-4 sm:px-6` |

**Desktop (`lg+`):** flex row — Logo + segmented nav | actions (bell + avatar).

Nav cluster: `rounded-lg bg-muted/50 p-0.5`. Links: `rounded-md px-3 py-2.5 text-sm font-medium`. Inactive: `text-muted-foreground`, hover `text-foreground` (fine pointer, 150ms). Active: `text-foreground` + sliding `bg-background shadow-sm ring-1 ring-border/60` pill. Icons `h-3.5 w-3.5`, opacity 90% active / 70% idle. Press: `tapScale` 0.98.

Items (labels + Lucide): Dashboard `Home`, Findings `Shield`, Assets `Server`, Assessments `ClipboardList`, Analytics `BarChart3`, AI Chat `MessageSquare`. Visibility is permission-filtered (does not change styling of remaining items).

**Mobile (`<lg`):** 3-column grid `[1fr_auto_1fr]`: hamburger + section label | centered compact logo | actions.

Hamburger: ghost `icon` button, Lucide `Menu` `h-5 w-5`. Section label: `border-l-2 border-primary/80 pl-2`, `text-xs font-medium tracking-wide text-muted-foreground`, swap animation y±4.

**Logo:** Shield `h-5 w-5 sm:h-6 sm:w-6 text-primary`. Wordmark `Apex` muted + `Assess` primary. Compact: truncate `max-w-[7.5rem]`. Tap scale 0.97. Links to `/dashboard`.

### 5.2 Mobile nav sheet

Left `Sheet`, width `w-72` (288px), `p-0`. Header `border-b border-border/50 px-4 py-4`, title “Go to” `text-sm font-semibold tracking-tight`. List `p-3 gap-0.5`, stagger x −8. Active sheet link: `bg-background shadow-sm ring-1 ring-border/60` full width.

Sheet overlay: same frost as dialogs. Sheet motion: 500ms in / 300ms out, `ease-in-out`, slide from left. Close: Lucide X `size-4`, top-4 right-4, opacity 70→100.

### 5.3 Secondary navigation

- **Breadcrumbs (detail pages):** `text-xs text-muted-foreground`, ArrowLeft `h-3.5`, hover `text-primary`, separator `/`, current ID `font-mono font-medium text-foreground`.
- **Tabs:** shadcn tabs — default muted track `h-9 p-[3px] rounded-sm`; active `bg-background shadow-sm`. Line variant: underline `h-0.5 bg-foreground`. Assessment workbench uses icon+label triggers in a filtered-table header strip.
- **Analytics workspace:** three collapsible panes (Reports / Filters / Preview), grow 1/1/2; collapsed desktop rail `w-10` with vertical label.
- **Chat:** conversation rail 248px expanded / 52px collapsed (`md+`); mobile sheet `w-72`.
- **Canvas:** floating docks, not a site nav.

**No** traditional breadcrumb component on list dashboards. **No** footer nav.

### 5.4 Notifications

Ghost icon button, Bell `h-4 w-4`. Unread: `absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground`. Menu `w-80`. Unread rows `bg-primary/5`. Empty: centered `text-sm text-muted-foreground` “You're all caught up.” Loading: `Loader2` spin + “Loading…”. Footer link for approvers: “View approval queue”.

### 5.5 User / account menu

Trigger: ghost `h-8 w-8 rounded-full` + Avatar 32px. Panel `w-64 p-0 sideOffset={8}`. Sections stagger y 6. Identity: avatar 36px, name `text-sm font-medium`, email `text-xs muted`, role/team outline badges `text-[10px]`. Appearance: Light/Dark/System segmented `text-xs` with Sun/Moon/Monitor; active `bg-primary/10 text-primary`. Palette grid 2-col; selected `border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/25`. Logout: destructive menu item + Lucide `LogOut`.

---

## 6. Component Library

Primitives live in `components/ui/*`. Shared product patterns: `SearchFilterToolbar`, `ExpandableFilterPanel`, filtered-table tokens, affirm/dismiss tokens.

### 6.1 Buttons

**Base (Confirmed `button.tsx`):** inline-flex, `gap-1.5`, `rounded-sm`, `text-xs/relaxed font-medium`, `transition-all`, `outline-none`, `select-none`, SVG `size-4` unless overridden, disabled `opacity-50`. Focus: `controlFocusClass`. Active: `translate-y-px` unless `aria-haspopup`.

| Variant | Surface | Hover | Notes |
| --- | --- | --- | --- |
| `default` (primary) | `bg-primary text-primary-foreground` | `bg-primary/80` | Main CTA |
| `outline` | `border-border`; dark `bg-input/30` | `bg-primary/10 text-foreground` | Filters, secondary |
| `secondary` | `bg-secondary text-secondary-foreground` | `/80` | Quiet fill |
| `ghost` | transparent | `bg-primary/10 text-foreground` | Icon chrome |
| `destructive` | `bg-destructive/10 text-destructive` (dark `/20`) | `/20` (dark `/30`) | Soft destructive, not solid red fill |
| `link` | `text-primary` | underline | Text button |

**Dismiss outline (token):** `DISMISS_OUTLINE_CLASS` = destructive-tinted outline for Reject/Retry.

**Sizes:**

| Size | Padding | SVG | Extra |
| --- | --- | --- | --- |
| `xs` | `p-1.5` | 10px | `text-[0.625rem] gap-1` |
| `sm` | `p-2` | 12px | `gap-1` |
| `default` | `p-2.5` | 14px | |
| `lg` | `p-3` | 16px | |
| `icon` / `icon-xs` / `icon-sm` / `icon-lg` | matching p | matching svg | square |

**Loading:** no built-in spinner; pages compose `Loader2 animate-spin` inside the button.

**Press (product):** `PRESS_CLASS` = `duration-100 ease-out active:scale-[0.97]` on toolbars and affirm/dismiss. Motion `tapScale` 0.98 on rows/nav.

**Hierarchy (affirm/dismiss):** reject leading outline-destructive; approve trailing filled primary. Confirm: ghost Cancel + filled Confirm (`destructive` if reject mode). Icons Check/X `size-3.5` `strokeWidth={2.25}`.

### 6.2 Inputs

**Text input (Confirmed):** height **28px** (`h-7`), `rounded-sm`, `border-input`, `bg-input/20` (dark `/30`), `p-2.5`, `text-sm` / `md:text-xs/relaxed`, placeholder `text-muted-foreground`, `transition-colors`. Focus: primary border + `ring-2 ring-primary/30`. Invalid: destructive ring. Disabled: `opacity-50`. File addon: `file:h-6 file:text-xs/relaxed file:font-medium`.

**Search (toolbar):** wraps Input at **32px** (`h-8 text-xs`), `rounded-md border-border/50 bg-muted/40`, `pl-9 pr-9`, placeholder `/70`. Search icon `h-3.5` left-3, muted → foreground on focus. Clear: ghost `icon-sm` `h-6 w-6` when non-empty. Focus: `bg-background/80`.

**Select:** trigger matches input (`h-7`, `sm`=`h-6`), CaretDown `size-3.5` muted. Content: `rounded-sm border-border bg-popover shadow-md`, viewport max 16rem, `p-1`. Item `min-h-7 px-2 py-1.5 text-sm md:text-xs/relaxed`, check on the right. Hover/focus `bg-primary/10`. Open: fade + slide.

**Multi-select:** **no primitive**. Use single Selects.

**Checkbox:** `size-4 rounded-sm border-input`. Checked: `border-primary bg-primary text-primary-foreground`. Check icon `size-3.5`. Hit area expanded with `after:-inset`.

**Radio:** `size-4 rounded-full border-input shadow-xs`. Indicator: filled Circle `size-2 fill-primary`. Group `grid gap-3`.

**Toggle / Switch:** **no Switch component.** Appearance uses a 3-segment button group, not a switch.

**Date picker:** outline Button + Calendar in Popover. Calendar: `p-3`, cell `--cell-size: spacing(6)` = 24px, `--cell-radius: radius-sm`. Selected/focus uses primary ring `3px ring-primary/30`. Nav uses ghost icon buttons.

**Textarea:** `min-h-16`, `rounded-sm`, `px-2 py-2`, same border/bg/focus as Input, `resize-none`, `field-sizing-content`. Chat overrides to borderless pill.

**File upload:** visually a `Button`; hidden `<input type="file">`. Import dialogs: large dashed/drop zones inside `max-w-6xl` / `max-w-4xl` dialogs.

### 6.3 Forms

**Label:** `text-xs/relaxed font-medium leading-none`, `gap-2` with extras. Error label: `text-destructive`.

**FormItem:** `space-y-2`. Description: `text-xs text-muted-foreground`. Message: `text-xs font-medium text-destructive`.

**Login exception:** labels `text-xs text-muted-foreground`; inputs **h-10 rounded-lg** with leading Mail/Lock icons `left-3.5 top-3 h-4`; password eye control right. Submit **h-10 rounded-lg** full width.

**Create assessment / finding form:** large dialogs (`sm:max-w-4xl` / `lg:max-w-4xl`), internal sections, not the 28px-compact login style.

### 6.4 Cards

**Primitive:** `rounded-sm bg-card py-4 gap-4 text-xs/relaxed text-card-foreground ring-1 ring-foreground/10`. Size `sm`: `py-3 gap-3`. Header `px-4` (`sm: px-3`), title `font-heading text-sm font-medium`, description muted `text-xs/relaxed`. Footer `px-4`, optional `border-t` padding.

**Filtered register card:** `gap-0 overflow-hidden rounded-sm border-border/60 py-0 shadow-none ring-0`. Header wash `bg-muted/20 border-b border-border/40`. **Do not nest a second bordered box.**

**KPI stat card (lists):** header row title + 16px icon; value `text-2xl font-bold tabular-nums`; caption `text-xs muted`. Grid `gap-4`.

**Dashboard KPI:** min-height `9.75rem`, `rounded-xl` link wrapper, `hover:bg-muted/40`, title min-height `2.75rem`, caption clamped 2 lines.

**Compact detail KPI:** `py-0`, content `px-4 py-3`, label `text-xs muted`, value `text-sm font-semibold tabular-nums`.

**Situation banner:** tinted border/background per level; micro-stats 3-col.

**Chart cards:** Card + header title/description + `ChartContainer` (often `aspect-video`). Empty: `ChartEmptyState` min-h 220px ghost diagram.

### 6.5 Tables

**Primitive:** wrapper `overflow-x-auto`; table `w-full text-xs`. Head row `border-b`, cell `h-10 px-2 font-medium`. Body last row no border. Row: theme hover `primary/10`, selected `primary/15`. Footer `bg-muted/50`.

**Filtered registers (assets, assessments, workbench tabs):**

| Part | Spec |
| --- | --- |
| Head | `h-9 py-0 text-[11px] font-medium text-muted-foreground px-3` + edge inset |
| Cell | `py-2.5 px-3` + edge inset |
| Row | `border-b border-border/30 last:border-0`; hover `bg-muted/25` + **3px inset primary bar**; `active:bg-muted/35`; 150ms |
| Refetch | body `opacity-60 pointer-events-none`; spinner in toolbar not overlay |
| IDs | `font-mono tabular-nums` |
| Empty | “No … match these filters.” vs “No … registered yet.” |

**Findings register:** master–detail, not a wide table. List 30% (`min 240px`) on `lg`; stacked on small screens. Selected row uses same inset bar language. Keyboard: ArrowUp/Down/Home/End.

**Do not** `y`-translate `<tr>` (fights table layout).

### 6.6 Modals / Dialogs

**Default `DialogContent`:** centered, `max-w-[calc(100%-2rem)]`, `sm:max-w-sm` (24rem), `gap-4 p-4 rounded-sm bg-popover ring-1 ring-foreground/10 text-xs/relaxed`. Overlay frost. Animate 100ms fade + zoom 95%. Close: ghost `icon-sm` top-2 right-2, Phosphor X, sr-only “Close”. Footer: column-reverse on mobile, `sm:flex-row sm:justify-end`. Nested selects do not dismiss the dialog (pointer-events guard).

**Wide variants (Confirmed overrides):**

| Dialog | Max width |
| --- | --- |
| Delete report confirm | `sm:max-w-md` |
| Calendar day | `max-w-md` / `max-w-lg` |
| Submit remediation | `max-w-2xl` |
| Finding form | `sm:max-w-2xl lg:max-w-4xl`, `max-h-[min(90dvh,100%)]`, `p-0` |
| Create assessment | `sm:max-w-4xl`, same height/padding pattern |
| Add assets import | `sm:max-w-6xl` |
| Report history | `max-w-5xl`, height `min(90dvh, 880px)` |
| Finding detail (workbench) | custom card `max-w-2xl` height `min(85vh,720px)` `rounded-lg p-5` |

### 6.7 Dropdowns / Popovers

**Dropdown:** `min-w-[8rem] rounded-sm border bg-popover p-1 shadow-md`, `sideOffset` 4 (user menu 8). Item `px-2 py-1.5 text-sm rounded-sm`; hover/focus `bg-primary/10`; destructive variant red text + `/10` wash. Separator `h-px bg-border -mx-1 my-1`. Open: fade + zoom-in-95.

**Popover:** `w-72 p-2.5 gap-4 rounded-sm bg-popover shadow-md ring-1 ring-foreground/10 text-xs`. Same 100ms fade/zoom.

### 6.8 Tabs

Root `flex gap-2`; horizontal = column flex. List default: `bg-muted rounded-sm p-[3px] h-9`. Trigger: `px-2 py-1 text-sm font-medium text-foreground/60`; hover foreground; active `bg-background text-foreground shadow-sm` (dark: `bg-input/30 border-input`). Disabled `opacity-50`. Line variant: bottom `h-0.5` bar at opacity 100 when active.

Workbench: tabs in `FILTERED_TABLE_HEADER_CLASS` strip; panel enter spring y 10.

### 6.9 Badges

Height **20px** (`h-5`), `rounded-sm`, `px-2 py-0.5`, `text-[0.625rem] font-medium`, SVG `size-2.5`. Variants: default primary fill; secondary; destructive wash; outline `border-border bg-input/20`; ghost; link.

Status badges compose `variant="outline"` + semantic `badgeClass`. Header badges: `h-5 gap-1.5 rounded-sm border px-2 text-xs font-normal tabular-nums` + color dots `h-2 w-2 rounded-full`.

### 6.10 Alerts / Toasts

**Alert:** `rounded-md border px-3.5 py-3 text-sm`. Default: `bg-card`. Destructive: `border-destructive/25 border-l-[3px] border-l-destructive bg-destructive/[0.06]` (dark `/09`). Icon `size-4`. Action slot absolutely right-centered (retry). Description `text-xs/relaxed muted` on destructive.

**Toast:** Sonner `position="top-right" richColors closeButton duration={5000}`. Exact Sonner palette = library default (**not re-themed in-repo**). Treat as system toasts with rich status colors.

### 6.11 Tooltips

Provider `delayDuration={0}`. Content: `rounded-sm bg-foreground px-3 py-1.5 text-xs text-background max-w-xs`, fade/zoom-in-95, arrow `size-2.5` rotated square matching foreground. `sideOffset` default 0.

### 6.12 Pagination

**Only on Asset Inventory table (Confirmed).** Footer strip, centered. Ghost Prev/Next `h-8 px-2 text-muted-foreground`, chevrons `size-3.5` stroke 2.25. Page numbers `h-8 min-w-8 tabular-nums`; current `variant="default"`; others ghost muted. Ellipsis `h-8 min-w-8 text-xs tracking-wide muted`. Window: first, last, current±1 (`pageWindow`).

Findings/assessments lists are server/filter paged without this control **Unknown if other lists paginate in UI** beyond assets — assessments table is a full filtered list card without the same footer in source reviewed.

### 6.13 Loading States

| Pattern | Spec |
| --- | --- |
| Session | Centered `Loader2 h-8 w-8 animate-spin text-primary` + optional `text-sm muted` “Loading secure session…” |
| Page skeleton | Layout-matching `Skeleton` (`animate-shimmer rounded-sm bg-muted/50`) |
| Chart skeleton | `h-[300px] w-full rounded-md` in card |
| Stat skeleton | title 16×4, icon 16, value 32×16, caption 12×28 |
| Button | inline `Loader2 size-3.5 animate-spin` |
| Table refetch | dim body; toolbar spinner |
| Notifications | spinner in dropdown |
| Finding detail | skeleton bars in panel |
| Canvas | centered “Loading canvas…” |

### 6.14 Empty States

| Surface | Visual |
| --- | --- |
| Chart | Ghost donut/pie/bar/hbar/area/rows, muted, `text-[11px]` notes |
| Findings list | ShieldAlert `h-5 opacity-50` + “No findings match your filters.” |
| Finding detail | FileSearch in `rounded-full bg-muted/60 p-5`, title + 2-line help `max-w-sm` |
| Notifications | Centered copy |
| Chat history | MessagesSquare `size-8` muted/50 + two-line caption |
| Chat thread | Centered starters `max-w-[34rem]`; composer compact |
| Saved reports | Dashed `rounded-sm` box `py-16`; duotone Phosphor icon; optional primary CTA |
| Search reports | Same dashed, “No reports match your search.” |
| 404 detail | `min-h-[320px]` center, `text-xl font-semibold`, mono ID, primary Button back |

### 6.15 Error States

Destructive `Alert` with icon, title “Unable to load …”, `font-mono tabular-nums` message, outline Retry using `DISMISS_OUTLINE_CLASS` + `PRESS_CLASS`. Login: destructive Alert `py-3 rounded-lg` centered `text-xs`. Analytics/dashboard: “Data load error”. Access denied: Lock duotone `h-10`, `text-lg font-semibold`, muted explanation. Form: `aria-invalid` rings + `FormMessage`.

---

## 7. Page-by-Page Specifications

Shared list-dashboard shell (Findings, Assets, Assessments):

```text
PageReveal  max-w-7xl mx-auto flex-col gap-6 p-4 sm:p-6
 └── SectionStagger gap-6
      ├── SectionItem: H1 + subtitle [+ actions] + Separator mt-6
      ├── SectionItem: destructive Alert (if error)
      ├── SectionItem: KPI grid
      ├── SectionItem(s): charts
      └── SectionItem: filtered table / register (#hash scroll-mt-20)
```

H1: `text-2xl font-bold tracking-tight sm:text-3xl`. Subtitle: `text-muted-foreground` (default sm).

---

### 7.1 Login (`/login`)

**Purpose:** Unauthenticated split marketing + sign-in. Navbar hidden.

**Layout:**

```text
Full viewport row
 ├── Left (hidden until lg): 50% width, p-10 xl:p-14
 │    ├── primary/[0.03] wash + two blurred primary orbs
 │    ├── Brand: 40px rounded-xl primary tile + Shield + “Apex Assess”
 │    ├── Carousel min-h 200px (icon 48px rounded-xl primary/10, title, body)
 │    └── Dots: active w-8 h-1.5 bg-primary; idle w-1.5 bg-primary/25
 └── Right: full / 50%, center, p-6 sm:p-10
      ├── 24px grid texture at 6% opacity
      ├── Mobile brand (lg:hidden) uppercase
      └── Card max-w-md frost shadow-2xl
           ├── Title “Welcome back” text-xl font-semibold
           ├── Description text-xs
           ├── Error alert
           └── Form space-y-4, h-10 rounded-lg fields, full-width CTA
```

**Motion:** slides 500ms opacity + `translate-y-4`; auto-advance 5000ms. CTA shadow-primary. Loading: full-page primary spinner.

**Responsive:** single column until `lg`; left pane disappears.

---

### 7.2 Dashboard (`/dashboard`)

**Purpose:** Security posture overview (charts + KPIs). Header component exists but is **commented out**.

**Structure:**

```text
motion.div max-w-7xl gap-6 p-4 sm:p-6
 └── Filters label + 2/3/5-col Select grid (date, severity, status, type, assessment)
      custom range → Popover Calendar
 └── Alert if error
 └── SituationBanner (tinted card + 3 micro-stats)
 └── PostureStats “Key Risk Indicators” 2/3/6 KPI cards (min-h 9.75rem)
 └── md:2-col: Severity donut | Remediation progress
 └── Assessment trend (ranked rows, static bars)
 └── Findings by source
 └── md:2-col: Riskiest assets | Age distribution
 └── md:2-col: Asset criticality | Scope overview
 └── Assigned-to breakdown (static bars)
```

**Filters:** `h-8 w-full text-xs` selects. “Filters” `text-xs font-medium muted`. Clear appears with count badge when any ≠ all.

**Pending approvals block is commented out** — do not include unless re-enabled.

**Skeleton:** matches filter chips, banner, 6 stats, chart cards `h-[300px]`.

**Responsive:** KPI 2-col → 3 (`md`) → 6 (`lg`). Charts stack below `md`.

---

### 7.3 Findings Registry (`/findings`)

**Purpose:** Stats + charts + master–detail register.

**Structure:** page shell as above. Title “Findings Registry”. Stats 2/3/6 cards. Two `md:2-col` chart rows (severity/status; by-assessment/by-owner). Register `#register`.

**Register card:** filtered-table chrome. Toolbar: SearchFilterToolbar (search, severity/status/assignee/assessment/overdue, Export CSV). Body:

```text
lg: row
 ├── aside 30% (min 240px) border-r: FindingsList + severity legend
 └── FindingDetails (header badges, tabs: general / evidence / …)
sm: column, list on top (border-b), details below
```

Empty list vs empty detail as §6.14. Selection deselects on second click (copy in empty state).

---

### 7.4 Assets Dashboard (`/assets`)

**Purpose:** Inventory KPIs, breakdown charts, table.

**Header actions:** Sample (outline), Add Assets (outline, spinner while upload/validate), Canvas View (primary) `size-sm` + `PRESS_CLASS`.

**Stats:** 5 cards `md:2 lg:5`. Charts: type/location/env/status in grids. Table `#table` with pagination footer.

**Import:** hidden file input; `AddAssetsDialog` `max-w-6xl`.

---

### 7.5 Asset Canvas (`/assets/canvasview`)

**Purpose:** Full-bleed React Flow graph under navbar.

**Layout:** `h-[calc(100vh-3.5rem)]`. Optional top error alert. Graph + floating glass docks: back, filters `w-72 max-w-[85vw] z-40`, stats/legend cards `w-48`, zoom/help pill, bottom view-mode toolbar centered `bottom-4 z-50`, top-right cluster.

**Glass:** `CANVAS_GLASS` / `CANVAS_GLASS_PILL`. Grid opacity 0.12. Nodes: no outline/shadow; enter 350ms. Edges below nodes.

---

### 7.6 Asset Detail (`/assets/[id]`)

**Purpose:** Single asset dossier.

**Layout:** `flex-1 space-y-3 p-4` + breadcrumb. Inner PageReveal `space-y-4`:

```text
Header: 44px icon well (border-primary/30 bg-primary/10) + name text-xl + mono ID
        right: disabled outline Notify + disabled primary Edit
KPI row (compact cards)
Insights row
Properties section
Findings section (filtered table)
Assessments section
Optional Tool Coverage card (emoji + names — domain chrome, not system icons)
```

Not-found / error as §6.15.

---

### 7.7 Assessments Dashboard (`/assessments`)

**Purpose:** Cycles, calendar, table.

Title “Assessments Dashboard”. Primary action: Create Assessment (`PermissionGuard`). Stats 6-up. `AssessmentCalendar` (status dots). Table `#table`. Create dialog `sm:max-w-4xl`.

---

### 7.8 Assessment Workbench (`/assessments/[id]`)

**Purpose:** One assessment: header, KPIs, tabs.

```text
p-4 space-y-3
 ├── Breadcrumb Assessments / {id}
 └── space-y-4
      ├── Header: 44px type icon well + name + type badge + mono ID
      ├── Compact KPI row
      └── WorkbenchTabs: Overview | Findings | Remediation | Reports
```

Tab panels spring in. Findings/remediation use filtered-table skeletons while loading.

---

### 7.9 Remediation Detail (`/assessments/[id]/remediation/[findingId]`)

**Purpose:** Finding remediation workflow.

Breadcrumb + PageReveal `space-y-4`: status control, compact KPIs, properties, approval panel **or** evidence, history. Approval uses affirm/dismiss pair + confirm strip. Submit dialog `max-w-2xl`.

---

### 7.10 Analytics (`/analytics`)

**Purpose:** Report workspace. `/analytics/reports/new` and `/analytics/reports/[id]/edit` **redirect** here.

**Layout:** `h-[calc(100dvh-3.5rem)] p-3 sm:p-4`; `lg:overflow-hidden`, small screens scroll.

```text
Optional alerts (error / action message)
 └── rounded-sm border-border/50 bg-card/40 inset highlight
      └── ReportBuilder
           ├── toolbar: name input, save/export cluster (CSV/Excel/PDF h-9)
           └── panes: Saved reports | Filters | Preview (grow 1 : 1 : 2)
```

Collapsed pane: `h-10` full width on mobile; `lg:w-10` vertical title. Delete confirm `sm:max-w-md`. History dialog `max-w-5xl`. Empty reports: dashed panel §6.14. Access denied: centered lock.

Saved report card: `bg-card/80` frost; selected `border-primary/40 bg-primary/12`. Title `text-[17px] font-semibold tracking-[-0.02em]`.

---

### 7.11 AI Chat (`/chat`)

**Purpose:** Conversational assistant. Different density (15px type, pills).

```text
PageReveal flex h-[calc(100vh-3.5rem)]
 ├── ChatConversationSidebar (md+: 248 / 52)
 └── column
      ├── header px-3 py-2: mobile List button rounded-xl size-9 | title | Settings size-8 rounded-lg
      ├── messages (data-selectable)
      └── composer max-w-3xl: rounded-full border-border/50 bg-foreground/5 p-1.5 shadow-md
           textarea border-0 rounded-full text-[15px]
           send size-9 rounded-full; enabled active:scale-0.94
```

User bubble: `max-w-[85%] rounded-[1.25rem] rounded-br-md bg-primary px-4 py-2.5 text-[15px] text-primary-foreground`. Empty: starters + compact composer. Unavailable overlay: title/message + settings/retry.

---

### 7.12 Approvals (`/approvals`)

**Purpose:** Queue of pending remediation reviews. Not in top nav; linked from bell.

`p-4 md:p-6`. Accordion list with `ROW_HOVER_CLASS`, severity dots, KPI chips, inline approve/reject using the same affirm/dismiss rules. Expand spring stiffness 400 damping 32.

---

### 7.13 Home (`/`)

Redirects to `/dashboard`. No unique UI.

---

## 8. Responsive Design Specification

| Component/Page | Desktop (`lg+`, ≥1024px) | Tablet (`sm`–`md`) | Mobile (`<640px`) |
| --- | --- | --- | --- |
| Navbar | Logo + pill nav left; actions right | Hamburger + section + logo + actions | Same 3-col; logo truncated |
| Nav sheet | Hidden | Left sheet 288px | Same |
| Page padding | 24px | 24px from sm | 16px |
| Page H1 | 30px | 30px from sm | 24px |
| Dashboard charts | 2-col | 2-col from md; else 1 | 1 col |
| Dashboard KPI | 6 col | 3 col md; 2 col | 2 col |
| Findings/Assets/Assessments KPI | 6 or 5 col | 2–3 | 1–2 |
| Findings register | 30% list + detail | Stacked | Stacked |
| Tables | Full columns, horizontal scroll if needed | Scroll | Scroll |
| Dialogs | Variant max-width | `calc(100%-2rem)` floor | Same; footer stacked |
| Sheet | sm:max-w-sm | 75% width | 75% |
| Login | 50/50 split | Form only | Form + mobile brand |
| Analytics | 3 panes horizontal | Panes stack; collapsed bars full width | Same, page scrolls |
| Chat | Rail 248/52 | History via sheet (`md:hidden` trigger) | Sheet |
| Canvas | Floating docks | Filters max 85vw | Same |
| Forms | Multi-column in large dialogs | Single column | Single column |
| Typography | `md:text-xs/relaxed` on controls | sm 14px inputs | sm 14px inputs |
| Hover | Fine-pointer media | No hover lift on touch | No hover |
| Situation banner | Row: copy + 3 stats | Row from sm | Column |

---

## 9. Design Tokens

### Confirmed Tokens

**COLORS** — all `--*` in §4.1 from `globals.css`; chart HSL in `lib/charts/constants.ts`; overlay `bg-background/40`.

**TYPOGRAPHY** — `--font-sans: var(--font-geist)`; `--font-mono: var(--font-jetbrains-mono)`.

**SPACING** — Tailwind default 4px grid; page `16/24`; section `24`; card `16`.

**BORDER RADIUS** — `--radius: 0.625rem` + multipliers in §4.6.

**BORDERS** — `1px solid var(--border)` and opacity variants.

**SHADOWS** — §4.7 CSS variables.

**BREAKPOINTS** — Tailwind defaults §4.10.

**Z-INDEX (Observed, no scale token):** navbar/overlay/dialog/tooltip/select `z-50`; canvas filters `z-40`; canvas toolbar `z-50`.

**TRANSITIONS** — `lib/motion` duration/ease/spring; `PRESS_CLASS` 100ms; CSS dialog 100ms; sheet 300/500ms.

**COMPONENT HEIGHTS**

```text
navbar                 56px
input/select default   28px
select sm              24px
toolbar control        32px
login input/button     40px
badge                  20px
tabs list              36px
table head primitive   40px
filtered table head    36px
avatar default         32px
avatar sm/lg           24 / 40px
checkbox/radio         16px
chat send              36px
chat rail expanded     248px
chat rail collapsed    52px
```

**CONTAINER WIDTHS**

```text
page content     80rem (1280px)
dialog default   24rem (sm)
dialog md        28rem
finding form     42rem → 56rem
create assess    56rem
add assets       72rem
report history   64rem
submit remed.    42rem
login card       28rem
popover          18rem
nav sheet        18rem
tooltip          max 20rem
chat composer    48rem
chat empty       34rem
```

### Derived Tokens

HEX/RGB/HSL in §4.1; radius px in §4.6.

### Unknown

- Exact Geist fallback stack beyond `next/font`
- Whether `font-heading` is remapped in `shadcn/tailwind.css` to serif
- Sonner richColor HEX
- Sidebar token intended use (no app sidebar)

---

## 10. Reusable UI Patterns

1. **List dashboard:** H1 + rule + KPI grid + chart grid + filtered table.
2. **Filtered table card:** header wash + toolbar strip + body + optional pagination footer.
3. **Search + Filters:** `SearchFilterToolbar`; filters expand **below** with height spring; count badge; clear in panel.
4. **Master–detail:** 30/70 on `lg`; selection inset bar.
5. **Compact KPI row:** 4-up small cards, `text-sm` values (detail pages).
6. **Dashboard KPI tile:** tall card, icon top-right, huge tabular number.
7. **Entity header:** 44× auto icon well primary/10 + title + mono ID.
8. **Breadcrumb:** back chevron + hover primary.
9. **Error + Retry:** destructive alert + dismiss-outline retry.
10. **Affirm/dismiss:** quiet reject, loud approve, then confirm.
11. **Ghost charts:** empty that keeps chart silhouette.
12. **Frosted overlay:** 40% background + blur.
13. **Segmented control:** muted track + sliding white pill (nav, theme mode).
14. **Canvas glass dock:** translucent card, shared by all floating controls.

---

## 11. Interaction & State Specifications

| State | Spec | Confidence |
| --- | --- | --- |
| Default | Token colors, 1px borders | Confirmed |
| Hover (fine pointer) | `primary/10` on controls/menus; rows `muted/25` + inset bar or `muted/50` + shadow | Confirmed |
| Focus-visible | `border-primary` + `ring-2 ring-primary/30` | Confirmed |
| Active / press | Button `translate-y-px`; product `scale(0.97)` 100ms; rows `tapScale` 0.98 | Confirmed |
| Selected | Nav pill; table `primary/15`; theme chip primary ring; finding list inset bar | Confirmed |
| Disabled | `opacity-50` + no pointer | Confirmed |
| Loading | Spinner primary; skeleton shimmer; refetch dim | Confirmed |
| Error | Destructive rings/alerts | Confirmed |
| Empty | §6.14 | Confirmed |
| Success | Toast richColors; situation “Healthy” emerald; closure rate emerald ≥80% | Confirmed |
| Expanded | Filter panel height spring; accordion spring; `aria-expanded` outline button `border-primary/40 bg-muted/40` | Confirmed |
| Collapsed | Chat 52px rail; analytics 40px pane | Confirmed |
| Invalid | `controlInvalidClass` | Confirmed |
| Reduced motion | Instant opacity; no y/scale; no Recharts anim; static nav pill | Confirmed |

KPI number color (dashboard): orange/red/destructive/amber/emerald/blue by threshold — Confirmed in `posture-stats.tsx`.

---

## 12. Design Principles

Supported by the UI:

1. **Dashboard-oriented** — KPIs and charts before tables.
2. **Dense information** — 6 KPIs, 11px table heads, 28px controls.
3. **Card-based** — almost every module is a card.
4. **Compact, not sparse** — small radius, tight padding; login/chat are the spacious exceptions.
5. **Warm enterprise** — paper neutrals + terracotta, not cold gray-only.
6. **Semantic risk color** — severity never depends on `--primary`.
7. **Themeable accent** — hover/focus/primary follow `--primary` so palettes work.
8. **Restrained motion** — short, ease-out, skip on repeat.
9. **Frosted chrome** — navbar, overlays, canvas, login card.
10. **Flat-ish elevation** — rings and hairlines over drop shadows.
11. **Accessible density** — focus rings, `sr-only` close labels, reduced-motion paths, keyboard finding list.

Not: playful illustration system, huge marketing type on inner pages, or a persistent left app rail.

---

## 13. Replication Rules

## Rules for Replicating This Design

1. Reuse the documented design tokens. Put colors on CSS variables matching §4.1.
2. Do not introduce arbitrary colors for chrome. `--primary` / `--destructive` / `--muted` / `--border` cover UI. Risk uses the HSL/Tailwind maps in §4.1.4.
3. Do not introduce arbitrary font sizes. Stick to the hierarchy table. Chat `15px` and report titles `17px` are **named exceptions**, not a license for random sizes.
4. Maintain the spacing scale (4px grid). Page `16/24`, sections `24`, card padding `16`.
5. Maintain border radius: **6px** for product controls/cards; **8–10px** for nav/search; **pills** only for nav cluster, chat, canvas docks, avatars in the header.
6. Maintain component states: hover, focus-visible, disabled, invalid, loading, empty, error.
7. Follow documented responsive behavior, especially `lg` as the desktop-nav breakpoint.
8. Reuse component patterns (filtered table, toolbar, KPI grids, entity header) instead of one-off visuals.
9. Preserve hierarchy and density: 11px column labels, 24px KPI numbers, 28px fields.
10. Do not modify the design language unless the new project explicitly requires it.
11. Do not re-stagger page/list motion on filter changes.
12. Do not animate display-only KPI strips.
13. Honor `prefers-reduced-motion`.
14. Do not use `transition: all`, `scale(0)` enters, or CSS `ease-in` for UI enters.
15. Keep body `select-none` except inputs and explicitly selectable surfaces (chat).
16. Map all interactive hover/focus to `--primary` tints so a palette swap still works.
17. Do not nest a bordered table inside a bordered card.
18. Keep destructive **buttons** as washed (`bg-destructive/10`), not solid candy-red fills.
19. Affirmative actions sit trailing and filled; dismissive actions leading and quiet.
20. Copy Lucide for app chrome; Phosphor is acceptable for primitive carets to match shadcn mira.

---

## 14. Implementation Guidance

**Implement globally**

- CSS variables for color, radius, shadow (copy `globals.css` `:root` / `.dark` / `@theme`).
- Base: Geist, JetBrains Mono, antialiased, `select-none`, themed scrollbars, shimmer.
- Focus helpers equivalent to `focus-styles.ts`.
- Light/dark class on `html`; optional system preference.
- Overlay backdrop class.
- Motion tokens module (even if you use CSS only: same curves/durations).

**Reusable components (build once)**

- Button, Input, Textarea, Select, Checkbox, Radio, Label, Form bits
- Card (+ filtered-table variants)
- Table
- Dialog, Sheet, Popover, Dropdown, Tooltip
- Tabs, Badge, Alert, Avatar, Skeleton, Calendar, ScrollArea, Separator
- Navbar (logo, pill nav, sheet, bell, user/theme menu)
- SearchFilterToolbar + ExpandableFilterPanel
- Pagination controls
- Chart container + tooltip + empty ghosts
- PageReveal / SectionStagger equivalents
- Affirm/dismiss button pair

**Design tokens to centralize**

- Colors, radius, shadows, motion durations/easing, overlay, press class, filtered-table classes, metric number class, canvas glass, severity/status maps

**Page-specific**

- Login split + carousel
- Dashboard situation banner + filter bar
- Findings 30/70 register
- Canvas graph (if in scope)
- Chat pills/bubbles
- Analytics collapsible workspace
- Calendar month view on assessments

**Do not duplicate per page:** button styles, input heights, card radius, table head type, alert layout, spinner color.

**Recommended hierarchy**

```text
tokens (css)
 → primitives (button, input, card, …)
    → patterns (toolbar, filtered table, kpi grid, entity header)
       → page shells (list dashboard, detail, workspace, chat, login)
```

**Responsive strategy:** mobile-first Tailwind; `lg` = desktop information architecture (nav, findings split, analytics panes, login split).

**Icons:** Lucide 14–16px in chrome; 16px in KPI; 20–24px logo. Match stroke 2.25 on compact actions.

**Charts:** Recharts or equivalent; severity colors from HSL map, not `--chart-*`, for risk series. Bar hover = halo, not grow. Pie hover = stroke/brightness, no radial pop.

---

## 15. Confirmed vs Observed vs Inferred vs Unknown

| Item | Status |
| --- | --- |
| `:root` / `.dark` OKLCH and HEX charts | Confirmed |
| HEX/RGB/HSL of OKLCH | Derived |
| Button/input/card/table/dialog classes | Confirmed |
| Motion numeric tokens | Confirmed |
| Navbar 56px, max-w-7xl, p-4/sm:p-6, gap-6 | Confirmed |
| Tailwind default breakpoints / spacing | Confirmed (no override) |
| `font-heading` = Geist | Inferred |
| Source Serif 4 unused in UI | Observed (loaded, no utility usage found) |
| Geist Mono unused in `@theme` | Confirmed mapping; unused **Observed** |
| Sidebar CSS variables unused by layout | Observed |
| `claude.ts` vs `globals.css` destructive/charts | Confirmed divergence |
| Sonner colors | Unknown (library defaults) |
| Extra font fallbacks | Unknown |
| Assessments table pagination UI | Not present like assets (Observed) |
| Switch component | Absent (Confirmed) |
| Multi-select primitive | Absent (Confirmed) |

---

## 16. Final Replication Checklist

```text
[ ] Light Claude colors match globals.css OKLCH (or documented HEX)
[ ] Dark Claude colors match globals.css
[ ] --primary hover/focus tints ( /10 /15 /30 /80 ) used consistently
[ ] Destructive is washed on buttons, solid-left-rail on alerts
[ ] Chart severity/status uses HSL map, not random hues
[ ] Badge status classes match severity/remediation/assessment maps
[ ] Geist (or metric-equivalent) for UI; JetBrains Mono for IDs
[ ] Page H1 24/30 bold tracking-tight
[ ] Card titles 14px medium
[ ] KPI numbers 24px bold tabular-nums
[ ] Table heads 11px medium muted (registers)
[ ] Body/captions 12–14px; muted for secondary
[ ] 4px spacing grid; page 16/24; sections 24
[ ] --radius 10px; controls/cards rounded-sm (~6px)
[ ] Shadows match token set; register cards shadow-none
[ ] Sticky 56px frosted navbar, no app sidebar
[ ] Desktop pill nav + sliding active pill
[ ] Mobile hamburger sheet 288px
[ ] Logo Shield + Apex muted / Assess primary
[ ] Buttons: 6 variants, compact padding, 1px active translate
[ ] Inputs/selects h-7, border-input, primary focus ring
[ ] Toolbar search h-8 rounded-md muted wash
[ ] Cards ring-1 foreground/10 or filtered-table border/60
[ ] Tables: inset primary bar hover, dim on refetch
[ ] Dialogs: frost overlay, zoom-95, sm:max-w-sm default
[ ] Alerts: destructive left 3px rail
[ ] Badges h-5 10px type
[ ] Tooltips inverted (fg bg, bg text)
[ ] Pagination matches assets footer (if tables paginate)
[ ] Skeletons use shimmer, not pulse-only
[ ] Empty states: ghost charts + dashed reports + icon wells
[ ] Error alerts with Retry outline
[ ] Hover only on fine pointers for rows
[ ] Focus-visible rings present
[ ] Disabled opacity 50%
[ ] Press scale 0.97 on toolbars; 0.98 on nav/rows
[ ] Page enter y+opacity; no filter remount stagger
[ ] Reduced-motion paths
[ ] lg breakpoint for nav, login split, findings split, analytics panes
[ ] Chat/login exceptions not leaked into registers
[ ] Icons Lucide/Phosphor, sizes 14–16 default
[ ] Overlay bg-background/40 blur
[ ] Scrollbars thin, border-colored
[ ] Global select-none with input exceptions
[ ] Light/dark (and optional palettes) via CSS variables
[ ] No arbitrary extra colors, type sizes, or radii
[ ] Reusable primitives + filtered-table + toolbar implemented once
```

---

*End of design contract. Replicate visuals from this document plus the cited class strings; do not invent tokens.*
