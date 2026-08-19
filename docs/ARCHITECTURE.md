# Architecture & Tech Stack

## 1. Tech Stack
*   **Frontend:** Next.js (App Router), React, Tailwind CSS for styling.
*   **Backend:** Node.js with Express (acting as the API layer).
*   **Database:** PostgreSQL (Relational data structure for clients and line items).
*   **Deployment & Infrastructure:** AWS (Containerized via Docker, deployed using AWS ECR and Lambda/EC2).

## 2. System Architecture
*   **Client Layer:** Next.js handles the UI, form state management, and client-side validation.
*   **API Gateway:** Express server processes estimation logic, calculates totals, and handles database transactions.
*   **Persistence:** PostgreSQL stores client data, historical estimates, and standardized rate cards.

## 3. Design Principles
*   **Component-Driven:** Keep UI components modular (e.g., `<CostInput />`, `<SummaryCard />`).
*   **Stateless Computations:** All monetary calculations (margins, taxes, totals) should be handled by utility functions with strict floating-point handling to avoid rounding errors.