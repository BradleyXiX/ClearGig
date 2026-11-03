# ClearGig Engineering & Design Instructions

## Authoritative Specification
The Ledger design specification at `docs/superpowers/specs/2026-11-03-cleargig-ledger-design.md` and the implementation plan at `docs/superpowers/plans/2026-11-03-cleargig-ledger.md` are **authoritative** for ClearGig frontend development.

---

## Architecture & Visual Standards

### 1. Approved Palette
Only ten tokens are permitted in the application, defined in `frontend/src/app/globals.css`:
- `--paper` (#F7F4EE)
- `--paper-raised` (#FFFDF8)
- `--paper-sunken` (#EFEBE1)
- `--ink` (#14140F)
- `--ink-muted` (#5C5A52)
- `--rule` (#D9D4C7)
- `--rule-strong` (#B9B2A1)
- `--accent` (#1E4A3C)
- `--accent-wash` (#E7EDE8)
- `--danger` (#8A2B1F)

Never hardcode hex values inline or create arbitrary colors. Never use `dark:` class modifiers or pastel light-mode washes.

### 2. Prohibited Technologies & Anti-Patterns
The following libraries and patterns are **explicitly out of scope and forbidden**:
- **Three.js / React Three Fiber / drei**: No 3D canvas or particle backgrounds.
- **GSAP / @gsap/react**: No GSAP tickers, timelines, or scroll triggers.
- **Lenis**: No smooth-scroll interceptors or hijacked scrolling.
- **Custom Cursors**: Native pointer only (`cursor-none` is prohibited).
- **Glassmorphism / Blur**: No `backdrop-blur`, `glass`, or saturated overlay glows.
- **Gradients**: No background gradients. Backgrounds must be flat paper tones.
- **Arbitrary Tailwind Values**: No bracketed values like `text-[...]`, `w-[...]`, `p-[...]`, or `gap-[...]`.
- **Heavy Type Weights**: Cap at semibold (`font-semibold` / 600). No `font-black` or 800/900.
- **Italics**: No italic text anywhere in the interface.

### 3. Typography & Motion
- Typefaces: Geist Sans for headings and body; Geist Mono for all tabular figures, monetary totals, dates, and codes.
- Numbers: Right-aligned with `font-mono tabular-nums`.
- Motion: Max 400ms using `cubic-bezier(0.22, 1, 0.36, 1)`, scoped to `transform` and `opacity` only. No `transition-all`.
- Icons: `lucide-react` with 1.5px stroke, 20px size, inheriting `currentColor`.

### 4. Verification Gates
Before proposing or committing changes:
```bash
npx tsc --noEmit
npm test
npm run build
npm run lint:design
```
All four gates must exit 0.
