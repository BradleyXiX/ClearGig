# ClearGig Ledger Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ClearGig's sci-fi ambience with a paper-and-ink "Ledger" system, so the app reads as contract work and every screen responds instantly.

**Architecture:** Strip three always-on layers (custom cursor, WebGL background, Lenis) and rebuild the three routes plus one print route on a token layer defined once in `globals.css`. Money math and the write sequence leave the components and become four tested modules — `totals`, `finops`, `folio`, `save-estimate` — that every screen and both printable documents consume.

**Tech Stack:** Next.js 16.3.2 (app router), React 19.2.8, TypeScript 5, Tailwind v4 with `@theme inline`, `node:test`, existing `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-11-03-cleargig-ledger-design.md`

**Working directory:** every command in this plan runs from `ClearGig/frontend` unless the step says otherwise. Git commits are made from the repo root path as written, and the branch is `design/ledger`.

## Global Constraints

- Palette (approved 2026-11-03), the only colors allowed: `--paper #F7F4EE`, `--paper-raised #FFFDF8`, `--paper-sunken #EFEBE1`, `--ink #14140F`, `--ink-muted #5C5A52`, `--rule #D9D4C7`, `--rule-strong #B9B2A1`, `--accent #1E4A3C`, `--accent-wash #E7EDE8`, `--danger #8A2B1F`.
- Type: Geist only; Geist Mono for numerals. No italics. No weight above 600. No new fonts.
- Type scale: Tailwind default steps only. No arbitrary sizes.
- Spacing: 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96 only. Main buttons 8px vertical, 12px horizontal.
- Radius: 0 rules/table cells, 2px inputs/buttons/stamps, 4px cards/panels. Nested: `inner = outer − gap`, only above 2.
- Motion: `cubic-bezier(0.22, 1, 0.36, 1)`. 400ms max for movement, 150ms for hover, transform and opacity only. No blur, no scale, no filter animation.
- No background gradients. No glass. No shadow beyond a 1px rule.
- Icons: `lucide-react`, 1.5px stroke, 20px, `currentColor`.
- No new dependencies. Removing `three`, `@react-three/fiber`, `@react-three/drei`, `lenis`, `gsap`, `@gsap/react` is required.
- Tests: `node:test` only, files colocated as `*.test.ts` under `src/lib`.
- Every task ends green: `npx tsc --noEmit`, `npm run build`, `node scripts/design-lint.mjs src`.

## Review Focus

Things the spec implies but no task's tests cover by default. Each now has one test added to its owning task.

| # | Risk | Covered by |
|---|---|---|
| 1 | Abandoned wizard leaving an orphan client — partial write after `createClient` succeeds and `createProject` fails | Task 12, `save-estimate.test.ts` |
| 2 | Recurring line items double counted into the one-time total | Task 2, `totals.test.ts` |
| 3 | Half-hour estimates (`0.5`) rounding inconsistently between screen and printed document | Task 2, `totals.test.ts`; Task 11 prints via the same helper |
| 4 | Print route inheriting the old global print CSS that hides `header, nav, aside, button, input, select` | Task 10 deletes it, Task 5 replaces it with `.no-print` only, Task 11 Step 6 verifies |
| 5 | A light-mode OS rendering a surviving `dark:` class on the paper palette | Task 9 Step 7, Task 14 Step 2 |

---

### Task 1: Lint gate

**Files:**
- Create: `frontend/scripts/design-lint.mjs` (copy from `Insight Scraper/scripts/design-lint.mjs`)
- Modify: `frontend/package.json` — add `"lint:design": "node scripts/design-lint.mjs src"`

**Interfaces:**
- Consumes: nothing
- Produces: `npm run lint:design`, exit 0 clean, exit 1 on violations

- [ ] **Step 1: Copy the script**

```powershell
Copy-Item "..\..\Insight Scraper\scripts\design-lint.mjs" "scripts\design-lint.mjs"
```

- [ ] **Step 2: Add the npm script, then run it**

Run: `node scripts/design-lint.mjs src`
Expected: exit 1, baseline violations listed. Record the error count in the commit message.

