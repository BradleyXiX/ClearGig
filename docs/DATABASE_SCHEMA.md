# Database Schema — ClearGig

**ORM:** Prisma 7  
**Database:** PostgreSQL 15

---

## Entity Relationship Diagram

```
┌──────────────┐         ┌───────────────────┐         ┌──────────────────┐
│    clients   │         │     projects       │         │   line_items     │
├──────────────┤         ├───────────────────┤         ├──────────────────┤
│ id (PK)      │ 1     * │ id (PK)           │ 1     * │ id (PK)          │
│ name         │────────►│ client_id (FK)    │────────►│ project_id (FK)  │
│ email        │         │ title             │         │ category         │
│ created_at   │         │ status            │         │ description      │
└──────────────┘         │ contingency_%     │         │ estimated_hours  │
                         │ profit_margin     │         │ hourly_rate      │
                         │ created_at        │         │ is_recurring     │
                         │ updated_at        │         └──────────────────┘
                         └───────────────────┘
```

---

## Tables

### `clients`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | PK, UUID default | Unique client identifier |
| `name` | `TEXT` | NOT NULL | Client or company name |
| `email` | `TEXT` | NULLABLE | Contact email address |
| `created_at` | `TIMESTAMP` | NOT NULL, default now() | Record creation timestamp |

---

### `projects`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | PK, UUID default | Unique project identifier |
| `client_id` | `TEXT` | FK → clients.id | Owning client |
| `title` | `TEXT` | NOT NULL | Descriptive project name |
| `status` | `ProjectStatus` | NOT NULL, default `DRAFT` | Lifecycle status |
| `contingency_percentage` | `DECIMAL` | default `0.0` | Risk buffer % applied to base cost |
| `profit_margin` | `DECIMAL` | default `0.0` | Margin % applied to (base + contingency) |
| `created_at` | `TIMESTAMP` | NOT NULL, default now() | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | NOT NULL, auto-updated | Last modification timestamp |

**`ProjectStatus` enum values:**

| Value | Description |
|---|---|
| `DRAFT` | Estimate in progress, editable |
| `SENT` | Sent to client, locked for editing |
| `ACCEPTED` | Client accepted the estimate |
| `REJECTED` | Client rejected the estimate |

---

### `line_items`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | PK, UUID default | Unique line item identifier |
| `project_id` | `TEXT` | FK → projects.id, CASCADE DELETE | Parent project |
| `category` | `LineItemCategory` | NOT NULL | Work category |
| `description` | `TEXT` | NOT NULL | Work description |
| `estimated_hours` | `DECIMAL` | NOT NULL | Hours estimated for this item |
| `hourly_rate` | `DECIMAL` | NOT NULL | Rate in USD per hour |
| `is_recurring` | `BOOLEAN` | NOT NULL, default `false` | Whether cost repeats monthly |

**`LineItemCategory` enum values:**

| Value | Description |
|---|---|
| `FRONTEND` | UI/UX and client-side development |
| `BACKEND` | Server-side logic, APIs, databases |
| `CLOUD` | Infrastructure, DevOps, CI/CD |
| `MAINTENANCE` | Ongoing support and updates |

---

## Cascade Behaviour

- **Deleting a `Project`** → cascades to delete all associated `LineItem` records.
- **Deleting a `Client`** → does **not** cascade automatically. Projects must be deleted first.

---

## Migrations

Migrations are managed by Prisma and stored in `backend/prisma/migrations/`.

```bash
# Create a new migration (development)
npx prisma migrate dev --name <migration_name>

# Apply migrations (production — runs automatically on container start)
npx prisma migrate deploy
```