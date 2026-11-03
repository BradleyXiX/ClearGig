# ClearGig — Ledger Prompt Pack

Ten Antigravity sessions, in order. One deliverable each. Copy-paste; do not skip A1.

**The plan is the source of truth, not this file.** Every session tells the agent to
read its task from
`docs/superpowers/plans/2026-11-03-cleargig-ledger.md` before it touches code, then
quote the task's `Interfaces` block back to you as proof it read it. That keeps the
pack short and prevents the two documents drifting apart. If a session and the plan
disagree, the plan wins — say so and stop.

Why ten sessions: Antigravity sessions are stateless and drift. A session that
starts at Task 1 and ends at Task 12 will invent spacing values around Task 5 and
forget the delete list by Task 10. One task group per session keeps the constraints
in attention and the diff reviewable.

**Design decisions are already made.** Do not re-diagnose, do not re-choose values,
do not propose a different direction. The spec at
`docs/superpowers/specs/2026-11-03-cleargig-ledger-design.md` is approved, including
the paper palette.

---

## A0 — Branch check (terminal, not Antigravity)

```powershell
cd "C:\Users\Admin\OneDrive\Desktop\Source Code\ClearGig"
git status --short
git branch --show-current
```

Expect: clean tree, `design/ledger`. The branch and both docs already exist
(`e91aea8`, `0e9bf9e`, `b65c447`). If the tree is dirty, commit or stash before A1 —
every session below assumes it can commit what it changed and nothing else.

Do **not** run `git checkout main`. Render deploys `main` only, and this branch is
what keeps the redesign off production.

---

## PREAMBLE — paste at the top of every session A1–A10

```text
Repo: C:\Users\Admin\OneDrive\Desktop\Source Code\ClearGig
Work in: frontend/
Branch: design/ledger  (never switch to main, never push, never merge)

Before writing any code:
1. Read docs/superpowers/plans/2026-11-03-cleargig-ledger.md
2. Read only the task(s) named below. Read the spec file sections it cites.
3. Reply with the task's Interfaces block quoted verbatim, then wait for nothing —
   proceed. This proves you read it instead of guessing.

The plan is authoritative. If you think it is wrong, stop and say why. Do not
improvise a different design, a different file layout, or a different number.

Approved palette — the ONLY colors allowed. Paper/ink, replacing the dark set:
  --paper #F7F4EE      --paper-raised #FFFDF8   --paper-sunken #EFEBE1
  --ink #14140F        --ink-muted #5C5A52      --rule #D9D4C7
  --rule-strong #B9B2A1                         --accent #1E4A3C
  --accent-wash #E7EDE8                         --danger #8A2B1F
These ten hex values live in frontend/src/app/globals.css and nowhere else. Never
inline a hex in a component.

Hard rules:
- No new dependencies. Removing three, @react-three/fiber, @react-three/drei,
  lenis, gsap, @gsap/react is required (Task 7). Adding anything is a failure.
- Icons stay lucide-react, 1.5px stroke, 20px. This is a recorded exception to
  the design system, not an oversight. Do not migrate to Phosphor.
- No background gradients, no glass, no blur, no shadow beyond a 1px rule.
- No italics. No font weight above 600. No arbitrary Tailwind values
  (text-[..], rounded-[..], p-[..]) — the lint gate rejects them.
- Motion: cubic-bezier(0.22, 1, 0.36, 1), 400ms max, transform and opacity only.
- Do not refactor logic, rename files, or change the API contract in
  frontend/src/services/api.ts.

Skills:
- Do NOT load frontend-design or impeccable. They contradict the approved values.
- landing-page-design may be loaded for its type and spacing scales only. Its
  dark-background palette does NOT apply here; the ten values above override it.
- Do not re-run the redesign diagnosis. It is done, and its findings are in the
  spec's §2.

Gate, run before you claim the session is done:
  npx tsc --noEmit
  npm test
  npm run build
  npm run lint:design
All four must exit 0. Paste the real output. A passing claim without output is
a failed session.

Commits: conventional commits, one per task, as the plan specifies. `git add`
named paths only — never `git add -A`, because the repo lives under OneDrive and
picks up stray files.

Stop when the named deliverable is done. Do not start the next task.
```

