# Beads PRD

**Bead:** bd-210  
**Created:** 2026-02-16  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 14
```

---

## Problem Statement

### What problem are we solving?

The admin panel has no order management capability, while checkout currently stores order data only in browser session storage. This prevents admins from seeing real orders, controlling post-payment fulfillment flow, and enforcing business rules after delivery. The current state creates operational blind spots, weak traceability, and inconsistent customer support handling.

### Why now?

Order management is a core ecommerce capability. Without persisted orders and admin controls, each checkout is ephemeral and cannot be processed in a reliable operational workflow. Cost of inaction: lost order visibility, no lifecycle governance, and inability to safely support delivered-order immutability.

### Who is affected?

- **Primary users:** Admin operators who need to track and update order lifecycle.
- **Secondary users:** Shoppers and support staff who depend on accurate order state and history.

---

## Scope

### In-Scope

- Persist orders to backend storage when user completes checkout.
- Add admin order management screen and backend APIs for listing and updating order status.
- Enforce immutable delivered state: once an order is marked delivered, status cannot be changed.
- Define and implement order deletion policy aligned with ecommerce best practices.
- Keep existing admin role guard pattern and apply it to order admin endpoints.

### Out-of-Scope

- Payment gateway integration redesign.
- Full returns/exchange module implementation.
- Inventory reservation and allocation engine.
- Bulk import/export order tooling.

---

## Proposed Solution

### Overview

Introduce a persisted Order domain in backend (model, service, controller, routes), wire checkout to create orders through API, and add an admin orders page that lists orders and updates allowed statuses. Use explicit transition rules with terminal state enforcement so delivered orders are locked. Adopt soft delete policy (not hard delete) with audit fields for compliance and supportability.

### User Flow

1. User completes checkout and frontend submits order payload to backend.
2. Backend creates persisted order with initial lifecycle state and returns order id.
3. Admin opens `/admin/orders` to review and manage orders.
4. Admin updates status only through allowed transitions.
5. If order reaches delivered state, further status updates are rejected.
6. If removal is needed, admin performs soft delete (archival visibility retained).

---

## Requirements

### Functional Requirements

#### Persisted Order Creation

Checkout completion must create a persistent backend order record instead of only relying on session storage.

**Scenarios:**

- **WHEN** a user submits checkout successfully **THEN** backend stores an order with line items, totals, customer/shipping snapshot, and initial statuses.
- **WHEN** order creation succeeds **THEN** frontend stores returned order id for success page rendering.

#### Admin Order Visibility

Admins must be able to fetch and view order list with key lifecycle fields.

**Scenarios:**

- **WHEN** admin loads order management page **THEN** UI shows paginated or bounded order list with status, amount, customer, and created time.
- **WHEN** non-admin calls admin order endpoints **THEN** request is rejected with forbidden response.

#### Status Transition Guard and Delivered Lock

Order status updates must follow explicit allowed transitions and terminal immutability rules.

**Scenarios:**

- **WHEN** admin attempts an allowed status transition **THEN** backend updates status and records actor/time.
- **WHEN** an order is already delivered **THEN** any status change attempt is rejected.

#### Deletion Policy

Orders must not be hard deleted from operational storage.

**Scenarios:**

- **WHEN** admin requests delete action **THEN** system performs soft delete with `deletedAt`, `deletedBy`, and reason.
- **WHEN** default admin list is loaded **THEN** soft-deleted orders are excluded unless explicitly requested for audit view.

### Non-Functional Requirements

- **Performance:** Admin order listing should remain responsive for normal panel usage; apply indexed sort/filter keys where needed.
- **Security:** Enforce role checks server-side for all admin order actions.
- **Accessibility:** Admin order controls must preserve keyboard access and semantic labels.
- **Compatibility:** Follow existing frontend/backend architecture and API client conventions.

---

## Success Criteria

- [ ] Checkout writes a persistent order record and success page can load using backend order id.
  - Verify: `npm run typecheck`
  - Verify: manual API check `POST /api/orders` then read created order in admin API.
- [ ] Admin can view persisted orders from backend on new orders page.
  - Verify: `npm run typecheck`
  - Verify: manual UI check at `/admin/orders` with admin account.
- [ ] Delivered orders cannot change status.
  - Verify: manual API check: update status after delivered returns rejection (4xx).
- [ ] Deletion policy uses soft delete, not hard delete.
  - Verify: manual DB/API check confirms record retained with `deletedAt` metadata.
- [ ] Quality gates for shipped changes pass.
  - Verify: `npm run lint:fix`
  - Verify: `npm run typecheck`

---

## Technical Context

### Existing Patterns

- Admin role guard (frontend): `frontend/src/app/admin/layout.tsx` - redirects non-admin users away from admin routes.
- Admin role guard (backend): `backend/src/middlewares/authMiddleware.js` and `backend/src/middlewares/requireRole.js` - pattern to protect write endpoints.
- Admin CRUD route pattern: `backend/src/routes/productRoutes.js` and `backend/src/routes/categoryRoutes.js` - existing admin-protected route style.
- Frontend API client convention: `frontend/src/lib/api.ts` - central API helpers for domain operations.
- Current checkout implementation gap: `frontend/src/app/checkout/page.tsx` and `frontend/src/app/checkout/success/page.tsx` use session storage, not persisted backend orders.

### Key Files

- `backend/src/routes/index.js` - route registration point; needs order route wiring.
- `backend/src/models/User.js` - role source for admin authorization.
- `frontend/src/components/admin/AdminSidebar.tsx` - add orders navigation entry.
- `frontend/src/app/admin/products/page.tsx` and `frontend/src/app/admin/categories/page.tsx` - page composition pattern for new admin orders page.

### Affected Files

Files this bead is expected to modify or add:

```yaml
files:
  - backend/src/routes/index.js
  - backend/src/routes/orderRoutes.js
  - backend/src/controllers/orderController.js
  - backend/src/services/orderService.js
  - backend/src/models/Order.js
  - backend/src/middlewares/requireRole.js
  - frontend/src/lib/api.ts
  - frontend/src/app/checkout/page.tsx
  - frontend/src/app/checkout/success/page.tsx
  - frontend/src/components/admin/AdminSidebar.tsx
  - frontend/src/app/admin/orders/page.tsx
  - frontend/src/components/admin/AdminOrdersPanel.tsx
