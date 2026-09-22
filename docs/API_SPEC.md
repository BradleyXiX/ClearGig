# API Specification — ClearGig

**Base URL:** `http://<host>:5000/api/v1`  
**Content-Type:** `application/json`

---

## Clients

### `GET /clients`
Returns all clients.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "createdAt": "2026-09-01T00:00:00.000Z"
  }
]
```

---

### `POST /clients`
Creates a new client.

**Request Body**
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com"
}
```

**Response `201`**
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "createdAt": "2026-09-01T00:00:00.000Z"
}
```

---

## Projects

### `GET /projects`
Returns all projects with their line items included.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "title": "E-commerce Redesign",
    "status": "DRAFT",
    "contingencyPercentage": "10",
    "profitMargin": "20",
    "clientId": "uuid",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "updatedAt": "2026-09-01T00:00:00.000Z",
    "lineItems": []
  }
]
```

---

### `POST /projects`
Creates a new project.

**Request Body**
```json
{
  "title": "E-commerce Redesign",
  "client_id": "uuid",
  "contingency_percentage": 10,
  "profit_margin": 20
}
```

**Response `201`** — Returns the created project object.

---

### `GET /projects/:id`
Returns a single project with its line items.

**Response `200`** — Returns the full project object.  
**Response `404`** — `{ "error": "Project not found" }`

---

### `PUT /projects/:id`
Updates a project's status, contingency, or profit margin.

**Request Body** *(all fields optional)*
```json
{
  "status": "SENT",
  "contingency_percentage": 15,
  "profit_margin": 25
}
```

**Valid status values:** `DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`

**Response `200`** — Returns the updated project object.

---

### `DELETE /projects/:id`
Deletes a project and all its associated line items (cascades).

**Response `204`** — No content.

---

## Line Items

### `POST /projects/:projectId/line-items`
Adds a line item to a project.

**Request Body**
```json
{
  "category": "BACKEND",
  "description": "Set up authentication with JWT",
  "estimated_hours": 12,
  "hourly_rate": 85,
  "is_recurring": false
}
```

**Valid category values:** `FRONTEND`, `BACKEND`, `CLOUD`, `MAINTENANCE`

**Response `201`** — Returns the created line item.

---

### `DELETE /line-items/:id`
Deletes a specific line item.

**Response `204`** — No content.

---

## Cost Calculation Formula

All calculations are performed client-side in the frontend:

```
Base Cost       = Σ (estimatedHours × hourlyRate) for non-recurring items
Contingency     = baseCost × (contingencyPercentage / 100)
Profit          = (baseCost + contingency) × (profitMargin / 100)
Total Price     = baseCost + contingency + profit

Monthly Recurring = Σ (estimatedHours × hourlyRate) for recurring items
                    + profit margin applied
```

---

## Error Responses

All error responses follow the format:

```json
{
  "error": "Human-readable error message"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad Request — missing or invalid fields |
| `404` | Not Found — resource does not exist |
| `500` | Internal Server Error |