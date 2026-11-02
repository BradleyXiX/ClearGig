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

## ✨ Features

- **Project Estimation Dashboard** — Create and manage client project estimates with real-time cost calculations
- **Line Item Breakdown** — Categorize work into Frontend, Backend, Cloud/DevOps, and Maintenance
- **Recurring vs One-Time Costs** — Separate MRR (Monthly Recurring Revenue) from project-based fees
- **Contingency Buffer** — Configurable % buffer to account for scope creep (0–50%)
- **Profit Margin Control** — Global margin slider applied across the full estimate (0–100%)
- **Estimate Status Lifecycle** — Track estimates through `DRAFT → SENT → ACCEPTED / REJECTED`
- **Client Management** — Create and associate clients with projects inline
- **Auto-Locking** — Estimates lock for editing once sent or accepted

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
| Frontend | [Vercel](https://vercel.com) | Next.js 16, React 19, Tailwind CSS |
| Backend API | [Render](https://render.com) | Node.js Express 5, Prisma ORM (Free Web Service) |
| Database | [Supabase](https://supabase.com) | PostgreSQL 15 (Free Tier) |
| CI / Automation | GitHub Actions | Automated Linting, Prisma Generation, and Build verification |

---

## 📁 Project Structure

```
ClearGig/
├── frontend/               # Next.js app (deployed to Vercel)
│   ├── src/
│   │   ├── app/            # Pages (App Router)
│   │   ├── components/     # Reusable UI components
│   │   └── services/       # API client (api.ts)
│   ├── vercel.json         # Vercel configuration
│   └── .env.example
├── backend/                # Express REST API (deployed to Render)
│   ├── controllers/        # Route handlers
│   ├── routes/             # API route definitions
│   ├── prisma/
│   │   └── schema.prisma   # Database models configured for Supabase
│   ├── render.yaml         # Render blueprint service configuration
│   └── .env.example
├── render.yaml             # Root Render Blueprint specification
├── docs/                   # Design & specification documents
├── docker-compose.yml      # Local development stack
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions CI workflow
```

---

## 🚀 Local Development

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for local PostgreSQL) or a free [Supabase](https://supabase.com) database
- [Git](https://git-scm.com)

### 1. Clone the repository

```bash
git clone https://github.com/BradleyXiX/ClearGig.git
cd ClearGig
```

### 2. Start the local database (or connect to Supabase)

```bash
docker compose up -d db
```

### 3. Set up the backend

```bash
cd backend
cp .env.example .env   # Fill in your DATABASE_URL (local or Supabase)
npm install
npx prisma migrate dev
npm run dev
```

> Backend runs at `http://localhost:5001` (or configured PORT)

### 4. Set up the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

> Frontend runs at `http://localhost:3000`

### Environment Variables

**Backend (`backend/.env`)**

```env
PORT=5001
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env.local`)**

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

---

## 🌐 Deployment to Free Platforms

### 1. Database (Supabase)
1. Create a free project on [Supabase](https://supabase.com).
2. Under **Project Settings → Database**, copy the PostgreSQL connection string URI.
3. Use this URI as your `DATABASE_URL`.

### 2. Backend (Render Free Tier)
1. In [Render](https://render.com), create a new Blueprint or Web Service connecting your GitHub repository.
2. Render detects `render.yaml` automatically.
3. Set the environment variable:
   - `DATABASE_URL`: Your Supabase connection string.
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://cleargig.vercel.app`).
4. Render deploys the backend service with health checks at `/api/v1/health`.

### 3. Frontend (Vercel)
1. In [Vercel](https://vercel.com), import the repository.
2. Set the **Root Directory** to `frontend`.
3. Add the environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL with `/api/v1` (e.g. `https://cleargig-backend.onrender.com/api/v1`).
4. Deploy!

---

## ⚙️ CI/CD Pipeline

Every push or pull request to `main` triggers automated GitHub Actions verification:

```
git push main
    │
    ├── 1. frontend-lint-and-build → ESLint & Next.js production build verification
    └── 2. backend-validate        → Prisma client generation & syntax check
```

Deployments are handled automatically by Render and Vercel on push to `main`.

---

## 📖 Documentation

| Document | Description |
|---|---|
| [PRD](./docs/PRD.md) | Product requirements and user flows |
| [Architecture](./docs/ARCHITECTURE.md) | System design and tech stack |
| [Database Schema](./docs/DATABASE_SCHEMA.md) | Relational data models |
| [API Specification](./docs/API_SPEC.md) | REST endpoints and payloads |

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

**Project statuses:** `DRAFT` → `SENT` → `ACCEPTED` | `REJECTED`  
**Line item categories:** `FRONTEND`, `BACKEND`, `CLOUD`, `MAINTENANCE`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
