# ClearGig — detailed redesign execution plan

## 1. Scope and intended experience

Confirmed by the owner: add a portfolio-facing showcase while preserving existing app routes. Propose `/showcase` as the new entry. Keep `/` as new estimate, `/dashboard` as estimates, `/projects/[id]` as editing and both `/document` variants as printable artifacts.

Prospective client journey: arrive at showcase → understand the estimating problem → see a clearly labelled working example → inspect the real workspace or start an estimate. Working journey: choose client → scope/rate → review → save → edit → export. Visual work must improve both journeys without forcing working users through a long marketing scroll.

The showcase must render its main story without API availability. Link into the real app rather than fetching all projects on marketing load. A sample preview can be deterministic local data, visibly labelled; it must never save automatically or masquerade as a real customer's account.

## 2. Visual authority: Considered Work

The six reference images have now been received and translated in the accompanying `design.md`. That specification and its reference map govern the proposed implementation; this roadmap describes task ownership and checks.

**A distinctive studio presentation of scope, precision and a finished proposal.** Use deliberate type, strong composition, tactile/media treatment if the references support it, and a signature sequence in which pieces of scope become a coherent estimate. The visual object should belong to ClearGig's purpose, rather than borrowing SupportGenius's sphere because that project used one.

The final `design.md` must record all of:

- Audience, use cases, narrative, exact route map and links.
- Reference-to-decision map, including why each chosen feature fits ClearGig.
- Semantic palette for showcase, workspace and print; actual hex values/contrast pairs; focus/danger/status roles. Do not apply unreadable photographed colors to financial text.
- Type roles, fluid heading sizes, readable body/labels, tabular numeric roles, line lengths and font fallback/load behavior.
- Spacing/grid/container/breakpoint tokens; desktop and mobile composition for each route/section.
- Shared mark/wordmark treatment and app-shell compatibility. Do not casually replace product identity without documenting the chosen design.
- Exact section copy, CTA targets, demo disclosures and feature-claim boundaries.
- Image/SVG manifest with original source, allowed usage, visual role, dimensions, crops, mobile variants, alt/decorative intent, format and byte target.
- Component anatomy, interaction states and motion ownership matrix.
- Print variants and numeric/data contracts.
- Acceptance matrix, fallback conditions, bundle/media limits and baseline evidence.

The actual pictures are incorporated as mood references, not bundled production photography. The original generated photo and responsive local preview are available in preview/. Review the representative preview before scaling implementation. No large canvas, new motion engine or direct Pinterest-photo use is part of this direction.

## 3. Section coverage

### Showcase navigation

Wordmark/mark, short section navigation and direct workspace/new-estimate access. Keyboard skip link, clear current destination, native anchors and consistent focus. Avoid a hover-dependent menu. Keep marketing navigation out of print and do not substitute it for the workspace's working navigation.

### Hero

One clear statement about turning project scope into a client-ready estimate. Supporting copy explains contractor estimation, not generic AI automation. Primary action enters the existing wizard; secondary opens the estimates workspace or scrolls to the example.

One visual focal point: original estimate/document composition, optionally integrated with a supplied image if appropriate. Essential title, explanation and CTA are visible on first paint. Reserve art dimensions. Mobile uses a purpose-composed crop/reflow rather than a shrunken desktop collage. No required canvas or autoplay video to understand the product.

### Scope-to-estimate story

Three beats: define work → review structure and adjustments → prepare a document. Desktop may pair sticky illustration with normal-flow text if it does not trap scrolling; mobile becomes a regular vertical sequence. The owner requested no prices on the landing page. The local example therefore changes scope, workstreams, deliverables, ongoing-work labels and document readiness, without rates, currency, savings amounts or money calculations. Controls respond immediately and never POST. The real app retains its financial values and formulas.

### Product capability/visual interlude

Show dashboard, editable estimate and document output in an intentional composition, not a generic repeated three-card template. Use real fixture screenshots or DOM previews. Introduce supplied photographic/abstract art at most where it supports the story; do not cover forms and tables in decorative imagery.

Cover actual capabilities: categories, contingency/margin, recurring costs, status labels, estimate document and FinOps scenario. Audit values are assumptions/projections, not guaranteed optimization or live cloud-account analysis. Do not fabricate payments, e-signing, delivery emails, collaboration, authentication or integrations.

