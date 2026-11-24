# ClearGig — Considered Work

Design specification, 23 November 2026. Prepared from the six supplied Pinterest mood references and the inspected ClearGig source. This is the proposed redesign authority for the implementation branch, not evidence that production has changed.

## 1. Product intent and scope

ClearGig helps independent developers and studios turn work scope into an estimate. The new `/showcase` gives portfolio visitors a compelling first impression; the existing estimator remains available at `/`, with `/dashboard`, `/projects/[id]` and print routes preserved.

Direction: **Considered Work**. Warm editorial paper, walnut and ink, architectural light, confident typographic contrast, a precise estimate document. The impression is an independent professional prepared for an important client conversation. It should feel contemporary and useful, not like a law firm's brochure, a luxury watch advertisement or a trading terminal.

The photos establish material, light, framing and mood. Their photographed contract terms, spreadsheet content, brand names and implied legal procedures are not product requirements. ClearGig creates estimates and projected audit documents; it does not negotiate, execute or legally validate contracts.

## 2. Reference translation

| Image | Read from the reference | Design decision | Do not carry over |
| --- | --- | --- | --- |
| 01 Contract and black pen | Strong diagonal, black-on-paper contrast, precise writing instrument | Layered paper estimate artwork, dark ink, a fine diagonal edge detail | Watermark, document prose, blackletter headline or implied legal-contract features |
| 02 Warm renewal document | Parchment, walnut, brass nib, personal annotations | Warm canvas, restrained brass accent, ruled annotations in scope story | Yellow/sepia wash over every screen, renewal clauses, handwritten text replacing UI labels |
| 03 Top-down handshake | Structured desk geometry, shared focus, cool shadow/light separation | Balanced split layouts and a narrative of a professional client conversation | Recognizable people or a fake customer testimonial; no handshake stock-photo hero by default |
| 04 Boardroom and skyline | Architectural verticals, cinematic light, serious negative space | Hero environmental photography with strong framing and warm window light | Implying ClearGig's team occupies this office, prestige claims or identifiable client meetings |
| 05 Productive desk | Tools deliberately arranged, pale surfaces, black notebook, useful work | Workspace hierarchy, calm panels, meaningful tools/inputs and material detail | Fake spreadsheet metrics, excessive desktop props behind forms or copied brands |
| 06 Reviewing a document | Document as a substantial object, close crop, monochrome confidence | Product preview and final document narrative, tactile paper contrast | Genre-book character identity, photographed legal content or dark unreadable app screens |

All supplied Pinterest files are **mood references**, not approved production assets. Image 01 visibly contains a stock watermark and must not be used in production or have its watermark removed. The other files also lack verified original-source reuse permission. The kit uses an original generated environmental image for the preview and code-native estimate illustrations. This avoids making the implementation depend on those exact photos. If the owner later supplies appropriately licensed originals, preserve the same crop/byte/accessibility contract and update the manifest.

## 3. Brand and visual system

### Palette

| Token | Value | Role |
| --- | --- | --- |
| canvas | `#F4F0E8` | Marketing and workspace foundation |
| paper | `#FFFCF6` | Document and raised interactive surfaces |
| paper-muted | `#E9E2D6` | Secondary surfaces and quiet fields |
| ink | `#201E1A` | Headings, body and primary button fill |
| muted | `#686158` | Supporting text on light backgrounds |
| rule | `#CFC5B6` | Decorative separators only |
| control-border | `#8B8173` | Control edges on light surfaces; verify actual pairs |
| brass | `#A98A5D` | Decorative annotations/artwork; not default body text on paper |
| brass-ink | `#705330` | Readable accent text on light canvas; verify actual pairs |
| forest | `#3E4B40` | Positive/current selection; words/icons reinforce meaning |
| dark-canvas | `#191916` | One story section, footer, dark preview shell |
| on-dark | `#F5F0E6` | Main text on dark canvas |
| on-dark-muted | `#C4B9A8` | Secondary text on dark canvas |
| danger | `#8C3228` | Errors/destructive actions only |
| focus-light | `#3E4B40` | Focus on paper |
| focus-dark | `#E0C6A1` | Focus on dark surfaces |

