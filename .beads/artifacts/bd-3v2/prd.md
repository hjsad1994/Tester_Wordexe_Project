# Checkout Page with COD and MoMo Payment

**Bead:** bd-3v2  
**Created:** 2026-02-12  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: [] # Shopping cart (bd-3bs) is already closed/shipped
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 6
```

---

## Problem Statement

### What problem are we solving?

Baby Bliss e-commerce site has a complete shopping cart but no checkout flow. The "Thanh toán" button on the cart page shows an alert placeholder, and the "Mua ngay" buttons on product detail pages are non-functional. Customers cannot complete purchases.

### Why now?

The shopping cart (bd-3bs) is shipped and merged. Checkout is the natural next step to complete the purchase funnel. Without it, the cart feature is incomplete.

### Who is affected?

- **Primary users:** Vietnamese parents shopping for baby products who want to complete a purchase via COD or MoMo
- **Secondary users:** Store owner who needs to see order details

---

## Scope

### In-Scope

- Checkout page at `/checkout` with customer info form, shipping address, payment method selection (COD / MoMo), and order summary
- Navigation from cart page ("Thanh toán" button → `/checkout` with full cart)
- "Mua ngay" (Buy Now) from product detail page and modal → `/checkout` with single product
- Form validation for Vietnamese address fields (name, phone 0xxx format, province/district/ward, address detail)
- MoMo payment UI simulation (QR code display, fake redirect flow)
- COD payment confirmation UI
- Order confirmation / success page at `/checkout/success`
- Order status states (pending, confirmed, processing, shipped, delivered)
- Responsive design matching Baby Bliss pastel theme
- Accessibility: WCAG AA, keyboard navigation, focus management, aria labels

### Out-of-Scope

- Real backend API integration or database persistence
- Real MoMo API integration (frontend simulation only)
- User authentication / account system
- Order history page
- Email notifications
- Coupon / discount codes
- Multiple shipping methods
- Saved addresses
- Payment via credit card, VNPay, or other gateways

---

## Proposed Solution

### Overview

A single-page checkout form at `/checkout` that receives items either from the full cart or from a "Buy Now" action on a single product. The page displays: (1) customer information form with Vietnamese address fields, (2) payment method selector with COD and MoMo options, (3) live order summary with item list, subtotal, shipping fee, and total. On submission, users see an order confirmation page at `/checkout/success` with order details and status.

### User Flow

**Flow A — From Cart:**

1. User clicks "Thanh toán" on `/cart`
2. Redirected to `/checkout` with all cart items
3. Fills customer info + selects payment method
4. Clicks "Đặt hàng" (Place Order)
5. If COD → immediate confirmation page
6. If MoMo → show simulated QR/payment screen → confirmation page
7. Cart is cleared on successful order

**Flow B — Buy Now:**

1. User clicks "Mua ngay" on product detail page or modal
2. Redirected to `/checkout` with only that single product (quantity from detail page)
3. Same flow as steps 3–7 above (cart is NOT cleared since items came from Buy Now)

---

## Requirements

### Functional Requirements

#### Customer Information Form

The checkout page displays a form collecting customer details for delivery.

**Scenarios:**

- **WHEN** user lands on `/checkout` **THEN** form displays fields: Full Name, Phone Number, Province/City, District, Ward, Address Detail, and optional Order Notes
- **WHEN** user submits with empty required fields **THEN** validation errors appear inline under each invalid field
- **WHEN** user enters phone not matching `0[0-9]{9}` pattern **THEN** phone field shows "Số điện thoại không hợp lệ"
- **WHEN** all fields are valid **THEN** "Đặt hàng" button is enabled

#### Payment Method Selection

Users choose between COD and MoMo payment.

**Scenarios:**

- **WHEN** user views payment section **THEN** COD is selected by default
- **WHEN** user selects MoMo **THEN** MoMo payment info/instructions are shown
- **WHEN** user selects COD **THEN** COD confirmation message is shown ("Thanh toán khi nhận hàng")
- **WHEN** user submits with MoMo selected **THEN** a simulated MoMo payment screen appears (QR code placeholder + "Đã thanh toán" button)

#### Order Summary

Live summary sidebar showing items being purchased.

**Scenarios:**

- **WHEN** checkout loads from cart **THEN** all cart items appear with name, quantity, price, and image
- **WHEN** checkout loads from "Buy Now" **THEN** only the single product appears
- **WHEN** items are displayed **THEN** subtotal, shipping fee (fixed 30,000₫), and grand total are calculated and shown
- **WHEN** cart is empty and user navigates to `/checkout` directly **THEN** redirect to `/cart` with message

#### Order Confirmation Page

Success page after order placement.

**Scenarios:**

- **WHEN** order is placed successfully **THEN** user sees `/checkout/success` with order ID, items summary, delivery info, payment method, and estimated delivery
- **WHEN** payment is COD **THEN** status shows "Chờ xác nhận" (Pending)
- **WHEN** payment is MoMo (simulated) **THEN** status shows "Đã thanh toán" (Paid)
- **WHEN** user clicks "Tiếp tục mua sắm" **THEN** navigate to `/products`

#### Buy Now Integration

"Mua ngay" buttons route directly to checkout with a single product.

**Scenarios:**

- **WHEN** user clicks "Mua ngay" on product detail page **THEN** navigate to `/checkout?buyNow=true` with product data passed via context/state
- **WHEN** user clicks "Mua ngay" on product detail modal **THEN** same behavior as above, respecting selected quantity
- **WHEN** "Buy Now" checkout completes **THEN** cart items remain untouched

#### Cart Checkout Integration

"Thanh toán" button on cart page navigates to checkout.

**Scenarios:**

- **WHEN** user clicks "Thanh toán" on cart page **THEN** navigate to `/checkout`
- **WHEN** order from cart completes successfully **THEN** cart is cleared via `clearCart()`

### Non-Functional Requirements

- **Performance:** Checkout page loads in < 2s on 3G; no unnecessary re-renders during form input
- **Accessibility:** All form fields have associated labels, error messages use `aria-live="polite"`, focus moves to first error on validation failure, keyboard-navigable payment method selection
- **Responsiveness:** Fully responsive — stacked layout on mobile, side-by-side on desktop (order summary sidebar)
- **Design:** Matches Baby Bliss pastel OKLCH design system (pink-500, warm-white, lavender accents)

---

## Success Criteria

- [ ] Checkout page renders at `/checkout` with customer form, payment selection, and order summary
  - Verify: `npm run build` succeeds with `/checkout` route in output
- [ ] Cart "Thanh toán" button navigates to `/checkout` (no more alert)
  - Verify: Manual check — click "Thanh toán" on `/cart` → lands on `/checkout`
- [ ] "Mua ngay" buttons on product detail page and modal navigate to `/checkout` with single product
  - Verify: Manual check — click "Mua ngay" → lands on `/checkout` with correct product
- [ ] Form validation works for all required fields with inline error messages
  - Verify: Manual check — submit empty form → see validation errors
- [ ] COD and MoMo payment methods selectable with appropriate UI for each
  - Verify: Manual check — toggle between COD/MoMo, see relevant content
- [ ] Order confirmation page renders at `/checkout/success` with order details
  - Verify: `npm run build` succeeds with `/checkout/success` route in output
- [ ] TypeScript compiles with zero errors
  - Verify: `npx tsc --noEmit`
- [ ] Code passes Prettier formatting
  - Verify: `npm run format:check`
- [ ] Responsive layout works on mobile and desktop viewports
  - Verify: Manual check at 375px and 1280px widths

---

## Technical Context

### Existing Patterns

- `src/contexts/CartContext.tsx` — React 19 Context with `useReducer`, uses `<CartContext value={}>` (no `.Provider`). Follow this pattern for any new context.
- `src/app/cart/page.tsx` — Full page with Tailwind styling, order summary sidebar, Baby Bliss pastel theme. Follow this layout and styling pattern.
- `src/components/icons/index.tsx` — Custom SVG icon components. Add new icons here (e.g., payment icons).
- `src/app/products/[id]/page.tsx` — Product detail with "Mua ngay" button at line 620.
- `src/components/ProductDetailModal.tsx` — Modal with "Mua ngay" button at line 382.

### Key Files

- `src/contexts/CartContext.tsx` — Cart state, must extend with "Buy Now" capability
- `src/app/cart/page.tsx` — Must update "Thanh toán" button to link to `/checkout`
- `src/app/products/[id]/page.tsx` — Must wire "Mua ngay" to checkout
- `src/components/ProductDetailModal.tsx` — Must wire "Mua ngay" to checkout
- `src/app/globals.css` — OKLCH color tokens for consistent styling

### Affected Files

Files this bead will create or modify:

```yaml
files:
  - src/app/checkout/page.tsx # NEW — Main checkout page
  - src/app/checkout/success/page.tsx # NEW — Order confirmation page
  - src/contexts/CartContext.tsx # MODIFY — Add buyNowItem state + setBuyNowItem action
  - src/app/cart/page.tsx # MODIFY — Wire "Thanh toán" to navigate to /checkout
  - src/app/products/[id]/page.tsx # MODIFY — Wire "Mua ngay" to checkout
  - src/components/ProductDetailModal.tsx # MODIFY — Wire "Mua ngay" to checkout
  - src/components/icons/index.tsx # MODIFY — Add payment-related icons (MoMo, COD, CheckCircle)
