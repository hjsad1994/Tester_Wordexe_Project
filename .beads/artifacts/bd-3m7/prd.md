# Add-to-Cart Success Notification

**Bead:** bd-3m7  
**Created:** 2026-02-22  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: ["bd-wqw"] # Both may touch ProductCard/ProductDetailModal
blocks: []
estimated_hours: 4
```

---

## Problem Statement

### What problem are we solving?

When users click "Thêm giỏ" or "Thêm vào giỏ hàng", the cart state updates silently — no toast, no animation, no confirmation. The only visual signal is the header cart badge count changing, which is easy to miss. Users don't know:

- Whether the add-to-cart action succeeded
- Whether a new item was added or an existing item's quantity increased
- What the current cart state is after the action

This creates uncertainty and friction, potentially leading to duplicate adds or users navigating to the cart page just to verify.

### Why now?

The cart system is functionally complete (context, reducer, localStorage persistence, buy-now flow) but lacks the final UX layer — user feedback. This is a baseline e-commerce expectation that affects conversion and user confidence.

### Who is affected?

- **Primary users:** Shoppers browsing and adding products to cart
- **Secondary users:** Mobile users (where the cart badge is even harder to notice)

---

## Scope

### In-Scope

- Create a reusable toast notification system (global, context-based)
- Show toast notification on all 4 add-to-cart call sites
- Differentiate messaging: "Đã thêm vào giỏ hàng" (new item) vs "Đã cập nhật giỏ hàng" (quantity updated)
- Include product name and thumbnail in the toast
- Add "Xem giỏ hàng" action button in toast
- Add cart badge bounce/pop animation when count changes
- Auto-dismiss after 4 seconds, pause on hover
- Accessible: `role="status"`, `aria-live="polite"`, keyboard dismissible

### Out-of-Scope

- Mini-cart drawer / slide-in panel (future enhancement)
- Cross-sell / upsell suggestions in toast
- Replacing existing `alert()` calls in ProductReviews.tsx (separate task)
- Refactoring the profile page's local Toast to use the new system (separate task)
- Toast notifications for other actions (wishlist, checkout, etc.)

---

## Proposed Solution

### Overview

Install **Sonner** as the toast library (5KB gzipped, correct a11y defaults, action button support). Create a `<Toaster>` provider at the root layout. Modify the `addToCart` function in `CartContext.tsx` to return whether the item was new or updated. At each add-to-cart call site, fire a Sonner toast with the product thumbnail, name, quantity info, and a "Xem giỏ hàng" link. Add a CSS `cart-badge-pop` animation to the Header badge that triggers on count change.

### User Flow

1. User clicks "Thêm giỏ" / "Thêm vào giỏ hàng" on any product
2. Cart state updates immediately (existing behavior)
3. Cart badge in header animates with a pop/bounce effect
4. Toast appears (top-right, 4s auto-dismiss):
   - Success icon + product thumbnail
   - "Đã thêm vào giỏ hàng" or "Đã cập nhật giỏ hàng (×3)"
   - Product name
   - "Xem giỏ hàng" action button
5. User can dismiss (swipe/close) or click "Xem giỏ hàng" to navigate to `/cart`
6. Toast auto-dismisses after 4 seconds (pauses on hover)

---

## Requirements

### Functional Requirements

#### FR1: Toast on Add-to-Cart

Toast notification appears whenever an item is added to cart from any call site.

**Scenarios:**

- **WHEN** user adds a new item to cart **THEN** toast shows "Đã thêm vào giỏ hàng" with product name, thumbnail, and "Xem giỏ hàng" action
- **WHEN** user adds an item already in cart **THEN** toast shows "Đã cập nhật giỏ hàng" with updated quantity (e.g., "×3")
- **WHEN** user adds multiple quantity from product detail page **THEN** toast shows total quantity added
- **WHEN** user rapidly clicks add-to-cart multiple times **THEN** toasts stack or the existing toast updates (no flooding)

#### FR2: Cart Badge Animation

Header cart badge animates when cart count changes.

**Scenarios:**

- **WHEN** cart count changes from 0 to 1 **THEN** badge appears with pop animation
- **WHEN** cart count increases **THEN** badge does a brief scale bounce (0.3s)
- **WHEN** user has `prefers-reduced-motion` enabled **THEN** animation is disabled

#### FR3: Toast Interaction

**Scenarios:**

- **WHEN** user hovers over toast **THEN** auto-dismiss timer pauses
- **WHEN** user clicks "Xem giỏ hàng" **THEN** navigates to `/cart` page
- **WHEN** user swipes or clicks close **THEN** toast dismisses immediately

### Non-Functional Requirements

- **Performance:** Toast rendering must not block the main thread or delay cart state update
- **Accessibility:** Toast uses `role="status"` with `aria-live="polite"`, close button is keyboard-accessible, meets WCAG 2.1 AA color contrast (4.5:1)
- **Compatibility:** Works on all viewports (mobile, tablet, desktop)
- **Bundle size:** Sonner adds ~5KB gzipped — acceptable for the functionality

---

## Success Criteria

- [ ] Toast appears when adding item from ProductCard (product listing grid)
  - Verify: Click "Thêm giỏ" on any product card → toast visible with product name
- [ ] Toast appears when adding item from Product Detail Page
  - Verify: Set quantity to 2, click "Thêm vào giỏ hàng" → toast shows correct quantity
- [ ] Toast appears when adding item from ProductDetailModal
  - Verify: Open product modal, click "Thêm vào giỏ hàng" → toast visible
- [ ] Toast appears when adding item from Wishlist page
  - Verify: Navigate to `/wishlist`, click add-to-cart icon → toast visible
- [ ] Toast differentiates new item vs quantity update
  - Verify: Add item once → "Đã thêm vào giỏ hàng". Add same item again → "Đã cập nhật giỏ hàng" with new quantity
- [ ] "Xem giỏ hàng" button in toast navigates to `/cart`
  - Verify: Click "Xem giỏ hàng" in toast → URL changes to `/cart`
- [ ] Cart badge animates on count change
  - Verify: Add item → badge does a brief pop/bounce animation
- [ ] Toast auto-dismisses after ~4 seconds
  - Verify: Add item → toast disappears after ~4s without interaction
- [ ] Toast is accessible
  - Verify: Inspect toast element → has `role="status"` and `aria-live="polite"`

---

## Technical Context

### Existing Patterns

- Cart state: React Context + `useReducer` in `frontend/src/contexts/CartContext.tsx` — `addToCart` dispatches `ADD_ITEM` action, reducer checks if item exists (increment qty) or adds new
- Local Toast pattern: `frontend/src/app/profile/page.tsx:94-112` — inline Toast component with `fixed top-6 right-6 z-50 animate-fade-in-up`, 3s auto-dismiss, success-only
- CSS animations: `frontend/src/app/globals.css:159-168` — `fade-in-up` keyframe already exists
- Design tokens: `frontend/src/app/globals.css:33-35` — `--success`, `--warning`, `--destructive` colors defined but underused
- Header cart badge: `frontend/src/components/Header.tsx:160-175` — uses `cartCount` from `useCart()`, has `aria-live="polite"`
- Provider hierarchy: `AuthProvider > CartProvider > WishlistProvider` in `frontend/src/app/layout.tsx:37-41`

### Key Files

- `frontend/src/contexts/CartContext.tsx` — Cart state management, `addToCart` function (line 166)
- `frontend/src/components/Header.tsx` — Cart badge (lines 160-175)
- `frontend/src/components/ProductCard.tsx` — Add-to-cart button (lines 184-193)
- `frontend/src/components/ProductDetailModal.tsx` — Add-to-cart handler (lines 74-84)
- `frontend/src/app/products/[id]/page.tsx` — Add-to-cart with quantity (lines 756-767)
- `frontend/src/app/wishlist/page.tsx` — Add-to-cart from wishlist (lines 153-160)
- `frontend/src/app/layout.tsx` — Root layout with providers (lines 37-41)
- `frontend/src/app/globals.css` — Animations and design tokens

### Affected Files

Files this bead will modify:

```yaml
files:
  - frontend/src/contexts/CartContext.tsx # Modify addToCart to return new/updated status
  - frontend/src/components/Header.tsx # Add cart-badge-pop animation
  - frontend/src/components/ProductCard.tsx # Add toast call after addToCart
  - frontend/src/components/ProductDetailModal.tsx # Add toast call after addToCart
  - frontend/src/app/products/[id]/page.tsx # Add toast call after addToCart
  - frontend/src/app/wishlist/page.tsx # Add toast call after addToCart
  - frontend/src/app/layout.tsx # Add Sonner <Toaster> provider
  - frontend/src/app/globals.css # Add cart-badge-pop keyframe
  - frontend/package.json # Add sonner dependency
