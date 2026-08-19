# Database Schema (PostgreSQL)

## Tables

### `clients`
*   `id` (UUID, Primary Key)
*   `name` (VARCHAR)
*   `email` (VARCHAR, Nullable)
*   `created_at` (TIMESTAMP)

### `projects`
*   `id` (UUID, Primary Key)
*   `client_id` (UUID, Foreign Key -> clients.id)
*   `title` (VARCHAR)
*   `status` (ENUM: 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED')
*   `contingency_percentage` (DECIMAL)
*   `profit_margin` (DECIMAL)
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

### `line_items`
*   `id` (UUID, Primary Key)
*   `project_id` (UUID, Foreign Key -> projects.id)
*   `category` (ENUM: 'FRONTEND', 'BACKEND', 'CLOUD', 'MAINTENANCE')
*   `description` (TEXT)
*   `estimated_hours` (DECIMAL)
*   `hourly_rate` (DECIMAL)
*   `is_recurring` (BOOLEAN) - True for monthly AWS/hosting costs

## Relationships
*   A `Client` has many `Projects`.
*   A `Project` has many `LineItems`.