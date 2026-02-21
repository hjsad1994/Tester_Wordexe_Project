# Beads PRD: Checkout Auto-fill & Address Simplification

**Bead:** bd-1ez  
**Created:** 2026-02-22  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 3
```

---

## Problem Statement

### What problem are we solving?

Logged-in users who have filled out their profile (name, phone, address) are forced to re-enter all their information manually on the checkout page. Additionally, the checkout page collects address as 4 separate fields (province, district, ward, detailed address), while the user profile stores address as a single flat string — creating an inconsistent experience.

Users expect their profile data to pre-populate the checkout form so they can check out faster. The address model should be unified: a single address field on both profile and checkout.

### Why now?

This is a basic UX expectation for any e-commerce site. Every checkout where the user has to re-type their info is friction that leads to cart abandonment.

### Who is affected?

- **Primary users:** Registered/logged-in customers who have profile data saved
- **Secondary users:** Admin users viewing orders (address format changes in order records)

---

## Scope

### In-Scope

- Simplify checkout address from 4 fields (province/district/ward/address) to 1 field (address) — matching profile
- Pre-fill checkout form (fullName, phone, address) from user profile when logged in
- Update Order model's `customerInfo` schema to use single `address` field
- Update backend order validation for simplified address
- Update admin orders panel display if needed
- Ensure orders continue to be recorded and visible in admin panel

### Out-of-Scope

- Structured address with dropdowns (province/district/ward selectors from API)
- Address book (multiple saved addresses per user)
- Guest checkout changes (guest still enters all fields manually)
- Profile page changes (profile already has single address field)
- Payment method changes
- Real MoMo integration

---

## Proposed Solution

### Overview

When a logged-in user navigates to the checkout page, the form automatically pre-fills `fullName` from `user.name`, `phone` from `user.phone`, and `address` from `user.address`. The 4 separate address fields (province, district, ward, address) are consolidated into a single `address` text input, matching the profile's data model. The Order model's `customerInfo` is updated to store a single `address` string instead of the 4-field breakdown. Orders continue to appear in the admin panel with the simplified address.

### User Flow

1. User logs in and fills out their profile (name, phone, address)
2. User adds items to cart and navigates to checkout
3. Checkout form is pre-populated with name, phone, and address from profile
4. User can modify any pre-filled field if needed
5. User selects payment method and submits order
6. Order is created with the correct customer info and appears in admin panel

---

## Requirements

### Functional Requirements

#### FR1: Pre-fill checkout from profile

When a logged-in user opens the checkout page, the form fields are pre-populated with their profile data.

**Scenarios:**

- **WHEN** a logged-in user with name="Nguyen Van A", phone="0912345678", address="123 Le Loi, Q1, HCM" opens `/checkout` **THEN** fullName, phone, address fields are pre-filled with those values
- **WHEN** a logged-in user with no address saved opens `/checkout` **THEN** fullName and phone are pre-filled, address is empty
- **WHEN** a guest (not logged in) opens `/checkout` **THEN** all fields are empty (no pre-fill)
- **WHEN** a user modifies a pre-filled field **THEN** the modified value is used for the order, not the profile value

#### FR2: Simplified address field

The checkout form uses a single address input instead of 4 separate fields.

**Scenarios:**

- **WHEN** the checkout form renders **THEN** there is one "Địa chỉ" text input instead of province/district/ward/address
- **WHEN** the user submits an order **THEN** the single address string is stored in `customerInfo.address`

#### FR3: Order recording in admin

Orders with the simplified address are correctly displayed in the admin panel.

**Scenarios:**

- **WHEN** an order is created with the simplified address **THEN** the admin orders panel shows the full address string
- **WHEN** admin views order listing **THEN** customer name, phone, and address are visible

### Non-Functional Requirements

- **Performance:** Pre-fill should happen instantly from AuthContext (no additional API call)
- **Compatibility:** Existing orders with old 4-field address structure should still display correctly in admin

---

## Success Criteria

- [ ] Logged-in user with profile data sees checkout form pre-filled with name, phone, address
  - Verify: `Login as user with profile data → navigate to /checkout → confirm fields are pre-filled`
- [ ] Checkout form has single address field instead of province/district/ward/address
  - Verify: `Navigate to /checkout → confirm only one address input exists`
- [ ] Orders are created successfully with simplified address
  - Verify: `Submit checkout form → check order in database has customerInfo.address as single string`
- [ ] Admin panel shows orders with correct address
  - Verify: `Login as admin → /admin/orders → confirm new orders display address correctly`
- [ ] Guest checkout still works (no pre-fill, all fields editable)
  - Verify: `Logout → navigate to /checkout → confirm all fields are empty and form works`

---

## Technical Context

### Existing Patterns

- `frontend/src/contexts/AuthContext.tsx` — Provides `useAuth()` hook with `user.name`, `user.phone`, `user.address`
- `frontend/src/app/profile/page.tsx` — Profile form uses single address text input
- `frontend/src/app/checkout/page.tsx` — Checkout form uses `useState` for form state, no pre-fill logic
- `backend/src/models/User.js` — User model has `address: String` (single field)
- `backend/src/models/Order.js` — Order model has `customerInfo` with 4 address fields
- `backend/src/services/orderService.js` — Order creation validates customerInfo fields

### Key Files

- `frontend/src/app/checkout/page.tsx` — Main checkout form (needs pre-fill + address simplification)
- `frontend/src/lib/api.ts` — TypeScript types for OrderCustomerInfo and CreateOrderPayload
- `backend/src/models/Order.js` — Order schema customerInfo definition
- `backend/src/services/orderService.js` — Order creation and customerInfo validation
- `frontend/src/components/admin/AdminOrdersPanel.tsx` — Admin order listing display

### Affected Files

Files this bead will modify:

```yaml
files:
  - frontend/src/app/checkout/page.tsx # Simplify address fields + add pre-fill from AuthContext
  - frontend/src/lib/api.ts # Update OrderCustomerInfo and CreateOrderPayload types
  - backend/src/models/Order.js # Simplify customerInfo schema (remove province/district/ward)
  - backend/src/services/orderService.js # Update customerInfo validation
  - frontend/src/components/admin/AdminOrdersPanel.tsx # Update address display if needed
