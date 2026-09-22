# Architecture — ClearGig

## Overview

ClearGig is a full-stack monorepo consisting of three services orchestrated via Docker Compose and deployed to AWS EC2.

## System Diagram

```
┌─────────────────────────────────────────────────────┐
│                    AWS EC2 (t2.micro)               │
│                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────┐ │
│  │  Next.js 16 │   │  Express 5  │   │ Postgres  │ │
│  │  Port: 80   │──►│  Port: 5000 │──►│ Port:5432 │ │
│  │  TypeScript │   │  Prisma ORM │   │  Alpine   │ │
│  └─────────────┘   └─────────────┘   └───────────┘ │
│         ▲                 ▲                         │
└─────────┼─────────────────┼─────────────────────────┘
          │                 │
      Port 80          Port 5000
      (Public)          (Public)
```

## Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend | Next.js | 16.x | App Router, React Server Components |
| UI Library | React | 19.x | With TypeScript |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Icons | Lucide React | 1.x | SVG icon library |
| Backend | Express | 5.x | REST API |
| ORM | Prisma | 7.x | Type-safe database client |
| Database | PostgreSQL | 15 | Alpine Docker image |
| Containerization | Docker | Latest | Multi-stage builds |
| Orchestration | Docker Compose | v2 | Dev & production configs |
| Registry | AWS ECR | - | Private container registry |
| Hosting | AWS EC2 | t2.micro | Free-tier eligible |
| CI/CD | GitHub Actions | - | Automated lint, build, deploy |

## Repository Structure

```
ClearGig/
├── frontend/                    # Next.js 16 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Dashboard (project list)
│   │   │   └── projects/[id]/   # Project detail page
│   │   ├── components/
│   │   │   ├── ProjectCard.tsx  # Project summary card
│   │   │   ├── LineItemTable.tsx# Itemized cost table
│   │   │   └── SummaryPanel.tsx # Cost summary sidebar
│   │   └── services/
│   │       └── api.ts           # HTTP client & TypeScript types
│   ├── Dockerfile               # Multi-stage production build
│   └── package.json
│
├── backend/                     # Express REST API
│   ├── server.js                # Entry point, middleware config
│   ├── routes/                  # Route definitions
│   ├── controllers/             # Business logic handlers
│   ├── prisma/
│   │   ├── schema.prisma        # Data models
│   │   └── migrations/          # Database migration history
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml           # Local development stack
├── docker-compose.prod.yml      # Production stack (ECR images)
│
└── .github/
    └── workflows/
        └── deploy.yml           # CI/CD pipeline (lint → build → deploy)
```

## CI/CD Pipeline

```
git push → main
    │
    ▼
[GitHub Actions]
    │
    ├── JOB 1: lint
    │   └── ESLint on /frontend
    │
    ├── JOB 2: build-and-push  (needs: lint)
    │   ├── Configure AWS credentials
    │   ├── Login to ECR
    │   ├── docker build + push → cleargig-backend:latest
    │   └── docker build + push → cleargig-frontend:latest
    │
    └── JOB 3: deploy  (needs: build-and-push)
        ├── SCP docker-compose.prod.yml → EC2
        ├── SSH → EC2
        ├── aws ecr get-login-password | docker login
        ├── docker compose pull
        └── docker compose up -d
```

## Infrastructure

| Resource | Service | Details |
|---|---|---|
| Container Images | AWS ECR | `cleargig-backend`, `cleargig-frontend` (private, `latest` tag) |
| Compute | AWS EC2 | `t2.micro`, Ubuntu 24.04 LTS, `us-east-1` |
| Networking | AWS VPC | Default VPC, Security Group with ports 22, 80, 5000 |
| Storage | EBS | 8 GB gp3 root volume (default) |
| Database | Docker Volume | `pgdata_prod` — persisted across container restarts |

## Design Decisions

- **Monorepo**: Frontend and backend share a single repository for simplified CI/CD and issue tracking.
- **Docker on EC2 over ECS/Fargate**: Chosen for zero-cost operation within the AWS free tier, with no added orchestration complexity for a portfolio project.
- **Prisma ORM**: Provides type-safe database queries and a declarative migration system that runs on container startup (`prisma migrate deploy`).
- **`latest` image tag**: Acceptable for a demo/portfolio project. Production systems should use SHA-pinned or version-tagged images.