Use contrast calculations against final pairs. Decorative rules need not pretend to be sufficient input borders. Aim for >=4.5:1 regular text, >=3:1 large text/nontext where applicable. No beige-on-beige labels, colored text over complex photography, pastel pink accents or neon glows.

### Typography

- Keep existing Geist Sans for navigation, controls, body and workspace headings, and Geist Mono for financial figures/folios.
- Introduce a **system serif display role** for selected showcase phrase only: `Georgia, 'Times New Roman', serif`, roman, normal weight. No new font package or remote font request. This is a narrow new design exception to the historical one-family Ledger rule; app forms/tables remain sans/mono.
- Showcase hero: first line sans 500, second phrase serif 400; desktop clamp 56–92px, line-height 1.02–1.06, tight but not colliding. At 390px target 48–54px, at 320px 40–44px. Fit by typography/reflow, never body overflow clipping.
- Section heading: 40–58px desktop, 32–38px phone. Body 17/28 or 18/29 on showcase; app main body/input text 16/24; secondary labels 14/20; small folio metadata 12–13/18 only.
- Do not imitate blackletter from image01. No faux handwritten font, universal uppercase paragraphs, animated scrambled text or rasterized text in photographs.

### Shape, depth and rhythm

- Max showcase content 1320px, workspace 1280px. At 1440 viewport use 60px gutters; 1024 use 32px, 390 use 22px, 320 use 16px.
- Scale: 4,8,12,16,20,24,32,40,48,64,80,96,120. Showcase section spacing 96–120px desktop, 64–80px mobile.
- Quiet straight rules, 2–4px controls, 6px panels, slightly larger 8px photo frame permitted. No ubiquitous pills/bento tiles. One pill-like tiny photo caption may be avoided in favor of plain metadata.
- Reserve soft static shadows for paper art and the hero image's product overlap. Actual forms stay flat/clear. No full-screen blur or live shadow animation.
- Hero composition may use small static perspective on paper; separate outer art wrapper owns hover tilt. The estimate's textual content is rendered as semantic HTML.

### Mark

Extend the existing wordmark with an original **folio corner** mark: a thin dark squared document bracket, folded upper-right corner and two ruled lines. It should read as scoped work/document structure, not an e-signature/security verification badge. Produce SVG in dark, light and favicon forms. Keep geometry simple and recognizable at 20px; wordmark remains ClearGig. No acquired stock logo or copied luxury-brand monogram.

## 4. Route and layout ownership

- `/showcase`: new server-rendered marketing route with small client islands for example/motion; no API calls for first paint.
- `/`: existing wizard; shared brand refresh only, no marketing blocks above active fields.
- `/dashboard`: working estimate list; readable table/list, real data and error states.
- `/projects/[id]`: financial controls, summary, status, FinOps surface; no photo backgrounds.
- `/projects/[id]/document[?variant=audit]`: complete print output, no animated visual layer.
- Root layout should not import a universal animation provider. Shared brand navigation may select a showcase/app variant using a narrow route boundary; avoid putting all marketing sections behind `'use client'` just to switch headers.

## 5. Showcase: exact composition and copy

### A. Navigation

Height 76px desktop, 68px mobile; ordinary document flow. Wordmark left. Desktop anchors: The approach (`#approach`), Inside ClearGig (`#workspace`); right text link Open workspace (`/dashboard`). No menu drawer is needed for two links. On mobile retain wordmark and a single compact Open workspace link; optional secondary anchors can wrap below only if they fit comfortably. Include keyboard skip link to `#showcase-main`.

### B. Hero — `#introduction`

Warm paper field, desktop two columns around 53:47 with 64px separation. Left copy, right architectural photo; image top aligns near first headline line, not nav. Copy:

- Eyebrow: `PROJECT ESTIMATES, CONSIDERED.`
- H1: `Good work.` then `Clearly scoped.` (serif phrase).
- Lead: `Bring your scope, rates and recurring costs into one considered estimate. Ready for the next client conversation.`
- Primary: `Build an estimate` → `/` with small arrow.
- Secondary: `Explore workspace` → `/dashboard`.
- Supporting note: `Built for independent developers and small studios.`

