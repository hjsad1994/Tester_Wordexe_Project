# Beads PRD

**Bead:** bd-2zx  
**Created:** 2026-02-13  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: false
conflicts_with: ["bd-15n"]
blocks: []
estimated_hours: 10
```

---

## Problem Statement

### What problem are we solving?

The website already has backend authentication and frontend auth UI, but it does not enforce role-based authorization. Product and category write actions are currently not protected by role checks, so non-admin users can potentially perform create, update, and delete operations that should be restricted.

### Why now?

The team needs a basic RBAC model to separate admin responsibilities from normal users before extending product and category management features. Delaying this work increases security risk (unauthorized writes) and creates rework when admin features grow.

### Who is affected?

- **Primary users:** Store administrators managing products and categories
- **Secondary users:** Normal authenticated users who should only have non-admin permissions

---

## Scope

### In-Scope

- Add `role` model for users with values `admin` and `user`
- Enforce backend authorization so only `admin` can create/update/delete products and categories
- Keep read/list behavior unchanged unless current routes already require auth
- Expose role in authenticated user response so frontend can apply role-aware UX
- Add frontend role gating for admin controls related to product/category write operations
- Add automated RBAC verification for positive and negative permission paths

### Out-of-Scope

- Multi-role/permission matrix beyond `admin` and `user`
- Organization/team-level permissions
- Full admin dashboard redesign unrelated to product/category RBAC
- Changes to unrelated domains outside auth, product, and category boundaries

---

## Proposed Solution

### Overview

Introduce a two-role RBAC layer centered on server-side enforcement: persist user role in the auth domain, add reusable authorization middleware, and apply it to product/category write routes. Frontend consumes role from session data to render admin controls conditionally for UX, while backend remains the security boundary.

### User Flow

1. User logs in and receives authenticated session as today, plus role-aware identity data.
2. If role is `admin`, user can access product/category create, edit, and delete actions.
3. If role is `user`, write actions are hidden/disabled in UI and rejected by backend with `403` when attempted directly.

---

## Requirements

### Functional Requirements

#### Role Persistence and Auth Exposure

User records include a role field (`admin` or `user`), defaulting safely for existing/new non-admin users, and authenticated identity responses include role.

**Scenarios:**

- **WHEN** a new user registers **THEN** the stored user has a valid default role and authentication still succeeds.
- **WHEN** an authenticated user calls the identity endpoint **THEN** the response includes role alongside existing fields.

#### Admin-Only Product/Category Writes

Backend enforces admin-only access for product/category create/update/delete endpoints.

**Scenarios:**

- **WHEN** an admin calls product/category write endpoints **THEN** the operation is allowed if request data is valid.
- **WHEN** a non-admin user calls product/category write endpoints **THEN** the API responds with `403 Forbidden`.

#### Frontend Role-Aware UX

Frontend auth/session state consumes role and only shows write controls for admin users.

**Scenarios:**

- **WHEN** an admin is logged in **THEN** product/category write controls are visible and actionable.
- **WHEN** a non-admin user is logged in **THEN** write controls are not available in product/category UI.

#### Backward-Compatible Auth and Read Paths

Existing login/register/me and product/category read flows remain functional after RBAC rollout.

**Scenarios:**

- **WHEN** existing auth flows run **THEN** users can still login/register/logout/me without regression.
- **WHEN** users access product/category read endpoints/pages **THEN** behavior matches current baseline unless explicitly changed.

### Non-Functional Requirements

- **Performance:** Role checks add negligible overhead per protected request and do not introduce additional DB calls where avoidable.
- **Security:** Authorization is deny-by-default for protected write routes; frontend checks are UX-only and not treated as security.
- **Accessibility:** Role-based UI visibility changes keep keyboard navigation and existing semantics intact.
- **Compatibility:** Maintain compatibility with current cookie-based auth and existing frontend auth context shape (additive extension).

---

## Success Criteria

- [ ] Product/category write endpoints are inaccessible to non-admin users.
  - Verify: `cd backend && npm run lint`
  - Verify: Execute API checks showing `403` for non-admin on POST/PUT/DELETE product/category routes.
- [ ] Admin users can successfully perform create/update/delete operations for products and categories.
  - Verify: Execute API checks showing success status for admin on POST/PUT/DELETE product/category routes.
- [ ] Frontend role-aware controls reflect authenticated role correctly.
  - Verify: `cd frontend && npm run typecheck`
  - Verify: `cd frontend && npm run lint`
  - Verify: Manual UI check for admin vs user visibility of product/category write controls.
- [ ] Existing auth and read behavior remains stable after role integration.
  - Verify: Manual smoke test of login/register/logout/me and product/category read pages.
- [ ] Automated RBAC regression tests exist for both allowed and denied paths.
  - Verify: `cd playwright && npm test`

---

## Technical Context

### Existing Patterns

- Auth cookie + JWT identity: `backend/src/middlewares/authMiddleware.js` and `backend/src/services/authService.js`
- Auth response mapping: `backend/src/services/authService.js` (`toUserResponse`)
- Product/category route registration: `backend/src/routes/productRoutes.js` and `backend/src/routes/categoryRoutes.js`
- Frontend auth session state: `frontend/src/contexts/AuthContext.tsx`
- Frontend auth-aware header rendering: `frontend/src/components/Header.tsx`

### Key Files

- `backend/src/models/User.js` - User schema currently has no role field
- `backend/src/middlewares/authMiddleware.js` - Current auth middleware sets `req.userId`
- `backend/src/errors/ClientError.js` - Contains `ForbiddenError` usable for authz failures
- `backend/src/controllers/productController.js` - Product CRUD controllers
- `backend/src/controllers/categoryController.js` - Category CRUD controllers
- `frontend/src/app/products/page.tsx` - Product UI currently static
- `frontend/src/components/Categories.tsx` - Category UI currently static

### Affected Files

```yaml
files:
  - backend/src/models/User.js
  - backend/src/services/authService.js
  - backend/src/middlewares/authMiddleware.js
  - backend/src/middlewares/requireRole.js
  - backend/src/routes/productRoutes.js
  - backend/src/routes/categoryRoutes.js
  - backend/src/controllers/productController.js
  - backend/src/controllers/categoryController.js
  - frontend/src/contexts/AuthContext.tsx
  - frontend/src/components/Header.tsx
  - frontend/src/app/products/page.tsx
  - frontend/src/components/Categories.tsx
  - frontend/src/lib/api.ts
  - playwright/tests/rbac/admin-product-category.spec.ts
