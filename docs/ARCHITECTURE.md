# Architecture — ClearGig

## Overview

ClearGig is a full-stack monorepo consisting of frontend and backend services migrated to 100% free cloud platforms (Vercel, Render, and Supabase).

## System Diagram

```
┌────────────────────────────────┐       HTTPS       ┌────────────────────────────────┐
│      Vercel (Free Tier)        │ ────────────────► │       Render (Free Tier)       │
│                                │                   │                                │
│      Next.js 16 (App Router)   │                   │      Express 5 REST API        │
│      React 19 / TypeScript     │                   │      Node.js Runtime           │
│      Tailwind CSS / Three.js   │                   │      Prisma ORM (@prisma/pg)   │
└────────────────────────────────┘                   └────────────────────────────────┘
                                                                     │
                                                                     │ SQL (Port 5432 / SSL)
                                                                     ▼
                                                     ┌────────────────────────────────┐
                                                     │     Supabase (Free Tier)       │
                                                     │                                │
                                                     │   PostgreSQL 15 Database       │
                                                     │   Client / Project / LineItem  │
                                                     └────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Hosting / Provider | Notes |
|---|---|---|---|
| Frontend | Next.js 16, React 19, TypeScript | Vercel | Global edge CDN, fast builds |
| Styling | Tailwind CSS 4, Lucide Icons | Vercel | Utility-first CSS |
| Backend | Node.js, Express 5 | Render | Free web service, automated blueprints |
| ORM | Prisma 7 | Render | Type-safe database client (`@prisma/adapter-pg`) |
| Database | PostgreSQL 15 | Supabase | Free managed database with SSL connection |
| CI/CD | GitHub Actions | GitHub | Automated lint, build, and schema validation |

## Repository Structure

```
ClearGig/
├── frontend/                    # Next.js 16 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Interactive estimator view
│   │   │   ├── dashboard/       # Command center dashboard
│   │   │   └── projects/[id]/   # Project estimate breakdown
│   │   ├── components/          # Reusable UI components
│   │   └── services/
│   │       └── api.ts           # Dynamic API client (NEXT_PUBLIC_API_URL)
│   ├── vercel.json              # Vercel deployment configuration
│   └── package.json
│
├── backend/                     # Express REST API
│   ├── server.js                # Entry point, health check endpoints
│   ├── routes/                  # API routes (projects, clients, line items)
│   ├── controllers/             # Business logic handlers
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (PostgreSQL standard connection)
│   │   └── migrations/          # Migration SQL scripts
│   ├── render.yaml              # Render blueprint service configuration
│   └── package.json
│
├── render.yaml                  # Monorepo Render Blueprint
├── docs/                        # Architecture & PRD documentation
└── .github/
    └── workflows/
        └── deploy.yml           # CI workflow (frontend & backend verification)
```

## CI/CD Pipeline

```
git push → main
    │
    ▼
[GitHub Actions]
    │
    ├── JOB 1: frontend-lint-and-build
    │   ├── Setup Node 20
    │   ├── ESLint on /frontend
    │   └── Next.js production build verification
    │
    └── JOB 2: backend-validate
        ├── Setup Node 20
        ├── Prisma client generation
        └── Server syntax check
```

Automated deployments happen upon push to `main`:
- **Vercel** deploys the frontend from `./frontend`.
- **Render** builds and deploys the backend service from `./backend` using `render.yaml`.

## Infrastructure

| Resource | Service | Details |
|---|---|---|
| Frontend | Vercel Free Tier | Automatic SSL, Next.js optimization |
| Backend | Render Free Tier | Web Service (0.1 CPU, 512 MB RAM), auto-deploy from Git |
| Database | Supabase Free Tier | Managed PostgreSQL 15, SSL encryption, connection pooling |

## Design Decisions

- **100% Free Hosting**: Eliminates all cloud infrastructure costs by leveraging generous free tiers from Vercel, Render, and Supabase.
- **Dynamic API Base URL**: Frontend dynamically normalizes `NEXT_PUBLIC_API_URL` to route requests to the Render backend service across dev and production.
- **Prisma with PG Driver Adapter**: Uses `@prisma/adapter-pg` with node-postgres connection pooling and SSL support for hosted PostgreSQL instances like Supabase.
