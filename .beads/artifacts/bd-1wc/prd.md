# Beads PRD

**Bead:** bd-1wc  
**Created:** 2026-02-15  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 16
```

---

## Problem Statement

### What problem are we solving?

The current product experience does not support Cloudinary-based image upload, and customer-facing frontend pages still render categories and products from inline mock data instead of database-backed APIs. This prevents real catalog image management, makes seeded/demo data inconsistent with backend state, and blocks production-like product media workflows.

### Why now?

The request explicitly requires Cloudinary image support, seed data for categories/products with baby-themed product images, and migration of frontend catalog/category displays from mock to DB-backed data. Delaying this keeps frontend and backend out of sync and prevents end-to-end product image management.

### Who is affected?

- **Primary users:** Store administrators managing catalog items and product images.
- **Secondary users:** Shoppers browsing categories and products on customer-facing pages.

---

## Scope

### In-Scope

- Configure backend Cloudinary integration for product image upload.
- Add/extend product create/update flow to persist uploaded Cloudinary image URLs in product records.
- Seed categories, products, and baby-themed product images into the database.
- Replace customer-facing frontend mock catalog/category data with API-driven DB data.
- Update frontend rendering to prefer product image URLs from DB instead of static illustration-only mock assumptions.
- Document and enforce secure handling of Cloudinary credentials via environment variables.

### Out-of-Scope

- Authentication/authorization redesign.
- Full admin UI redesign beyond image-upload enablement needed for product workflow.
- Reworking unrelated search/recommendation algorithms.
- Broader media management features (bulk media library, advanced editing pipeline).

---

## Proposed Solution

### Overview

Implement a backend Cloudinary upload path that stores `secure_url` values in product `images` fields, then seed DB categories/products with baby-themed product images uploaded to Cloudinary, and migrate customer-facing frontend components/pages to fetch categories/products from existing backend APIs so catalog and category rendering reflect live database data.

### User Flow

1. Admin creates/updates products with image upload support, and image URLs are stored in DB.
2. Seed workflow inserts categories/products and uploads baby-themed images to Cloudinary for initial catalog population.
3. Customer-facing pages request `/api/categories` and `/api/products` and render DB-backed results with Cloudinary image URLs.

---

## Requirements

### Functional Requirements

#### Cloudinary Product Upload Integration

Backend supports authenticated product image upload to Cloudinary and persists returned image URLs for products.

**Scenarios:**

- **WHEN** an admin uploads a valid product image **THEN** the backend uploads it to Cloudinary and stores returned URL/public metadata on the target product.
- **WHEN** upload to Cloudinary fails **THEN** the API returns a structured error and does not write partial/invalid image data.

#### Seed Categories, Products, and Baby-Themed Images

A deterministic seed flow creates categories/products and attaches uploaded baby-themed product image URLs so environments can be initialized consistently.

**Scenarios:**

- **WHEN** seed is executed on an empty DB **THEN** categories, products, and image URLs are created successfully.
- **WHEN** seed is executed again **THEN** duplicates are prevented or safely handled via idempotent upsert logic.

#### Frontend Catalog/Category Migration to DB APIs

Customer-facing frontend no longer depends on hardcoded mock arrays for category/product listing and display.

**Scenarios:**

- **WHEN** `/api/categories` and `/api/products` return data **THEN** homepage/category/product listing UI renders API results.
- **WHEN** API returns empty/error states **THEN** frontend renders resilient fallback states without crashing.

#### Product Image Rendering Contract

Frontend product display components consume DB image URL arrays and render product visuals from remote image sources.

**Scenarios:**

- **WHEN** a product has one or more image URLs **THEN** product cards/list/detail views render image content from those URLs.
- **WHEN** a product has no image URL **THEN** frontend uses defined placeholder behavior without broken UI.

### Non-Functional Requirements

- **Performance:** Product/category page load remains acceptable for seeded catalog sizes; image delivery uses Cloudinary CDN URLs.
- **Security:** Cloudinary secrets must remain server-side and must not be exposed in frontend bundles or committed files.
- **Accessibility:** Product/category UI migration preserves existing keyboard navigation and semantic structure.
- **Compatibility:** Existing API consumers/admin flows continue to work with `images` array contract.

---

## Success Criteria

- [ ] Cloudinary-backed upload flow for product images works end-to-end and persists DB image URLs.
  - Verify: `cd backend && npm run start`
  - Verify: `curl -X POST -b "token=<admin_cookie>" -F "image=@./fixtures/baby-product.jpg" http://localhost:3001/api/products/<productId>/images`
- [ ] Seed workflow creates categories/products and populates baby-themed product image URLs in DB.
  - Verify: `cd backend && npm run seed`
  - Verify: `curl http://localhost:3001/api/categories && curl http://localhost:3001/api/products`
- [ ] Customer-facing frontend pages render DB-backed categories/products (no inline mock source of truth).
  - Verify: `cd frontend && npm run typecheck`
  - Verify: `cd frontend && npm run lint`
- [ ] Product cards/list/detail render Cloudinary-backed image URLs with safe fallback behavior.
  - Verify: `cd frontend && npm run dev` and manually confirm `/` and `/products` show DB image content

---

## Technical Context

### Existing Patterns

- Express routing aggregation: `backend/src/routes/index.js`
- Controller-service-repository layering for products: `backend/src/controllers/productController.js`, `backend/src/services/productService.js`, `backend/src/repositories/productRepository.js`
- Product model image field already present (`images: [String]`): `backend/src/models/Product.js`
- Frontend API wrapper for categories/products: `frontend/src/lib/api.ts`
- Customer-facing mock-driven pages/components: `frontend/src/components/FeaturedProducts.tsx`, `frontend/src/components/Categories.tsx`, `frontend/src/app/products/page.tsx`
- Existing admin panels already API-backed: `frontend/src/components/admin/AdminProductsPanel.tsx`, `frontend/src/components/admin/AdminCategoriesPanel.tsx`