- [ ] **Step 3: Commit**

```bash
git add scripts/design-lint.mjs package.json
git commit -m "chore(design): add design-lint gate"
```

---

### Task 2: `totals` module

**Files:**
- Create: `frontend/src/lib/totals.ts`
- Create: `frontend/src/lib/totals.test.ts`
- Modify: `frontend/package.json` — add `"test": "node --test src/lib"`

**Interfaces:**
- Consumes: `Project` and `LineItem` from `src/services/api.ts`
- Produces:

```ts
export interface Totals {
  base: number;
  contingency: number;
  margin: number;
  total: number;
  recurringMonthly: number;
}
export function computeTotals(project: Pick<Project, "lineItems" | "contingencyPercentage" | "profitMargin">): Totals;
```

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/totals.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { computeTotals } from "./totals.ts";
import type { LineItem } from "../services/api.ts";

const item = (over: Partial<LineItem>) => ({
  id: "x", projectId: "p", category: "FRONTEND" as const,
  description: "d", estimatedHours: 10, hourlyRate: 100, isRecurring: false, ...over,
});

test("base includes one-time items and excludes recurring", () => {
  const t = computeTotals({ contingencyPercentage: 10, profitMargin: 20,
    lineItems: [item({}), item({ isRecurring: true, estimatedHours: 5 })] });
  assert.equal(t.base, 1000);
  assert.equal(t.recurringMonthly, 500);
});

test("margin applies to base plus contingency, not to base alone", () => {
  const t = computeTotals({ contingencyPercentage: 10, profitMargin: 20, lineItems: [item({})] });
  assert.equal(t.contingency, 100);
  assert.equal(t.margin, 220);
  assert.equal(t.total, 1320);
});

test("half hours survive without rounding drift", () => {
  const t = computeTotals({ contingencyPercentage: 0, profitMargin: 0,
    lineItems: [item({ estimatedHours: 0.5, hourlyRate: 150 })] });
  assert.equal(t.total, 75);
});

test("empty project is all zeros", () => {
  const t = computeTotals({ contingencyPercentage: 15, profitMargin: 10, lineItems: [] });
  assert.deepEqual(t, { base: 0, contingency: 0, margin: 0, total: 0, recurringMonthly: 0 });
});
```

- [ ] **Step 2: Run it**

Run: `npm test`
Expected: FAIL, cannot find module `./totals.ts`

> **Runtime note.** Node 26 is installed, so `node --test` strips TypeScript natively. Two rules follow and apply to every `*.test.ts` in this plan: relative imports must carry the `.ts` extension, and type-only imports must use `import type` (a plain `import { LineItem }` would survive stripping as a runtime binding and fail).

- [ ] **Step 3: Implement `computeTotals` to the four assertions above**

Signature and field names exactly as the Interfaces block. No rounding inside the module; format at render.

- [ ] **Step 4: Run it**

Run: `npm test`
Expected: PASS, 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/totals.ts src/lib/totals.test.ts package.json
git commit -m "feat(lib): add computeTotals with tests"
```

---

### Task 3: `finops` module

**Files:**
- Create: `frontend/src/lib/finops.ts`
- Create: `frontend/src/lib/finops.test.ts`

**Interfaces:**
- Produces:

```ts
export interface AuditInput { monthlySpend: number; savingsRate: number }
export interface AuditResult {
  monthlySavings: number; optimizedSpend: number;
  annualizedSavings: number; contingencyFee: number; clientNetSavings: number;
}
export function computeAudit(input: AuditInput): AuditResult;
```

- [ ] **Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { computeAudit } from "./finops.ts";

test("reference case: 12500 at 30%", () => {
  assert.deepEqual(computeAudit({ monthlySpend: 12500, savingsRate: 30 }), {
    monthlySavings: 3750, optimizedSpend: 8750, annualizedSavings: 45000,
    contingencyFee: 5625, clientNetSavings: 39375,
  });
});

test("zero spend yields zeros, not NaN", () => {
  assert.deepEqual(computeAudit({ monthlySpend: 0, savingsRate: 30 }),
    { monthlySavings: 0, optimizedSpend: 0, annualizedSavings: 0, contingencyFee: 0, clientNetSavings: 0 });
});