### Closing / questions / footer

One clear conversion hierarchy. Primary start-estimate/workspace link; an optional professional contact link uses an owner-approved destination. Keep secondary links quiet so the closing does not repeat SupportGenius's crowded CTA problem. Short native disclosures can answer what data is needed, what is recurring, what export does and the meaning of audit projections. Footer provides identity and actual links; no fake legal links, client logos or award badges.

### Workspace

Carry type, spacing and accent discipline from the showcase while keeping financial work legible. Quiet surfaces, larger useful text, visible units, real status states, structured empty/error/loading states and genuine keyboard navigation. No scroll reveals for project rows, no moving numbers during editing, no atmospheric render loop behind forms.

### Documents

Screen preview can inherit refined branding; printed content stays high-contrast, lightweight and complete. Hide controls, navigation and decoration for print. Long descriptions/line-item lists paginate; do not clip or scale everything down to fit one page. Estimate/audit outputs must match the current input scenario and explicit saved/unsaved behavior.

## 4. Motion and interaction contract

Use CSS transitions/keyframes and native WAAPI/IntersectionObserver before adding any engine. No new dependency is currently authorized or required. Reuse the current Next/React stack, lucide icons and native scroll. No Lenis, custom pointer, application-wide canvas, infinite decorative ticker or required hover-only action.

| Surface | Purpose | Trigger and implementation | Timing / interruption | Fallback |
| --- | --- | --- | --- | --- |
| Hero composition | Explain assembled scope | Finite transform/opacity sequence after critical content; separate wrappers for perspective and movement | Proposed 600–900ms total, never delaying CTA; cleanly cancel on navigation | Static final arrangement for reduced motion/no JS |
| Hero/art hover | Gentle depth cue if justified | Fine pointer only, outer wrapper owns bounded tilt; no React state updates per pointer frame | Settle ~180–250ms, reset on pointer exit | Static on touch/reduced motion |
| Story progression | Explain workflow | Native scroll with observer-driven discrete state or justified native scroll-driven transform; normal flow always intact | Small travel, no blocked scroll or delayed reading | Static three-step sequence |
| Media crop reveal | Introduce reference artwork | Once on entry, only visual media wrapper | Proposed 350–500ms, no whole-page opacity gate | Media fully visible |
| Buttons/links | Immediate feedback | Color/outline and optional small icon shift | ~120–180ms, no hitbox movement | Clear focus/pressed style |
| Example scenario | Explain scope and document workflow | Direct state update; subtle panel continuity; no displayed prices | Labels update immediately; optional <=180ms wrapper transition | Instant replacement |
| Workspace controls | Feedback/orientation | Controlled input/save/tab state, small opacity/transform only | <=200ms, rapid actions interrupt cleanly | Immediate state change |
| Print | Reliable document | No animation | None | Same complete content |

One owner per animated property per element. Stop observer/RAF/timeline work on unmount. Stop any ongoing effect offscreen/hidden. If a decorative effect runs automatically beyond five seconds, supply an appropriate pause mechanism; prefer finite sequences so the page settles. Respect reduced motion on first load and runtime changes. Do not use focus changes, screen reader announcements or fake loaders as decoration.

## 5. Asset integration

Treat the supplied pictures as references until inspected. If direct use is appropriate and permitted, create responsive AVIF/WebP candidates and compare actual visual quality/size. Preserve focal subjects with art-directed mobile crops. Use local assets, explicit dimensions/sizes and appropriate priority for only the actual hero/LCP image. Below-fold imagery lazy-loads.

Use meaningful alt text for informative media and empty alt for purely decorative visuals. Never put essential product information only inside rasterized text. A static optimized poster is the default reference for any proposed video/3D option. No embedded Pinterest/Dribbble iframes or remote hotlinked assets.

New expensive visual technology requires a specific interaction justification and measured benefit. A heavy live scene is not automatically more advanced than well-composed images, SVG and layered HTML. The current plan targets an advanced result without a 3D dependency.

## 6. Task / commit sequence

Run one task per Antigravity session. Each prompt must start with branch/status/current parent SHA, list owned files, preserve contracts and end with a scoped commit/evidence summary. Exact new component filenames can be finalized with the visual spec; the listed paths are responsibility boundaries.