Photo is 5:6 portrait-ish crop of the generated landscape, architectural window subject placed toward top/right, warm ivory light and dark table below. Original aspect can be adjusted by object-fit in a reserved box; no raster editing needed to position text. Photo corner caption in small light text on dark solid inset: `A clearer start to the work ahead.`

Overlay a small HTML estimate sheet at lower-left of art, contained in art column and not invading hero copy. At 1440 target art box ~500×550 and sheet ~300×250; no giant floating layers covering CTA. Sheet: `ILLUSTRATIVE ESTIMATE`, Northline Studio, Website refresh, Project scope `Defined`, Workstreams `Frontend + backend`, Cost structure `One-time + recurring`, Document status `Ready to review`. Footer `WORKFLOW PREVIEW · NO PRICING SHOWN`. Use a smaller text treatment for the status, not a large monetary total.

**Owner correction: no prices on `/showcase`.** This includes the hero sheet, interactive example, mini workspace, document artwork, screenshots, tooltips, alt text, hidden mobile variants and scenario states. Do not display sample rates, currency amounts, savings projections or pricing tiers, or merely blur/redact real amounts. Demonstrate scope, categories, document structure and workflow instead. The actual estimator, workspace and printable project documents retain financial values as required by the product.

Phone: copy first, buttons second, art third with 32px gap. Art height 350–390px at390, 300–330 at320; sheet becomes an inset overlay with max width of parent minus 32px. Do not hide the product estimate and leave only a generic office photo. No text over bright windows.

### C. Product framing strip

Thin top/bottom rule after hero; three calm factual descriptors: `One-time + recurring`, `Clear cost adjustments`, `Estimate + audit documents`. These are not live telemetry/counts. Stack or wrap evenly on phone; no scrolling marquee.

### D. Approach — `#approach`

Dark field as a visual change of pace. Large heading left: `From scope` / `to a clear next step.` Serif may be used on final phrase only. Lead: `Define the work. Understand the numbers. Prepare the document.`

Desktop: left narrative column 38%; right warm paper local estimate panel 62%. Three real buttons/readable steps: `01 Define the work`, `02 Review the numbers`, `03 Prepare the document`. Each has short explanatory copy. Selecting a step changes emphasis/detail in the accompanying local preview; all steps remain readable. Scroll can enhance discrete step emphasis if it does not fight explicit selection or focus; explicit selection has precedence until next deliberate user action. No mandatory pinned multi-screen tunnel.

Sample scenarios: Website refresh and Product build. No rates, monetary totals, savings amounts or hidden price constants in this public preview.

- Website: workstreams `Frontend + backend`, deliverables `Website + content structure`, ongoing work `Maintenance planning`, document status `Ready to review`.
- Product: workstreams `Interface + platform`, deliverables `Product + supporting services`, ongoing work `Infrastructure planning`, document status `Ready to review`.

Label panel `Interactive example · no data is saved`. Buttons immediately update the scope, deliverables and ongoing-work labels, with correct aria-pressed and concise status announcement. No showcase money calculation is necessary. No client/project creation, fetching real clients, analytics claims or new backend calls.

Phone: narrative, three step controls and estimate panel in normal flow; no sticky behavior or tiny horizontal chips. Avoid repetitive full product tables inside narrow preview.

### E. Inside the product — `#workspace`

Return to warm paper with more breathing room. Eyebrow `BUILT AROUND THE WORK`; heading `The details, in order.` Lead: `A focused workspace for the estimate and the conversation that follows.`

Asymmetric composition: large DOM dashboard preview taking 8/12 columns, with a 4/12 ruled feature rail. Include fixture project names, status words and document types, but no monetary columns or rates. It is labelled `Sample workspace`; never imply real client records. Do not embed an unmodified real-app screenshot that reintroduces financial figures.