test("zero rate yields zero savings and full spend retained", () => {
  const r = computeAudit({ monthlySpend: 1000, savingsRate: 0 });
  assert.equal(r.monthlySavings, 0);
  assert.equal(r.optimizedSpend, 1000);
});
```

- [ ] **Step 2: Run** `npm test` — expect FAIL, module missing
- [ ] **Step 3: Implement** the five formulas from spec §6.7
- [ ] **Step 4: Run** `npm test` — expect PASS
- [ ] **Step 5: Commit** `feat(lib): add computeAudit with tests`

---

### Task 4: `folio` module

**Files:**
- Create: `frontend/src/lib/folio.ts`
- Create: `frontend/src/lib/folio.test.ts`

**Interfaces:**
- Produces: `export function folio(project: Pick<Project, "id" | "createdAt">): string`

- [ ] **Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { folio } from "./folio.ts";

test("derives year and four-character reference", () => {
  assert.equal(folio({ id: "4f2a9c11-0000-4000-8000-000000000000", createdAt: "2026-03-08T10:00:00Z" }),
    "EST-2026-4F2A");
});

test("is stable across calls", () => {
  const p = { id: "abcd1234-0000-4000-8000-000000000000", createdAt: "2025-12-31T23:00:00Z" };
  assert.equal(folio(p), folio(p));
});

test("uses the UTC year, not the local one", () => {
  assert.equal(folio({ id: "abcd1234-0000-4000-8000-000000000000", createdAt: "2025-12-31T23:00:00Z" }),
    "EST-2025-ABCD");
});
```

- [ ] **Step 2: Run** `npm test` — FAIL
- [ ] **Step 3: Implement** — `project.id.slice(0, 4).toUpperCase()` and `new Date(project.createdAt).getUTCFullYear()`. A local-time `getFullYear()` renders a different folio on the document than on screen for anyone east of UTC near New Year, so UTC is required, not stylistic.
- [ ] **Step 4: Run** `npm test` — PASS
- [ ] **Step 5: Commit** `feat(lib): add deterministic folio`

---

### Task 5: Token layer

**Files:**
- Modify: `frontend/src/app/globals.css` (replace `:root`, `@theme inline`, `.glass`; delete the dark scrollbar block)
- Delete: nothing else

**Interfaces:**
- Consumes: nothing
- Produces: Tailwind utilities `bg-paper`, `bg-paper-raised`, `bg-paper-sunken`, `text-ink`, `text-ink-muted`, `border-rule`, `border-rule-strong`, `bg-accent`, `text-accent`, `bg-accent-wash`, `text-danger`, plus `--radius-card: 4px`, `--radius-control: 2px`, `--ease-ledger`.

- [ ] **Step 1: Replace the token blocks** with the ten palette values from Global Constraints, mapped in `@theme inline` under the names listed above. Keep `@import "tailwindcss";` at the top. Also map `--radius-control: 2px` and `--radius-card: 4px` so components can use `rounded-control` and `rounded-card`; `rounded-[2px]` is an arbitrary value and the lint gate rejects it.
- [ ] **Step 2: Delete `.glass`** and every rule referencing blur or gradient.
- [ ] **Step 3: Add the print base** — `@page { size: letter portrait; margin: 18mm }` and `@media print { .no-print { display: none } }`. Nothing else; no global element hiding.
- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: PASS. Run `node scripts/design-lint.mjs src`. `globals.css` is the sanctioned home for raw palette values — the script exempts files named `globals`, `theme` or `tokens` from `hardcoded-hex` and `arbitrary-value` (`design-lint.mjs:70,76`), so the ten hex values belong here and nowhere else. Confirm instead that `hardcoded-hex` fires in **no other file**.

- [ ] **Step 5: Commit** `feat(ui): add Ledger token layer`

---

### Task 6: UI primitives

**Files:**
- Create: `frontend/src/components/ui/Button.tsx`
- Create: `frontend/src/components/ui/Field.tsx`
- Create: `frontend/src/components/ui/Stamp.tsx`
- Create: `frontend/src/components/ui/Rule.tsx`
- Create: `frontend/src/components/ui/Panel.tsx`

