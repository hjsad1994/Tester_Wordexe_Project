# Shopping Cart: Header Badge Count + Cart Page

**Bead:** bd-3bs
**Created:** 2026-02-12
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

Trang e-commerce Baby Bliss hiện tại không có chức năng giỏ hàng hoạt động. Nút "Thêm giỏ" trên ProductCard, ProductDetailModal, và trang chi tiết sản phẩm đều không làm gì (chỉ có `console.log` hoặc comment placeholder). Header hiển thị badge giỏ hàng hardcoded số `2`, không phản ánh trạng thái thực tế. Không có trang `/cart` để user xem và quản lý giỏ hàng.

### Why now?

Giỏ hàng là chức năng core của bất kỳ e-commerce nào. Không có giỏ hàng = user không thể mua hàng. Các nút "Thêm giỏ" đã có sẵn trên UI nhưng không hoạt động, tạo trải nghiệm xấu.

### Who is affected?

- **Primary users:** Khách hàng muốn mua sản phẩm trên Baby Bliss
- **Secondary users:** Nhà phát triển cần nền tảng để build checkout flow sau này

---

## Scope

### In-Scope

- Global cart state management (React Context)
- Header cart badge cập nhật real-time khi thêm sản phẩm
- Cart badge cập nhật từ TẤT CẢ nguồn: ProductCard, ProductDetailModal, ProductDetailPage
- Trang `/cart` với style phù hợp homepage (pastel pink, warm-white, rounded corners)
- Danh sách sản phẩm trong giỏ (ảnh, tên, giá, số lượng)
- Tăng/giảm số lượng sản phẩm
- Xóa sản phẩm khỏi giỏ
- Hiển thị tổng tiền
- Nút "Tiếp tục mua sắm" (quay về `/products`)
- Nút "Thanh toán" (placeholder, chưa link checkout)
- Giỏ hàng rỗng state (empty cart UI)

### Out-of-Scope

- Chọn size/màu sắc khi thêm giỏ
- Lưu giỏ hàng vào localStorage (chỉ session state)
- Trang checkout / thanh toán
- Tích hợp backend / API
- Wishlist functionality
- Mã giảm giá / coupon

---

## Proposed Solution

### Overview

Tạo CartContext (React Context + useReducer) quản lý state giỏ hàng toàn cục. Wrap app trong CartProvider tại `layout.tsx`. Header đọc cart count từ context và hiển thị badge động. Các component ProductCard, ProductDetailModal, ProductDetailPage gọi `addToCart()` từ context. Trang `/cart` hiển thị danh sách sản phẩm với controls tăng/giảm/xóa, tổng tiền, và CTA buttons, theo design system Baby Bliss (pastel pink, rounded, warm-white background).

### User Flow

1. User browse sản phẩm tại `/products`
2. Click "Thêm giỏ" trên ProductCard → badge giỏ hàng trên header tăng số
3. (Hoặc) Mở ProductDetailModal → click "Thêm vào giỏ" → badge tăng
4. (Hoặc) Vào trang `/products/[id]` → click "Thêm vào giỏ hàng" → badge tăng
5. Click icon giỏ hàng trên header → navigate đến `/cart`
6. Tại `/cart`: xem danh sách, điều chỉnh số lượng, xóa sản phẩm
7. Xem tổng tiền cập nhật real-time
8. Click "Tiếp tục mua sắm" → quay về `/products`
9. Click "Thanh toán" → placeholder action (alert hoặc toast)

---

## Requirements

### Functional Requirements

#### Cart State Management

Cart state must be globally accessible and reactive across all components.

**Scenarios:**

- **WHEN** user clicks "Thêm giỏ" on any product **THEN** product is added to cart with quantity 1
- **WHEN** same product is added again **THEN** quantity increments by 1 (no duplicates)
- **WHEN** cart state changes **THEN** header badge updates immediately without page reload

#### Header Badge

Header cart icon displays accurate count of total items in cart.

**Scenarios:**

- **WHEN** cart is empty **THEN** no badge is shown (or badge shows 0)
- **WHEN** cart has items **THEN** badge shows total quantity (sum of all items)
- **WHEN** item is removed from cart **THEN** badge decrements accordingly

#### Cart Page

Full cart management page at `/cart` with Baby Bliss styling.

**Scenarios:**

- **WHEN** cart is empty **THEN** show empty state with illustration and "Tiếp tục mua sắm" link
- **WHEN** cart has items **THEN** show product list with image, name, price, quantity controls
- **WHEN** user increases quantity **THEN** item quantity and total update immediately
- **WHEN** user decreases quantity to 0 **THEN** item is removed from cart
- **WHEN** user clicks delete button **THEN** item is removed and total recalculated

