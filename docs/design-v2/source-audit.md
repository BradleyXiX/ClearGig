# ClearGig source audit

## Evidence boundary

Inspected local source at `C:\Users\Admin\OneDrive\Desktop\Source Code\ClearGig`, on reported branch main, HEAD `6ae29e122f6b5348adcd684f98afbd6ef5c7cb9d`. This was not a fresh remote/deployment verification. No live database, model, hosting or production UI check was performed. Git status in this execution environment reports that it is not in a worktree, so clean/dirty status remains unverified.

The owner confirmed a new showcase page with existing app routes preserved. Reference pictures are missing from the current message; no exact visual interpretation has been claimed.

## Actual product

ClearGig estimates software contracting work for clients. Its primary working journey is client selection/creation → project title → scope/rate → review → create → project detail. It also includes an estimate dashboard, one-time versus recurring totals, contingency and margin inputs, status labels, a FinOps scenario calculator and printable estimate/audit documents.

| Route | Current role | Preserve |
| --- | --- | --- |
| `/` | Five-state estimate wizard | Existing/new client behavior, keyboard flow, saving and partial-failure feedback |
| `/dashboard` | Projects ledger and client totals | Real project/client loading, totals, navigation, empty/loading/error states |
| `/projects/[id]` | Estimate editing and FinOps tab | Line items, adjustments, status UI, save/delete, audit inputs and export |
| `/projects/[id]/document` | Print-oriented estimate | Folio, project values, signature/document layout |
| `/projects/[id]/document?variant=audit` | Print-oriented audit | Correct scenario inputs and computed results |
| `/showcase` | Proposed new public entry | No existing route replacement; no live data dependency for first paint |

## Stack and boundaries

- Frontend: Next.js 16.3.2, React 19.2.8, TypeScript, Tailwind 4, clsx/tailwind-merge and lucide-react.
- Backend: Express 5, Prisma 7, PostgreSQL. README describes Vercel frontend, Render backend and Supabase database; actual hosting state was not verified.
- Fonts: Geist and Geist Mono via next/font.
- No animation or WebGL package is in the inspected frontend manifest.
- Existing local instructions deliberately removed GSAP/Three/Lenis/cursor/blur theatrics in an earlier redesign. The old visual plan is historical evidence for why those choices failed, not a reason to deny the owner's new design request.
- Keep native scrolling and existing stack. CSS/WAAPI/SVG should cover the planned showcase treatment first. No new motion dependency is justified yet.
- Existing `frontend/scripts/design-lint.mjs` enforces old Ledger choices. Any approved new visual exception must be narrowly scoped and recorded, not implemented by deleting/disabling the lint gate.
- `frontend/AGENTS.md` requires reading relevant installed Next.js docs before implementation. Preserve the Next-generated instruction block.

## Current visual baseline from source

Paper/ink/pine palette, small uppercase labels, dense mono numerical rows, square controls and a shared 56px brand bar. The root page starts directly with a form, not a product story. Public assets largely contain stock Next/Vercel scaffolding SVGs; there is no inspected product-image library or established logo asset beyond the wordmark.

This explains a limited portfolio first impression, but it is a source assessment, not a visual score based on rendered screenshots. Baseline screenshots and performance measurements still belong to task 00.

The opportunity is a product-led showcase with memorable composition, artwork and an interactive estimate narrative, supported by a more legible workspace. Decorative effects must not recreate the heavy application-wide rendering that the previous Ledger phase removed.

## Correctness findings to isolate from visual commits

| Finding | Evidence | Required handling |
| --- | --- | --- |
| Update HTTP method mismatch | `frontend/src/services/api.ts` uses PUT; `backend/routes/projects.js` registers PATCH | Confirm intended contract, then align frontend with actual route and add a focused regression test |
| Successful delete parsed as JSON | Shared API helper always calls res.json(); backend project delete returns 204/end | Treat 204/no-content as successful void; retain parsing/error behavior for actual JSON routes |
| Audit edits not represented in export | FinOpsAudit owns local input state; export opens only `?variant=audit`; print page supplies recurring/default spend and default savings rate | Define one source for current audit scenario and pass validated finite inputs to the print route without claiming server persistence |
| Partial wizard save can leave a project | saveEstimate creates project, then line items separately; later line-item failure lacks the richer project-created recovery information | Add clear partial-success feedback/recovery; do not silently retry POSTs or claim atomic saving |
| Detail mutations swallow failures | Several handlers only console.error; project load failures become not-found | Visible error state, meaningful retry and distinct missing/unavailable handling in the relevant app tasks |
| Locked state is primarily UI behavior | Client `status !== DRAFT` hides/disables controls; inspected backend controllers do not enforce equivalent locking | Preserve UI rules, do not market immutable or secure server-side locking; server enforcement is a separate backend scope if required |
| Keyboard access gaps | Dashboard rows navigate via onClick on tr; some Link wraps Button; some field labels are disconnected | Real links/buttons, one focus target per action, labelled controls and visible focus |
| Field prefix not visibly rendered | Wizard passes prefix="$"; Field renders suffix only and forwards remaining attributes | Shared field task should render accessible units/prefixes rather than relying on an HTML attribute |

These are source findings; runtime impact needs mocked/local verification. Do not alter money formulas as part of the redesign.

## Financial and presentation contracts

`computeTotals`: sum one-time hours×rate; contingency on one-time base; margin on base+contingency; recurring items excluded from one-time total and shown monthly. Preserve current precision/calculation behavior and test reference values.

`computeAudit`: savings = spend×rate/100; optimized spend = spend−savings; annualized savings = savings×12; fee = savings×3×0.5; client net first year = annualized savings−fee. These are scenario projections, not measured cloud savings or an automated cloud-account audit. Showcase examples must say illustrative/sample and never imply real financial results or cloud integrations.

The document route must handle long content and pagination. Do not enforce a one-page PDF promise for arbitrarily many line items or clip terms/totals to achieve a screenshot.

## Checks actually executed

Runtime used: bundled Node v24.22.1, not the Node 26 runtime used previously for SupportGenius.

| Check | Result |
| --- | --- |
| Frontend tests, explicit four `src/lib/*.test.ts` paths | 17 passed, exit 0 |
| Backend `node --test utils/httpError.test.js` | 7 passed, exit 0 |
| Frontend `node scripts/design-lint.mjs src` | Clean, exit 0 |
| Frontend TypeScript `tsc --noEmit --incremental false` | Exit 0 |
| Production build / ESLint / browser / print / performance | Not run in this source-planning pass |

Important runner discrepancy: the current npm test scripts use directory arguments (`node --test src/lib` and `node --test utils`), which failed under this Node 24 execution. Explicit file discovery/paths passed. The initial backend scalar-path splat also failed; the direct file command above succeeded. Do not call either current npm test script verified here. Task 00 must establish a portable runtime/runner command and record real exits. The frontend tests also emit module-format inference warnings; a redesign does not justify blindly changing package module semantics.

Backend `server.js` invokes `prisma migrate deploy` on startup. Do not start it against an existing/unknown .env for visual previews.

## Reference review — resolved after source audit

The six pictures arrived after this initial audit. See design.md for the completed reference map and Considered Work visual direction. The earlier missing-input statement above describes the initial source-review state, not a current blocker. The supplied photos are mood references; the preview uses an original generated architectural image. Production image encoding and integrated Next/app performance remain implementation work.