---

## A1 — Deterministic gate

```text
<preamble>

Task 1 from the plan. Deliverable: `npm run lint:design` exists and runs.

- Copy design-lint.mjs from "C:\Users\Admin\OneDrive\Desktop\Source Code\Insight Scraper\scripts\design-lint.mjs"
  to frontend/scripts/design-lint.mjs. Do not modify the script.
- Add "lint:design": "node scripts/design-lint.mjs src" to frontend/package.json.
- Run it. It will exit 1. Paste the full output and record the error/warning counts
  in the commit message. That baseline is what later sessions are measured against.

Note for later: the script exempts files named globals/theme/tokens from the
hardcoded-hex and arbitrary-value rules, so the palette belongs in globals.css and
components must use rounded-control / rounded-card, never rounded-[2px].

Stop after the script runs and is committed.
```

---

## A2 — Money math (three modules, test-first)

```text
<preamble>

Tasks 2, 3, 4 from the plan. Deliverable: totals, finops and folio exist, with 10
passing node:test cases (4 + 3 + 3), and `npm test` is wired.

- Add "test": "node --test src/lib" to package.json.
- Work test-first in the order the plan gives. Write the test, run it, watch it fail,
  then implement. Do not write implementation and test in the same step.
- Node 26 strips TypeScript natively. Relative imports in tests must carry the .ts
  extension; type-only imports must use `import type`.
- Do not import React or services/api into these modules. Put the type imports
  under `import type`.

Copy the test bodies from the plan verbatim. If an assertion is wrong, stop and
tell me — do not adjust the expected value to match your implementation.

Stop when all three modules pass and are committed.
```

---

## A3 — Tokens and primitives

```text
<preamble>

Tasks 5 and 6 from the plan. Deliverable: the token layer plus five primitives.

- Task 5: replace the dark token blocks in frontend/src/app/globals.css with the ten
  approved values in Tailwind v4 `@theme inline`, mapped to the utility names the plan
  lists. Add --radius-control, --radius-card and --ease-ledger. Delete `.glass` and
  every blur/gradient rule. Add only the print base the plan specifies.
- Task 6: create Button, Field, Stamp, Rule, Panel under src/components/ui/.
  Button has exactly four variants — use the table in the plan. Do not add a fifth.
  Every button gets focus-visible:outline-2 outline-offset-2 outline-accent.

Nothing may import these yet. Do not restyle a route in this session — the screens
still reference the old dark tokens and will look broken until A5–A7. That is
expected; the build must still pass, and the screens will look wrong until the
routes are rebuilt. Do not try to fix them here.

Stop when the build is green and both tasks are committed.
```

---

## A4 — Remove the ambience

```text
<preamble>

Task 7 from the plan. Deliverable: no custom cursor, no WebGL canvas, no smooth
scroll, no animation dependencies.

- Rewrite frontend/src/app/layout.tsx: Geist variables, body
  `min-h-dvh bg-paper text-ink`, a BrandBar, main. No cursor-none, no canvas, no
  provider, no overflow effect.
- Create src/components/BrandBar.tsx: wordmark left, "New estimate" primary button
  right, active route marked with an --accent underline via usePathname. Nothing
  floating, no glass.
- Delete CustomCursor.tsx, Background3D.tsx, LenisProvider.tsx.
- Remove the six dependencies from package.json and run `npm install`.

Then prove it: grep src for cursor-none, Lenis, three, gsap, blur-3xl, scale-[4].
No matches. Paste that output with the build result.

This is the session that should make the app feel fast. If anything still animates
on route change, you did not finish.

Stop after the commit.
```

---

## A5 — Dashboard

