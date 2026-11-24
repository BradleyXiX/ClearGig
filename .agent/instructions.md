# ClearGig Engineering & Design Instructions

## Authoritative Specification
The canonical Considered Work redesign specification is located at `design.md` (with packet documentation under `docs/design-v2/`). It is **authoritative** for the ClearGig showcase (`/showcase`) and approved workspace refinements.
The historical Ledger design specification (`docs/superpowers/specs/2026-11-03-cleargig-ledger-design.md`) and implementation plan (`docs/superpowers/plans/2026-11-03-cleargig-ledger.md`) are preserved as dated context and are superseded by `design.md` for the showcase redesign.

### Scope & Precedence Rules
- The new `/showcase` route is the public portfolio landing page. Existing routes (`/` wizard, `/dashboard`, `/projects/[id]`, `/projects/[id]/document[?variant=audit]`) are strictly preserved.
- **No prices on `/showcase`**: The showcase demonstrates scope, deliverables, workstreams, ongoing work, and document readiness without rates, prices, savings amounts, or monetary figures in any hero sheet, interactive example, mini workspace, or preview. Financial figures and formulas (`computeTotals`, `computeAudit`) remain active in the estimator and workspace.
- **Showcase typography exception**: Geist Sans and Geist Mono remain standard; a narrow system serif display role (`Georgia, 'Times New Roman', serif`, roman, normal weight) is permitted solely for selected showcase phrases as specified in `design.md`.
- **Approved media & static shadow exceptions**: Curated architectural photography under `public/cleargig/` and restrained static paper shadows/perspective are permitted on `/showcase` as specified in `design.md`.

---

## Architecture & Visual Standards

### 1. Approved Palette
The primary application tokens are defined in `frontend/src/app/globals.css`. The Considered Work semantic palette (canvas, paper, paper-muted, ink, muted, rule, control-border, brass, brass-ink, forest, dark-canvas, on-dark, on-dark-muted, danger, focus roles) maps to these semantic surfaces.
Never hardcode hex values inline or create arbitrary colors outside token definitions. Never use `dark:` class modifiers or pastel light-mode washes.

### 2. Prohibited Technologies & Anti-Patterns
The following libraries and patterns remain **strictly forbidden**:
- **Three.js / React Three Fiber / drei**: No 3D canvas or particle backgrounds.
- **GSAP / @gsap/react**: No GSAP tickers, timelines, or scroll triggers.
- **Lenis**: No smooth-scroll interceptors or hijacked scrolling. Native scroll only.
- **Custom Cursors**: Native pointer only (`cursor-none` is prohibited).
- **Glassmorphism / Blur**: No `backdrop-blur`, `glass`, or saturated overlay glows.
- **Gradients**: No background gradients. Backgrounds must be flat tones (text-clipped gradients are exempt where allowed by design-lint).
- **Arbitrary Tailwind Values**: No bracketed values like `text-[...]`, `w-[...]`, `p-[...]`, or `gap-[...]`.
- **Heavy Type Weights**: Cap at semibold (`font-semibold` / 600). No `font-black` or 800/900.
- **Italics**: No italic text anywhere in the interface.

### 3. Typography, Motion, Icons & Dependencies
- Typefaces: Geist Sans for headings, navigation, controls, and body; Geist Mono for all tabular figures, monetary totals, dates, and codes. (Showcase-only display accent: system serif).
- Numbers: Right-aligned with `font-mono tabular-nums`.
- Motion: Bounded native CSS/WAAPI/IntersectionObserver only, scoped to `transform` and `opacity`. No `transition-all`. Respect `prefers-reduced-motion` at initial load and runtime. One owner per animated property, cleanly aborting listeners/effects on unmount or offscreen.
  - Local app/control transitions: normally <=200ms, with 400ms as an upper bound (`cubic-bezier(0.22, 1, 0.36, 1)`).
  - Showcase hero paper sequence exception: finite 650–800ms assembly sequence as specified in `design.md`. Text, headings, and CTA button availability must never be delayed by this sequence.
- Icons: `lucide-react` with 1.5px stroke, 20px size, inheriting `currentColor`. Do not migrate to Phosphor or add icon packages.
- Dependencies: No new dependencies may be added. The removed packages (three, lenis, gsap, etc.) must never be reinstalled.

### 4. Verification Gates
Before proposing or committing changes:
```bash
npx tsc --noEmit
npm test
npm run build
npm run lint:design
```
All verification gates must exit 0. Pre-existing baseline failures must be distinguished and reported.
