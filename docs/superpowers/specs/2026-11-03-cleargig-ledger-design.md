# ClearGig — Ledger Redesign

**Date:** 2026-11-03
**Branch:** `design/ledger`
**Status:** draft, awaiting approval

---

## 1. Intent

ClearGig is an estimate manager for freelance development work. The current
build feels clunky. The cause is not "too much design" — it is **miscostumed
design**. Neon chartreuse, a scanning line, a 3D data sea and glass panels are
the visual language of a trading terminal. The product is contract work. The
interface argues with the task.

Two costs follow from that:

1. **Latency.** A custom cursor with 250ms easing over a hidden native pointer,
   full-page `scale(4)` + `blur(3xl)` step transitions, an always-rendering
   WebGL canvas, and a smooth-scroll layer that fights every scrollable panel.
2. **Dissonance.** The user is writing an estimate; the screen says crypto.

The redesign keeps the app premium and makes the aesthetics **evidence of the
domain**: an estimate should look like a document you would trust with money.

---

## 2. What is wrong today

Evidence from the current source, not impressions.

### Feel

| # | Problem | Location |
|---|---|---|
| F1 | `cursor-none` on `<body>`; GSAP cursor trails every mouse move by 0.25s | `layout.tsx:39`, `CustomCursor.tsx:14-16` |
| F2 | Wizard steps transition at `scale-[4]` + `blur-3xl` + translate, 850ms | `page.tsx:56-61`, `page.tsx:183` |
| F3 | Whole dashboard blurs to `blur(2px)` and scales when the drawer opens | `dashboard/page.tsx:45-53` |
| F4 | WebGL plane renders on every route, permanently | `layout.tsx:38`, `Background3D.tsx` |
| F5 | Lenis smooth scroll wraps the entire app | `layout.tsx:44`, `LenisProvider.tsx` |
| F6 | `document.body.style.overflow` toggled by three different screens | `page.tsx:44-47`, `dashboard/page.tsx:19-22` |
| F7 | Loading states are the literal word "Loading..." | `dashboard/page.tsx:58`, `projects/[id]/page.tsx:115` |

### Structure

| # | Problem | Location |
|---|---|---|
| S1 | Two disconnected products. `/` is a client-only wizard that saves nothing and hardcodes `$150/hr` and `15%` contingency. `/dashboard` and `/projects/[id]` use the real API. | `page.tsx:16-19` vs `services/api.ts` |
| S2 | "Back to Dashboard" and delete both navigate to `/` — the estimator, not the dashboard | `projects/[id]/page.tsx:122,138,108` |
| S3 | Nothing links to `/projects/[id]`; the dashboard opens a drawer instead, so the detail route is unreachable | `dashboard/page.tsx:239` |
| S4 | `Export PDF` button has no `onClick` | `page.tsx:173` |
| S5 | `SummaryPanel` implements print (`handlePrint`) but the wizard does not use it, and what it prints is a *Cloud FinOps Audit & Proposal*, not an estimate | `SummaryPanel.tsx:78,87-119` |

### Correctness that shows up as ugliness

| # | Problem | Location |
|---|---|---|
| C1 | Light-mode Tailwind classes on a dark-only app: `bg-blue-100 text-blue-800 dark:bg-blue-900/30`. With no dark variant configured, `dark:` falls back to `prefers-color-scheme`, so a light-mode OS renders pastel chips on near-black | `LineItemTable.tsx:36,40`, `projects/[id]/page.tsx:311` |
| C2 | Hardcoded `#D4FF00` and `rgba(212,255,0,…)` repeated inline | `dashboard/page.tsx:184`, `page.tsx:54,173` |
| C3 | `window.confirm` for destructive delete | `projects/[id]/page.tsx:104` |
| C4 | `hover:scale-105` / `hover:scale-110` on buttons and text links cause layout jitter | `page.tsx:196,215`, `dashboard/page.tsx:240` |
| C5 | No `focus-visible` styling on buttons or links; inputs only | throughout |

---

## 3. Goals, non-goals, anti-goals

**Goals**

- The app feels instant: no input lag, no decorative transition on the path to
  a task.