```

---

## Risks & Mitigations

| Risk                                                   | Likelihood | Impact | Mitigation                                                                     |
| ------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------ |
| Buy Now state lost on navigation                       | Medium     | High   | Use CartContext to hold `buyNowItem` in state, not URL params for complex data |
| Form re-renders on every keystroke                     | Medium     | Medium | Use uncontrolled inputs with `useRef` or debounced controlled inputs           |
| MoMo simulation confuses users into thinking it's real | Low        | Medium | Add clear "Đây là mô phỏng" (simulation) label                                 |
| Cart cleared before confirmation page loads            | Low        | High   | Only call `clearCart()` after successful order placement, not on navigation    |

---

## Open Questions

| Question                                                           | Owner | Due Date              | Status                   |
| ------------------------------------------------------------------ | ----- | --------------------- | ------------------------ |
| Should shipping fee vary by province or stay fixed at 30,000₫?     | User  | Before implementation | Resolved — fixed 30,000₫ |
| Should order data persist in localStorage for order history later? | User  | Before implementation | Open                     |

---

## Tasks

### 1. Extend CartContext with Buy Now support [context]

CartContext includes a `buyNowItem` state and `setBuyNowItem` / `clearBuyNowItem` actions so that "Mua ngay" can pass a single product to checkout without modifying the cart.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - src/contexts/CartContext.tsx
```