```

---

## Risks & Mitigations

| Risk                                                            | Likelihood | Impact | Mitigation                                                                                     |
| --------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------- |
| Existing orders with old 4-field address break in admin display | High       | Medium | Admin panel should handle both old (4-field) and new (single field) address formats gracefully |
| Checkout validation regression                                  | Medium     | High   | Verify form validation still enforces required fields after changes                            |
| Order creation API breaks                                       | Medium     | High   | Test order creation end-to-end after backend schema changes                                    |

---

## Open Questions

| Question                                                                               | Owner | Due Date              | Status |
| -------------------------------------------------------------------------------------- | ----- | --------------------- | ------ |
| Should old orders with province/district/ward display as concatenated string in admin? | Dev   | Before implementation | Open   |

---

## Tasks

### Simplify Order customerInfo schema [backend]

The Order model's `customerInfo` sub-document uses a single `address` field instead of province/district/ward/address, and the order service validates accordingly.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Update frontend API types"]
files:
  - backend/src/models/Order.js
  - backend/src/services/orderService.js
```

**Verification:**

- Backend starts without errors after schema change
- `POST /api/orders` with `{ customerInfo: { fullName, phone, address, notes? } }` creates order successfully
- Old orders with province/district/ward fields still load without errors

### Update frontend API types [frontend]

The `OrderCustomerInfo` and `CreateOrderPayload` TypeScript interfaces reflect the simplified address structure (single `address` field, no province/district/ward).

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Simplify Order customerInfo schema"]
files:
  - frontend/src/lib/api.ts
```

**Verification:**

- `npx tsc --noEmit` passes with no type errors
- `OrderCustomerInfo` has fields: fullName, phone, address, notes?

### Simplify checkout form + pre-fill from profile [frontend]

The checkout page has a single address input (replacing province/district/ward/address), and pre-fills fullName, phone, and address from AuthContext when user is logged in.

**Metadata:**

```yaml
depends_on: ["Update frontend API types"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/checkout/page.tsx
```

**Verification:**

- Checkout form renders with single address field
- Logged-in user with profile data sees pre-filled form
- Guest sees empty form
- Form validation rejects empty required fields
- Order submission works with COD and MoMo

### Update admin orders panel for simplified address [frontend]

The admin orders panel displays the single address field for new orders and gracefully handles old orders that have province/district/ward fields (concatenating them for display).

**Metadata:**

```yaml
depends_on: ["Simplify Order customerInfo schema"]
parallel: true
conflicts_with: []
files:
  - frontend/src/components/admin/AdminOrdersPanel.tsx
```

**Verification:**

- Admin panel loads orders without errors
- New orders show single address string
- Old orders (if any) with province/district/ward still display correctly (concatenated)

---

## Dependency Legend

| Field            | Purpose                                           | Example                               |
| ---------------- | ------------------------------------------------- | ------------------------------------- |
| `depends_on`     | Must complete before this task starts             | `["Setup database", "Create schema"]` |
| `parallel`       | Can run concurrently with other parallel tasks    | `true` / `false`                      |
| `conflicts_with` | Cannot run in parallel (same files)               | `["Update config"]`                   |
| `files`          | Files this task modifies (for conflict detection) | `["src/db/schema.ts"]`                |

---

## Notes

- The `AuthContext` already provides `user.name`, `user.phone`, `user.address` — no additional API call needed for pre-fill
- The profile page already uses a single address text input — checkout will now match this pattern
- Guest checkout (not logged in) continues to work with all fields empty
- The `user` field on Order model is already optional (supports both guest and logged-in orders)
- Orders are already being recorded and visible in admin panel — this feature just ensures the address format is consistent
