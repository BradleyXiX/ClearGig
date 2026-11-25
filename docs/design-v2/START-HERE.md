# ClearGig — Considered Work Redesign Packet

This packet contains supporting documentation and planning artifacts for the **Considered Work** redesign of ClearGig.

## Canonical Design Authority

The single canonical design specification for this project lives at the repository root:
- **[`../../design.md`](../../design.md)** — Authoritative palette tokens, typography, responsive composition, section copy, interaction states, and motion matrix.

## Design Packet Documents

- **[`execution-plan.md`](execution-plan.md)** — Detailed 16-task execution sequence, responsibility boundaries, performance budgets, and acceptance criteria.
- **[`assets-manifest.md`](assets-manifest.md)** — Asset roles, provenance, dimension/byte targets, and measured responsive derivatives under `frontend/public/cleargig/`.
- **[`integrated-verification.md`](integrated-verification.md)** — **Current Integrated Verification Report (November 2026):** Consolidated end-to-end evidence covering `/showcase`, wizard partial recovery, project dirty-state handling, FinOps parity, Poppler multi-page PDF rendering, and measured performance observations with documented limitations.
- **[`source-audit.md`](source-audit.md)** — Pre-redesign technical source audit and boundary definitions (historical planning context).
- **[`verification.md`](verification.md)** — Initial standalone prototype planning verification (historical reference evaluating an early static HTML reference).

## Core Principles & Scope Boundaries

1. **New Showcase Entry**: `/showcase` is the public portfolio entry presenting contractor scope estimation, workstreams, and document readiness.
2. **Preserved App Routes & Workflows**: Existing working routes are preserved:
   - `/` — Five-step estimate wizard with client reuse, partial-save recovery, and storage quota resilience.
   - `/dashboard` — Projects ledger and client totals rail.
   - `/projects/[id]` — Estimate editing, line item CRUD, inline adjustments, and FinOps audit tab.
   - `/projects/[id]/document` — Branded printable estimate with multi-page table header repetition and signature line.
   - `/projects/[id]/document?variant=audit` — Branded printable audit with 5-metric formula parity.
3. **Strictly Price-Free Showcase**: The `/showcase` landing page demonstrates scope, deliverables, workstreams, ongoing work, and document readiness without display of rates, currency amounts, or monetary totals. Financial figures and calculations remain active in the working application routes and printed documents.
4. **Clean Stack Preservation**: Native Next.js 16 (App Router), React 19, Tailwind CSS 4, Geist Sans & Mono. Native scroll only; no 3D canvas, GSAP tickers, Lenis scroll hijacking, or custom cursors.
5. **No API Dependencies on Initial Marketing Paint**: The showcase initial render does not depend on live backend or mock API calls.

## Verification & Execution Context

The interactive HTML reference preview and individual task execution prompts were delivered in the owner-provided redesign kit. Each task prompt was executed sequentially on the `design/cleargig-showcase-v2` branch with explicit scoped commits and verification receipts stored in the external kit's `receipts/` directory.

- The repository-owned integrated verification report is maintained at [`integrated-verification.md`](integrated-verification.md), with curated screenshots and sample PDFs tracked in [`evidence/`](evidence/).
- Automated test gates (`node --test src/lib/*.test.ts src/services/*.test.ts`) verify 99 passing tests across math formulas, controller lifecycles, API resilience, and showcase contracts.