### Key Files

- `backend/src/index.js` - dotenv bootstrap and API mount
- `backend/src/routes/productRoutes.js` - product route surface
- `backend/src/routes/categoryRoutes.js` - category route surface
- `backend/src/models/Product.js` - persisted image URL array contract
- `frontend/src/lib/api.ts` - frontend category/product API client contracts
- `frontend/src/components/ProductCard.tsx` - product visual rendering behavior

### Affected Files

```yaml
files:
  - backend/src/index.js
  - backend/src/routes/index.js
  - backend/src/routes/productRoutes.js
  - backend/src/controllers/productController.js
  - backend/src/services/productService.js
  - backend/src/repositories/productRepository.js
  - backend/src/models/Product.js
  - backend/.env.example
  - frontend/src/lib/api.ts
  - frontend/src/components/FeaturedProducts.tsx
  - frontend/src/components/Categories.tsx
  - frontend/src/app/products/page.tsx
  - frontend/src/components/ProductCard.tsx
  - frontend/src/components/admin/AdminProductsPanel.tsx
```

---

## Risks & Mitigations

| Risk                                                          | Likelihood | Impact | Mitigation                                                                                                        |
| ------------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| Cloudinary credentials leaked into tracked files              | Medium     | High   | Keep secrets in ignored env files only, document key names in `.env.example`, verify no secret values in git diff |
| Seed image licensing/compliance issues for baby-themed assets | Medium     | High   | Use approved/licensed sources only, record source/license metadata for each seeded image                          |
| Frontend migration breaks mock-dependent UI assumptions       | Medium     | Medium | Introduce API loading/error/empty states and validate `/` + `/products` rendering manually and via tests          |
| Upload flow introduces API contract mismatch (`images` shape) | Medium     | Medium | Keep `images: string[]` contract stable, add integration verification for product create/update/read              |
| Test coverage gaps miss regressions                           | Medium     | Medium | Extend Playwright/API checks for image upload and DB-backed rendering scenarios                                   |

---

## Open Questions

| Question                                                                                                                        | Owner               | Due Date   | Status |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------- | ------ |
| Should Cloudinary credentials be stored only in `backend/.env` or also mirrored in root `.env` for local orchestration?         | Engineering         | 2026-02-16 | Open   |
| Which image generation/source pipeline is approved for baby-themed seed images (AI-generated vs licensed stock)?                | Product/Engineering | 2026-02-16 | Open   |
| Is direct frontend upload with signed/unsigned preset needed now, or backend-only upload endpoint is sufficient for this phase? | Engineering         | 2026-02-16 | Open   |
| Expected seed volume for categories/products/images in initial dataset?                                                         | Product             | 2026-02-16 | Open   |

---

## Tasks

### Build Cloudinary product image upload flow [backend]

Product create/update flows accept image uploads, push assets to Cloudinary, and persist canonical product image URL metadata in MongoDB.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - backend/src/routes/productRoutes.js
  - backend/src/controllers/productController.js
  - backend/src/services/productService.js
  - backend/src/repositories/productRepository.js
  - backend/src/models/Product.js
  - backend/.env.example
```

**Verification:**

- `cd backend && npm run start`
- `curl -X POST -b "token=<admin_cookie>" -F "image=@./fixtures/baby-product.jpg" http://localhost:3001/api/products/<productId>/images`
- `curl http://localhost:3001/api/products/<productId>`

### Create deterministic catalog + image seed workflow [data]

Seed execution produces repeatable categories/products and attaches baby-themed Cloudinary image URLs suitable for local/staging bootstrap.

**Metadata:**

```yaml
depends_on: ["Build Cloudinary product image upload flow"]
parallel: false
conflicts_with: []
files:
  - backend/package.json
  - backend/src/models/Category.js
  - backend/src/models/Product.js
  - backend/src/repositories/categoryRepository.js
  - backend/src/repositories/productRepository.js
```

**Verification:**

- `cd backend && npm run seed`
- `curl http://localhost:3001/api/categories`
- `curl http://localhost:3001/api/products`

### Migrate customer-facing catalog/category UI from mock to API [frontend]

Homepage and products listing surfaces fetch categories/products from backend APIs and no longer use inline mock arrays as primary data source.

**Metadata:**

```yaml
depends_on: ["Create deterministic catalog + image seed workflow"]
parallel: false
conflicts_with: []
files:
  - frontend/src/lib/api.ts
  - frontend/src/components/FeaturedProducts.tsx
  - frontend/src/components/Categories.tsx
  - frontend/src/app/products/page.tsx
```

**Verification:**

- `cd frontend && npm run typecheck`
- `cd frontend && npm run lint`
- `cd frontend && npm run dev`

### Update product visual rendering to DB image URLs [frontend]

Product card/detail rendering consumes image URLs from DB-backed payloads with robust fallback behavior when images are absent.

**Metadata:**

```yaml
depends_on: ["Migrate customer-facing catalog/category UI from mock to API"]
parallel: false
conflicts_with: []
files:
  - frontend/src/components/ProductCard.tsx
  - frontend/src/app/products/page.tsx
  - frontend/src/lib/api.ts
```

**Verification:**

- `cd frontend && npm run typecheck`
- `cd frontend && npm run dev`
- Manual check: open `/` and `/products` and confirm Cloudinary image rendering + placeholder fallback

## Notes

- Credentials provided by requester are treated as sensitive and must not be committed; only variable names belong in tracked files.
- This document defines specification only (`/create` phase); implementation starts after `/start bd-1wc`.