Feature rail: `Keep scope visible` (line-item categories and rates), `Separate recurring costs` (monthly vs one-time), `Review adjustments` (contingency/margin), `Prepare a document` (print/save-to-PDF). No invented analytics graph. Hover/focus may highlight relevant part of the preview using opacity/background, no delayed financial calculation.

Below, a wide document composition: two slightly offset page sheets on a warm muted surface; one estimate, one FinOps scenario. Show section labels, deliverable/status words and document anatomy without prices or savings figures. Caption: `Illustrative document structure. Financial values appear in your working estimate.` A modest `Open workspace` link gives access to the app. Do not use a claim of legally signed contracts or actual cloud savings.

### F. Closing and useful questions

Ruled two-column warm-paper closing, not another card grid. Left headline `Make the next proposal` / `a considered one.` Right short copy and primary `Build an estimate` → `/`, secondary `Open workspace` → `/dashboard` as a quiet text link. Only one primary button.

Three native details below or adjacent, not a large separate FAQ wall:

1. `What can I estimate?` — Software project work by category, hourly scope/rates, one-time costs and recurring monthly items.
2. `How do documents work?` — Open the saved project's estimate or audit document, then use browser print or save-to-PDF. No claim of generated legal contracts or e-signing.
3. `Are audit savings guaranteed?` — No. The FinOps view models a scenario from the supplied spend and savings-rate assumptions; it does not verify cloud-account savings.

No new contact form, mailing list, booking service or pricing tiers. If a professional contact CTA is added, use the owner's existing verified identity, keep it secondary to trying ClearGig and record the destination in the spec.

### G. Footer

Dark ink field, light wordmark. Short phrase `Clarity before commitment.` Links: New estimate, Workspace and the actual owner GitHub repository/portfolio if approved as existing public destinations. No fake Privacy/Terms hrefs or copied SupportGenius licensing claim. Small plain copyright line without invented company registration/team claims.

## 6. Workspace refinements

### Shared shell

Keep quick access to New estimate and Estimates. Add a quiet Product overview link to `/showcase`, without making users traverse marketing on every visit. Avoid nested Link+button. Logo destination can remain `/dashboard` in app and `/showcase` in marketing. Body/main structure has exactly one main landmark.

### Dashboard

Title `Estimates`, short descriptor `Your work, clearly accounted for.` Primary New estimate. Main ledger takes 8/12, client totals rail4/12. Refine spacing, increase key labels to14px/financial values16px, reserve readable column widths, use actual keyboard links and explicit status stamps. New responsive list alternative is permitted if semantics/values remain equivalent. Show true loading, empty and unavailable states. No fabricated revenue/paid invoice metrics.

### Wizard

Centered 680px canvas with folio-like progress and larger question. Fields16px; labels14px; step number12–13px. Keep rate/client choices, explicit save, existing five-state flow and keyboard shortcuts with proper event targeting. Focus heading/field when useful; errors near their controls and a polite save status. Desktop may show a quiet summary rail only on review, not a tall decoration blocking field access. New partial-save recovery must identify what actually exists.

### Project detail

Readable header/folio/client/status, Estimate and FinOps tabs, two-column editing layout and a contained sticky summary only on sufficiently large desktop. Distinguish save success/error and unavailable/missing records. Non-DRAFT UI remains visibly locked as before, without claiming server enforcement. No cinematic backgrounds or scroll reveals on numbers/tables.

### Audit

Spend/rate inputs clearly labelled as scenario assumptions. Use the same design vocabulary, not a separate neon product. Show all five computed values and agreed fee formula as projection, not billing. Edited inputs reach print with a finite validated transport; absent values use explicit defaults, invalid values are rejected or clearly fall back, and no query parameter executes code or changes server records.

### Print

White/paper print ground, ink text, small brass rule optional only if legible in grayscale. Folio/client/title/date; clear cost rows/totals; full terms/signature reference text as currently supported. Remove site navigation/buttons/photos/animations. Long data paginates; never mask overflow or scale to tiny text for a single-page screenshot. Audit scenario and estimated totals match screen values. Browser print is not e-signing or legal-contract drafting.

## 7. Motion ownership and fallbacks

