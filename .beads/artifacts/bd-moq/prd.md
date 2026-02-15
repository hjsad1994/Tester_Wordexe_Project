# Beads PRD Template

**Bead:** bd-moq  
**Created:** 2026-02-15  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 4
```

---

## Problem Statement

### What problem are we solving?

Clicking a product card currently opens a product detail URL but renders a "Khong tim thay san pham" state for valid items, because product list/detail data sources and route lookup conventions are inconsistent. Product card images also render too small inside cards, reducing visual quality. Product links currently expose long IDs instead of readable Vietnamese slugs, which hurts UX and shareability.

### Why now?

This is a visible browsing flow regression on core commerce pages (`/products` and product detail), directly affecting product discovery and conversion. Cost of inaction is continued broken navigation from list to detail and poor storefront presentation.

### Who is affected?

- **Primary users:** Shoppers browsing products on storefront pages.
- **Secondary users:** Content/admin teams sharing product links and expecting readable URLs.

---

## Scope

### In-Scope

- Fix product detail route resolution so links from product cards open valid detail content instead of not-found for existing products.
- Update product card image rendering so the product image fills the intended media frame consistently.
- Use slug-based product URLs in the frontend instead of raw long IDs.
- Ensure Vietnamese product names are represented by valid URL slugs that route correctly.
- Keep verification aligned with CI checks without adding Playwright requirements.

### Out-of-Scope

- Redesigning the full product detail layout, related products module, or cart/wishlist feature logic.
- Introducing a new i18n framework or multi-locale routing system.
- Broad SEO metadata overhaul beyond product path readability.

---

## Proposed Solution

### Overview

Align product list and detail route conventions around a slug-first URL contract, while preserving compatibility for existing ID-based links during transition if needed. Ensure backend product lookup paths can resolve slug requests reliably, and ensure frontend detail page data lookup matches the same source of truth used by listing surfaces. Update `ProductCard` media styling so images occupy the full visual area as intended.

### User Flow (if user-facing)

1. User opens `/products` and sees product cards with correctly sized images.
2. User clicks a product card and navigates to `/products/<readable-slug>`.
3. Product detail page loads the expected product instead of the not-found state.

---

## Requirements

### Functional Requirements

#### Product Detail Route Resolves Correctly

Product detail pages must resolve valid product links generated from the product list.

**Scenarios:**

- **WHEN** a user clicks a product card from `/products` **THEN** the detail page renders that product, not the not-found state.
- **WHEN** the URL contains a valid product slug **THEN** detail lookup resolves correctly and returns product content.

#### Product URLs Use Readable Slugs

Product links should display slug-based paths rather than long IDs.

**Scenarios:**

- **WHEN** product links are rendered in `ProductCard` **THEN** the href uses slug format.
- **WHEN** a product has Vietnamese characters in its name **THEN** generated slug remains URL-safe and routable.

#### Product Card Image Fills Media Frame

Product card media presentation must avoid undersized images inside the frame.

**Scenarios:**

- **WHEN** a product has an image URL **THEN** the image fills the card media container according to design intent.
- **WHEN** image fallback renders **THEN** fallback still preserves the same media area dimensions.

### Non-Functional Requirements

- **Performance:** No additional blocking client fetches that materially slow first render versus current behavior.
- **Security:** Preserve existing backend validation and authorization boundaries for product endpoints.
- **Accessibility:** Product links and images remain keyboard-accessible with meaningful alt text behavior unchanged.
- **Compatibility:** Existing product detail links continue to work during rollout, or have explicit redirect behavior.

---

## Success Criteria

- [ ] Clicking a product card opens a working product detail page for valid products.
  - Verify: `Manual: run frontend+backend locally, open /products, click at least 3 products, confirm no "Khong tim thay san pham" state for existing products`
- [ ] Product detail URL is slug-based and readable (including Vietnamese-origin product names).
  - Verify: `Manual: confirm product card links render as /products/<slug> and navigation succeeds`
  - Verify: `cd backend && npm run lint`
- [ ] Product card image fills the media frame consistently on list pages.
  - Verify: `Manual: check /products grid and homepage featured products for image fill consistency`
- [ ] Frontend quality gates pass for the change set.
  - Verify: `cd frontend && npm run lint`
  - Verify: `cd frontend && npm run typecheck`
  - Verify: `cd frontend && npm run build`

---

## Technical Context

### Existing Patterns

- Product list fetches API products via `frontend/src/lib/api.ts` and maps `_id`/`slug` for UI cards.
- Product detail route currently uses `frontend/src/app/products/[id]/page.tsx` and local static lookup (`allProducts.find`).
- Backend already exposes both ID and slug product endpoints in `backend/src/routes/productRoutes.js` with service/repository lookups in `backend/src/services/productService.js` and `backend/src/repositories/productRepository.js`.
- Card media behavior is controlled in `frontend/src/components/ProductCard.tsx` using a square media container plus `next/image` fit settings.

### Key Files

- `frontend/src/components/ProductCard.tsx` - Product link href and card image rendering behavior.
- `frontend/src/app/products/page.tsx` - Product list mapping from API model to card model.
- `frontend/src/components/FeaturedProducts.tsx` - Additional surface rendering `ProductCard` links/images.
- `frontend/src/app/products/[id]/page.tsx` - Current detail route parameter and not-found fallback.
- `frontend/src/lib/api.ts` - Product API type and fetch contracts including slug.
- `backend/src/routes/productRoutes.js` - Product detail route definitions by id/slug.
- `backend/src/services/productService.js` - Business-level detail lookup and not-found signaling.
- `backend/src/repositories/productRepository.js` - Data access for `findById` and `findBySlug`.
- `backend/src/models/Product.js` - Current slug generation strategy and update hook behavior.

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/components/ProductCard.tsx # Switch links to slug and adjust image fill behavior
  - frontend/src/app/products/page.tsx # Ensure card mapping provides slug contract consistently
  - frontend/src/components/FeaturedProducts.tsx # Ensure secondary product cards use same slug contract
  - frontend/src/app/products/[id]/page.tsx # Replace/align route param and lookup to prevent false not-found
  - frontend/src/lib/api.ts # Confirm product type contract for slug/id routing needs
  - backend/src/routes/productRoutes.js # Ensure slug endpoint is resolved correctly
  - backend/src/services/productService.js # Keep detail resolution parity for slug/id lookups
  - backend/src/models/Product.js # Ensure Vietnamese-friendly slug generation rules
```