### Non-Functional Requirements

- **Performance:** Cart state updates must feel instant (<100ms perceived)
- **Accessibility:** All interactive elements must have `aria-label`, `focus-visible` rings, min 44px touch targets (following existing patterns from products page)
- **Compatibility:** Works with Next.js 16 App Router + React 19 + Turbopack

---

## Success Criteria

- [ ] Clicking "Thêm giỏ" on ProductCard adds item and header badge increments
  - Verify: `Navigate to /products, click "Thêm giỏ" on any card, observe header badge count increase`
- [ ] Clicking "Thêm vào giỏ" in ProductDetailModal adds item and header badge increments
  - Verify: `Open product modal, click add to cart, observe header badge`
- [ ] Clicking "Thêm vào giỏ hàng" on product detail page adds item and header badge increments
  - Verify: `Navigate to /products/1, click add to cart button, observe header badge`
- [ ] Adding same product multiple times increments quantity (no duplicate entries)
  - Verify: `Add same product 3 times, check cart shows quantity 3 not 3 separate entries`
- [ ] Cart page at `/cart` renders with Baby Bliss styling
  - Verify: `Navigate to /cart, verify pastel pink theme, rounded corners, warm-white background`
- [ ] Quantity controls (+/-) work correctly on cart page
  - Verify: `On /cart, click + and - buttons, observe quantity and total changes`
- [ ] Remove button deletes item from cart and updates total
  - Verify: `Click remove on an item, verify it disappears and total recalculates`
- [ ] Empty cart shows appropriate empty state
  - Verify: `Remove all items, verify empty state UI with "Tiếp tục mua sắm" link`
- [ ] Header cart icon navigates to `/cart`
  - Verify: `Click cart icon in header, verify navigation to /cart`
- [ ] TypeScript compiles without errors
  - Verify: `cd frontend && npx tsc --noEmit`
- [ ] Build succeeds
  - Verify: `cd frontend && npm run build`

---

## Technical Context

### Existing Patterns

- `frontend/src/components/Header.tsx:125` - Cart icon with hardcoded badge `2`, needs dynamic count from context
- `frontend/src/components/ProductCard.tsx:155-159` - "Thêm giỏ" button with `// Add to cart logic` placeholder
- `frontend/src/components/ProductDetailModal.tsx:77-81` - `handleAddToCart` does `console.log` only
- `frontend/src/app/products/[id]/page.tsx:600` - "Thêm vào giỏ hàng" button, no onClick handler
- `frontend/src/components/icons/index.tsx` - Centralized icon components (CartIcon already exists)
- `frontend/src/app/globals.css` - OKLCH color system with `--pink-*`, `--warm-white`, `--soft-cream` vars

### Key Files

- `frontend/src/app/layout.tsx` - Root layout, needs CartProvider wrapper
- `frontend/src/components/Header.tsx` - Cart badge display
- `frontend/src/components/ProductCard.tsx` - Add to cart trigger
- `frontend/src/components/ProductDetailModal.tsx` - Add to cart trigger
- `frontend/src/app/products/[id]/page.tsx` - Add to cart trigger

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/contexts/CartContext.tsx # NEW - Cart state management
  - frontend/src/app/layout.tsx # Add CartProvider wrapper
  - frontend/src/components/Header.tsx # Dynamic badge from cart context
  - frontend/src/components/ProductCard.tsx # Wire addToCart to context
  - frontend/src/components/ProductDetailModal.tsx # Wire addToCart to context
  - frontend/src/app/products/[id]/page.tsx # Wire addToCart to context
  - frontend/src/app/cart/page.tsx # NEW - Cart page
