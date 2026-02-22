# Beads PRD: Promotion/Coupon Code System + Checkout Success Fix

**Bead:** Tester_Wordexe_Project-boo  
**Created:** 2026-02-22  
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

The Baby Bliss e-commerce platform currently has **no promotion/coupon code system**. Users cannot apply discount codes during checkout, and admins have no interface to create or manage promotional offers. This limits marketing capabilities and customer engagement.

Additionally, there is a **critical bug in the checkout flow**: after a user completes payment (clicks "Đặt hàng"), the cart is cleared via `clearCart()` before the router navigates to `/checkout/success`. A `useEffect` guard on the checkout page detects the now-empty cart and redirects to `/cart` (empty cart page), **overriding the success page navigation**. The user never sees the order confirmation.

### Why now?

- The platform has no way to run promotions, impacting customer acquisition and retention
- The checkout success bug creates a confusing user experience — users don't know if their order was placed
- Both issues directly impact conversion and trust

### Who is affected?

- **Primary users:** Shoppers (end customers) — cannot apply coupons, don't see order confirmation
- **Secondary users:** Admin/store managers — cannot create or manage promotional campaigns

---

## Scope

### In-Scope

- Backend: Coupon Mongoose model with full validation (code, type, value, limits, dates)
- Backend: Coupon CRUD API endpoints (admin-protected)
- Backend: Coupon validation endpoint (authenticated users)
- Backend: Order model extension with coupon/discount fields
- Backend: Order creation flow with coupon validation + discount calculation
- Frontend: Coupon code input in checkout page (order summary section)
- Frontend: Display available/applicable coupons for logged-in users
- Frontend: Discount line item in order summary (checkout + success page)
- Frontend: Admin coupons management panel (CRUD)
- Frontend: Admin sidebar navigation update
- Fix: Checkout redirect bug — ensure users see success page after payment

### Out-of-Scope

