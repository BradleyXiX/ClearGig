# Product Requirements Document (PRD): Gig Cost Estimator

## 1. Overview
A web application designed to calculate, manage, and export cost estimates for freelance software engineering projects. It allows the user to break down projects into specific line items (frontend, backend, cloud infrastructure), apply hourly rates, factor in AWS hosting costs, and add profit margins to generate a final proposal.

## 2. Core Features
*   **Project Management:** Create, read, update, and delete (CRUD) project estimates.
*   **Line-Item Costing:** Add specific tasks (e.g., "UI Implementation," "Database Setup") with estimated hours and hourly rates.
*   **Cloud & Recurring Costs:** Module to estimate monthly AWS costs (EC2, RDS, Lambda) and apply a markup for client billing.
*   **Contingency & Margin:** Global toggles to add a percentage buffer for unexpected delays and a profit margin.
*   **Summary Dashboard:** View total estimated costs across all pending and accepted gigs.

## 3. User Flow
1. User creates a new "Estimate Profile" for a prospective client.
2. User inputs development hours categorized by stack (Frontend, Backend, DevOps).
3. User adds expected monthly infrastructure costs.
4. System calculates the total project cost + recurring monthly maintenance.
5. User reviews the breakdown and locks the estimate.