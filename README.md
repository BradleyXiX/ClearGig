# ClearGig

> **A full-stack project estimation tool for software engineering contractors.**  
> Calculate scopes, hourly rates, contingency buffers, profit margins, and recurring cloud infrastructure costs — all in one clean dashboard.

[![CI/CD](https://github.com/BradleyXiX/ClearGig/actions/workflows/deploy.yml/badge.svg)](https://github.com/BradleyXiX/ClearGig/actions/workflows/deploy.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![AWS](https://img.shields.io/badge/AWS-EC2%20%2B%20ECR-FF9900?logo=amazonaws)

---

## 🌐 Live Demo

**[http://3.84.58.16](http://3.84.58.16)**

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
┌─────────────────┐     HTTP      ┌─────────────────┐     SQL      ┌──────────────┐
│   Next.js 16    │ ────────────► │  Express API    │ ───────────► │  PostgreSQL  │
│   (Port 80)     │               │  (Port 5000)    │              │  (Port 5432) │
│   TypeScript    │               │  Node.js        │              │  Prisma ORM  │
└─────────────────┘               └─────────────────┘              └──────────────┘
```

All three services run in Docker containers on a single AWS EC2 instance (t2.micro), orchestrated by Docker Compose.

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 5, Prisma ORM |
| Database | PostgreSQL 15 |
| Container Registry | AWS ECR (Elastic Container Registry) |
| Hosting | AWS EC2 (t2.micro — free tier) |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
ClearGig/
├── frontend/               # Next.js app
│   ├── src/
│   │   ├── app/            # Pages (App Router)
│   │   ├── components/     # Reusable UI components
│   │   └── services/       # API client (api.ts)
│   └── Dockerfile
├── backend/                # Express REST API
│   ├── controllers/        # Route handlers
│   ├── routes/             # API route definitions
│   ├── prisma/
│   │   └── schema.prisma   # Database models
│   └── Dockerfile
├── docs/                   # Design & specification documents
├── docker-compose.yml      # Local development
├── docker-compose.prod.yml # Production (used by CI/CD)
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions CI/CD pipeline
```

---

## 🚀 Local Development

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com)

### 1. Clone the repository

```bash
git clone https://github.com/BradleyXiX/ClearGig.git
cd ClearGig
```

### 2. Start the database

```bash
docker compose up -d db
```

### 3. Set up the backend

```bash
cd backend
cp .env.example .env   # Fill in your DATABASE_URL
npm install
npx prisma migrate dev
npm run dev
```

> Backend runs at `http://localhost:5000`

### 4. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs at `http://localhost:3000`

### Environment Variables

**Backend (`backend/.env`)**

```env
DATABASE_URL="postgresql://admin:password@localhost:5432/cleargig?schema=public"
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env.local`)**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 🐳 Running with Docker (Full Stack)

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api/v1 |
| PostgreSQL | localhost:5432 |

---

## ⚙️ CI/CD Pipeline

Every push to `main` triggers a 3-stage GitHub Actions workflow:

```
git push main
    │
    ├── 1. lint          → ESLint on frontend code
    ├── 2. build-and-push → Docker images built & pushed to AWS ECR
    └── 3. deploy        → SSH into EC2, pull images, restart containers
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | ECR/EC2 region (e.g. `us-east-1`) |
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID |
| `EC2_HOST` | EC2 public IP address |
| `EC2_USERNAME` | EC2 SSH username (`ubuntu`) |
| `EC2_SSH_KEY` | Private key (`.pem` file contents) |
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `FRONTEND_URL` | Public URL of the frontend |
| `NEXT_PUBLIC_API_URL` | Public URL of the backend API |

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