No new runtime dependency. Native CSS/WAAPI/IntersectionObserver; native scrolling. Each animated transform belongs to one element/owner; use wrappers to separate composition perspective from hover. Do not animate React state every frame.

| Effect | Owner | Trigger / behavior | Reduced motion / failure |
| --- | --- | --- | --- |
| Hero paper assembly | Hero child sheets, WAAPI | Finite 650–800ms after content is visible; ~16px travel, <=2deg rotation; primary content never delayed | Static settled sheets, no initial hidden H1 |
| Art tilt | Outer hero-art wrapper | Fine pointer only; max2deg, no hitbox movement; ~180ms settling | Static on touch/reduced motion, reset on exit |
| Approach emphasis | Step state | Observer can update discrete emphasis; buttons/focus never overridden by passive scroll | Normal readable vertical story |
| Photo movement | Inner photo wrapper | Optional <=16px desktop native scroll-linked translation if cheap/supportable; no recurring JS loop | Static crop on phone/reduced motion |
| Product-section reveal | Decorative preview wrappers | Once, <=16px/350–450ms; text remains visible | Fully visible immediately |
| Buttons | Local CSS | Color/outline; arrow travel <=3px, 120–160ms | Focus/pressed affordance retained |
| App state changes | Local component | Immediate values; <=180ms minor continuity only | Immediate swap |

No continuous particle field, logo spinner, auto-scroll carousel, hidden cursor, large blur filter, scroll smoothing, intro gate or full-app render loop. No decorative auto movement beyond5s; if a future effect exceeds that it needs pause controls. Abort observers/animations on unmount; ongoing work must stop hidden/offscreen. Dynamic reduced-motion changes must stop motion without hiding content.

## 8. Performance and verification contract

Budget targets are acceptance goals, not measurements or uptime promises:

- Showcase-only incremental client JS <=35KiB gzip relative to comparable Next shell; no showcase runtime imported by app routes.
- Hero generated photo responsive desktop target <=200KiB; mobile target <=110KiB; first viewport added visual assets <=300KiB. No autoplay video or full-resolution PNG in production.
- One responsive hero image can have priority; below-fold imagery lazy. Explicit dimensions/aspect-ratios prevent image shifts. Current Geist loading remains as configured; added serif is system-native, zero network.
- Trace native interactions under recorded mobile CPU throttling; immediate UI feedback, no repeated animation-caused long tasks >50ms, and no offscreen/hidden decorative work.
- Mobile lab targets: LCP<=2.5s, CLS<=0.1 in stated comparable conditions; real field INP only if actual field data exists. API wake-up is separate from marketing paint and must not be disguised.
- Test 1440 desktop,390 phone and320 reflow; touch, long content, keyboard/focus, no-JS showcase content, reduced motion at load/runtime, API unavailable/empty/failure and repeated navigation.
- One consolidated browser verification pass against the completed production preview, with source/targeted checks per earlier task. Baseline captures are comparison evidence, not repeated full audits per section.
- Required implementation gates: actual frontend/backend tests, tsc, lint, design lint, production build and a truthful fixture-based journey. Never run backend startup migrations against an unknown database for a screenshot.

## 9. Authority and implementation

This new specification is a narrow proposed replacement for historical Ledger visual constraints on showcase display type, photography, static paper shadows and finite editorial motion. It does not authorize framework migration, backend/database redesign, pricing, new integrations, licensing changes or a heavy animation dependency.

Install it under a new `docs/design-v2/` packet (ClearGig's existing docs use `docs/design-prompts`/superpowers, not a SupportGenius packet) or another conflict-free existing structure after inspecting the repo. Preserve historical specs, add clear precedence signposts and avoid duplicate full spec copies. Root `design.md` can be the canonical product design authority if no collision exists; prompts should link it.

One task/commit per section or app responsibility. See execution-plan.md and prompts/. The supplied HTML preview is a representative static/local-example reference, not the production Next app. Do not copy its demo behavior over real API handlers. Actual implementation remains in Antigravity on `design/cleargig-showcase-v2`; no publishing is included.