- Every screen reads as business and contract work at a glance.
- Numbers are exact and scannable: tabular figures, right-aligned, consistent
  currency formatting.
- Keyboard-complete for the estimate flow.
- Same features, same API, same framework. No migration.

**Non-goals**

- New features. No team accounts, no template library, no currency conversion.
- A marketing landing page. ClearGig has no public site today and this does not
  add one.
- Dark mode. The app commits to one tone.
- Rewriting the backend.

**Anti-goals** (if the result does any of these, the redesign failed)

- Looks premium but still takes 5 clicks to add a line item.
- Ships a beautiful estimate screen whose Export button does nothing.
- Keeps any always-on animation on the critical path.
- Introduces a second typeface or a third accent to feel "designed".

---

## 4. Constraints

- Next.js 16.3.2, React 19.2.8, Tailwind v4 (`@theme inline` in
  `globals.css`), TypeScript. Do not migrate.
- Existing dependencies only. Removing `three`, `@react-three/fiber`,
  `@react-three/drei`, `lenis`, `gsap`, `@gsap/react` is allowed and expected.
  Adding is not.
- `geist` and `geist-mono` via `next/font/google` already load. Keep them.
- API contract in `services/api.ts` is fixed.
- Icons: Phosphor, Solar or Iconamoon only. Current set is `lucide-react`,
  which the design system explicitly disallows. See §7.
- All numbers resolve to the approved type and spacing scales. No arbitrary
  values.

---

## 5. Approaches considered

| | Direction | Trade-off | Decision |
|---|---|---|---|
| **A** | **Ledger** — the estimate as a document you would trust with money. Light paper, ink, one deep accent, hairline rules, tabular numerals, stamp for status. | Palette inversion, real churn. Literal answer to "contract vibes"; furthest from the AI dark-glass default. | **Chosen** |
| B | Studio terminal — keep dark, delete the neon, dense calm grid, no glass. | Cheapest, closest to current code. Still "dark tech", does not read as business. | Rejected: smallest step away from generic |
| C | Blueprint — the estimate as a technical drawing, grid paper, measurement ticks, section numbering. | Most distinctive metaphor for scope; most work; tips into gimmick without expert density control. | Rejected: highest risk per unit of value |

All three share the same de-clunk baseline (§6), which is direction independent.

**Size.** With FinOps kept, this is a project, not a session: three routes, one
new print route with two variants, a money-math module, a dependency removal
pass, and a component split. Plan it as roughly a dozen tasks.

---

## 6. The Ledger system

### 6.1 Type

One family. **Geist** for everything, **Geist Mono** for numerals only.

Approved list is Geist / Manrope / Geist Mono / Poppins. No serif display — this
is deliberate. The audience is developers reading an estimate, and a Swiss
grotesk on a ruled document reads more credible than a serif impression of a
law firm. If a serif is wanted later it is a one-line change to the design
values, not a rebuild.

| Style | Class | Weight | Use |
|---|---|---|---|
| Display | `text-6xl` / 60px, lh 1 | 600, tracking `-0.02em` | Wizard question |
| H1 | `text-4xl` / 36px, lh 40 | 600, tracking `-0.01em` | Page title |
| H2 | `text-2xl` / 24px, lh 32 | 600 | Section |
| H3 | `text-lg` / 18px, lh 28 | 600 | Card title |
| Body | `text-base` / 16px, lh 24 | 400 | Running text |
| Body small | `text-sm` / 14px, lh 20 | 400 | Secondary |
| Label | `text-xs` / 12px, lh 16 | 500, tracking `0.08em`, uppercase | Field and column labels |
| Numeral | `text-sm` / `text-xl` / `text-5xl` | 500, `font-mono`, `tabular-nums` | Every number |
| Button | `text-sm` / 14px, lh 20 | 600 | All buttons |

Rules: no italics anywhere. No weight above 600. `text-wrap: balance` on
headings, `text-wrap: pretty` on body. No hyphens in copy. Sentence case for
headings and buttons; the only uppercase is the label style.

### 6.2 Color