**Interfaces:**
- Produces:

```ts
type ButtonProps = { variant?: "primary" | "secondary" | "quiet" | "danger"; size?: "md" | "sm" } & React.ButtonHTMLAttributes<HTMLButtonElement>;
type FieldProps = { label: string; hint?: string; error?: string; suffix?: string } & React.InputHTMLAttributes<HTMLInputElement>;
type StampProps = { status: Project["status"] };
```

`Stamp` renders a 1px `--rule-strong` rectangle with label-style type: ACCEPTED `--accent`, DRAFT `--ink-muted`, SENT `--ink`, REJECTED `--danger`. No pill radius, no fill.

`Button` variants — exactly four, no more may be added without editing this table:

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| `primary` | `--accent` | `--paper-raised` | none | One per screen: New estimate, Save, Export |
| `secondary` | transparent | `--ink` | 1px `--rule-strong` | Cancel, Back, secondary actions |
| `quiet` | transparent | `--ink-muted` | none | Tertiary and inline row actions |
| `danger` | transparent | `--danger` | 1px `--danger` | Delete confirm only, never as the default action |

Sizes: `md` is `px-3 py-2 text-sm font-semibold` (8px vertical, 12px horizontal per Global Constraints), `sm` is `px-2 py-1 text-sm font-medium`. Radius `2px` both. Hover changes color only, 150ms. Disabled is `opacity-50` with `cursor-not-allowed` and no hover change. No `hover:scale-*` on any variant.

- [ ] **Step 1: Implement the five primitives** using only tokens, against the variant table above. Every button gets `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`.
- [ ] **Step 2: Verify** `npx tsc --noEmit` and `npm run build`.
- [ ] **Step 3: Commit** `feat(ui): add Ledger primitives`

---

### Task 7: Strip the ambience

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Delete: `frontend/src/components/CustomCursor.tsx`, `Background3D.tsx`, `LenisProvider.tsx`
- Modify: `frontend/package.json` — remove `three`, `@react-three/fiber`, `@react-three/drei`, `lenis`, `gsap`, `@gsap/react`

**Interfaces:**
- Produces: `<BrandBar />` in the shell; `layout.tsx` exports the same `metadata`.

- [ ] **Step 1: Rewrite `layout.tsx`** — `<html>` with Geist variables, `<body className="min-h-dvh bg-paper text-ink">`, `<BrandBar />`, `<main>{children}</main>`. No `cursor-none`, no canvas, no provider.
- [ ] **Step 2: Create `src/components/BrandBar.tsx`** — wordmark left, "New estimate" primary button right, nothing floating. Current route marked with `--accent` underline via `usePathname`.
- [ ] **Step 3: Delete the three components and the six dependencies**, then `npm install`.
- [ ] **Step 4: Verify**

```powershell
Select-String -Path src\**\*.tsx,src\**\*.css -Pattern "cursor-none|Lenis|three|gsap|blur-3xl|scale-\[4\]"
```
Expected: no matches. Then `npm run build` PASS.

- [ ] **Step 5: Commit** `refactor(ui): remove cursor, canvas and smooth scroll`

---

### Task 8: Dashboard as the estimates ledger

**Files:**
- Modify: `frontend/src/app/dashboard/page.tsx` (rewrite, target under 160 lines)
- Delete: `frontend/src/components/ProjectCard.tsx` if unused after the rewrite

**Interfaces:**
- Consumes: `computeTotals`, `Stamp`
- Produces: route `/dashboard` — the app home

- [ ] **Step 1: Rewrite the page** as a `Rule`-separated ledger: columns Description | Client | Status | Total | Updated. Row height 48px, numerals `font-mono tabular-nums`. Row click `router.push('/projects/' + p.id)`.
- [ ] **Step 2: Replace the drawer entirely** — delete `renderProjectDetails`, the backdrop, the blur and the `body.overflow` effect.
- [ ] **Step 3: Client totals rail** — a plain table using `computeTotals` per project, summing by client. This fixes the compounding bug; delete the old `rev += rev * (p.contingencyPercentage / 100)` loop.
- [ ] **Step 4: Loading state** — six skeleton rows at 48px with `bg-paper-sunken`, no spinner, no "Loading...".
- [ ] **Step 5: Verify** `npm run build`, `npm run lint:design`.
- [ ] **Step 6: Commit** `feat(dashboard): rebuild as estimates ledger`