```

---

## Risks & Mitigations

| Risk                                | Likelihood | Impact | Mitigation                                                                    |
| ----------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------- |
| Toast too subtle on mobile          | Medium     | Medium | Combine with cart badge animation for redundant feedback                      |
| Rapid add-to-cart floods toasts     | Low        | Low    | Use Sonner's `id` param to update existing toast instead of creating new      |
| Sonner dependency adds bundle size  | Low        | Low    | ~5KB gzipped is negligible vs feature value                                   |
| ProductDetailModal may be dead code | Medium     | Low    | Verify if any page imports it; if unused, still add toast for future-proofing |

---

## Open Questions

| Question                                         | Owner | Due Date     | Status |
| ------------------------------------------------ | ----- | ------------ | ------ |
| Should toast include product thumbnail image?    | User  | Before start | Open   |
| Should toast show price or just name + quantity? | User  | Before start | Open   |

---

## Tasks

### Install Sonner and add Toaster provider [setup]

Sonner toast library is installed and the `<Toaster>` component is rendered at the root layout level, positioned top-right with Vietnamese-locale-friendly styling.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/package.json
  - frontend/src/app/layout.tsx
```

**Verification:**

- `cd frontend && cat package.json | grep sonner` shows sonner in dependencies
- `grep -n "Toaster" src/app/layout.tsx` shows Toaster imported and rendered
- `cd frontend && npm run build` completes without errors