### 00 — Base, isolation and reproducible baseline

- Verify main/remote ancestry and local changes; create `design/cleargig-showcase-v2` without modifying main. Do not push.
- Read root/.agent/frontend instructions, installed Next docs, current routes and existing design lint. Record old/new spec precedence so old restrictions do not undo the new showcase scope.
- Establish deterministic mocked API data and a disposable local integration strategy. Never load unknown production .env or run backend startup migrations against client/production data.
- Record relevant unit/type/lint/build exits with explicit commands. Current directory-form test commands failed on the reviewed Node24 runtime; determine portable explicit-file discovery instead of silently reporting success.
- Record minimal current desktop/mobile route captures and asset/build baseline when runnable. Existing failures remain labelled baseline, not hidden.
- Commit only deliberate baseline test/documentation artifacts if useful; avoid committing mountains of temporary traces.

### 01 — Fix the bounded API client contract mismatches

- Own `frontend/src/services/api.ts` and focused API-client tests.
- Write a failing regression for update method, success-with-no-body and retained JSON/error behavior. Align project update to actual PATCH route without changing backend contracts; handle 204 correctly and type void responses honestly.
- Keep endpoint shapes/base URL normalization and real error codes. No database/hosting work.
- Commit `fix(api): align estimate updates and empty responses with backend`.

### 02 — Install the design authority and prepare approved assets

- Own new redesign docs/reference assets and narrow .agent instruction precedence.
- Install the supplied Considered Work specification, reference map and asset manifest in a conflict-free repository packet. Use the provided desktop/mobile hero and workspace preview as representative reference, not production code. Prepare measured responsive image derivatives from the generated master, preserving the original. Do not substitute unrelated art or re-open the chosen direction without a concrete conflict.
- Resolve lint rule conflicts narrowly: explicit showcase-only exceptions if justified, existing core safeguards intact. Do not install libraries to imitate a reference effect.
- Preserve old Ledger spec as dated history. New spec governs this approved redesign; installed Next AGENTS block stays.
- Commit `docs(design): define ClearGig showcase and workspace direction`.

### 03 — Shared brand tokens, type and accessible primitives

- Own `globals.css`, shared UI components, logo assets and BrandBar/layout shell as needed; no business handlers or money helpers.
- Install semantic showcase/workspace/print roles, readable typography and reusable container/spacing rules. Keep print behavior scoped.
- Correct nested interactive elements, visible focus, accessible field hints/errors, prefix/suffix rendering and touch targets as shared primitive work. Decorative mark has an appropriate accessible name only where meaningful.
- Keep current fonts unless the reference decision justifies a documented change. No random font imports or global client animation provider.
- Commit `feat(brand): establish ClearGig visual system and accessible controls`.

### 04 — Static showcase shell and hero

- Own new `src/app/showcase/page.tsx`, showcase navigation/hero components and hero assets. Prefer a server-rendered page with tiny client islands only where needed.
- Build exact responsive composition, copy/CTAs, reserved artwork boxes, metadata and natural mobile reading order. Preserve root wizard/navigation destinations.
- All content works as static layout before motion. No API fetch to paint/show the hero. No fake loading screen.
- Commit `feat(showcase): compose responsive ClearGig introduction`.

### 05 — Interactive scope-to-estimate section

- Own example/story components and typed local sample data. No showcase money calculation, production requests/writes or price constants.
- Show illustrative scope/workstreams/deliverables/ongoing-work labels and document readiness. No rates, currency, savings amounts or monetary figures in any scenario, artwork, mini workspace or hidden/mobile variant. Actual app calculations are preserved. Use real buttons/labels, immediate updates and a restrained polite status announcement if useful.
- Responsive normal-flow version is complete before any sticky/scroll treatment.
- Commit `feat(showcase): demonstrate scope and estimate calculations`.

### 06 — Product surfaces and integrated reference media

- Own capability/interlude/gallery components and optimized below-fold assets.
- Show truthful estimate/dashboard/document/FinOps story. Avoid fake account/customer data, live cloud integrations and simulated financial returns.
- Compose the actual selected reference art seamlessly: shared lighting/color/material framing where appropriate, disciplined crops and responsive sizes, not a random background image pasted behind UI.
- Lazy-load noncritical media, reserve dimensions and retain readable text layers.
- Commit `feat(showcase): present product capabilities and visual story`.