- Payment gateway integration (payments remain simulated)
- Automatic coupon application (e.g., auto-apply best coupon)
- Coupon stacking (multiple coupons per order)
- Referral/affiliate code system
- Email notification for new coupons
- Coupon analytics dashboard
- Product/category-specific coupon targeting (deferred to future iteration — keep model fields but don't implement filtering UI)

---

## Proposed Solution

### Overview

Add a complete coupon/promotion system spanning backend and frontend. The backend gets a new `Coupon` model, CRUD API, and validation endpoint. The order creation flow is extended to validate and apply coupons, storing discount data as a snapshot on the order. The frontend checkout page gets a collapsible coupon input section where users can enter a code or select from available coupons. The admin panel gets a new "Khuyến mãi" section for managing coupons. The checkout redirect bug is fixed by adding an order-completion flag that bypasses the cart-empty guard.

### User Flow — Applying a Coupon

1. User navigates to `/checkout` with items in cart
2. In the order summary (right column), user sees "Bạn có mã khuyến mãi?" collapsible link
3. User clicks to expand, enters a coupon code (or selects from available coupons shown below)
4. User clicks "Áp dụng" — frontend calls `POST /api/coupons/validate`
5. On success: discount amount shown as a green line item in order summary, total recalculated
6. On error: inline error message below input (e.g., "Mã khuyến mãi đã hết hạn")
7. User can remove applied coupon via ✕ button
8. User clicks "Đặt hàng" — order created with coupon code, server re-validates and applies discount
9. User sees success page with discount breakdown

### User Flow — Admin Managing Coupons

1. Admin navigates to `/admin/coupons` via sidebar
2. Sees table of all coupons (code, name, type, value, usage, status, dates)
3. Can create new coupon via modal form
4. Can edit existing coupon via modal form
5. Can toggle active/inactive status
6. Can delete unused coupons (usageCount === 0 only)

### Checkout Success Fix Flow

1. User clicks "Đặt hàng" → `completeOrder()` runs
2. On API success: set `isOrderComplete = true` state flag BEFORE clearing cart
3. Cart-empty guard checks `isOrderComplete` flag — if true, skip redirect to `/cart`
4. `router.push('/checkout/success?orderId=...&token=...')` executes correctly

---

## Requirements

### Functional Requirements

#### FR-1: Coupon Model

A `Coupon` Mongoose model exists with fields for code, name, description, discount type (percentage/fixed_amount/free_shipping), discount value, maximum discount cap, minimum order amount, usage limits, date validity, and active status.

**Scenarios:**

- **WHEN** admin creates a coupon with code "SAVE20" **THEN** it is stored with uppercase-normalized code and all specified fields
- **WHEN** a coupon with code "SAVE20" already exists **THEN** creation fails with a duplicate error (unique constraint)
- **WHEN** coupon has `discountType: "percentage"` and `discountValue: 20` **THEN** 20% discount is calculated on eligible subtotal
- **WHEN** coupon has `maximumDiscount: 50000` **THEN** percentage discount is capped at 50,000đ

#### FR-2: Coupon CRUD API

Admin-protected endpoints exist for creating, reading, updating, and deleting coupons.

**Scenarios:**

- **WHEN** authenticated admin calls `POST /api/coupons` with valid data **THEN** coupon is created and returned
- **WHEN** non-admin user calls `POST /api/coupons` **THEN** 403 Forbidden
- **WHEN** admin calls `DELETE /api/coupons/:id` on a coupon with `usageCount > 0` **THEN** 400 Bad Request (must deactivate instead)
- **WHEN** admin calls `GET /api/coupons` **THEN** all coupons returned with pagination

#### FR-3: Coupon Validation API

An authenticated endpoint validates a coupon code against the current cart and returns the calculated discount.

**Scenarios:**

- **WHEN** user submits valid, active, non-expired code with cart meeting minimum amount **THEN** returns `{ valid: true, discount, discountAmount }` details
- **WHEN** coupon is expired **THEN** returns error "Mã khuyến mãi đã hết hạn"
- **WHEN** coupon usage limit reached **THEN** returns error "Mã khuyến mãi đã hết lượt sử dụng"
- **WHEN** user already used coupon up to `perUserLimit` **THEN** returns error "Bạn đã sử dụng mã khuyến mãi này"
- **WHEN** cart subtotal < `minimumOrderAmount` **THEN** returns error with required minimum

#### FR-4: Order Integration with Coupons

Order creation accepts an optional coupon code, re-validates server-side, applies discount, and stores coupon snapshot on the order.

**Scenarios:**

- **WHEN** order created with valid coupon code **THEN** order has `couponCode`, `discountAmount` fields populated, `total = subtotal - discountAmount + shippingFee`
- **WHEN** order created with invalid/expired coupon **THEN** order creation fails with validation error
- **WHEN** order created without coupon **THEN** order works as before (`discountAmount = 0`)
- **WHEN** coupon type is `free_shipping` **THEN** `shippingFee` is set to 0 on the order
- **WHEN** coupon is successfully applied to order **THEN** coupon `usageCount` incremented atomically

#### FR-5: Checkout Coupon UI

The checkout page order summary section includes a collapsible coupon input with apply/remove functionality and available coupons list.

**Scenarios:**

- **WHEN** user clicks "Bạn có mã khuyến mãi?" **THEN** input field and available coupons expand below
- **WHEN** user enters valid code and clicks "Áp dụng" **THEN** discount shown as green line in order summary, total updated
- **WHEN** user clicks ✕ on applied coupon **THEN** coupon removed, totals reset
- **WHEN** user selects a coupon from available list **THEN** code auto-filled and validated
- **WHEN** logged-in user views checkout **THEN** available (valid, active) coupons displayed as selectable chips/cards

#### FR-6: Admin Coupons Panel

Admin panel has a "Khuyến mãi" section with table listing, create/edit modal, and delete/deactivate controls.

**Scenarios:**

- **WHEN** admin navigates to `/admin/coupons` **THEN** sees table of all coupons with columns: code, name, type, value, usage count/limit, status, valid dates, actions
- **WHEN** admin clicks "Tạo mã khuyến mãi" **THEN** modal form opens with all coupon fields
- **WHEN** admin submits valid form **THEN** coupon created and appears in table
- **WHEN** admin clicks edit on a coupon row **THEN** modal pre-filled with existing data
- **WHEN** admin toggles active/inactive **THEN** coupon status updated immediately

#### FR-7: Checkout Success Page Fix

After successful order creation, users are reliably redirected to the success page instead of the empty cart.

**Scenarios:**

- **WHEN** order is created successfully with COD **THEN** user sees `/checkout/success` with full order details
- **WHEN** order is created successfully with MoMo **THEN** user sees `/checkout/success` with full order details
- **WHEN** order has a coupon applied **THEN** success page shows discount line in order details

#### FR-8: Success Page Discount Display

The checkout success page displays coupon/discount information in the order details.

**Scenarios:**

- **WHEN** order has `discountAmount > 0` **THEN** shows "Giảm giá" line with coupon code and `-{amount}đ` in green
- **WHEN** order has `discountAmount === 0` **THEN** no discount line shown (backwards compatible)

### Non-Functional Requirements

- **Performance:** Coupon validation API responds in < 500ms
- **Security:** All coupon mutation endpoints admin-only; validation endpoint requires authentication; discount always recalculated server-side (never trust client)
- **Accessibility:** All new UI elements have proper labels, focus management, keyboard navigation, min 44px touch targets
- **Compatibility:** Matches existing Tailwind CSS 4 pink pastel design system (OKLCH palette, Nunito/Quicksand fonts, rounded-2xl cards, gradient buttons)

---

## Success Criteria

- [ ] Coupon model exists in MongoDB with all specified fields
  - Verify: `node -e "const m = require('./backend/src/models/Coupon'); console.log(Object.keys(m.schema.paths))"`
- [ ] Admin can create, read, update, delete coupons via `/admin/coupons`
  - Verify: Manual test — create coupon "TEST10" with 10% discount, verify it appears in table
- [ ] User can apply a valid coupon code in checkout and see discount
  - Verify: Manual test — add items to cart, go to checkout, enter coupon code, verify discount shown in summary
- [ ] Order created with coupon has correct discount and total
  - Verify: `curl -X POST http://localhost:3001/api/orders -d '...' | jq '.data.discountAmount, .data.total'`
- [ ] Checkout redirects to success page after payment (not empty cart)
  - Verify: Manual test — complete checkout with COD, verify landing on `/checkout/success` with order details
- [ ] Success page shows discount breakdown when coupon was applied
  - Verify: Manual test — create order with coupon, verify "Giảm giá" line on success page
- [ ] All new UI matches Baby Bliss pink pastel design system
  - Verify: Visual comparison — coupon input, admin panel, success page all use pink gradients, rounded cards, Tailwind patterns
- [ ] Invalid/expired coupon shows clear error message in Vietnamese
  - Verify: Manual test — enter expired code, verify error "Mã khuyến mãi đã hết hạn"

---

## Technical Context

### Existing Patterns

- **Model pattern:** `backend/src/models/Category.js` — simple Mongoose model with timestamps, slug generation, indexes (use as template for Coupon model)
- **Service pattern:** `backend/src/services/categoryService.js` — class-based singleton with CRUD methods, validation, error throwing
- **Controller pattern:** `backend/src/controllers/categoryController.js` — thin handlers wrapped in `asyncHandler`, delegating to service
- **Route pattern:** `backend/src/routes/categoryRoutes.js` — public GET, admin-protected mutations with `authMiddleware` + `requireRole('admin')`
- **Route registry:** `backend/src/routes/index.js` — `router.use('/coupons', couponRoutes)` to add
- **API client pattern:** `frontend/src/lib/api.ts` — fetch with `credentials: 'include'`, error via `parseError()`, return `body.data`
- **Admin panel pattern:** `frontend/src/components/admin/AdminCategoriesPanel.tsx` — inline form + delete modal, state management with useState, CRUD via api.ts functions
- **Admin modal pattern:** `frontend/src/components/admin/AdminProductsPanel.tsx` — full modal with focus trap, escape-to-close, accessibility attributes
- **Admin sidebar:** `frontend/src/components/admin/AdminSidebar.tsx` — nav items array at lines 6-11
- **Checkout order summary:** `frontend/src/app/checkout/page.tsx` — right column sticky sidebar with price breakdown at lines 382-442
- **Order model:** `backend/src/models/Order.js` — embedded sub-schemas, status history, soft delete
- **Order service:** `backend/src/services/orderService.js` — `createOrder()` with product lookup, price snapshot, total calculation

### Key Files

- `backend/src/models/Order.js` — Order schema, needs `couponCode` + `discountAmount` fields
- `backend/src/services/orderService.js` — Order creation, needs coupon validation + discount logic
- `backend/src/routes/index.js` — Route registry, needs coupon routes registration
- `frontend/src/app/checkout/page.tsx` — Checkout UI, needs coupon input + discount display + redirect fix
- `frontend/src/app/checkout/success/page.tsx` — Success page, needs discount line in order details
- `frontend/src/lib/api.ts` — API client, needs Coupon interfaces + functions
- `frontend/src/components/admin/AdminSidebar.tsx` — Sidebar nav, needs "Khuyến mãi" link
- `frontend/src/contexts/CartContext.tsx` — Cart context (read-only reference, not modified)

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  # Backend - New files
  - backend/src/models/Coupon.js # New Coupon model
  - backend/src/services/couponService.js # New Coupon service
  - backend/src/controllers/couponController.js # New Coupon controller
  - backend/src/routes/couponRoutes.js # New Coupon routes
  # Backend - Modified files
  - backend/src/models/Order.js # Add couponCode, discountAmount fields
  - backend/src/services/orderService.js # Add coupon validation in createOrder
  - backend/src/controllers/orderController.js # Pass coupon data through
  - backend/src/routes/index.js # Register coupon routes
  # Frontend - New files
  - frontend/src/components/admin/AdminCouponsPanel.tsx # New admin panel
  - frontend/src/app/admin/coupons/page.tsx # New admin page
  # Frontend - Modified files
  - frontend/src/app/checkout/page.tsx # Coupon input + redirect fix
  - frontend/src/app/checkout/success/page.tsx # Discount display
  - frontend/src/lib/api.ts # Coupon API functions + types
  - frontend/src/components/admin/AdminSidebar.tsx # Add nav item
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Race condition on coupon usage | Medium | High | Use atomic `findOneAndUpdate` with `$inc` for usage count, not `find()` then `save()` |
| Client-side discount manipulation | Medium | High | Always re-validate and recalculate discount server-side in `createOrder` — never trust client `discountAmount` |
| Checkout redirect bug regression | Low | High | Add `isOrderComplete` ref/state flag, test both COD and MoMo flows |
| Stale discount after cart change | Medium | Medium | Invalidate applied coupon when cart items change (clear coupon state on cart modification) |
| UI inconsistency with existing style | Low | Medium | Use exact same Tailwind classes from AdminProductsPanel/AdminCategoriesPanel as reference |
| Coupon code brute-force | Low | Medium | Rate-limit `/api/coupons/validate` endpoint; require authentication |

---

## Open Questions

| Question | Owner | Due Date | Status |
| --- | --- | --- | --- |
| Should guest users (not logged in) be able to use coupons? | Product | Before implementation | Open |
| Maximum number of coupons to show in "available coupons" list? | Product | Before implementation | Open |

---

## Tasks

### 1. Create Coupon Model [backend]

A `Coupon` Mongoose model exists at `backend/src/models/Coupon.js` with fields: `code` (unique, uppercase, trimmed), `name`, `description`, `discountType` (enum: percentage/fixed_amount/free_shipping), `discountValue`, `maximumDiscount`, `minimumOrderAmount`, `usageLimit`, `usageCount`, `perUserLimit`, `usedBy[]`, `isActive`, `validFrom`, `validUntil`, `createdBy`, with timestamps, indexes, and `isCurrentlyValid` virtual.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - backend/src/models/Coupon.js
```

**Verification:**

- `node -e "const m = require('./backend/src/models/Coupon'); console.log(Object.keys(m.schema.paths).join(', '))"` lists all expected fields
- `node -e "const m = require('./backend/src/models/Coupon'); console.log(m.schema.path('code').options.unique)"` returns `true`

### 2. Create Coupon Service [backend]

A `couponService.js` exists at `backend/src/services/couponService.js` with methods: `createCoupon`, `getAllCoupons`, `getCouponById`, `updateCoupon`, `deleteCoupon`, `validateCoupon(code, subtotal, userId)`, `redeemCoupon(couponId, userId)`, and `getAvailableCoupons()`. Validation checks: active status, date range, usage limits, per-user limit, minimum order amount. Redemption uses atomic `findOneAndUpdate` with `$inc`.

**Metadata:**

```yaml
depends_on: ["1. Create Coupon Model"]
parallel: false
conflicts_with: []
files:
  - backend/src/services/couponService.js
```

**Verification:**

- Service file loads without errors: `node -e "require('./backend/src/services/couponService')"`
- All methods are exported: `node -e "const s = require('./backend/src/services/couponService'); console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(s)).filter(m => m !== 'constructor').join(', '))"`

### 3. Create Coupon Controller and Routes [backend]

Controller at `backend/src/controllers/couponController.js` and routes at `backend/src/routes/couponRoutes.js` registered in `backend/src/routes/index.js`. Routes: `GET /api/coupons` (admin: list all), `GET /api/coupons/available` (auth: list valid coupons for user), `POST /api/coupons` (admin: create), `PUT /api/coupons/:id` (admin: update), `DELETE /api/coupons/:id` (admin: delete), `POST /api/coupons/validate` (auth: validate code against cart).

**Metadata:**

```yaml
depends_on: ["2. Create Coupon Service"]
parallel: false
conflicts_with: []
files:
  - backend/src/controllers/couponController.js
  - backend/src/routes/couponRoutes.js
  - backend/src/routes/index.js
```

**Verification:**

- `curl http://localhost:3001/api/coupons` returns 401 (requires auth)
- `curl -X POST http://localhost:3001/api/coupons/validate` returns 401 (requires auth)
- Route registered: `grep "coupons" backend/src/routes/index.js`

### 4. Extend Order Model with Discount Fields [backend]

The `Order` model at `backend/src/models/Order.js` has new optional fields: `couponCode` (String, default null), `discountAmount` (Number, default 0, min 0). The `total` calculation accounts for discount: `total = subtotal - discountAmount + shippingFee`.

**Metadata:**

```yaml
depends_on: ["1. Create Coupon Model"]
parallel: true
conflicts_with: []
files:
  - backend/src/models/Order.js
```

**Verification:**

- `node -e "const m = require('./backend/src/models/Order'); console.log(m.schema.path('couponCode').instance, m.schema.path('discountAmount').instance)"` outputs `String Number`

### 5. Integrate Coupon into Order Creation Flow [backend]

The `orderService.createOrder()` accepts optional `couponCode` in payload. If provided, validates the coupon server-side, calculates discount, redeems coupon atomically, and stores `couponCode` + `discountAmount` on the order with `total = subtotal - discountAmount + shippingFee`. If coupon is `free_shipping` type, sets `shippingFee` to 0.

**Metadata:**

```yaml
depends_on: ["2. Create Coupon Service", "4. Extend Order Model with Discount Fields"]
parallel: false
conflicts_with: []
files:
  - backend/src/services/orderService.js
  - backend/src/controllers/orderController.js
```

**Verification:**

- Create a test coupon via API, then create an order with `couponCode` — verify `discountAmount > 0` and `total` is correct
- Create an order WITHOUT coupon — verify backward compatibility (`discountAmount: 0`)

### 6. Add Coupon API Functions to Frontend [frontend]

The `frontend/src/lib/api.ts` has new TypeScript interfaces (`Coupon`, `CouponPayload`, `ValidateCouponResponse`) and API functions: `fetchCouponsApi()`, `fetchAvailableCouponsApi()`, `createCouponApi()`, `updateCouponApi()`, `deleteCouponApi()`, `validateCouponApi()`. The `Order` and `CreateOrderPayload` interfaces are extended with `couponCode` and `discountAmount`.

**Metadata:**

```yaml
depends_on: ["3. Create Coupon Controller and Routes"]
parallel: true
conflicts_with: []
files:
  - frontend/src/lib/api.ts
```

**Verification:**

- `npx tsc --noEmit` passes without type errors in api.ts
- `grep -c "coupon\|Coupon" frontend/src/lib/api.ts` returns count > 0

### 7. Fix Checkout Redirect Bug [frontend]

The checkout page at `frontend/src/app/checkout/page.tsx` no longer redirects to `/cart` after successful order creation. An `isOrderCompleteRef` (useRef) is set to `true` before clearing the cart, and the cart-empty guard (`useEffect`) skips redirect when this ref is true.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["8. Add Coupon Input to Checkout Page"]
files:
  - frontend/src/app/checkout/page.tsx
```

**Verification:**

- Manual test: Add items to cart → go to checkout → submit order (COD) → verify landing on `/checkout/success` (NOT `/cart`)
- Manual test: Same flow with MoMo payment method

### 8. Add Coupon Input to Checkout Page [frontend]

The checkout page order summary section includes a collapsible "Bạn có mã khuyến mãi?" section with: (1) text input + "Áp dụng" button for entering codes, (2) list of available coupons as selectable cards (for logged-in users), (3) applied coupon badge with remove button, (4) "Giảm giá" line in price breakdown showing `-{discountAmount}đ` in green, (5) updated total calculation. Applied coupon code is sent in `completeOrder()` API call. All styling uses existing pink pastel design system.

**Metadata:**

```yaml
depends_on: ["6. Add Coupon API Functions to Frontend", "7. Fix Checkout Redirect Bug"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/checkout/page.tsx
```

**Verification:**

- Visual: Coupon input renders in order summary below price breakdown, above submit button
- Functional: Entering valid code shows discount; entering invalid code shows error in Vietnamese
- Functional: Selecting available coupon auto-applies it
- Functional: Order submitted with coupon code in payload

### 9. Update Checkout Success Page with Discount Display [frontend]

The success page at `frontend/src/app/checkout/success/page.tsx` shows a "Giảm giá" line between subtotal and shipping fee rows when `order.discountAmount > 0`, displaying the coupon code and negative discount amount in green. If `discountAmount` is 0 or absent, no discount line is rendered (backward compatible).

**Metadata:**

```yaml
depends_on: ["6. Add Coupon API Functions to Frontend"]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/checkout/success/page.tsx
```

**Verification:**

- Manual test: Create order with coupon → success page shows "Giảm giá: -{amount}đ" in green
- Manual test: Create order without coupon → success page shows no discount line (backward compatible)

### 10. Create Admin Coupons Panel [frontend]

A new `AdminCouponsPanel` component exists at `frontend/src/components/admin/AdminCouponsPanel.tsx` with: (1) table listing all coupons (code, name, type, value, usage count/limit, status badge, valid dates, action buttons), (2) create/edit modal with all coupon fields (follows AdminProductsPanel modal pattern with focus trap, escape-to-close, accessibility), (3) delete confirmation modal (only for `usageCount === 0`), (4) active/inactive toggle per row. A page wrapper exists at `frontend/src/app/admin/coupons/page.tsx`. The admin sidebar at `AdminSidebar.tsx` has a new "Khuyến mãi" nav item pointing to `/admin/coupons`. All styling matches existing admin panel design system.

**Metadata:**

```yaml
depends_on: ["6. Add Coupon API Functions to Frontend"]
parallel: true
conflicts_with: []
files:
  - frontend/src/components/admin/AdminCouponsPanel.tsx
  - frontend/src/app/admin/coupons/page.tsx
  - frontend/src/components/admin/AdminSidebar.tsx
```

**Verification:**

- Visual: `/admin/coupons` renders with consistent admin panel styling (pink gradients, rounded cards, same font/color system)
- Functional: Create → coupon appears in table; Edit → changes reflected; Delete → removed (only if unused)
- Sidebar: "Khuyến mãi" link visible and active-highlighted on `/admin/coupons`
- Accessibility: Modal has `role="dialog"`, `aria-modal="true"`, focus trap, escape-to-close

---

## Dependency Legend

| Field | Purpose | Example |
| --- | --- | --- |
| `depends_on` | Must complete before this task starts | `["Setup database", "Create schema"]` |
| `parallel` | Can run concurrently with other parallel tasks | `true` / `false` |
| `conflicts_with` | Cannot run in parallel (same files) | `["Update config"]` |
| `files` | Files this task modifies (for conflict detection) | `["src/db/schema.ts", "src/db/client.ts"]` |

---

## Task Dependency Graph

```
Task 1 (Coupon Model) ─────┬──→ Task 2 (Coupon Service) ──→ Task 3 (Controller+Routes) ──→ Task 6 (FE API) ─┬──→ Task 8 (Checkout Coupon UI)
                            │                                                                                 ├──→ Task 9 (Success Page)
                            │                                   Task 2 ─────────────────────┐                 └──→ Task 10 (Admin Panel)
                            └──→ Task 4 (Order Model) ─────────→ Task 5 (Order Integration) │
                                                                                             │
Task 7 (Redirect Fix) ──────────────────────────────────────────────────────────────── conflicts_with Task 8

Parallel tracks:
  • Track A: Task 1 → Task 2 → Task 3 → Task 6 → Tasks 8, 9, 10 (parallel)
  • Track B: Task 1 → Task 4 → Task 5 (joins at Task 5 needing Task 2)
  • Track C: Task 7 (independent, but conflicts_with Task 8 on same file)
```

---

## Notes

- All Vietnamese text in UI should use consistent tone with existing app (formal but friendly)
- Coupon codes should always be stored and compared in uppercase
- The `usedBy[]` array on the Coupon model is acceptable for expected usage volumes (< 10K uses per coupon). If a coupon goes viral, consider migrating to a separate `CouponUsage` collection.
- The `free_shipping` discount type sets `shippingFee` to 0 rather than subtracting from subtotal
- The checkout page currently has a hardcoded `SHIPPING_FEE = 30000` — this should be respected by the coupon system
- The Order model stores coupon data as a snapshot (denormalized) so order history remains accurate even if coupon is later modified/deleted