```

---

## Risks & Mitigations

| Risk                                                                     | Likelihood | Impact | Mitigation                                                                                  |
| ------------------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------- |
| Checkout regression while moving from session storage to API persistence | Medium     | High   | Keep payload contract explicit, preserve fallback UX, verify end-to-end checkout happy path |
| Invalid status transitions causing data inconsistency                    | Medium     | High   | Centralize transition rules in service layer and block illegal transitions server-side      |
| Admin-only controls exposed accidentally                                 | Low        | High   | Reuse existing auth middleware + requireRole guard on every admin order endpoint            |
| Soft delete policy misunderstood as hard delete                          | Medium     | Medium | Encode deletion semantics in API contract and admin UI labels; keep audit fields mandatory  |

---

## Open Questions

| Question                                                                                                                           | Owner                 | Due Date       | Status |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------- | ------ |
| Should financial and fulfillment statuses be modeled as two separate fields now, or start with one status field and migrate later? | Product + Engineering | Before `/ship` | Open   |
| Should soft-deleted orders be restorable from admin UI in this iteration, or audit-only visibility is enough?                      | Product               | Before `/ship` | Open   |

---

## Tasks

### Define order domain model and lifecycle rules [backend]

Order persistence schema exists with lifecycle fields, terminal state definitions, and soft-delete audit fields.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - backend/src/models/Order.js
  - backend/src/services/orderService.js
```

**Verification:**

- `npm run typecheck`
- Manual: create/update service calls accept allowed states and reject terminal-state mutation.

### Add order API endpoints for checkout and admin [backend]

Backend exposes create/list/update/soft-delete order endpoints with admin protection on management actions.

**Metadata:**

```yaml
depends_on: ["Define order domain model and lifecycle rules"]
parallel: false
conflicts_with: []
files:
  - backend/src/routes/index.js
  - backend/src/routes/orderRoutes.js
  - backend/src/controllers/orderController.js
  - backend/src/services/orderService.js
  - backend/src/middlewares/requireRole.js
```

**Verification:**

- `npm run typecheck`
- Manual: non-admin receives forbidden on admin endpoints.
- Manual: delivered order status update returns rejection.

### Integrate checkout with persisted order creation [frontend]

Checkout submit path calls backend order creation API and uses returned order id/data for success flow.

**Metadata:**

```yaml
depends_on: ["Add order API endpoints for checkout and admin"]
parallel: false
conflicts_with: []
files:
  - frontend/src/lib/api.ts
  - frontend/src/app/checkout/page.tsx
  - frontend/src/app/checkout/success/page.tsx
```

**Verification:**

- `npm run typecheck`
- Manual: checkout creates retrievable persisted order instead of session-only record.

### Build admin orders route and management panel [frontend]

Admin has a dedicated orders screen with list/detail/status actions that consumes backend order APIs.

**Metadata:**

```yaml
depends_on: ["Add order API endpoints for checkout and admin"]
parallel: true
conflicts_with: []
files:
  - frontend/src/components/admin/AdminSidebar.tsx
  - frontend/src/app/admin/orders/page.tsx
  - frontend/src/components/admin/AdminOrdersPanel.tsx
  - frontend/src/lib/api.ts
```

**Verification:**

- `npm run typecheck`
- Manual: `/admin/orders` visible to admin and hidden/blocked for non-admin.

### Enforce deletion policy in API and UI language [policy]

Delete behavior is explicitly soft delete with audit metadata and operator-facing wording that avoids hard-delete semantics.

**Metadata:**

```yaml
depends_on:
  [
    "Add order API endpoints for checkout and admin",
    "Build admin orders route and management panel",
  ]
parallel: false
conflicts_with: []
files:
  - backend/src/controllers/orderController.js
  - backend/src/services/orderService.js
  - frontend/src/components/admin/AdminOrdersPanel.tsx
```

**Verification:**

- `npm run typecheck`
- Manual: delete action marks `deletedAt/deletedBy/reason`; record remains queryable in audit view.

### Add regression checks for order workflow [qa]

Core order flow has repeatable verification checks covering creation, admin visibility, status lock, and soft-delete behavior.

**Metadata:**

```yaml
depends_on:
  - "Integrate checkout with persisted order creation"
  - "Build admin orders route and management panel"
  - "Enforce deletion policy in API and UI language"
parallel: false
conflicts_with: []
files:
  - playwright/tests/rbac/admin-route-flow.spec.ts
  - playwright/tests/rbac/admin-product-category.spec.ts
```

**Verification:**

- `npm run typecheck`
- `npm run lint:fix`
- `bun test`

---

## Notes

- Best-practice policy for ecommerce order deletion in this bead: no hard delete for operational orders; use soft delete with auditability.
- Delivered order status is terminal and immutable; exceptions should be implemented as separate return/refund workflows, not direct status rewrites.