**This is the one area where the design values in the skill do not cover the
needed surface.** The skill defines dark backgrounds only, and this direction is
paper. The palette below is a proposal, approved by the user on 2026-11-03
rather than invented silently. It is the only new palette in the project and it
replaces the dark set, it does not extend it.

| Token | Hex | Use | Contrast on paper |
|---|---|---|---|
| `--paper` | `#F7F4EE` | Page base | — |
| `--paper-raised` | `#FFFDF8` | Cards, drawer, inputs | — |
| `--paper-sunken` | `#EFEBE1` | Table header, field wells | — |
| `--ink` | `#14140F` | Primary text | 16.1:1 |
| `--ink-muted` | `#5C5A52` | Labels, secondary | 6.3:1 |
| `--rule` | `#D9D4C7` | Hairlines, dividers | — |
| `--rule-strong` | `#B9B2A1` | Emphasis rule under totals | — |
| `--accent` | `#1E4A3C` | Deep pine. Primary action, totals, active nav | 9.6:1 |
| `--accent-wash` | `#E7EDE8` | Accent-tinted surfaces | — |
| `--danger` | `#8A2B1F` | Destructive only | 7.4:1 |

Flat surfaces only. **No gradients anywhere**, including the hero heading — this
direction does not use the hero text gradient, because the wizard question is
the document's headline, not a marketing hero. No glass, no blur, no shadow
larger than a 1px ring. Depth is expressed by rules and paper tone, never by
elevation.

Status is a **stamp**, not a pill: rectangular, 1px `--rule-strong` outline, label
style type, `--accent` for ACCEPTED, `--ink-muted` for DRAFT, `--ink` for SENT,
`--danger` for REJECTED.

### 6.3 Space and radius

Spacing scale only: 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96.
Main buttons: 8px vertical, 12px horizontal.

Radius: `0` for rules and table cells. `2px` for inputs, buttons and stamps.
`4px` for cards and panels. Nested shapes under a 32px gap use
`inner = outer − gap`, applied only above 2. In practice this direction is
nearly square; that is the point.

Container: max width 1280px, auto margins. Wizard question and its helper text
cap at 680px.

### 6.4 Ruled ledger

The signature element. Every list of line items is a ruled ledger:

- Row height 48px. Hairline `--rule` between rows, full width, never on one side
  only of a card.
- Columns: description left, hours right, rate right, subtotal right. Numerals
  `font-mono tabular-nums`.
- A `--rule-strong` 1px rule above the totals block. Total is `text-5xl`,
  `--accent`, right aligned.
- Document folio (`EST-2026-4821`) and date sit top right in label style.
- Signature block stays, as it already exists: a 192px rule, then "Authorized
  signature" in label style.

### 6.5 Motion

One curve: `cubic-bezier(0.22, 1, 0.36, 1)`.

- Navigation and drawer: 400ms, transform and opacity only.
- Hover: 150ms color only.
- No page or step transitions longer than 400ms.
- No blur, no scale, no filter animation anywhere.
- Scroll reveals: none on app screens. Data does not perform.
- `prefers-reduced-motion`: all movement becomes a 0ms swap.

Delete `LenisProvider` entirely. Native scroll.

### 6.6 Structure per route

**`/` — New estimate.** Keep the five questions, they suit the task and the user
liked the flow. Remove the theatre: no scanner line, no `scale(4)`, no blur, no
`overflow: hidden`. Steps become a single column on paper with a progress rule
across the top (1 of 5 in label style). Enter advances; Shift+Enter goes back;
Escape returns to `/dashboard` with a confirm if dirty. On the final step, saving
writes through the API: `createClient` then `createProject` then `addLineItem`
per row, then routes to `/projects/[id]`. "Export PDF" calls the existing
`handlePrint` path. "Start over" clears only the draft.

**`/dashboard` — Estimates.** Becomes the home. Top bar: wordmark, primary
"New estimate", nothing else floating. Body: the ruled ledger of all estimates
(title, client, status stamp, total, updated). Side panel of client totals
becomes a table, not bars, on the right rail. The drawer stays but becomes a
plain panel: no backdrop blur, no dashboard blur, Escape closes, focus trapped,
focus returns to the triggering row.