---

### Task 9: Estimate detail page

**Files:**
- Modify: `frontend/src/app/projects/[id]/page.tsx`
- Create: `frontend/src/components/EstimateSummary.tsx`
- Modify: `frontend/src/components/LineItemTable.tsx` (rename visually to the ruled ledger; keep the filename)

**Interfaces:**
- Consumes: `computeTotals`, `folio`, `Stamp`, primitives
- Produces: `EstimateSummary({ totals, contingencyPercentage, profitMargin, onExport })`

- [ ] **Step 1: Two-column layout** — ledger and add-item form left, summary rail right. Max width 1280px.
- [ ] **Step 2: Replace both range sliders** with `Field` numeric inputs showing the unit outside the field, `step="1"`, `min="0"`, `max="100"`.
- [ ] **Step 3: Replace the status `<select>`** with `<Stamp>` plus a menu.
- [ ] **Step 4: Inline delete confirm** — the row's delete button becomes a two-step inline confirm. Delete `window.confirm`.
- [ ] **Step 5: Save semantics** — explicit Save, disabled until dirty, `isLocked` keeps hiding add-item and row delete.
- [ ] **Step 6: Add a two-item switch** under the title: Estimate | FinOps audit. This task wires only the Estimate branch, rendering `EstimateSummary`. The audit tab renders `disabled` with `aria-disabled` and no handler until Task 10 creates `FinOpsAudit`; this keeps `npm run build` green at the end of this task instead of depending on a file that does not exist yet.
- [ ] **Step 7: Remove every `dark:` class and light-mode pastel** in this file and in `LineItemTable.tsx`.
- [ ] **Step 8: Verify** `npm run build`, `npm run lint:design`; grep for `dark:` returns nothing.
- [ ] **Step 9: Commit** `feat(project): rebuild estimate detail`

---

### Task 10: FinOps audit surface

**Files:**
- Create: `frontend/src/components/FinOpsAudit.tsx`
- **Delete:** `frontend/src/components/SummaryPanel.tsx`

`SummaryPanel.tsx` is not refactored, it is **deleted in full**. Its estimate half
is already replaced by `EstimateSummary.tsx` from Task 9; its FinOps half is
replaced by `FinOpsAudit.tsx` below. Nothing imports `SummaryPanel` after Task 9
lands, so the delete is the last step and the build must pass without it.

**Interfaces:**
- Consumes: `computeAudit`, primitives
- Produces: `FinOpsAudit({ defaultMonthlySpend }: { defaultMonthlySpend: number })`

- [ ] **Step 1: Build the surface** with two `Field` inputs (monthly spend, target rate), a five-row ruled results table, and a terms block reading "Fee: 50% of the first three months of savings".
- [ ] **Step 2: No badge, no sparkles, no primary-tinted panel, no Venture #9 pill.** Accent appears only on the net-savings figure.
- [ ] **Step 3: Delete `SummaryPanel.tsx`.** Its print block (`SummaryPanel.tsx:87-119`), the `isFinOpsMode` toggle, the Venture #9 strings and the guarantee panel go with the file. Also delete every `@media print` rule living inside a component; print styling belongs to `globals.css` and Task 11 only.
- [ ] **Step 4: Prove the file is unreferenced** — `Select-String -Path src\**\*.tsx -Pattern "SummaryPanel"` returns no matches, then `npm run build` passes without the file.
- [ ] **Step 5: Verify** `npm test` (finops cases pass), `npm run build`, `npm run lint:design`.
- [ ] **Step 6: Commit** `feat(finops): rebuild audit surface and delete SummaryPanel`

---

### Task 11: Printable documents

