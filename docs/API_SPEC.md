# API Specifications

## Base URL: `/api/v1`

### Clients
*   **GET `/clients`**
    *   Returns a list of all clients.
*   **POST `/clients`**
    *   Payload: `{ name, email }`
    *   Creates a new client.

### Projects
*   **GET `/projects`** 
    *   Returns a list of all estimates.
*   **POST `/projects`**
    *   Payload: `{ client_id, title, contingency_percentage, profit_margin }`
    *   Creates a new project wrapper.
*   **GET `/projects/:id`**
    *   Returns project details, including joined `line_items`.
*   **PATCH `/projects/:id`**
    *   Payload: `{ contingency_percentage, profit_margin, title, status }`
    *   Updates specific fields on a project.
### Line Items
*   **POST `/projects/:id/line-items`**
    *   Payload: `{ category, description, estimated_hours, hourly_rate, is_recurring }`
    *   Adds a cost item to a specific project.
*   **DELETE `/line-items/:id`**
    *   Removes a cost item.