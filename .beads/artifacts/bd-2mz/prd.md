# Beads PRD

**Bead:** bd-2mz  
**Type:** feature  
**Created:** 2026-02-16  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 6
```

---

## Problem Statement

### What problem are we solving?

The admin panel does not provide inventory management in the product CRUD flow. Admin users can create, update, and delete products, but they cannot view or edit stock directly in the active product management UI.

The backend data model already has `quantity` on products, but the admin UI form does not expose that field. This creates an operational gap between product catalog management and inventory management.

### Why now?

Current admin workflows require inventory to be managed indirectly or not managed at all, which increases manual effort and increases risk of stale stock values. The user explicitly requested inventory CRUD parity with product CRUD and CI-safe delivery.

### Who is affected?

- **Primary users:** Admin users managing products and inventory.
- **Secondary users:** Internal operations and support teams relying on accurate stock values.

---

## Scope

### In-Scope

- Add inventory field support to the active admin product CRUD interface.
- Ensure admin can create, view, and update stock in the same product workflow.
- Align frontend payloads and backend validation for stock values.
- Keep API contract consistent (`quantity` as storage field, inventory as UI label).
- Ensure all existing CI checks pass after changes.

### Out-of-Scope

- New warehouse, reservation, or multi-location inventory systems.
- Customer storefront behavior changes (beyond existing product data usage).
- Re-enabling or expanding Playwright CI jobs.
- Broad refactors of unrelated admin modules.

---

## Proposed Solution

### Overview

Extend the active admin products panel to include stock in form state, input controls, table display, and create/update payloads, while preserving the existing backend `quantity` field and existing CRUD route structure. Add explicit non-negative integer validation on stock values across client and server boundaries so admin stock CRUD behaves as a first-class product attribute.

### User Flow (Admin)

1. Admin opens `/admin/products` and sees a stock column for each product.
2. Admin opens create/edit product modal and can set inventory (stock quantity).
3. Admin saves changes and sees updated stock reflected in the product list.

---

## Requirements

### Functional Requirements

#### Inventory field in admin product UI

Admin product list and modal form must expose inventory alongside existing product fields.

**Scenarios:**

- **WHEN** admin views the products table **THEN** each row shows current stock from `quantity`.
- **WHEN** admin opens create or edit modal **THEN** the form includes editable stock input.

#### Inventory included in create/update payloads

Admin create and update actions must persist stock values via existing product APIs.

**Scenarios:**

- **WHEN** admin creates a product with stock value **THEN** backend stores value in `quantity`.
- **WHEN** admin updates product stock **THEN** product response reflects updated `quantity`.

#### Validation and constraints for stock

Stock must be validated as a non-negative integer in both UI and backend logic.

**Scenarios:**

- **WHEN** admin enters a negative or invalid stock value **THEN** the operation is blocked with validation error.
- **WHEN** stock input is omitted in create flow **THEN** system applies existing default behavior (`quantity` default 0) unless explicitly required by UI validation.

#### Backward-compatible contract usage

Implementation must keep compatibility with current model and API conventions that use `quantity`.

**Scenarios:**

- **WHEN** existing product APIs are called without inventory-specific renaming **THEN** requests remain compatible.
- **WHEN** admin UI labels inventory as stock **THEN** payload still uses `quantity` in API contract.

### Non-Functional Requirements

- **Performance:** No additional network round-trips beyond current create/update/list flows.
- **Security:** Preserve admin-only access controls already enforced in admin routes and auth checks.
- **Accessibility:** Stock input follows existing admin form accessibility behavior (label + keyboard submit flow).
- **Compatibility:** Maintain compatibility with existing Mongo schema (`Product.quantity`) and frontend `Product/ProductPayload` contracts.

---

## Success Criteria

- [ ] Admin product list and modal UI include stock and support create/update inventory values.
  - Verify: `npm --prefix frontend run typecheck`
  - Verify: `npm --prefix frontend run build`
- [ ] Backend accepts and persists valid stock values, rejecting invalid values without breaking existing CRUD.
  - Verify: `npm --prefix backend run lint`
  - Verify: `npm --prefix backend run test:ci`
- [ ] Frontend/backend contract for stock remains consistent through `quantity` field usage.
  - Verify: `npm --prefix frontend run lint`
  - Verify: `npm --prefix frontend run format:check`
- [ ] Repository-level CI commands continue passing after implementation.
  - Verify: `npm --prefix backend run format:check`
  - Verify: `npm --prefix frontend run typecheck`
  - Verify: `npm --prefix frontend run build`

---

## Technical Context

### Existing Patterns

- Modal-based admin product CRUD lives in `frontend/src/components/admin/AdminProductsPanel.tsx` and already wires list/create/update/delete/image flows.
- API contract types in `frontend/src/lib/api.ts` already include `quantity` in `Product` and `ProductPayload`.
- Backend model in `backend/src/models/Product.js` already defines `quantity` with default `0`.
- Product CRUD stack follows route -> controller -> service -> repository pattern in backend product modules.

### Key Files

- `frontend/src/components/admin/AdminProductsPanel.tsx` - active admin products UI and modal CRUD state.
- `frontend/src/lib/api.ts` - typed product contract and API client payload mapping.
- `backend/src/models/Product.js` - product schema including `quantity`.
- `backend/src/services/productService.js` - product validation and business rules.
- `backend/src/repositories/productRepository.js` - persistence layer for product create/update.
- `backend/src/controllers/productController.js` - API orchestration for product operations.
- `backend/src/routes/productRoutes.js` - product route definitions.

### Affected Files

Files this bead is expected to modify:

```yaml
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
  - frontend/src/lib/api.ts
  - backend/src/services/productService.js
  - backend/src/repositories/productRepository.js
  - backend/src/models/Product.js
  - backend/src/controllers/productController.js
  - backend/src/routes/productRoutes.js
  - backend/src/seed.js