**Verification:**

- `npx tsc --noEmit` passes with zero errors
- CartContext exports `buyNowItem`, `setBuyNowItem`, `clearBuyNowItem`

### 2. Create checkout page with customer form and payment selection [page]

`/checkout` page renders a responsive checkout form with: customer info fields (name, phone, province, district, ward, address, notes), payment method radio buttons (COD default, MoMo), and inline validation for required fields and phone format.

**Metadata:**

```yaml
depends_on: ["Extend CartContext with Buy Now support"]
parallel: false
conflicts_with: []
files:
  - src/app/checkout/page.tsx
```

**Verification:**

- `npm run build` succeeds with `/checkout` in route output
- `npx tsc --noEmit` passes
- Manual: form renders with all fields, validation errors appear on empty submit

### 3. Create order summary sidebar for checkout [page]

Checkout page includes a live order summary showing items (from cart or Buy Now), quantities, prices, images, subtotal, shipping fee (30,000₫), and grand total. Redirects to `/cart` if no items.

**Metadata:**

```yaml
depends_on: ["Extend CartContext with Buy Now support"]
parallel: true
conflicts_with: ["Create checkout page with customer form and payment selection"]
files:
  - src/app/checkout/page.tsx
```

**Verification:**

- Order summary shows correct items and calculated totals
- Empty checkout redirects to `/cart`