---

## Open Questions

| Question                                                                                                                                   | Owner               | Due Date   | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ---------- | ------ |
| Should product URLs be ASCII-transliterated slugs (e.g. `ca-phe-sua-da`) or preserve percent-encoded Vietnamese characters in path output? | Product/Engineering | 2026-02-16 | Open   |

---

## Tasks

Write tasks in a machine-convertible format for `prd-task` skill.

### Align product detail lookup with storefront links [routing]

Product detail pages resolve valid links from product cards without rendering false not-found states.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - frontend/src/app/products/[id]/page.tsx
  - frontend/src/lib/api.ts
```

**Verification:**

- `Manual: open /products and click multiple cards to confirm detail pages render product data`
- `cd frontend && npm run typecheck`

### Switch product links to Vietnamese-friendly slug URLs [frontend]

All storefront product entry points navigate using readable slug paths instead of long IDs.

**Metadata:**

```yaml
depends_on: ["Align product detail lookup with storefront links"]
parallel: false
conflicts_with: []
files:
  - frontend/src/components/ProductCard.tsx
  - frontend/src/app/products/page.tsx
  - frontend/src/components/FeaturedProducts.tsx
```

**Verification:**

- `Manual: inspect rendered href values and confirm /products/<slug> format`
- `cd frontend && npm run lint`

### Ensure backend slug resolution supports Vietnamese names reliably [backend]

Backend product slug generation and slug lookup support Vietnamese product names with stable routable output.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - backend/src/models/Product.js
  - backend/src/routes/productRoutes.js
  - backend/src/services/productService.js
  - backend/src/repositories/productRepository.js
```

**Verification:**

- `cd backend && npm run lint`
- `Manual: request product by slug endpoint and confirm non-404 for known Vietnamese-named product`

### Make product card images fill the intended media frame [ui]

Product card images visually fill card media containers consistently across product list surfaces.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/components/ProductCard.tsx
```

**Verification:**

- `Manual: verify image fill on /products and featured products sections at mobile and desktop widths`
- `cd frontend && npm run build`

### Run CI-aligned quality checks without Playwright [verification]

All required lint, typecheck, and build checks pass for touched frontend/backend code without Playwright execution.

**Metadata:**

```yaml
depends_on:
  - Align product detail lookup with storefront links
  - Switch product links to Vietnamese-friendly slug URLs
  - Ensure backend slug resolution supports Vietnamese names reliably
  - Make product card images fill the intended media frame
parallel: false
conflicts_with: []
files:
  - frontend/package.json
  - backend/package.json
```

**Verification:**

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd backend && npm run lint`

---

## Notes

- This PRD is specification-only and intentionally excludes implementation code.
- Playwright verification is explicitly excluded per request.
