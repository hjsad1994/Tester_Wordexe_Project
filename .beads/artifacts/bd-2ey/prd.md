# Product detail does not render Cloudinary image from DB

**Bead:** bd-2ey  
**Created:** 2026-02-16  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 1
```

---

## Problem Statement

### What problem are we solving?

The product detail page currently does not render product images stored in MongoDB/Cloudinary, even though backend APIs return `images[]` and frontend mapping already derives `imageUrl` from `images[0]`. Users see illustration placeholders instead of the real product image on the detail page.

### Why now?

This bug breaks a core e-commerce flow: product detail cannot visually represent the selected product, reducing buyer confidence and making product content inconsistent with product list cards that already show real images.

### Who is affected?

- **Primary users:** Shoppers viewing `/products/[id]` product detail pages
- **Secondary users:** Admin/product operators validating catalog quality from frontend pages

---

## Scope

### In-Scope

- Render Cloudinary image URL from API/DB on the product detail page when `images[0]` exists
- Preserve current visual fallback (illustration placeholder) when product has no image
- Keep existing data contract (`images?: string[]`) and existing product fetch flow (`/api/products/:id`, `/api/products/slug/:slug`)
- Add regression coverage for product detail image rendering path

### Out-of-Scope

- Backend upload/storage changes for Cloudinary (`secure_url` pipeline)
- Multi-image gallery redesign beyond the first image display behavior
- Admin product management UX changes
- Catalog-wide visual redesign of product detail page

---

## Proposed Solution

### Overview

Update the product detail media section to use the already-mapped `product.imageUrl` as the primary visual source (same convention used by product cards), while preserving the existing illustration fallback for products without image URLs. Add/extend end-to-end verification to ensure Cloudinary-hosted image URLs render on detail pages.

### User Flow

1. User opens a product detail page (`/products/[id]` or slug-resolved entry)
2. Frontend fetches product data and maps `images?.[0]` to `imageUrl`
3. If `imageUrl` exists, user sees real product image; otherwise, existing illustration fallback is shown

---

## Requirements

### Functional Requirements

#### Product detail image rendering from DB URL

Product detail page must display the product image sourced from backend `images[0]` (Cloudinary URL) when present.

**Scenarios:**

- **WHEN** API returns product with non-empty `images[]` **THEN** product detail renders the first image URL as the main visual
- **WHEN** image URL host is `res.cloudinary.com` **THEN** image loads successfully through configured Next.js image host allowlist

#### Fallback behavior for missing images

Product detail page must keep current placeholder behavior when no image URL is available.

**Scenarios:**

- **WHEN** product has no `images` or empty `images[]` **THEN** existing illustration placeholder remains visible
- **WHEN** API fetch fails and static fallback data is used **THEN** page still renders without broken image elements

#### Contract consistency across product surfaces

Detail page rendering must stay consistent with existing mapping convention used by product list/featured cards.

**Scenarios:**

- **WHEN** `mapApiProductToCard` maps `imageUrl: product.images?.[0]` **THEN** detail UI consumes that mapped field instead of ignoring it
- **WHEN** product card and product detail receive the same product payload **THEN** both surfaces show the same primary image behavior

### Non-Functional Requirements

- **Performance:** Reuse Next.js image optimization path already used in product cards; avoid redundant fetches
- **Security:** No changes to authentication, authorization, or image upload permissions
- **Accessibility:** Product image includes meaningful `alt` text and fallback remains readable
- **Compatibility:** Layout and rendering remain correct on desktop and mobile product detail views

---

## Success Criteria

- [ ] Product detail shows Cloudinary product image when `images[0]` exists in API response
  - Verify: `cd /Users/trantai/Documents/testing_project/frontend && npm run dev` then open a seeded product detail page and confirm image source points to `https://res.cloudinary.com/...`
- [ ] Product detail keeps illustration fallback for products without image data
  - Verify: `cd /Users/trantai/Documents/testing_project/frontend && npm run dev` then open a product with empty/no `images` and confirm placeholder still renders without broken image icon
- [ ] Frontend static checks pass after the fix
  - Verify: `cd /Users/trantai/Documents/testing_project/frontend && npm run lint:fix`
  - Verify: `cd /Users/trantai/Documents/testing_project/frontend && npm run typecheck`