### 07 — Closing, questions and footer

- Own closing/disclosures/footer components and links only.
- One CTA hierarchy, native accessible disclosures, owner-approved contact destination and precise product limits. Do not automatically copy SupportGenius pricing/license/contact policy to ClearGig.
- Verify anchor IDs/routes and no dead placeholder links. No backend contact form.
- Commit `feat(showcase): complete ClearGig conversion and footer journey`.

### 08 — Purposeful showcase motion

- Own showcase-only motion helpers/styles and tiny client components. No changes to API, money calculations or workspace data flow.
- Implement the approved motion matrix: bounded hero assembly, limited depth/hover and scroll story. Essential content remains available if JS fails.
- One owner per transform, correct cancellation/re-entry, hidden/offscreen pause and reduced-motion runtime handling. No whole-document scroll interceptor.
- Respect image/deferred-JS budgets. If a signature effect cannot fit, keep its static reference treatment rather than degrading the entire page.
- Commit `feat(motion): choreograph bounded ClearGig showcase interactions`.

### 09 — Estimates dashboard

- Own `/dashboard` UI and extracted ledger components. Preserve actual loading/retry/client totals and routes.
- Rework hierarchy, responsive ledger, status presentation and genuine keyboard-accessible project links. Long names/titles and large totals must remain readable.
- Empty/loading/unavailable are distinct. No app data reveal delays, decorative count-ups, fake analytics or global canvas.
- Keep one-time and recurring metrics labelled accurately. Do not add a new CRM/search/reporting feature under a visual commit.
- Commit `feat(workspace): refine estimate overview and client ledger`.

### 10 — Estimate wizard and save recovery

- Own `/` wizard UI, focused wizard components and `save-estimate` recovery/tests where necessary.
- Preserve existing client selection, editable rate, five-state progression, keyboard intent, discard confirmation and explicit save. Prevent Enter inside another action from triggering an unintended step/save.
- Give each active step clear hierarchy, sufficient labels/units and sensible focus/step announcement. No long step transition or forced animation before input.
- Make partial success truthful: if project/one line item exists after a later failure, expose recoverable project identity and avoid automatic duplicate POST retries. No atomic-save claim or backend transaction redesign.
- Commit `feat(estimator): refine guided estimate creation and recovery`.

### 11 — Project detail and real mutation states

- Own project-detail UI, line-item table/summary and focused state components.
- Preserve categories, recurring switch, current totals, adjustment values, selected status, UI locking and explicit save. Do not change formulas or fabricate server-enforced locks.
- Visible save/add/delete pending/success/error, double-submit prevention and truthful retry. Distinguish missing project from unavailable API. Cancel destructive confirmation must work and return focus logically.
- Clear status controls/tabs, no hidden-on-hover action and no animation competing with editable numeric values. Sticky summary must not obscure focused fields or mobile content.
- Commit `feat(estimates): refine project editing and mutation feedback`.

### 12 — FinOps scenario and export-state coherence

- Own FinOpsAudit state/interface, export URL/serialization helper, document-route validated input consumption and focused tests.
- Lift/coordinate scenario values so the active monthly spend and savings rate reach print. Preserve formula functions and current units. Define unsaved scenario as transient, not server-persisted.
- Validate finite nonnegative spend and rate range; handle missing/invalid print inputs explicitly. Avoid ambiguity where 1 might mean 1% versus 100%.
- Projection labels explain assumptions. No measured-savings, connected-cloud or ROI claim.
- Commit `fix(audit): preserve active scenario in document export`.

### 13 — Printable estimate and audit design

- Own DocumentShell/DocumentEstimate/DocumentAudit and print-scoped CSS/document-route presentation. Do not alter the task-12 scenario contract.
- Match brand through restrained type, folio/rules and hierarchy. Hide controls/showcase decoration in print. One semantic main per page; document article should not introduce nested main landmarks.
- Repeated/long line items, long client/title, zero/large values and both variants paginate cleanly. Avoid clipped totals, blank pages and one-page guarantees.
- Export remains browser print/save-to-PDF, not an invented background PDF service, legal signature or e-sign integration.
- Commit `feat(documents): refine branded estimate and audit output`.

