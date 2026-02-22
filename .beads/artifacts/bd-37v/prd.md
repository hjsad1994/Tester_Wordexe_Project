# Beads PRD: Fix Cart Persistence on Page Reload

**Bead:** bd-37v
**Created:** 2026-02-22
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 1
```

---

## Problem Statement

### What problem are we solving?

Khi user thêm sản phẩm vào giỏ hàng từ ProductCard trên homepage (hoặc bất kỳ surface nào), sau đó vào trang `/cart` và reload page (F5), toàn bộ sản phẩm đã thêm bị mất.

**Root cause:** `CartContext.tsx` sử dụng `useReducer` với initial state hardcoded `{ items: [], buyNowItem: null }` — không có persistence nào (localStorage, sessionStorage, hay API). Mỗi lần page reload, cart state bị reset hoàn toàn về rỗng.

### Why now?

Đây là bug ảnh hưởng trực tiếp đến trải nghiệm mua hàng. User mất sản phẩm đã chọn khi vô tình reload trang, dẫn đến frustration và khả năng bỏ mua hàng.

### Who is affected?

- **Primary users:** Tất cả khách hàng sử dụng trang web — bất kỳ ai thêm sản phẩm vào giỏ hàng
- **Secondary users:** Admin/business — mất conversion do UX kém

---

## Scope

### In-Scope

- Thêm localStorage persistence cho cart state (items + buyNowItem)
- Hydrate cart state từ localStorage khi app mount
- Sync cart state vào localStorage mỗi khi state thay đổi
- Xử lý edge cases: corrupted data, invalid JSON, storage quota exceeded

### Out-of-Scope

- Server-side cart sync (cart API backend) — deferred
- Cross-device cart sync — deferred
- Cart expiration/TTL — deferred
- Cart merge khi user đăng nhập — deferred
- Thay đổi cart UI/UX — không liên quan

---

## Proposed Solution

### Overview

Replicate pattern đã có sẵn trong `WishlistContext.tsx` sang `CartContext.tsx`: thêm `HYDRATE` action vào reducer, thêm `useEffect` để đọc localStorage khi mount và ghi localStorage khi state thay đổi. Storage key: `"baby-bliss-cart"`.

### User Flow

1. User mở trang web → CartProvider mount → `useEffect` đọc localStorage key `"baby-bliss-cart"` → dispatch `HYDRATE` action với saved items
2. User thêm sản phẩm vào giỏ → reducer update state → `useEffect` sync ghi state mới vào localStorage
3. User reload page (F5) → CartProvider remount → `useEffect` hydrate lại từ localStorage → cart items vẫn còn nguyên
4. User xóa sản phẩm / clear cart → reducer update state → `useEffect` sync ghi state rỗng vào localStorage

---

## Requirements

### Functional Requirements

#### Cart Persistence

Cart state phải được persist qua localStorage và survive page reload.

**Scenarios:**

- **WHEN** user thêm sản phẩm vào cart rồi reload page **THEN** sản phẩm vẫn hiển thị trong cart với đúng quantity
- **WHEN** user update quantity rồi reload **THEN** quantity mới được giữ nguyên
- **WHEN** user xóa sản phẩm rồi reload **THEN** sản phẩm đã xóa không xuất hiện lại
- **WHEN** user clear cart rồi reload **THEN** cart vẫn trống
- **WHEN** user sử dụng "Buy Now" rồi reload **THEN** buyNowItem được preserve

#### Error Handling

Xử lý graceful khi localStorage không khả dụng hoặc data bị corrupt.

**Scenarios:**

- **WHEN** localStorage bị disabled (private browsing trên một số browser) **THEN** cart vẫn hoạt động bình thường (in-memory only, không crash)
- **WHEN** localStorage chứa invalid JSON cho cart key **THEN** cart khởi tạo rỗng, invalid data bị xóa
- **WHEN** localStorage full (quota exceeded) **THEN** cart vẫn hoạt động in-memory, log warning

### Non-Functional Requirements

- **Performance:** Không block render — hydration chạy trong `useEffect` (post-mount)
- **Compatibility:** Hoạt động trên tất cả browser hỗ trợ localStorage (tất cả modern browsers)
- **Data size:** Cart data minimal (id, name, price, image, quantity per item) — không lo storage quota

---

## Success Criteria

- [ ] Cart items persist qua page reload (F5)
  - Verify: `Mở homepage → thêm 2 sản phẩm → vào /cart → F5 → sản phẩm vẫn còn`
- [ ] Cart quantity changes persist qua page reload
  - Verify: `Thêm sản phẩm → tăng quantity lên 3 → F5 → quantity vẫn là 3`
- [ ] Cart removal persists qua page reload
  - Verify: `Xóa 1 sản phẩm → F5 → sản phẩm đã xóa không xuất hiện`
- [ ] Clear cart persists
  - Verify: `Clear cart → F5 → cart vẫn trống`
- [ ] BuyNowItem persists qua page reload
  - Verify: `Click Buy Now → F5 → buyNowItem vẫn tồn tại`
- [ ] Corrupted localStorage handled gracefully
  - Verify: `Trong DevTools Console chạy localStorage.setItem('baby-bliss-cart', 'invalid{json') → reload → cart khởi tạo rỗng, không crash`
- [ ] TypeScript builds without errors
  - Verify: `cd frontend && npx tsc --noEmit`
- [ ] Lint passes
  - Verify: `cd frontend && npx next lint`

---

## Technical Context

### Existing Patterns

- **WishlistContext localStorage persistence:** `frontend/src/contexts/WishlistContext.tsx` — Uses `HYDRATE` action (line 21), mount useEffect to read localStorage (lines 60-70), sync useEffect to write localStorage (lines 72-79). Storage key: `"baby-bliss-wishlist"`. This is the exact pattern to replicate.

### Key Files

- `frontend/src/contexts/CartContext.tsx` — Core file to modify: add HYDRATE action, persistence useEffects
- `frontend/src/contexts/WishlistContext.tsx` — Reference pattern for localStorage persistence
- `frontend/src/app/layout.tsx` — CartProvider mounting (no changes needed, context only)
- `frontend/src/app/cart/page.tsx` — Cart page consumer (no changes needed, reads from context)

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/contexts/CartContext.tsx # Add HYDRATE action, localStorage persistence useEffects
```