```text
<preamble>

Task 8 from the plan. Deliverable: /dashboard is the estimates ledger and the app
home.

- Rewrite the page. Columns: Description | Client | Status | Total | Updated.
  Row height 48px, numerals font-mono tabular-nums, hairlines between rows.
  Row click navigates to /projects/[id].
- Delete the drawer completely: renderProjectDetails, the backdrop, the dashboard
  blur, and the body.overflow effect. Rows navigate; there is no peek panel.
- Client totals rail: recompute with computeTotals per project, then sum by client.
  Delete the old loop that applied contingency inside the line-item loop — it
  compounds per row and ignores margin. This is a real bug fix, not a refactor.
- Loading state: six skeleton rows at 48px in bg-paper-sunken. No spinner, no
  "Loading..." text.

Delete ProjectCard.tsx if nothing imports it after the rewrite.

Stop after the commit.
```

---

## A6 — Estimate detail

```text
<preamble>

Task 9 from the plan. Deliverable: /projects/[id] rebuilt in Ledger.

- Two columns: add-item form and ledger left, summary rail right, 1280px max.
- Create src/components/EstimateSummary.tsx. SummaryPanel still exists and is NOT
  yours to delete — that is A7. Import nothing from it.
- Replace both range sliders with numeric Fields, unit outside the field.
- Replace the status select with a Stamp plus a menu.
- Delete window.confirm (projects/[id]/page.tsx around line 104). Row delete becomes
  a two-step inline confirm.
- Explicit Save, disabled until dirty. Keep isLocked: non-DRAFT hides add-item and
  row delete.
- Add the Estimate | FinOps audit switch under the title. Only the Estimate branch is
  wired in this session. The audit tab is `aria-disabled` with no handler, because
  FinOpsAudit does not exist until A7. Do not create a stub for it.
- Rewrite LineItemTable as the ruled ledger and remove every `dark:` class and
  light-mode pastel in it and in the detail page.

Stop after the commit. The audit tab being dead is expected and is fixed next.
```

---

## A7 — FinOps audit surface

```text
<preamble>

Task 10 from the plan. Deliverable: the cloud audit surface, and SummaryPanel gone.

- Create src/components/FinOpsAudit.tsx using computeAudit from src/lib/finops.ts.
  Two Fields (monthly spend, target rate), a five-row ruled results table, and a
  terms block: "Fee: 50% of the first three months of savings".
- No badge, no sparkles, no primary-tinted panel, no "Venture #9" pill. Accent
  appears only on the net-savings figure.
- Enable the audit tab from A6.
- Delete frontend/src/components/SummaryPanel.tsx in full. It has two halves: the
  estimate half is already replaced by EstimateSummary, the FinOps half by
  FinOpsAudit. Nothing should import it.
- Delete every @media print rule living inside a component, including the block at
  the old SummaryPanel.tsx:87-119. That block hides header, nav, aside, button,
  input, select globally and forces .grid to display:block — it would break printing
  on every route. Print styling belongs in globals.css only.

Prove the deletion: grep src for SummaryPanel returns nothing, and the build passes
without the file.

Do not change the five FinOps formulas or their defaults (12500 spend, 30% rate).
They are covered by tests in src/lib/finops.test.ts. If a test fails, the test wins.

Stop after the commit.
```

---

## A8 — Printable documents

```text
<preamble>

Task 11 from the plan. Deliverable: /projects/[id]/document with two variants.

- Create DocumentShell, DocumentEstimate and DocumentAudit.
- The route fetches its own data with api.getProjectById(id). Loading renders ruled
  skeleton rows inside the shell; 404 renders "This estimate does not exist." with a
  link to /dashboard.
- /projects/[id]/document?variant=audit selects the audit document; default and
  unknown variants render the estimate.
- Both variants: folio and date top right in label style, title and client left, a
  192px rule and "Authorized signature" at the bottom.
- The page shows a visible Print button (variant primary, class no-print) calling
  window.print(). Nothing auto-prints on mount — no useEffect calling window.print().

Verify in the browser: print preview at Letter, one page, no nav, no buttons, and all
five audit values present. Paste what you observed.

Stop after the commit.
```

