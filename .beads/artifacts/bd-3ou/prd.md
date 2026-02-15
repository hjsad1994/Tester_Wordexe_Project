# Beads PRD Template

**Bead:** bd-3ou  
**Created:** 2026-02-15  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: ["bd-moq"]
blocks: []
estimated_hours: 3
```

---

## Problem Statement

### What problem are we solving?

Vietnamese product names with diacritics can be converted into malformed slugs that drop letters (example input: `Thú nhồi bông hình thỏ dễ thương`, observed malformed output: `th-nh-i-b-ng-h-nh-th-d-th-ng`). Broken slugs reduce SEO quality and can cause product detail links to fail when route lookup expects a different slug format.

### Why now?

This is an active user-facing bug reported in production-like usage. Delaying this fix keeps broken product URLs in circulation, increases "not found" product detail outcomes, and damages search/shareability for Vietnamese catalog content.

### Who is affected?

- **Primary users:** Shoppers browsing Vietnamese-named products from listing cards, wishlist, and direct links.
- **Secondary users:** Merchants/admins managing products and support staff handling broken-link complaints.

---

## Scope

### In-Scope

- Standardize product slug normalization so Vietnamese names do not lose base letters during slug generation.
- Ensure backend-generated slugs and frontend fallback slug generation follow the same normalization rules.
- Validate product detail route resolution for slug-based URLs.
- Add regression coverage for Vietnamese slug generation and slug-based product retrieval.

### Out-of-Scope

- Reworking category slug behavior unless it directly blocks this product-slug bug fix.
- Introducing a full slug-history/redirect system for old product slugs.
- Broad URL strategy redesign for all entities.

---

## Proposed Solution

### Overview

Define one canonical slug normalization behavior for products and apply it consistently where slugs are generated or derived. Backend remains source of truth for persisted slugs, while frontend fallback generation is aligned to avoid route mismatches. The fix includes regression checks for Vietnamese diacritic names and product slug route lookups.

### User Flow (if user-facing)

1. User opens product listings containing Vietnamese product names with diacritics.
2. User clicks a product card/wishlist item and navigates to `/products/<slug>`.
3. Product detail loads successfully using a slug that preserves intended letters (no dropped-character pattern).

---

## Requirements

### Functional Requirements

#### Canonical Product Slug Normalization

Product slug generation must produce deterministic, URL-safe slugs for Vietnamese names without dropping base letters.

**Scenarios:**

- **WHEN** product name is `Thú nhồi bông hình thỏ dễ thương` **THEN** generated slug preserves full base letters and must not match the malformed pattern `th-nh-i-b-ng-h-nh-th-d-th-ng`.
- **WHEN** a product name is created or updated **THEN** backend persists slug using the canonical normalization rule.

#### Frontend/Backend Slug Consistency

Any client-side fallback slug generation must follow the same normalization behavior as backend slug generation.

**Scenarios:**

- **WHEN** frontend needs a fallback slug for links **THEN** output follows canonical slug rules and routes to product detail correctly.
- **WHEN** backend returns `product.slug` **THEN** frontend prioritizes the returned slug over locally re-derived variants.

#### Slug Route Resolution

Slug-based product detail lookup must resolve products for Vietnamese-named items.

**Scenarios:**

- **WHEN** `/api/products/slug/:slug` receives a canonical Vietnamese-derived slug **THEN** API returns the correct product.
- **WHEN** user navigates to `/products/<slug>` **THEN** the product detail page resolves and does not show missing-product state.

### Non-Functional Requirements

- **Performance:** Slug normalization remains O(n) on input length and does not add additional network round trips in listing flows.
- **Security:** Slug handling must not bypass existing authorization checks on protected routes.
- **Accessibility:** No regression in keyboard/screen-reader navigation for product links.
- **Compatibility:** Behavior works with existing Next.js frontend routing and Express backend slug endpoints.

---

## Success Criteria

- [ ] Product names containing Vietnamese diacritics generate slugs without dropped-letter artifacts.
  - Verify: `cd backend && npm run lint`
  - Verify: manual API check for a Vietnamese product via `GET /api/products/slug/:slug` returns 200 and expected `slug`.
- [ ] Product detail URLs built from listing/wishlist cards resolve correctly for Vietnamese products.
  - Verify: manual browser check by opening `/products/<slug>` from product card and wishlist link.
- [ ] Frontend code remains type-safe and lint-clean after slug alignment changes.
  - Verify: `cd frontend && npm run typecheck`
  - Verify: `cd frontend && npm run lint`

---

## Technical Context

### Existing Patterns

- Product slug generation currently lives in `backend/src/models/Product.js` with normalization and suffix logic.
- Frontend duplicates `toUrlSlug` logic in multiple locations rather than sharing one utility.
- Product detail route (`frontend/src/app/products/[id]/page.tsx`) accepts slug-or-id and tries slug lookup first.

### Key Files

- `backend/src/models/Product.js` - Current product slug generation and update hooks.
- `backend/src/routes/productRoutes.js` - Slug route (`/slug/:slug`).
- `backend/src/controllers/productController.js` - Controller entry for slug lookup.
- `backend/src/services/productService.js` - Service layer for slug lookup.
- `backend/src/repositories/productRepository.js` - Repository query by slug.
- `frontend/src/lib/api.ts` - `fetchProductBySlug` API contract.
- `frontend/src/components/ProductCard.tsx` - Link slug fallback path used in catalog cards.
- `frontend/src/components/FeaturedProducts.tsx` - Product mapping fallback slug logic.
- `frontend/src/app/products/page.tsx` - Product list mapping fallback slug logic.
- `frontend/src/app/wishlist/page.tsx` - Wishlist link fallback slug logic.
- `frontend/src/app/products/[id]/page.tsx` - Slug/id route resolution logic.

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - backend/src/models/Product.js
  - frontend/src/components/ProductCard.tsx
  - frontend/src/components/FeaturedProducts.tsx
  - frontend/src/app/products/page.tsx
  - frontend/src/app/wishlist/page.tsx
  - frontend/src/app/products/[id]/page.tsx
  - frontend/src/lib/api.ts
  - playwright/tests/rbac/admin-product-category.spec.ts
```