---

## Risks & Mitigations

| Risk                                                                                       | Likelihood | Impact | Mitigation                                                                     |
| ------------------------------------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------ |
| localStorage data schema mismatch after future CartItem changes                            | Low        | Medium | Add try-catch around JSON.parse, fallback to empty state                       |
| SSR hydration mismatch (Next.js) — server renders empty, client hydrates from localStorage | Medium     | Low    | useEffect runs post-mount (client-only), so no SSR mismatch for Context state  |
| buyNowItem persisting when it shouldn't (e.g., after checkout completes)                   | Low        | Low    | clearBuyNowItem already called in checkout flow — localStorage sync handles it |

---

## Open Questions

_None — solution is well-defined based on existing WishlistContext pattern._

---

## Tasks

### Add HYDRATE action to CartContext reducer [bugfix]

CartContext reducer handles a `HYDRATE` action that replaces the entire cart state with persisted data from localStorage, following the same pattern as WishlistContext.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - frontend/src/contexts/CartContext.tsx
```

**Verification:**

- `cd frontend && npx tsc --noEmit` passes
- HYDRATE action type exists in CartAction union
- cartReducer handles HYDRATE case

### Add localStorage persistence to CartProvider [bugfix]

CartProvider includes two useEffects: one to hydrate state from localStorage on mount (read `"baby-bliss-cart"` key, parse JSON, dispatch HYDRATE), and one to sync state to localStorage whenever `state.items` or `state.buyNowItem` changes, with try-catch for corrupted data and storage errors.

**Metadata:**

```yaml
depends_on: ["Add HYDRATE action to CartContext reducer"]
parallel: false
conflicts_with: []
files:
  - frontend/src/contexts/CartContext.tsx
```

**Verification:**

- `cd frontend && npx tsc --noEmit` passes
- Open app → add item to cart → check DevTools Application > localStorage > `baby-bliss-cart` key exists with correct data
- Reload page → cart items still present
- Clear cart → reload → cart still empty
- Set `localStorage.setItem('baby-bliss-cart', 'invalid')` in console → reload → cart initializes empty without crash

---

## Notes

- Pattern đã proven trong codebase: `WishlistContext.tsx` sử dụng cùng approach và hoạt động ổn định
- Chỉ cần modify 1 file duy nhất: `CartContext.tsx`
- Không cần thay đổi bất kỳ consumer nào (cart page, product card, header, etc.) vì API của useCart() hook không thay đổi
- Storage key convention: `"baby-bliss-cart"` (consistent với `"baby-bliss-wishlist"`)