---

## A9 — Wizard

```text
<preamble>

Task 12 from the plan. Deliverable: / persists an estimate through the API, and
save-estimate has 7 passing tests.

- Work test-first: create src/lib/save-estimate.test.ts with the seven cases in the
  plan, run `npm test`, watch it fail, then implement src/lib/save-estimate.ts.
  The module takes its dependencies as a parameter and must not import api directly.
- Rewrite frontend/src/app/page.tsx: five steps, one column, progress rule reading
  "1 of 5". No absolute positioning, no scale, no blur, no overflow hidden.
- Step 1 is a client combobox over api.getClients(); picking an existing client sets
  clientId and skips client creation.
- Step 3 gains one shared hourly rate, prefilled from localStorage "cleargig.rate"
  or 150, written back on save.
- Persist by calling saveEstimate with the adapters in the plan (the API is
  snake_case and takes objects; do not pass api methods through unwrapped).
- On failure, render the SaveEstimateError message inline in --danger. If it carries
  a clientId, the message must name the client and say the client was saved but the
  estimate was not.
- Keyboard: Enter advances, Shift+Enter goes back, Escape returns to /dashboard
  after a confirm when dirty.
- Delete the fake invoiceId, the scanner-line, and the dead Export button on this page.

Then verify end to end against the local API: create an estimate, confirm it appears
on /dashboard and opens at /projects/[id]. Create a second one for the same client and
confirm no duplicate client row appears.

Stop after the commit.
```

---

## A10 — Navigation, repo instructions, acceptance

```text
<preamble>

Tasks 13 and 14 from the plan. Deliverable: correct redirects, a repo instruction
file that matches this design, and an acceptance report.

- Repoint every href="/" and router.push('/') in src/app/projects to /dashboard:
  "Back to dashboard", the not-found link, and post-delete.
- Rewrite ClearGig/.agent/instructions.md. The current file mandates Lenis, GSAP,
  three.js, glassmorphism and a custom cursor — the exact stack this redesign
  deleted — and tells the next agent to `npm install gsap`. Replace it with: the
  Ledger spec is authoritative, the palette is approved, those five technologies are
  out of scope, icons are lucide-react by recorded exception, and no dependency may
  be added.
- Run the acceptance pass in Task 14: the four gates, the forbidden-string grep, the
  390px overflow check on all four routes, a full keyboard-only estimate, and print
  previews of both documents.

Report PASS/FAIL per check with evidence. If something fails, fix it in the owning
task's files and say which task you had to reopen. Do not paper over a failure.

Finally tick the plan's checkboxes and commit the plan file.

Stop. The branch is then ready for review — do not merge, do not push to main.
```

---

## Deterministic gate (run outside Antigravity, after every session)

```powershell
cd "C:\Users\Admin\OneDrive\Desktop\Source Code\ClearGig\frontend"
npx tsc --noEmit; npm test; npm run build; npm run lint:design
```

Exit 1 on any error-level violation. It does not care which model wrote the code,
which is the point: it is the guard against a weaker Antigravity model drifting off
the value table.

---

## If a session goes wrong

1. `git log --oneline` — find the last good commit. Every task is one commit, so the
   blast radius is one task.
2. `git checkout -- .` and re-run that single session. Do not ask the agent to "fix
   everything" in one pass; that is how an unrelated file gets rewritten.
3. If the same session fails twice, the plan is ambiguous there. Report it and edit
   the plan — not the prompt — so the next run is unambiguous.

## Reusing this pack on other repos

The shape transfers, the content does not. For Insight Scraper and DataTurf the spec
and the plan get rewritten first (different domain metaphor: web/crawler for Insight
Scraper, graphs/information for DataTurf), then this file is copied and only the
task names and file paths change. Never copy the palette.