---

## Open Questions

| Question                                                                                                                                  | Owner                 | Due Date   | Status |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------- | ------ |
| Should canonical slug output preserve Vietnamese diacritics in stored slug, or transliterate to ASCII while preserving base letters only? | Product + Engineering | 2026-02-16 | Open   |

---

## Tasks

### Define canonical product slug normalization [backend]

Backend product create/update flows produce deterministic, URL-safe slugs for Vietnamese names without dropped-letter artifacts.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - backend/src/models/Product.js
```

**Verification:**

- `cd backend && npm run lint`
- Manual: create/update a product named `Thú nhồi bông hình thỏ dễ thương` and confirm slug does not match `th-nh-i-b-ng-h-nh-th-d-th-ng`.

### Align frontend slug fallback behavior [frontend]

All frontend product link builders use one canonical slug behavior and prioritize backend-provided slug values.

**Metadata:**

```yaml
depends_on:
  - Define canonical product slug normalization
parallel: false
conflicts_with: []
files:
  - frontend/src/components/ProductCard.tsx
  - frontend/src/components/FeaturedProducts.tsx
  - frontend/src/app/products/page.tsx
  - frontend/src/app/wishlist/page.tsx
  - frontend/src/app/products/[id]/page.tsx
  - frontend/src/lib/api.ts
```

**Verification:**

- `cd frontend && npm run typecheck`
- `cd frontend && npm run lint`
- Manual: click product links from listing and wishlist for a Vietnamese-named product and verify detail page resolves.

### Add regression coverage for Vietnamese slug routes [qa]

Automated or scripted regression checks exist for Vietnamese slug generation and slug-based product detail retrieval.

**Metadata:**

```yaml
depends_on:
  - Define canonical product slug normalization
  - Align frontend slug fallback behavior
parallel: true
conflicts_with: []
files:
  - playwright/tests/rbac/admin-product-category.spec.ts
```

**Verification:**

- `cd playwright && npx playwright test --list`
- Run or update an E2E case that visits `/products/<vietnamese-slug>` and validates product detail content is rendered.

---

## Dependency Legend

| Field            | Purpose                                           | Example                                    |
| ---------------- | ------------------------------------------------- | ------------------------------------------ |
| `depends_on`     | Must complete before this task starts             | `["Setup database", "Create schema"]`      |
| `parallel`       | Can run concurrently with other parallel tasks    | `true` / `false`                           |
| `conflicts_with` | Cannot run in parallel (same files)               | `["Update config"]`                        |
| `files`          | Files this task modifies (for conflict detection) | `["src/db/schema.ts", "src/db/client.ts"]` |

---

## Notes

- This PRD is specification-only for `/create` phase; no implementation code is included.
- During `/ship`, verify behavior using both API-level checks and UI navigation paths to prevent frontend/backend slug drift.