- [ ] Regression test path for product detail image rendering is executable
  - Verify: `cd /Users/trantai/Documents/testing_project/playwright && npm run test -- --grep "product detail"`

---

## Technical Context

### Existing Patterns

- `frontend/src/app/products/[id]/page.tsx` maps `imageUrl: product.images?.[0]` but detail render currently uses illustration-only blocks
- `frontend/src/components/ProductCard.tsx` already renders `product.imageUrl` using Next.js `Image`
- `frontend/src/components/FeaturedProducts.tsx` and `frontend/src/app/products/page.tsx` follow the same `images?.[0] -> imageUrl` mapping convention
- `frontend/next.config.ts` already allows `res.cloudinary.com` in `images.remotePatterns`
- `backend/src/services/productService.js` and `backend/src/models/Product.js` store Cloudinary `secure_url` into `Product.images[]`

### Key Files

- `frontend/src/app/products/[id]/page.tsx` - Product detail data mapping and render logic
- `frontend/src/components/ProductCard.tsx` - Reference implementation for image rendering pattern
- `frontend/src/lib/api.ts` - Product contract (`images?: string[]`) and fetchers
- `frontend/next.config.ts` - Cloudinary host allowlist for optimized images
- `backend/src/models/Product.js` - Source-of-truth product image field in DB schema

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/app/products/[id]/page.tsx # Render mapped imageUrl in detail media section with fallback
  - playwright/tests/demo-user-12/test-cases.spec.ts # Extend/adjust e2e assertions to cover product detail image path
```

---

## Open Questions

| Question                                                                                                                            | Owner    | Due Date       | Status |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------- | ------ |
| Should product detail thumbnails remain illustration-only for now, or should they also render real image URLs in this bugfix scope? | FE owner | Before `/ship` | Open   |

---

## Tasks

### Render DB-backed product image on product detail [ui]

Product detail page displays `product.imageUrl` (derived from `images[0]`) as the main media element whenever available.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - frontend/src/app/products/[id]/page.tsx
```

**Verification:**

- `cd /Users/trantai/Documents/testing_project/frontend && npm run dev` then open a product detail page with seeded Cloudinary image and confirm the main media is not placeholder-only
- `cd /Users/trantai/Documents/testing_project/frontend && npm run typecheck`

### Preserve fallback for products without image data [ui]

Product detail continues to render the existing illustration placeholder for products that do not provide `images[]`.

**Metadata:**

```yaml
depends_on: ["Render DB-backed product image on product detail"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/products/[id]/page.tsx
```

**Verification:**

- `cd /Users/trantai/Documents/testing_project/frontend && npm run dev` then validate a no-image product still shows placeholder and no broken image element
- `cd /Users/trantai/Documents/testing_project/frontend && npm run lint:fix`

### Add regression coverage for product detail image rendering [qa]

Automated test coverage includes at least one scenario asserting that product detail renders DB-provided Cloudinary image URLs.

**Metadata:**

```yaml
depends_on: ["Render DB-backed product image on product detail"]
parallel: true
conflicts_with: []
files:
  - playwright/tests/demo-user-12/test-cases.spec.ts
```

**Verification:**

- `cd /Users/trantai/Documents/testing_project/playwright && npm run test -- --grep "product detail"`

### Execute verification gates for release readiness [qa]

Frontend lint/typecheck and targeted Playwright checks pass with the bugfix in place.

**Metadata:**

```yaml
depends_on:
  - "Render DB-backed product image on product detail"
  - "Preserve fallback for products without image data"
  - "Add regression coverage for product detail image rendering"
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `cd /Users/trantai/Documents/testing_project/frontend && npm run lint:fix`
- `cd /Users/trantai/Documents/testing_project/frontend && npm run typecheck`
- `cd /Users/trantai/Documents/testing_project/playwright && npm run test -- --grep "product detail"`

---

## Notes

- Root-cause candidate from exploration: product detail already maps `imageUrl` from API but render block does not consume it.
- Backend Cloudinary storage contract appears healthy (`secure_url` persisted into `Product.images[]`), so this PRD scopes fix to frontend render path and regression verification.