```

---

## Risks & Mitigations

| Risk                                                         | Likelihood | Impact | Mitigation                                                                         |
| ------------------------------------------------------------ | ---------- | ------ | ---------------------------------------------------------------------------------- |
| CartProvider causes hydration mismatch (SSR vs client)       | Medium     | Medium | Use `"use client"` directive on CartContext, ensure no SSR of cart-dependent state |
| Re-renders cascade on every cart update                      | Low        | Medium | Use `useReducer` instead of `useState` for batched updates; memoize context value  |
| Cart count animation conflicts with `prefers-reduced-motion` | Low        | Low    | Respect existing `prefers-reduced-motion` CSS already in globals.css               |
| layout.tsx modification breaks existing page structure       | Low        | High   | Only add provider wrapper, no structural changes to existing layout                |

---

## Open Questions

| Question                                         | Owner | Due Date              | Status |
| ------------------------------------------------ | ----- | --------------------- | ------ |
| Nên hiển thị toast/notification khi add to cart? | User  | Before implementation | Open   |

---

## Tasks

### Create CartContext with useReducer [state]

A `CartContext` with `useReducer` exists at `frontend/src/contexts/CartContext.tsx`, providing `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `cartItems`, `cartCount`, and `cartTotal` to all descendants.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/contexts/CartContext.tsx
```

**Verification:**

- `cd frontend && npx tsc --noEmit` passes with no errors
- CartContext exports `CartProvider`, `useCart` hook, and `CartItem` type

### Wrap app in CartProvider [integration]

`frontend/src/app/layout.tsx` wraps children in `<CartProvider>` so cart state is available globally.

**Metadata:**

```yaml
depends_on: ["Create CartContext with useReducer"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/layout.tsx
```

**Verification:**

- `cd frontend && npx tsc --noEmit` passes
- `cd frontend && npm run build` succeeds

### Wire header cart badge to context [ui]

`Header.tsx` reads `cartCount` from `useCart()` and displays it as the badge number, replacing the hardcoded `2`. Cart icon click navigates to `/cart`.

**Metadata:**

```yaml
depends_on: ["Wrap app in CartProvider"]
parallel: true
conflicts_with: []
files:
  - frontend/src/components/Header.tsx
```

**Verification:**

- Header badge shows `0` when cart is empty
- Header badge updates when items are added via any source
- Cart icon click navigates to `/cart`

### Wire ProductCard addToCart [integration]

ProductCard's "Thêm giỏ" button calls `addToCart()` from `useCart()` with the product's id, name, price, and image.

**Metadata:**

```yaml
depends_on: ["Wrap app in CartProvider"]
parallel: true
conflicts_with: []
files:
  - frontend/src/components/ProductCard.tsx
```

**Verification:**

- Click "Thêm giỏ" on any ProductCard → header badge increments
- `cd frontend && npx tsc --noEmit` passes

### Wire ProductDetailModal addToCart [integration]

ProductDetailModal's `handleAddToCart` calls `addToCart()` from `useCart()` instead of `console.log`.

**Metadata:**

```yaml
depends_on: ["Wrap app in CartProvider"]
parallel: true
conflicts_with: []
files:
  - frontend/src/components/ProductDetailModal.tsx
```

**Verification:**

- Open product modal, click add to cart → header badge increments
- `cd frontend && npx tsc --noEmit` passes

### Wire ProductDetailPage addToCart [integration]

Product detail page's "Thêm vào giỏ hàng" button calls `addToCart()` from `useCart()`.

**Metadata:**

```yaml
depends_on: ["Wrap app in CartProvider"]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/products/[id]/page.tsx
```

**Verification:**

- Navigate to `/products/1`, click add to cart → header badge increments
- `cd frontend && npx tsc --noEmit` passes

### Build cart page [page]

Cart page at `frontend/src/app/cart/page.tsx` displays cart items with image, name, price, quantity controls (+/-), remove button, subtotal per item, grand total, "Tiếp tục mua sắm" link, and "Thanh toán" CTA, all styled with Baby Bliss design system (pastel pink, warm-white, rounded corners, OKLCH vars).

**Metadata:**

```yaml
depends_on: ["Create CartContext with useReducer"]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/cart/page.tsx
```

**Verification:**

- Navigate to `/cart` → page renders without errors
- Empty state shows when cart is empty
- Items display with correct info and controls
- Quantity +/- updates total in real-time
- Remove button removes item
- "Tiếp tục mua sắm" navigates to `/products`
- `cd frontend && npm run build` succeeds

---

## Dependency Legend

| Field            | Purpose                                           | Example                                  |
| ---------------- | ------------------------------------------------- | ---------------------------------------- |
| `depends_on`     | Must complete before this task starts             | `["Create CartContext with useReducer"]` |
| `parallel`       | Can run concurrently with other parallel tasks    | `true` / `false`                         |
| `conflicts_with` | Cannot run in parallel (same files)               | `["Update config"]`                      |
| `files`          | Files this task modifies (for conflict detection) | `["src/contexts/CartContext.tsx"]`       |

---

## Notes

- Cart state chỉ tồn tại trong session (không lưu localStorage) theo yêu cầu user
- Design cart page phải consistent với homepage: sử dụng CSS vars `--pink-*`, `--warm-white`, `--soft-cream`, rounded corners (`rounded-2xl`), shadow patterns đã có
- Sản phẩm hiện tại dùng mock data (hardcoded) — cart sẽ lưu product info tại thời điểm add
- Wishlist badge trên header cũng hardcoded (`3`) nhưng out-of-scope cho bead này