**Files:**
- Create: `frontend/src/components/DocumentShell.tsx`
- Create: `frontend/src/app/projects/[id]/document/page.tsx`
- Create: `frontend/src/components/DocumentEstimate.tsx`
- Create: `frontend/src/components/DocumentAudit.tsx`

**Interfaces:**
- Consumes: `computeTotals`, `computeAudit`, `folio`, `api.getProjectById`
- Produces: `/projects/[id]/document` and `/projects/[id]/document?variant=audit`; `DocumentShell({ folioNumber, title, clientName, children })`

- [ ] **Step 1: `DocumentShell`** — folio and date top right in label style, title and client left, children body, 192px rule plus "Authorized signature" at the bottom. The prop is `folioNumber`, deliberately not `folio`, so it does not shadow the `folio()` helper imported into the same tree.
- [ ] **Step 2: The route fetches its own data** — `api.getProjectById(id)`, guarded like the detail page. While loading, render the shell with ruled skeleton rows; on 404 render "This estimate does not exist." with a link to `/dashboard`. No `window.print()` anywhere in this step.
- [ ] **Step 3: `DocumentEstimate`** — ruled line items, `--rule-strong` above totals, total `text-5xl` `--accent`.
- [ ] **Step 4: `DocumentAudit`** — the five FinOps values, the terms block. Monthly spend seeds from the project's recurring total, else 12500, matching the spec default.
- [ ] **Step 5: `?variant=audit`** selects `DocumentAudit`; default is `DocumentEstimate`. Unknown variant falls back to estimate.
- [ ] **Step 6: `onExport` opens the document route in a new tab.** The document page renders the artifact plus a visible `Print` button (`variant="primary"`, class `no-print`) that calls `window.print()`. **Nothing auto-prints on mount** — a `useEffect(() => window.print())` is explicitly forbidden, because it fires the OS dialog before the client has read the document and it double-fires under React 19 StrictMode in dev. The user reads, then prints.
- [ ] **Step 7: Verify print** — in the browser, print preview at Letter shows one page, no nav, no buttons, all five audit values.
- [ ] **Step 8: Commit** `feat(document): add printable estimate and audit`

---

### Task 12: Wizard

**Files:**
- Create: `frontend/src/lib/save-estimate.ts`
- Create: `frontend/src/lib/save-estimate.test.ts`
- Modify: `frontend/src/app/page.tsx` (rewrite, target under 220 lines)

**Interfaces:**
- Consumes: `api.createClient`, `api.createProject`, `api.addLineItem`, `api.getClients`, primitives
- Produces:

```ts
export interface EstimateDraft {
  clientId?: string;      // set when an existing client was picked
  clientName: string;
  title: string;
  frontendHours: number;
  backendHours: number;
  hourlyRate: number;
  contingencyPercentage: number;
  profitMargin: number;
}

export interface SaveDeps {
  createClient: (name: string) => Promise<{ id: string }>;
  createProject: (input: { clientId: string; title: string; contingencyPercentage: number; profitMargin: number }) => Promise<{ id: string }>;
  addLineItem: (projectId: string, input: { category: "FRONTEND" | "BACKEND"; description: string; estimatedHours: number; hourlyRate: number; isRecurring: boolean }) => Promise<unknown>;
}

export interface SaveResult { projectId: string; clientId: string; clientCreated: boolean }

export class SaveEstimateError extends Error {
  clientId?: string;      // present when the client was created before the failure
  clientName?: string;
}

export function saveEstimate(draft: EstimateDraft, deps: SaveDeps): Promise<SaveResult>;
```

Two rules the module enforces so they cannot be skipped in the component:
- A category with `0` hours is **not** written as a line item. A zero row would print as `$0` on the document. Both zero is an error.
- If `createProject` throws after a client was created, the rejection is a `SaveEstimateError` carrying `clientId` and `clientName`, so the wizard can name the orphaned client instead of losing it.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/save-estimate.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { saveEstimate, SaveEstimateError } from "./save-estimate.ts";
import type { EstimateDraft, SaveDeps } from "./save-estimate.ts";