### Modify addToCart to return item status [core]

The `addToCart` function in CartContext returns information about whether the item was newly added or its quantity was updated, enabling call sites to show differentiated toast messages.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/contexts/CartContext.tsx
```

**Verification:**

- `grep -A5 "addToCart" frontend/src/contexts/CartContext.tsx` shows return type includes isNew/isUpdate info
- `cd frontend && npx tsc --noEmit` passes without type errors

### Add cart badge pop animation [ui]

The Header cart badge plays a brief scale-bounce animation whenever the cart count changes, providing immediate visual feedback that the cart was updated.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/app/globals.css
  - frontend/src/components/Header.tsx
```

**Verification:**

- `grep "cart-badge-pop" frontend/src/app/globals.css` shows the keyframe defined
- `grep "cart-badge" frontend/src/components/Header.tsx` shows animation class applied
- Reduced motion: `grep "prefers-reduced-motion" frontend/src/app/globals.css` covers the animation

### Add toast notification to all add-to-cart call sites [feature]

All 4 add-to-cart call sites (ProductCard, ProductDetailModal, Product Detail Page, Wishlist Page) fire a Sonner toast with product name, differentiated messaging (new vs updated), and a "Xem giỏ hàng" action button linking to `/cart`.

**Metadata:**

```yaml
depends_on: ["Install Sonner and add Toaster provider", "Modify addToCart to return item status"]
parallel: false
conflicts_with: []
files:
  - frontend/src/components/ProductCard.tsx
  - frontend/src/components/ProductDetailModal.tsx
  - frontend/src/app/products/[id]/page.tsx
  - frontend/src/app/wishlist/page.tsx
```

**Verification:**

- `grep -rn "toast(" frontend/src/components/ProductCard.tsx frontend/src/components/ProductDetailModal.tsx frontend/src/app/products/\[id\]/page.tsx frontend/src/app/wishlist/page.tsx` shows toast calls in all 4 files
- `grep "Xem giỏ hàng" frontend/src/components/ProductCard.tsx` shows action button text
- `cd frontend && npx tsc --noEmit` passes without type errors
- `cd frontend && npm run build` completes successfully

### Final verification and accessibility check [qa]

All toast notifications render correctly, are accessible (`role="status"`, `aria-live="polite"`), auto-dismiss after ~4s, pause on hover, and the cart badge animates on every add-to-cart action.

**Metadata:**

```yaml
depends_on: ["Add toast notification to all add-to-cart call sites", "Add cart badge pop animation"]
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `cd frontend && npm run build` succeeds
- `cd frontend && npx tsc --noEmit` passes
- Manual: Add item from product listing → toast appears with "Đã thêm vào giỏ hàng"
- Manual: Add same item again → toast shows "Đã cập nhật giỏ hàng" with quantity
- Manual: Click "Xem giỏ hàng" → navigates to `/cart`
- Manual: Inspect toast element → `role="status"` present

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

- **Library choice:** Sonner chosen over react-hot-toast (better action button DX, correct a11y defaults) and react-toastify (6x larger bundle)
- **Vietnamese UI text:** All toast messages in Vietnamese to match existing app language
- **Existing Toast in profile page:** Not refactored in this bead — separate task to consolidate later
- **ProductDetailModal:** May be dead code (no import found in routing) but toast added for completeness
