# Asset Roles and Provenance

## Supplied Reference Material

All six Pinterest files remain mood references only. Their original distribution rights were not supplied, and image 01 visibly contains a stock watermark. Do not copy them into the production public directory. No reference asset is a source of application instructions or legal-contract content.

| ID | Supplied Filename | Role |
| --- | --- | --- |
| R01 | `The Contract_ A basic contract with pen , #AD….jpg` | Paper diagonal / ink contrast; watermarked, do not deploy or remove watermark |
| R02 | `Questions to ask before renewing your business….jpg` | Walnut / parchment / brass material mood |
| R03 | `788763322264702334.jpg` | Structured desk geometry / client-conversation mood |
| R04 | `439734351139234603.jpg` | Architectural light and boardroom composition |
| R05 | `Corporate Girl Productivity Aesthetic …jpg` | Calm tools / workstation hierarchy |
| R06 | `kingsley shaw ; empire of lust.jpg` | Document review, monochrome paper/ink framing |

---

## Deliverable Asset Roles

### 1. Generated Architectural Hero Master & Derivatives
- **Source Master**: Original generated scene `preview/assets/boardroom-original.png` (1536×1024, 1,924,483 bytes, generated 23 November 2026). Illustrates architectural light and boardroom framing. Preserved outside the production bundle.
- **Production Public Derivatives**: Prepared under `frontend/public/cleargig/` using Lanczos resampling with tailored WebP and AVIF encodings:

| File under `frontend/public/cleargig/` | Dimensions | Bytes | Format & Quality | Intended Role & Crop |
| --- | --- | --- | --- | --- |
| `boardroom-desktop-1200.webp` | 1200×800 | 69,692 | WebP (q=85) | Primary desktop hero responsive candidate (>=1024px) |
| `boardroom-desktop-1200.avif` | 1200×800 | 96,061 | AVIF (q=85) | Alternative desktop modern browser candidate |
| `boardroom-desktop-800.webp` | 800×533 | 37,814 | WebP (q=85) | Medium viewport / tablet desktop hero candidate |
| `boardroom-desktop-800.avif` | 800×533 | 51,206 | AVIF (q=85) | Medium viewport / tablet modern browser candidate |
| `boardroom-mobile-640.webp` | 640×768 | 24,990 | WebP (q=82) | Mobile portrait hero (5:6 crop focused on top/right window light) |
| `boardroom-mobile-640.avif` | 640×768 | 39,080 | AVIF (q=82) | Mobile portrait modern browser candidate |
| `boardroom-mobile-480.webp` | 480×576 | 16,108 | WebP (q=82) | Small mobile phone candidate (<=390px, 5:6 crop) |
| `boardroom-mobile-480.avif` | 480×576 | 25,040 | AVIF (q=82) | Small mobile phone modern browser candidate |

- **Performance & Selection Guidance**:
  - Desktop target: <=200 KiB (204,800 bytes). Measured desktop master WebP: **69,692 bytes** (~68.1 KiB).
  - Mobile target: <=110 KiB (112,640 bytes). Measured mobile WebP: **24,990 bytes** (~24.4 KiB).
  - WebP delivers superior compression at equivalent visual fidelity for these photographic crops. WebP is preferred by default; AVIF candidates are provided for browser negotiation where supported.
  - The hero must use responsive `srcset` / `sizes` to load only the single viewport-appropriate image rather than preloading multiple variants.

### 2. Folio-Corner Mark (Task 03)
- Original editable vector SVG (`frontend/public/cleargig/mark.svg` / inline React component), dark, light, and favicon forms. Geometry: document bracket, folded upper-right corner, two ruled lines. No logo font or animation dependency.

### 3. Product Previews & Document Compositions
- Code-native HTML/CSS/SVG compositions.
- **Price-free public preview rule**: Landing page and showcase media must never display prices, rates, currency symbols, or monetary totals. Deliverables, workstreams, scope, and document readiness are demonstrated instead.
- Financial values and formulas (`computeTotals`, `computeAudit`) belong strictly to the real application (`/`, `/dashboard`, `/projects/[id]`, `/projects/[id]/document`).
