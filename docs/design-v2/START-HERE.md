# ClearGig — Considered Work Redesign Packet

This packet contains supporting documentation and planning artifacts for the **Considered Work** redesign of ClearGig.

## Canonical Design Authority

The single canonical design specification for this project lives at the repository root:
- **[`../../design.md`](../../design.md)** — authoritative palette tokens, typography, responsive composition, section copy, interaction states, and motion matrix.

## Design Packet Documents

- **[`execution-plan.md`](execution-plan.md)** — Detailed 16-task execution sequence, responsibility boundaries, performance budgets, and acceptance criteria.
- **[`assets-manifest.md`](assets-manifest.md)** — Asset roles, provenance, dimension/byte targets, and measured responsive derivatives under `frontend/public/cleargig/`.
- **[`source-audit.md`](source-audit.md)** — Pre-redesign technical source audit and boundary definitions (historical planning context).
- **[`verification.md`](verification.md)** — Initial standalone prototype planning verification (historical reference).

## Core Principles & Scope

1. **New Showcase Entry**: `/showcase` is the new public portfolio entry presenting contractor scope estimation.
2. **Preserved App Routes & Workflows**: Existing routes are preserved:
   - `/` — Five-state estimate wizard
   - `/dashboard` — Projects ledger and client totals
   - `/projects/[id]` — Estimate editing and FinOps tab
   - `/projects/[id]/document` — Branded printable estimate
   - `/projects/[id]/document?variant=audit` — Branded printable audit
3. **No Prices on `/showcase`**: The landing page demonstrates scope, deliverables, workstreams, ongoing work, and document readiness without display of rates, currency amounts, or monetary totals. Financial figures and calculations remain active in the working application routes and printed documents.
4. **Clean Stack Preservation**: Native Next.js 16 (App Router), React 19, Tailwind CSS 4, Geist Sans & Mono. Native scroll only; no 3D canvas, GSAP tickers, Lenis scroll hijacking, or custom cursors.

## Context & Execution Prompts

The interactive HTML reference preview and individual task execution prompts were delivered separately in the owner-provided redesign kit outside the repository. Each task prompt is executed sequentially on the `design/cleargig-showcase-v2` branch with explicit scoped commits and verification receipts stored in the external kit's `receipts/` directory.