const draft = (over: Partial<EstimateDraft> = {}): EstimateDraft => ({
  clientName: "Acme", title: "Portal", frontendHours: 10, backendHours: 5,
  hourlyRate: 150, contingencyPercentage: 15, profitMargin: 0, ...over,
});

function deps(over: Partial<SaveDeps> = {}) {
  const calls: string[] = [];
  const d: SaveDeps = {
    createClient: async (name) => { calls.push("client:" + name); return { id: "c1" }; },
    createProject: async (input) => { calls.push("project:" + input.clientId); return { id: "p1" }; },
    addLineItem: async (pid, input) => { calls.push("item:" + input.category); return {}; },
    ...over,
  };
  return { d, calls };
}

test("existing client is reused, not recreated", async () => {
  const { d, calls } = deps();
  const r = await saveEstimate(draft({ clientId: "existing" }), d);
  assert.equal(r.clientCreated, false);
  assert.equal(r.clientId, "existing");
  assert.deepEqual(calls, ["project:existing", "item:FRONTEND", "item:BACKEND"]);
});

test("new client is created once and used by the project", async () => {
  const { d, calls } = deps();
  const r = await saveEstimate(draft(), d);
  assert.equal(r.clientCreated, true);
  assert.equal(r.clientId, "c1");
  assert.deepEqual(calls, ["client:Acme", "project:c1", "item:FRONTEND", "item:BACKEND"]);
});

test("both line items carry the shared rate", async () => {
  const seen: number[] = [];
  const { d } = deps({ addLineItem: async (_p, input) => { seen.push(input.hourlyRate); return {}; } });
  await saveEstimate(draft({ hourlyRate: 175 }), d);
  assert.deepEqual(seen, [175, 175]);
});

test("a zero-hour category writes no line item", async () => {
  const { d, calls } = deps();
  await saveEstimate(draft({ frontendHours: 0 }), d);
  assert.deepEqual(calls, ["client:Acme", "project:c1", "item:BACKEND"]);
});

test("both zero hours is rejected before any write", async () => {
  const { d, calls } = deps();
  await assert.rejects(() => saveEstimate(draft({ frontendHours: 0, backendHours: 0 }), d));
  assert.deepEqual(calls, []);
});

test("project failure names the orphaned client", async () => {
  const { d } = deps({ createProject: async () => { throw new Error("500"); } });
  await assert.rejects(() => saveEstimate(draft(), d), (err: unknown) => {
    assert.ok(err instanceof SaveEstimateError);
    assert.equal(err.clientId, "c1");
    assert.equal(err.clientName, "Acme");
    assert.match(err.message, /Acme/);
    return true;
  });
});