```

---

## Risks & Mitigations

| Risk                                                                                 | Likelihood | Impact | Mitigation                                                                                    |
| ------------------------------------------------------------------------------------ | ---------- | ------ | --------------------------------------------------------------------------------------------- |
| Missing role values for existing users cause inconsistent authorization behavior     | Med        | High   | Add safe default role and run explicit backfill for existing users before enforcement         |
| Frontend-only role gating is bypassed by direct API calls                            | High       | High   | Enforce admin checks on backend routes and treat frontend gating as UX-only                   |
| Route protection changes break existing client behavior relying on open write routes | Med        | Med    | Roll out with explicit smoke tests and update clients to authenticate/admin role where needed |
| Authorization regressions are not detected early                                     | Med        | High   | Add negative and positive RBAC automated tests and include in regression runs                 |

---

## Open Questions

| Question                                                                                                         | Owner             | Due Date                       | Status |
| ---------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------ | ------ |
| How will initial admin users be provisioned (seed script, DB update, or admin promotion endpoint)?               | Product + Backend | Before `/start` implementation | Open   |
| Should non-admin users have authenticated read-only access, or should read routes stay public as they are today? | Product           | Before `/start` implementation | Open   |

---

## Tasks

### Persist role in auth domain [backend]

User entities and auth identity payloads include a validated role (`admin`/`user`) so role is available consistently across authentication flows.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: ["Enforce admin-only product/category writes [backend]"]
files:
  - backend/src/models/User.js
  - backend/src/services/authService.js
  - backend/src/controllers/authController.js
```

**Verification:**

- `cd backend && npm run lint`
- Manual API check: register/login/me returns role field and valid defaults.

### Enforce admin-only product/category writes [backend]

Product and category create/update/delete endpoints reject non-admin users and allow admins through centralized authorization middleware.

**Metadata:**

```yaml
depends_on: ["Persist role in auth domain [backend]"]
parallel: false
conflicts_with: []
files:
  - backend/src/middlewares/authMiddleware.js
  - backend/src/middlewares/requireRole.js
  - backend/src/routes/productRoutes.js
  - backend/src/routes/categoryRoutes.js
  - backend/src/errors/ClientError.js
```

**Verification:**

- `cd backend && npm run lint`
- API verification: non-admin receives `403` on POST/PUT/DELETE for product/category.
- API verification: admin succeeds on POST/PUT/DELETE for product/category.

### Expose role in frontend session and gate controls [frontend]

Frontend auth/session models include role and conditionally render write controls for product/category management only to admins.

**Metadata:**

```yaml
depends_on: ["Persist role in auth domain [backend]"]
parallel: true
conflicts_with: ["Implement admin product/category CRUD flows [frontend]"]
files:
  - frontend/src/contexts/AuthContext.tsx
  - frontend/src/components/Header.tsx
  - frontend/src/app/products/page.tsx
  - frontend/src/components/Categories.tsx
```

**Verification:**

- `cd frontend && npm run typecheck`
- `cd frontend && npm run lint`
- Manual UI check for admin vs user control visibility.

### Implement admin product/category CRUD flows [frontend]

Frontend provides functional admin-only product/category create, edit, and delete interactions wired to backend APIs.

**Metadata:**

```yaml
depends_on:
  - "Enforce admin-only product/category writes [backend]"
  - "Expose role in frontend session and gate controls [frontend]"
parallel: false
conflicts_with: []
files:
  - frontend/src/lib/api.ts
  - frontend/src/app/products/page.tsx
  - frontend/src/components/Categories.tsx
  - frontend/src/components/ProductCard.tsx
```

**Verification:**

- `cd frontend && npm run typecheck`
- `cd frontend && npm run lint`
- Manual admin workflow check: create/update/delete product and category from UI.

### Add RBAC regression coverage [testing]

Automated tests validate both allowed admin actions and denied non-admin actions for product/category write paths.

**Metadata:**

```yaml
depends_on:
  - "Enforce admin-only product/category writes [backend]"
  - "Implement admin product/category CRUD flows [frontend]"
parallel: false
conflicts_with: []
files:
  - playwright/tests/rbac/admin-product-category.spec.ts
  - playwright/fixtures/test-fixtures.ts
```

**Verification:**

- `cd playwright && npm test`
- Test report includes both success (admin) and denial (user) scenarios.

---

## Notes

- Backend authorization remains the source of truth; frontend role checks only improve user experience.
- This PRD intentionally separates server enforcement from UI enablement to avoid security regressions.