**`/projects/[id]` — Estimate detail.** Two columns: add-item form and ledger on
the left, summary and global toggles on the right. Ranges become numeric inputs
with a visible unit, because a 5% step slider is imprecise for money. Status
select becomes the stamp with a menu. Delete moves into an overflow menu and
uses an inline confirm, not `window.confirm`. A two-item switch sits under the
title: **Estimate** and **FinOps audit**. The right rail holds the totals, the
contingency and margin fields, and the export action for whichever surface is
active.

---

### 6.7 The FinOps audit surface

Kept, because it is a real offer. Restyled, because it currently looks like a
different company. It reuses every token in §6.1 to §6.5; it introduces no new
font, color, spacing value or radius.

**It is a document, not a panel.** A savings audit is a report a client signs,
so it gets the same paper, folio, rules and signature block as the estimate.
`DocumentShell` owns that chrome; the two variants differ only in body content.

**The model is unchanged.** These five values must compute exactly as they do
today (`SummaryPanel.tsx:49-61`):

| Value | Formula |
|---|---|
| Monthly savings | `monthlySpend × savingsRate` |
| Optimized spend | `monthlySpend − monthlySavings` |
| Annualized savings | `monthlySavings × 12` |
| Contingency fee | `monthlySavings × 3 × 0.5` |
| Client net first year | `annualizedSavings − contingencyFee` |

Defaults stay: `monthlySpend` seeds from recurring cost, else 12500; `savingsRate`
30%.

**What changes visually.** The primary-tinted panel, the emerald "50% contingency
model" badge, the sparkles icon and the Venture #9 pill all go. The fee model
becomes a plain terms block in label style under the totals: "Fee: 50% of the
first three months of savings". The toggle becomes a two-item switch with no
colour except the active underline in `--accent`. Inputs become bordered wells on
`--paper-sunken` with the unit outside the field, as in the estimate.

**What changes structurally.** State and math move out of `SummaryPanel` into a
`finops.ts` module with a `computeAudit(input)` function and its own `node:test`
cases, because this math is money and it is currently untested and inline.

---

## 7. Blocking correctness items

These are small and must ship with the redesign, or it ships a premium-looking
broken product.

1. Fix the two-product split: `/` must persist through the API (S1).
2. Repoint every "Back to dashboard" and post-delete redirect to `/dashboard`
   (S2).
3. Link the dashboard rows to `/projects/[id]`; keep the drawer only as a
   quick-peek (S3).
4. Wire `Export PDF` to the new `/projects/[id]/document` print view (S4, S5).
5. Remove all `dark:` variants and light-mode pastels; one tone only (C1).
6. Replace `window.confirm` with inline confirm (C3).
7. Icons: `lucide-react` is explicitly disallowed by the design system. Migration
   to Phosphor is the correct move but it is a dependency change, which the
   constraints forbid. **Decision: keep `lucide-react` for this pass, standardise
   every icon to 1.5px stroke and 20px size, and record the exception here.**
   Revisit only if the user approves adding `@phosphor-icons/react`.

---

## 8. Left to the builder

- Component file boundaries. `SummaryPanel` (530 lines) splits into
  `EstimateSummary`, `FinOpsAudit`, a shared `DocumentShell`, and a
  `finops.ts` module for the money math.
- Whether the wizard keeps local state or moves to a form library. Either is
  fine; no new dependency.
- Empty, loading and error visuals within the system: skeletons shaped like the
  ledger rows, an empty state that reads as a blank document with one action,
  inline field errors in `--danger`.
- Exact copy for the five questions. Keep the intent, sentence case, no
  exclamation marks.
- Test strategy. At minimum: the wizard persists and routes correctly, the
  ledger totals match the API values, and every interactive element is
  keyboard reachable.

---

## 9. Decisions from builder review

A fresh reviewer read this document against the source and raised nine gaps.
Resolved below. Anything marked **open** is waiting on the user.