test("project failure with an existing client orphans nothing", async () => {
  const { d } = deps({ createProject: async () => { throw new Error("500"); } });
  await assert.rejects(() => saveEstimate(draft({ clientId: "existing" }), d),
    (err: unknown) => err instanceof SaveEstimateError && err.clientId === undefined);
});
```

- [ ] **Step 2: Run** `npm test` — expect FAIL, module missing
- [ ] **Step 3: Implement** `saveEstimate` to the seven assertions. It takes deps as a parameter; it does **not** import `api` directly, so the test needs no mocking library.
- [ ] **Step 4: Run** `npm test` — expect PASS, 7 tests
- [ ] **Step 5: Commit** `feat(lib): add saveEstimate with orphan-client coverage`
- [ ] **Step 6: Rewrite the wizard as five steps, one column** — client, title, hours plus shared rate, review, saved document. No absolute positioning, no `scale`, no `blur`, no `overflow: hidden`. Progress rule across the top reading "1 of 5".
- [ ] **Step 7: Step 1 is a combobox** — existing clients from `getClients()` or a new name. Selecting an existing client sets `clientId` and skips `createClient`.
- [ ] **Step 8: Rate field** on step 3, prefilled from `localStorage.getItem("cleargig.rate") ?? "150"`, written back on save.
- [ ] **Step 9: Persist by calling `saveEstimate`.** Wire `deps` with three adapters — the real API uses objects and snake_case, and `save-estimate` uses positional/named arguments:

```ts
const deps: SaveDeps = {
  createClient: (name) => api.createClient({ name }),
  createProject: (i) => api.createProject({
    client_id: i.clientId,
    title: i.title,
    contingency_percentage: i.contingencyPercentage,
    profit_margin: i.profitMargin,
  }),
  addLineItem: (projectId, i) => api.addLineItem(projectId, {
    category: i.category,
    description: i.description,
    estimated_hours: i.estimatedHours,
    hourly_rate: i.hourlyRate,
    is_recurring: i.isRecurring,
  }),
};
```

Pass `contingencyPercentage: 15` and `profitMargin: 0`. On success `router.push('/projects/' + projectId)`. `tsc` catches it if the adapters are skipped and the raw `api` methods are wired instead, because the signatures differ.

- [ ] **Step 10: Failure handling** — catch `SaveEstimateError` and render its message inline in `--danger`. If it carries a `clientId`, the message must name the client and state that the client was saved but the estimate was not.
- [ ] **Step 11: Keyboard** — Enter advances, Shift+Enter goes back, Escape returns to `/dashboard` after confirm when dirty.
- [ ] **Step 12: Delete** the fake `invoiceId`, the `scanner-line`, and the dead Export button on this page.
- [ ] **Step 13: Verify** — create an estimate end to end against the local API; confirm it appears on `/dashboard` and opens at `/projects/[id]`. Then create a second estimate for the same client and confirm no duplicate client row appears on `/dashboard`.
- [ ] **Step 14: Commit** `feat(wizard): persist estimates through the API`

---

### Task 13: Navigation and repo instructions

**Files:**
- Modify: `frontend/src/app/projects/[id]/page.tsx` — every `href="/"` and every `router.push('/')` becomes `/dashboard`
- Rewrite: `ClearGig/.agent/instructions.md`

- [ ] **Step 1: Repoint redirects** — "Back to dashboard", the not-found link, and post-delete all target `/dashboard`.
- [ ] **Step 2: Rewrite `.agent/instructions.md`** to state that the Ledger spec at `docs/superpowers/specs/2026-11-03-cleargig-ledger-design.md` is authoritative, and that Lenis, GSAP, three.js, glassmorphism and the custom cursor are explicitly out of scope. Remove the `npm install gsap` instruction.
- [ ] **Step 3: Verify** — grep for `href="/"` in `src/app/projects` returns nothing.
- [ ] **Step 4: Commit** `fix(nav): point redirects at the dashboard`

---

### Task 14: Acceptance run

**Files:** none

- [ ] **Step 1: Gates**

```powershell
npx tsc --noEmit
npm test
npm run build
npm run lint:design
```
Expected: all exit 0.

- [ ] **Step 2: Grep the forbidden strings**

```powershell
Select-String -Path src\**\*.tsx,src\**\*.css -Pattern "cursor-none|blur-3xl|scale-\[4\]|bg-gradient|dark:|transition-all|ease-in-out"
```
Expected: no matches.

- [ ] **Step 3: Responsive check** at 390×844 on `/`, `/dashboard`, `/projects/[id]`, `/projects/[id]/document` — no horizontal overflow, primary action above the fold.
- [ ] **Step 4: Keyboard check** — complete an estimate without a mouse; every focus stop visible.
- [ ] **Step 5: Print check** — both document variants, one Letter page each.
- [ ] **Step 6: Record the run** — tick the boxes in this plan file and commit it. The acceptance run changes no source code, so there is nothing else to commit; an `--allow-empty` commit is not the goal.

```bash
git add docs/superpowers/plans/2026-11-03-cleargig-ledger.md
git commit -m "chore: record Ledger acceptance run"
```

---

## Deploy safety

`render.yaml` has no `branch:` key, so the backend and frontend Render services deploy from `main` only. Vercel produces preview deployments per branch, which is what `design/ledger` will get. Nothing in this plan reaches production until the branch is merged into `main`, so the live site is unaffected while the redesign is in progress.

## Handoff

When Task 14 is green, the branch is ready for review. Two things stay out of scope by decision, and should not be "fixed" during review: `lucide-react` stays (spec §7, item 7), and the wizard stays at five steps with one shared rate (spec §9, D1).