```

---

## Risks & Mitigations

| Risk                                                                      | Likelihood | Impact | Mitigation                                                                         |
| ------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------- |
| UI updates wrong admin file due backup duplicates (for example `* 2.tsx`) | Medium     | Medium | Limit edits to active route-linked files and verify imports from admin page.       |
| Validation mismatch between client and backend for stock                  | Medium     | High   | Define non-negative integer rules in both layers and verify with CI commands.      |
| Contract drift if inventory naming diverges from `quantity`               | Medium     | Medium | Keep API payload key as `quantity`; use inventory wording only in labels and docs. |
| Existing products missing explicit stock values                           | Low        | Medium | Preserve model default behavior and avoid breaking required-field assumptions.     |

---

## Open Questions

| Question                                                                                                         | Owner                 | Due Date                             | Status |
| ---------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------ | ------ |
| Should admin stock edits support absolute set only, or both absolute set and delta adjustment in this iteration? | Product + Engineering | Before `/ship bd-2mz` implementation | Open   |

---

## Tasks

### Align product-inventory contract [api]

The product contract consistently uses backend `quantity` for inventory data across frontend types and backend service/repository validation paths.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - frontend/src/lib/api.ts
  - backend/src/services/productService.js
  - backend/src/repositories/productRepository.js
  - backend/src/models/Product.js
```

**Verification:**

- `npm --prefix frontend run typecheck`
- `npm --prefix backend run lint`

### Add stock CRUD controls in admin products panel [frontend]

The active admin products panel allows admins to view and edit stock in table and modal create/update flows using the existing product CRUD interactions.

**Metadata:**

```yaml
depends_on:
  - Align product-inventory contract
parallel: false
conflicts_with: []
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
  - frontend/src/app/admin/products/page.tsx
```

**Verification:**

- `npm --prefix frontend run lint`
- `npm --prefix frontend run typecheck`

### Enforce stock value constraints at form and API boundaries [validation]

Invalid stock values are rejected before persistence and valid non-negative integer stock values persist correctly through create/update operations.

**Metadata:**

```yaml
depends_on:
  - Align product-inventory contract
  - Add stock CRUD controls in admin products panel
parallel: false
conflicts_with: []
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
  - backend/src/services/productService.js
  - backend/src/controllers/productController.js
```

**Verification:**

- `npm --prefix backend run test:ci`
- `npm --prefix frontend run build`

### Validate repository CI compatibility [verification]

All CI-relevant backend and frontend checks pass with inventory CRUD changes and no Playwright rerun requirement.

**Metadata:**

```yaml
depends_on:
  - Enforce stock value constraints at form and API boundaries
parallel: false
conflicts_with: []
files:
  - .github/workflows/ci.yml
  - frontend/package.json
  - backend/package.json
```

**Verification:**

- `npm --prefix backend run lint`
- `npm --prefix backend run format:check`
- `npm --prefix backend run test:ci`
- `npm --prefix frontend run lint`
- `npm --prefix frontend run format:check`
- `npm --prefix frontend run typecheck`
- `npm --prefix frontend run build`

---

## Notes

- This specification defines planning scope only for `/create` and does not include implementation code.
- Playwright re-test is not required by user request; CI criteria follow currently active backend/frontend workflow commands.