| # | Question | Decision |
|---|---|---|
| D1 | What rate and contingency does the wizard write? The five questions only collect names and hours, and `POST /line-items` requires `description`, `category`, `estimated_hours`, `hourly_rate`. | Step 3 gains one **shared hourly rate** field beside hours, prefilled from the last used rate (`localStorage`), falling back to 150. Contingency defaults to 15% and is editable on the document step. Still five questions. The value is visible and editable, so it stops being the hidden constant that made S1 a defect. The rate applies to both line items. |
| D2 | Does every wizard run create a new client? `Client.name` has no unique constraint, so "Acme" twice yields two rows. | Step 1 becomes a combobox: pick an existing client from `getClients()` or type a new one. Creating a client is skipped when one is selected. |
| D3 | Does Cloud FinOps Audit Mode survive? It is a second product inside `SummaryPanel` (about 250 lines, its own print document, "Venture #9", a guarantee panel). | **Kept and restyled, per the user.** It is not a panel inside the estimate summary any more — it becomes a second surface on the project, reachable from a two-item switch on `/projects/[id]`: *Estimate* and *FinOps audit*. It keeps its own math and its own printed document, rebuilt in the Ledger system (§6.7) so one project can produce two artifacts that look like they came from the same firm. The cheapest alternative — leave the component untouched — is rejected because a neon widget inside a paper document is the exact clash this redesign exists to remove. |
| D4 | What does Export PDF produce, and can it run before save? | One printable document shell, `DocumentShell`, with two variants: `estimate` at `/projects/[id]/document` and `audit` at `/projects/[id]/document?variant=audit`. Both render folio, ruled rows, totals and a signature block from the same primitives. The old print block at `SummaryPanel.tsx:87-119` is deleted: it hides `header, nav, aside, button, input, select` globally and forces `.grid` to `display:block`, which breaks any page it runs on. Export is unavailable until the estimate exists. |
| D5 | What is a "total"? Three definitions exist. | One helper `computeTotals(project)` used by every screen and the print document: `base + contingency + profit margin`, recurring items excluded from the one-time total and shown as a separate monthly line. `API_SPEC.md:157-164` is the reference. **Bug to fix:** `dashboard/page.tsx:73-80` applies contingency inside the line-item loop, so it compounds per row and ignores margin entirely. |
| D6 | Is saving on the detail page explicit or automatic? | Explicit `Save estimate`, as today, with a dirty indicator and a disabled state until something changes. The existing `isLocked` rule is kept: non-DRAFT hides add-item and row delete. |
| D7 | Where does the folio come from? `Project` has no number field and the id is a UUID. | Deterministic presentational value: `EST-{createdAt year}-{first 4 of id, uppercased}`. Stable across screen and print, no collision in practice, no API change. Replaces the random per-mount id at `page.tsx:27`. |
| D8 | What opens the drawer if rows navigate? | The drawer is **deleted**. Rows navigate to `/projects/[id]`. This removes the backdrop blur, the dashboard blur (F3) and one of the three `body.overflow` writers (F6). |
| D9 | Does `design-lint` exist, and may dev tooling be added? | It exists at `Insight Scraper/scripts/design-lint.mjs`. Copy to `frontend/scripts/design-lint.mjs`, scanning `frontend/src`. Tests use Node's built-in `node:test` — no dependency added, so the constraint holds and the §8 test requirement is real. |

**Repo conflict to resolve.** `ClearGig/.agent/instructions.md` mandates Lenis,
GSAP, three.js, glassmorphism and a custom cursor — the exact stack this design
deletes. Left alone, the next agent session reintroduces it. It gets rewritten
to defer to this document.

---

## 10. Acceptance

- `node scripts/design-lint.mjs .` exits 0.
- First contentful interaction within 500ms of route settle on the dev machine;
  no long task over 50ms attributable to cursor, canvas or transitions.
- 390px: no horizontal overflow on any of the three routes.
- Tab through the whole estimate flow without touching a mouse.
- Every number right-aligned and `tabular-nums`.
- No file contains `cursor-none`, `blur-3xl`, `scale-[4]`, `bg-gradient`, or
  `dark:`.
- No dependency added; the five removed animation dependencies are gone from
  `package.json`.
- Both document variants print to a single letter page, and the audit document
  shows all five FinOps values from §6.7.
- `finops.ts` has `node:test` cases covering the five formulas, including a zero
  spend and a zero rate.
