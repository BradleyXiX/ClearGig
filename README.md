# ClearGig

> **A full-stack project estimation tool for software engineering contractors.**  
> Calculate scopes, hourly rates, contingency buffers, profit margins, and recurring cloud infrastructure costs — all in one clean dashboard.

[![CI/CD](https://github.com/BradleyXiX/ClearGig/actions/workflows/deploy.yml/badge.svg)](https://github.com/BradleyXiX/ClearGig/actions/workflows/deploy.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)

---

## ✨ Features & Application Routes

ClearGig provides a unified public showcase and an authentic, protected contractor estimating workspace:

| Route | Role | Description & Data Boundaries |
|---|---|---|
| `/showcase` | **Public Showcase** | Public landing page presenting contractor scope estimation, workstreams, interactive sample scenarios (`Website refresh`, `Product build`), and document previews. **Strictly price-free**: zero currency figures, rates, or dollar totals; no API or backend dependencies required for full initial paint. |
| `/` | **Estimate Wizard** | Five-step guided creation flow (`CLIENT → SCOPE → RATES → RECURRING → REVIEW`) with atomic client persistence, in-flight mutation locks, partial-save recovery, and graceful storage quota handling. |
| `/dashboard` | **Workspace Overview** | Client ledger and estimate registry displaying project statuses, one-time base sums, and recurring totals. Handles empty states, loading skeletons, and connection retry states. |
| `/projects/[id]` | **Project Editor & Audit** | Full estimate management with line-item CRUD, inline contingency/profit margin adjustments, status lifecycle transitions (`DRAFT → SENT → ACCEPTED / REJECTED`), and an interactive FinOps audit projection tab. |
| `/projects/[id]/document` | **Printable Estimate** | Branded, publication-ready contractor estimate document with repeated table headers across multi-page page breaks, totals breakdown, and client signature authorization line. |
| `/projects/[id]/document?variant=audit` | **Printable Audit** | Branded FinOps audit document showing baseline annual run-rates, projected savings, Net Present Value, and estimated client first-year net savings. |

---

## 🏗️ Architecture

```
┌──────────────────┐       HTTPS       ┌──────────────────┐       SQL       ┌────────────────────────┐
│     Vercel       │ ────────────────► │      Render      │ ──────────────► │        Supabase        │
│    (Next.js)     │                   │  (Express API)   │                 │ (PostgreSQL Database)  │
│ NEXT_PUBLIC_API_ │                   │  Free Web Service│                 │       Free Tier        │
│       URL        │                   │   render.yaml    │                 │                        │
└──────────────────┘                   └──────────────────┘                 └────────────────────────┘
```

ClearGig is 100% hosted on free cloud tiers:

| Layer | Service | Details |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Next.js 16 (App Router), React 19, Tailwind CSS 4, Geist Sans & Mono |
| Backend API | [Render](https://render.com) | Node.js Express 5, Prisma ORM (Free Web Service) |
| Database | [Supabase](https://supabase.com) | PostgreSQL 15 (Free Tier) |
| CI / Automation | GitHub Actions | Automated Linting, Prisma Generation, and Build verification |

---

## 📁 Project Structure

```
ClearGig/
├── frontend/               # Next.js app (deployed to Vercel)
│   ├── src/
│   │   ├── app/            # App Router pages (/showcase, /, /dashboard, /projects/[id])
│   │   ├── components/     # UI components (showcase, dashboard, UI primitives)
│   │   ├── lib/            # Business math (totals, audit, controllers, WAAPI motion)
│   │   └── services/       # Resilient REST API client (api.ts)
│   ├── scripts/            # Mock API fixtures and test runners
│   ├── vercel.json         # Vercel configuration
│   └── .env.example
├── backend/                # Express REST API (deployed to Render)
│   ├── controllers/        # Route handlers
│   ├── routes/             # API route definitions
│   ├── prisma/
│   │   └── schema.prisma   # Database models configured for Supabase
│   ├── render.yaml         # Render blueprint service configuration
│   └── .env.example
├── docs/                   # Design specifications & Considered Work packet
│   └── design-v2/          # Canonical execution plan, assets manifest, and verification logs
├── design.md               # Authoritative Considered Work specification
├── render.yaml             # Root Render Blueprint specification
├── docker-compose.yml      # Local development PostgreSQL stack
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions CI workflow
```

---

## 🚀 Local Development & Verification

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for local PostgreSQL) or a free [Supabase](https://supabase.com) database
- [Git](https://git-scm.com)

### 1. Clone the repository

```bash
git clone https://github.com/BradleyXiX/ClearGig.git
cd ClearGig
```

### 2. Set up and run the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

> Frontend dev server runs at `http://localhost:3000`. Navigate to `http://localhost:3000/showcase` for the public showcase or `http://localhost:3000/` for the estimate wizard.

### 3. Run Quality & Verification Gates

From `frontend/`:

```bash
# Type check (must exit 0 with 0 errors)
node node_modules/typescript/bin/tsc --noEmit --incremental false

# Unit & controller tests (99 tests across math, controllers, API resilience, and showcase)
node --test --test-timeout=5000 src/lib/*.test.ts src/services/*.test.ts

# Production build verification
npm run build
```

### 4. Optional: Local Backend & Database Stack

```bash
# Start local PostgreSQL
docker compose up -d db

# Start backend
cd ../backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

> Backend runs at `http://localhost:5001`.

---

## 🔬 Measured Verification & Performance Observations

Automated end-to-end browser, print, and timeline verification was conducted in November 2026 using Playwright Chromium and Poppler `pdftoppm` against an isolated production preview build (`next start -p 3005`):

- **Core Web Vitals (Local Unthrottled Loopback):**
  - **LCP:** Median `256 ms` (LCP candidate: hero image `boardroom-desktop-1200.avif`, candidate area 280,140 CSS px²; meets <= 2500 ms target).
  - **CLS:** Median `0.0000` (target <= 0.1).
  - **TTFB:** Median `6 ms`.
- **Bundle & Asset Transfer:**
  - Total transferred JavaScript: `158.48 KB` (decoded: `536.87 KB` across 19 resources).
  - CSS transferred: `9.01 KB`.
- **Throttled Timeline & Long Tasks (4x CPU Slowdown Observation):**
  - Captured CDP performance trace: `2.48 MB` JSON, `10,984 events`, `801 main-thread RunTasks`.
  - Observed 19 main-thread tasks > 50 ms under 4x CPU throttling, max `821.51 ms` (initial bundle parse/hydration during cold navigation) and bounded interactive tasks between `54.73 ms` and `151.42 ms`.
  - Synthetic scenario toggle latency (`pointerup` to next `requestAnimationFrame` render callback): mean `108.07 ms` over 6 alternating samples. *(Note: Approximate callback duration under synthetic 4x slowdown, not field INP or physical display presentation).*
- **Print & PDF Geometry:**
  - Multi-page estimate PDF (40 items): Verified 5 pages rendered with Poppler `pdftoppm` 26.07.0. Repeated table headers intact on all pages; totals and client signature block preserved on page 5 without clipping.
  - Audit PDF: Clean 1-page financial projection summary.
- **Detailed Evidence Dossier:**
  - Full reports, Poppler raster PNGs, and traces are cataloged in `docs/design-v2/` and the dated external redesign receipt dossier at `outputs/cleargig-redesign/receipts/`.

---

## 📖 Documentation & Design Standards

| Document | Description |
|---|---|
| [design.md](./design.md) | **Authoritative Specification:** Considered Work design system, tokens, layout, and motion boundaries |
| [docs/design-v2/START-HERE.md](./docs/design-v2/START-HERE.md) | Redesign packet navigation, role boundaries, and core guidelines |
| [docs/design-v2/execution-plan.md](./docs/design-v2/execution-plan.md) | 16-task redesign sequence, architecture guardrails, and budget targets |
| [docs/design-v2/assets-manifest.md](./docs/design-v2/assets-manifest.md) | Image asset roles, dimensions, AVIF/WebP responsive derivatives, and provenance |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Full system architecture and cloud infrastructure |
| [docs/API_SPEC.md](./docs/API_SPEC.md) | REST API endpoints, schemas, and payload specifications |
| [docs/PRD.md](./docs/PRD.md) | Product requirements and contractor user stories |

---

## 📊 Data Model

```
Client ──< Project ──< LineItem
```

| Model | Key Fields |
|---|---|
| `Client` | `id`, `name`, `email` |
| `Project` | `id`, `title`, `status`, `contingencyPercentage`, `profitMargin`, `clientId` |
| `LineItem` | `id`, `category`, `description`, `estimatedHours`, `hourlyRate`, `isRecurring`, `projectId` |

**Project statuses:** `DRAFT` → `SENT` → `ACCEPTED` \| `REJECTED`  
**Line item categories:** `FRONTEND`, `BACKEND`, `CLOUD`, `MAINTENANCE`

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