### 4. Create order confirmation page [page]

`/checkout/success` page displays order ID (generated), ordered items, customer info, payment method, order status badge, and estimated delivery date. Includes "Tiếp tục mua sắm" button linking to `/products`.

**Metadata:**

```yaml
depends_on: ["Create checkout page with customer form and payment selection"]
parallel: true
conflicts_with: []
files:
  - src/app/checkout/success/page.tsx
```

**Verification:**

- `npm run build` succeeds with `/checkout/success` in route output
- `npx tsc --noEmit` passes
- Page shows order details with status badge

### 5. Add payment-related icons [ui]

Add `CodIcon`, `MomoIcon`, `CheckCircleIcon`, and `MapPinIcon` SVG icon components to the icons file for use in checkout UI.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - src/components/icons/index.tsx
```

**Verification:**

- `npx tsc --noEmit` passes
- Icons render without visual defects

### 6. Wire cart "Thanh toán" button to /checkout [integration]

Replace the `alert()` placeholder on the cart page's "Thanh toán" button with `router.push('/checkout')` navigation using Next.js `useRouter`.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - src/app/cart/page.tsx
```

**Verification:**

- `npx tsc --noEmit` passes
- Manual: clicking "Thanh toán" on `/cart` navigates to `/checkout`
- No more alert dialog

### 7. Wire "Mua ngay" buttons to checkout [integration]

Product detail page and ProductDetailModal "Mua ngay" buttons call `setBuyNowItem()` with the current product (respecting selected quantity) then navigate to `/checkout?buyNow=true`.

**Metadata:**

```yaml
depends_on: ["Extend CartContext with Buy Now support"]
parallel: true
conflicts_with: []
files:
  - src/app/products/[id]/page.tsx
  - src/components/ProductDetailModal.tsx
```

**Verification:**

- `npx tsc --noEmit` passes
- Manual: "Mua ngay" on product detail → `/checkout` with only that product shown
- Manual: "Mua ngay" on modal → same behavior
- Cart items remain untouched after Buy Now checkout

### 8. MoMo payment simulation UI [ui]

When MoMo is selected and user clicks "Đặt hàng", a simulated payment overlay/modal appears with a QR code placeholder, MoMo branding, amount to pay, and a "Đã thanh toán" (Mark as Paid) button. Includes clear "Đây là mô phỏng" disclaimer label.

**Metadata:**

```yaml
depends_on: ["Create checkout page with customer form and payment selection"]
parallel: true
conflicts_with: []
files:
  - src/app/checkout/page.tsx
```

**Verification:**

- Manual: select MoMo → submit → see QR overlay with disclaimer
- Clicking "Đã thanh toán" navigates to success page
- `npx tsc --noEmit` passes

---

## Dependency Legend

| Field            | Purpose                                           | Example                |
| ---------------- | ------------------------------------------------- | ---------------------- |
| `depends_on`     | Must complete before this task starts             | `["Setup database"]`   |
| `parallel`       | Can run concurrently with other parallel tasks    | `true` / `false`       |
| `conflicts_with` | Cannot run in parallel (same files)               | `["Update config"]`    |
| `files`          | Files this task modifies (for conflict detection) | `["src/db/schema.ts"]` |

---

## Notes

- **React 19**: Use `<Context value={}>` directly — no `.Provider` wrapper needed
- **Vietnamese UI**: All user-facing text in Vietnamese (Đặt hàng, Thanh toán, etc.)
- **No backend**: All order processing is simulated client-side. Order IDs generated with `Date.now()` or `crypto.randomUUID()`
- **Design system**: Follow Baby Bliss pastel OKLCH theme — pink-500 for primary actions, warm-white backgrounds, lavender/mint accents
- **Cart behavior**: Cart → checkout clears cart on success. Buy Now → checkout does NOT clear cart.
