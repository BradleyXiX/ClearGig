# Product Requirements Document — ClearGig

**Version:** 1.0  
**Status:** Implemented

---

## Problem Statement

Software engineering contractors and freelancers often struggle to produce accurate, professional estimates quickly. Pricing decisions are made ad-hoc in spreadsheets, without visibility into total project value, recurring costs, or margin health. ClearGig solves this by providing a structured, real-time estimation tool built specifically for technical contractors.

---

## Target User

- Freelance software engineers
- Small dev agencies
- Technical contractors who manage their own client relationships

---

## Core Features

### 1. Project Dashboard
- View all active estimates in a card-based grid layout
- Display aggregate metrics at a glance:
  - **Total Pipeline Value** — sum of all non-recurring project costs
  - **Monthly Recurring Revenue (MRR)** — sum of recurring line items across all projects
  - **Active Estimates** — count of non-rejected projects

### 2. Client Management
- Create clients with a name and optional email
- Associate a client with one or more projects
- Create clients inline during project creation (no separate page needed)

### 3. Project Estimation
- Each project has a **title**, **client**, and a **status**
- Add line items to a project, categorized as:
  - `FRONTEND`, `BACKEND`, `CLOUD`, `MAINTENANCE`
- Each line item has:
  - Description
  - Estimated hours
  - Hourly rate
  - Recurring toggle (monthly cost vs one-time)
- **Contingency Buffer** (0–50%): applied to non-recurring base cost
- **Profit Margin** (0–100%): applied to `(base + contingency)`

### 4. Estimate Lifecycle
- Estimates follow the status flow: `DRAFT → SENT → ACCEPTED | REJECTED`
- When status is not `DRAFT`, the estimate is **locked** — no line items can be added or removed
- Status can be changed at any time from the project detail page

### 5. Real-Time Cost Calculation
All cost metrics are calculated client-side and update instantly as the user adjusts sliders:

```
Base Cost    = Σ non-recurring (hours × rate)
Contingency  = base × contingency%
Profit       = (base + contingency) × margin%
Total        = base + contingency + profit

MRR          = Σ recurring (hours × rate) × (1 + margin%)
```

### 6. Project Deletion
- Projects can be deleted with a confirmation dialog
- Deletion cascades to all associated line items

---

## User Flows

### Flow 1: Create and Price a New Estimate

1. Click **"New Estimate"** on the dashboard
2. Enter a project title
3. Select or create a client
4. Submit → navigated to the project detail page
5. Add line items (category, description, hours, rate, recurring toggle)
6. Adjust contingency and profit margin sliders
7. Review the Summary Panel
8. Click **"Save Estimate"** → status remains `DRAFT`

### Flow 2: Send and Track an Estimate

1. Open an existing estimate
2. Change status dropdown from `DRAFT` to `SENT`
3. Click **"Save Estimate"** → estimate becomes locked
4. Update status to `ACCEPTED` or `REJECTED` once client responds

---

## Out of Scope (v1.0)

- PDF/export of estimates
- Email delivery to clients
- User authentication / multi-tenancy
- Currency selection (USD only)
- Invoice generation
- Time tracking integration