### 14 — Consolidated integration, accessibility and performance verification

- Use one planned verification matrix and one browser tool/session, production preview and deterministic fixtures. Capture baseline-comparable conditions. Do not repeat full audits after each section with no new reason.
- Exercise showcase navigation/example, new/existing client wizard, save/partial failure, dashboard links, detail pending/failure/lock states, audit scenario export and print variants. Intercept writes in UI tests; real integration uses disposable local data only.
- Desktop 1440×1000, phone 390×844, 320px reflow, touch/focus/keyboard, long content, reduced motion at load/runtime, JS-disabled showcase, repeated navigation and image/JS failure fallback.
- Run current unit tests, TypeScript, ESLint, design lint and production build; resolve introduced failures honestly. Use focused regressions for behavioral changes, not brittle text snapshots or superficial tests of CSS class names.
- Measure production assets, cold-load median LCP/CLS over comparable runs, throttled interactions, long tasks and offscreen/hidden work. Local interaction traces are not field INP. Record real evidence rather than inventing smoothness claims.
- Commit only actual corrections and stable useful tests/evidence: `test(ui): verify ClearGig redesign across journeys and devices`.

### 15 — Documentation, evidence and handoff

- Own README and concise current design/verification navigation. Show current real route screenshots with fixture/provenance labels, accurate feature limits and exact start/check commands.
- Update agent signposts so future work follows the approved new scope, without replacing the preserved app with marketing or restoring abandoned heavy effects.
- Document route entry `/showcase`, no API-dependent marketing paint, print behavior and evidence limits. Leave licensing/hosting changes out of this redesign.
- Report parent/final SHAs, commit sequence, scoped paths, measured budgets, remaining gaps and ready PR text. Preserve unrelated user edits.
- Commit `docs: document ClearGig showcase and redesigned workspace`.
- No push/merge/deployment or production data operation without the owner's later authorization.

## 7. Performance and accessibility acceptance

Targets below are proposed budgets, not measured outcomes. Confirm against the baseline in 00 and final art in 02. If a target cannot fit, simplify before increasing a budget and record the reason.

- Initial showcase-specific client JS target: <=35 KiB gzip incremental above comparable Next shell; defer optional effects. App routes do not import showcase runtime/media.
- Hero image target: <=200 KiB at the intended desktop responsive rendition; first-viewport added visual assets <=300 KiB combined; mobile variants should be smaller. No initial background video download.
- Fonts: reuse current families/subsets by default; no blocking third-party font runtime. Any change requires measured transfer comparison and fallback layout stability.
- Mobile lab LCP target <=2.5s and CLS <=0.1 under recorded comparable conditions; also compare to baseline. These are not guarantees on the free API host or field data.
- App interaction feedback immediate; local feedback normally <=200ms. No repeated long tasks caused by decorative motion; no perpetual offscreen/hidden render work.
- Content readable without animation. No document-wide horizontal overflow at 320px. If a true data table needs horizontal scroll, confine it to an identifiable keyboard-usable region with sufficient context, not hidden body overflow.
- Body content generally 16px with comfortable leading; app secondary text generally >=14px; small mono metadata not used for essential instructions. Targets must still be checked against the actual reference type and browser result.
- WCAG2.2 AA target: text/nontext contrast, visible unobscured focus, labelled fields, correct semantics, usable touch targets, real links and accessible error/status messages. Automated checks complement keyboard/visual review.

## 8. Prompt and receipt format

Every eventual task prompt includes: goal; exact owned paths; preceding dependency/parent; preserved routes/data/money/print contract; precise implementation decisions; mandatory and out-of-scope checks; failure/fallback behavior; commit name; and stop condition. Do not tell an agent to 'make it premium' without section anatomy, responsive behavior and acceptance.

Receipt: branch/parent/commit, changed paths, checks and exits, visual/evidence reference where relevant, deviations, generated files/unrelated edits preserved, known gaps and next task. A receipt is evidence of reported work, not proof that every source claim is true; final review reads actual files.

## 9. Remaining decisions

Reference pictures are now available and design.md specifies palette, type, composition and motion. Route decision is already made. Remaining implementation evidence: final encoded media sizes, actual Next route bundle/performance results, print output and safe real integration checks. The prototype is a reference; do not represent its local fixture behavior as completed production functionality.
