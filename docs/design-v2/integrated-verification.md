# ClearGig Integrated Verification Report (November 2026)

**Date:** 25 November 2026  
**Commit Range:** `6ae29e1` to `89a091a`  
**Execution Branch:** `design/cleargig-showcase-v2`  
**Automated Verification Suite:** `frontend/scripts/verify-task14.py`  
**Test Environment:** Windows (Node v24.22.1 / Python 3.13), Next.js 16.3.2 production preview (`next start -p 3005`), Playwright Chromium 145.0.7632.6, Poppler `pdftoppm` 26.07.0.

---

## 1. Scope & Execution Overview

This document presents the integrated verification findings for the ClearGig application across the public showcase (`/showcase`), estimator wizard (`/`), workspace ledger (`/dashboard`), project editor (`/projects/[id]`), and branded print documents (`/projects/[id]/document`).

This report supersedes the initial standalone prototype planning notes in [`verification.md`](./verification.md), which evaluated an early static HTML reference rather than the integrated application.

---

## 2. Tested Capabilities & Route Parity

| Route / Area | Test Method | Observed Result | Evidence Artifact |
|---|---|---|---|
| `/showcase` Composition & Multi-Viewport | Viewports: 1440×1000, 390×844, 320×568; full reflow inspection | Zero horizontal overflow; text nodes strictly price-free; native `<details>` FAQ disclosures operate without JS | [`showcase-desktop-1440.png`](./evidence/showcase-desktop-1440.png)<br>[`showcase-mobile-390.png`](./evidence/showcase-mobile-390.png) |
| `/showcase` WAAPI Motion Lifecycle | Media query override (`prefers-reduced-motion: reduce`) & viewport scroll | Zero active animations in reduced-motion mode; offscreen scroll pauses WAAPI animations (frozen at 150.0ms); on-screen scroll resumes; tilt returns to neutral matrix | Test assertions in Area 2 of `verify-task14.py` |
| `/` Estimate Creation & Partial Recovery | Mock network with simulated 500 failure during line-item save | Client is persisted once; subsequent project failure locks creation; inline error offers `Inspect partial project` link without re-issuing duplicate writes; storage quota errors handled gracefully | [`wizard-recovery.png`](./evidence/wizard-recovery.png) |
| `/projects/[id]` Dirty State & Race Guards | Simulated slow request A (1.8s) vs fast request B; simulated 503 on project refresh | Fast Project B view preserved over late arriving A; unsaved local contingency adjustments (e.g. 33%) survive 503 read rejections; retry reads issue `GET` only | Test assertions in Area 5 of `verify-task14.py` |
| `/projects/[id]` FinOps Audit to Document Export | Tested rate parameters 0%, 1%, 30%, 100% and spend variations | All 5 on-screen audit metrics (monthly savings, optimized spend, annualized savings, contingency fee, client net savings) match document export view identically | Parity confirmed in Area 6 of `verify-task14.py` |
| Printable Estimate PDF | 40 line-item dataset rendered to PDF and rasterized at 150 DPI with Poppler | 5 complete pages; repeated table headers (`DESCRIPTION`, `HOURS`, `RATE`, `AMOUNT`) on every page; base totals, contingency, profit margin, and client signature intact on page 5 | [`estimate-40-items.pdf`](./evidence/estimate-40-items.pdf)<br>Page 1: [`poppler-estimate-page-1.png`](./evidence/poppler-estimate-page-1.png)<br>Page 5: [`poppler-estimate-page-5.png`](./evidence/poppler-estimate-page-5.png) |
| Printable Audit PDF | FinOps scenario export rendered to PDF | 1 complete page with clear scenario assumptions, annualized projections, contingency fee, and net savings | [`audit-finops.pdf`](./evidence/audit-finops.pdf)<br>[`poppler-audit-page-1.png`](./evidence/poppler-audit-page-1.png) |

---

## 3. Measured Performance & Resource Metrics

All measurements were captured against an isolated production preview server (`http://localhost:3005`):

### A. Unthrottled Local Loopback Metrics (Cold Runs)
- **Largest Contentful Paint (LCP):** Median **256 ms** across 3 cold runs.
  - LCP candidate: hero image `boardroom-desktop-1200.avif`.
  - Candidate rendered area: **280,140 CSS px²** (area in CSS pixels, distinct from transfer byte weight).
- **Cumulative Layout Shift (CLS):** Median **0.0000** (target <= 0.1).
- **Time to First Byte (TTFB):** Median **6 ms**.
- **JavaScript Transfer Weight:** Total transferred JS: **158.48 KB** (decoded size: **536.87 KB** across 19 resources).
- **CSS Transfer Weight:** Total transferred CSS: **9.01 KB**.

### B. Synthetic Throttled Performance Trace (4x CPU Slowdown)
Captured via Chrome DevTools Protocol (`Tracing.start` / `Tracing.end`) under active 4x CPU slowdown:
- **Captured Trace Event Count:** 10,984 events (2.48 MB JSON).
- **Trace Window:** 7,698.2 ms.
- **Renderer Main Thread Tasks:** 801 `RunTask` events.
- **Observed Long Tasks (> 50 ms):** 19 tasks observed on the main thread during navigation and rapid interaction.
  - Maximum observed task duration: **821.51 ms** (captured during cold initial page load and script evaluation under 4x CPU throttling).
  - Secondary durations during load: 631.15 ms, 784.40 ms, 259.55 ms, 245.10 ms.
  - Interactive scenario toggling task durations remained bounded between 54.73 ms and 151.42 ms.
- **Scenario Toggle Latency Callback Approximation:**
  - Alternating toggle of `Product build` and `Website refresh` buttons across 6 measured samples: 109.0 ms, 114.0 ms, 148.5 ms, 103.7 ms, 79.9 ms, 93.3 ms (mean: **108.07 ms**).

---

## 4. Observed Limitations & Caveats

1. **Synthetic Callback vs Field INP:**
   - The measured mean 108.07 ms interaction latency is an in-browser approximation measured from `pointerup` to the subsequent `requestAnimationFrame` render callback under simulated 4x CPU slowdown. It is not equivalent to real-world field Interaction to Next Paint (INP) or hardware-measured physical display presentation.
2. **Long Task Root Cause Attribution:**
   - The 19 observed tasks exceeding 50 ms under 4x CPU throttling represent an observed performance boundary during cold load and interaction. They are recorded here as an operational limitation and follow-up profiling candidate; root causes have not been definitively partitioned between hydration, bundle execution, or style recalculation.
3. **Local Loopback vs Production CDN:**
   - LCP (256 ms) and TTFB (6 ms) were measured over unthrottled local loopback on a dedicated machine. Live public internet latency, edge CDN distribution, and mobile cellular networks will show different profiles.
4. **Accessibility Assessment Scope:**
   - Keyboard focus orders and semantic landmark structures were verified. This does not constitute an exhaustive WCAG 2.2 AAA certification or assistive screen-reader test across all platforms.
