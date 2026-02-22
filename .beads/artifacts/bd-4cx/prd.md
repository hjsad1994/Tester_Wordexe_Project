# Fix Cart/Wishlist localStorage Data Leakage Between Users

**Bead:** bd-4cx
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

Cart và wishlist trên Baby Bliss sử dụng localStorage key cố định (`baby-bliss-cart` và `baby-bliss-wishlist`) không có scoping theo user. Khi user A logout và user B login trên cùng trình duyệt, user B sẽ thấy giỏ hàng và wishlist của user A. Ngoài ra, hàm `logout()` trong `AuthContext.tsx` chỉ xóa cookie và React state, **không xóa localStorage**, dẫn đến dữ liệu giỏ hàng tồn tại giữa các phiên đăng nhập khác nhau.

### Why now?

Đây là lỗi bảo mật và UX nghiêm trọng:
- **Privacy violation:** User có thể thấy sản phẩm mà user khác đã thêm vào giỏ hàng
- **Data integrity:** User mới bị "kế thừa" giỏ hàng cũ, gây nhầm lẫn
- **Trust erosion:** User mất niềm tin khi thấy dữ liệu không phải của mình

### Who is affected?

- **Primary:** Mọi user chia sẻ thiết bị/trình duyệt (gia đình, quán net, máy công cộng)
- **Secondary:** Guest users (chưa login) có thể thấy cart của user đã logout trước đó

---

## Scope

### In-Scope

- Thêm per-user scoping cho localStorage key của CartContext
- Thêm per-user scoping cho localStorage key của WishlistContext
- Clear cart/wishlist localStorage khi logout
- Clear cart/wishlist React state khi logout
- Xử lý transition giữa guest → login (merge hoặc replace cart)
- Xử lý transition giữa login → logout (clear cart)

### Out-of-Scope

- Backend cart persistence (lưu cart vào database)
- Cart merge strategy phức tạp (giữ cả guest + user cart)
- Sync cart giữa multiple devices
- Session expiry / auto-logout
- Wishlist backend persistence

---

## Proposed Solution

### Overview

1. **Per-user localStorage keys:** Thay đổi `STORAGE_KEY` từ string cố định sang dynamic key dựa trên `user.id` từ AuthContext. Format: `baby-bliss-cart-{userId}` cho authenticated users, `baby-bliss-cart-guest` cho guest.
2. **Logout cleanup:** Thêm `clearCart()` và `clearWishlist()` calls vào hàm `logout()` trong AuthContext, đồng thời xóa localStorage entries.
3. **User change detection:** Khi `user` thay đổi trong AuthContext (login/logout), CartContext và WishlistContext phải re-hydrate từ localStorage key tương ứng với user mới.

### User Flow

1. Guest user browse → cart lưu vào `baby-bliss-cart-guest`
2. Guest login thành user A → cart re-hydrate từ `baby-bliss-cart-{userA.id}` (guest cart bị bỏ)
3. User A thêm sản phẩm → lưu vào `baby-bliss-cart-{userA.id}`
4. User A logout → localStorage `baby-bliss-cart-{userA.id}` được xóa, React state cleared
5. User B login → cart re-hydrate từ `baby-bliss-cart-{userB.id}` (trống nếu chưa có)
6. User B thấy giỏ hàng trống (hoặc cart riêng của mình), KHÔNG thấy cart của user A

---

## Requirements

### Functional Requirements

#### Per-User Cart Scoping

Cart localStorage phải được scope theo user ID.

**Scenarios:**

- **WHEN** user A logs in **THEN** cart loads from `baby-bliss-cart-{userA.id}`
- **WHEN** user A logs out and user B logs in **THEN** user B does NOT see user A's cart
- **WHEN** guest user (not logged in) adds items **THEN** cart saves to `baby-bliss-cart-guest`
- **WHEN** guest user logs in **THEN** cart re-hydrates from user-specific key (guest cart abandoned)

#### Per-User Wishlist Scoping

Wishlist localStorage phải được scope theo user ID.

**Scenarios:**

- **WHEN** user A logs in **THEN** wishlist loads from `baby-bliss-wishlist-{userA.id}`
- **WHEN** user A logs out and user B logs in **THEN** user B does NOT see user A's wishlist
- **WHEN** guest user adds wishlist items **THEN** saves to `baby-bliss-wishlist-guest`

#### Logout Cleanup

Logout phải clear tất cả user-specific data.

**Scenarios:**

- **WHEN** user clicks logout **THEN** cart React state is cleared to empty
- **WHEN** user clicks logout **THEN** wishlist React state is cleared to empty
- **WHEN** user clicks logout **THEN** user-specific localStorage entries are removed
- **WHEN** user clicks logout **THEN** subsequent page load shows empty cart/wishlist

#### Login Transition

Login phải hydrate cart/wishlist từ user-specific storage.

**Scenarios:**

- **WHEN** user logs in **THEN** cart hydrates from `baby-bliss-cart-{userId}`
- **WHEN** user logs in for first time **THEN** cart is empty (no key exists yet)
- **WHEN** user logs in and has saved cart from previous session **THEN** cart restores correctly

### Non-Functional Requirements

- **Security:** Không có cách nào user B có thể access dữ liệu localStorage của user A thông qua app flow
- **Performance:** User change detection và re-hydration phải hoàn thành trong <100ms
- **Backward Compatibility:** Existing cart data (key `baby-bliss-cart`) phải được migrate hoặc handled gracefully (không crash)

---

## Success Criteria

- [ ] User A's cart is NOT visible to User B after A logs out and B logs in
  - Verify: `Login as User A, add items to cart, logout, login as User B, verify cart is empty`
- [ ] Logout clears cart state and localStorage
  - Verify: `Login, add items, logout, check localStorage in DevTools — no user-specific cart key remains`
- [ ] Logout clears wishlist state and localStorage
  - Verify: `Login, add wishlist items, logout, check localStorage — no user-specific wishlist key remains`
- [ ] Guest cart is separate from authenticated user cart
  - Verify: `Add items as guest, login, verify cart loads user-specific data (not guest data)`
- [ ] Login restores user-specific cart
  - Verify: `Login as User A, add items, logout, login as User A again, verify cart is restored`
- [ ] Cart state updates use user-scoped key
  - Verify: `Login, add item, check localStorage key matches baby-bliss-cart-{userId} pattern`
- [ ] Wishlist state updates use user-scoped key
  - Verify: `Login, add wishlist item, check localStorage key matches baby-bliss-wishlist-{userId} pattern`
- [ ] No regression: existing cart functionality works
  - Verify: `Add/remove/update quantity in cart, verify all operations work correctly`
- [ ] TypeScript compiles without errors
  - Verify: `cd frontend && npx tsc --noEmit`
- [ ] Build succeeds
  - Verify: `cd frontend && npm run build`

---

## Technical Context

### Existing Patterns

- `frontend/src/contexts/CartContext.tsx:13` — `STORAGE_KEY = 'baby-bliss-cart'` (fixed string, no user ID)
- `frontend/src/contexts/CartContext.tsx:115-149` — Hydration on mount from localStorage
- `frontend/src/contexts/CartContext.tsx:151-160` — Sync cart state to localStorage on change
- `frontend/src/contexts/WishlistContext.tsx:54` — `baby-bliss-wishlist` (same fixed key pattern)
- `frontend/src/contexts/AuthContext.tsx:179-189` — `logout()` only clears cookie + React state, does NOT clear localStorage
- `frontend/src/app/layout.tsx:38-42` — Provider nesting: `AuthProvider → CartProvider → WishlistProvider`

### Key Files

- `frontend/src/contexts/CartContext.tsx` — Cart state management with localStorage
- `frontend/src/contexts/WishlistContext.tsx` — Wishlist state management with localStorage
- `frontend/src/contexts/AuthContext.tsx` — Auth state, login/logout functions
- `frontend/src/app/layout.tsx` — Provider nesting order

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/contexts/CartContext.tsx # Add user-scoped storage key + user change detection
  - frontend/src/contexts/WishlistContext.tsx # Add user-scoped storage key + user change detection
  - frontend/src/contexts/AuthContext.tsx # Add localStorage cleanup on logout
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Existing cart data in `baby-bliss-cart` key becomes orphaned | High | Low | Handle gracefully: ignore old key or migrate to guest key on first load |
| Circular dependency: CartContext needs AuthContext, AuthContext calls clearCart | Medium | High | Use event-based cleanup (custom event or callback prop) instead of direct import |
| Hydration mismatch if user state not available on first render | Medium | Medium | Defer localStorage read until user state is resolved; show loading state |
| localStorage quota exceeded with per-user keys | Low | Low | Old user keys naturally expire; cart data is small (<1KB per user) |

---

## Open Questions

| Question | Owner | Due Date | Status |
| --- | --- | --- | --- |
| Giữ lại guest cart khi login hay abandon? | User | Before implementation | Open |
| Có cần migrate data từ key `baby-bliss-cart` cũ không? | User | Before implementation | Open |

---

## Tasks

### Add user-scoped storage key to CartContext [state]

Thay đổi `STORAGE_KEY` trong CartContext từ string cố định sang dynamic key dựa trên `user.id`. CartContext consume `useAuth()` để lấy user ID. Key format: `baby-bliss-cart-{userId}` cho authenticated users, `baby-bliss-cart-guest` cho guest. Re-hydrate cart khi user thay đổi.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Add user-scoped storage key to WishlistContext"]
files:
  - frontend/src/contexts/CartContext.tsx
```

**Verification:**

- localStorage key changes based on logged-in user
- Cart re-hydrates when user changes
- `cd frontend && npx tsc --noEmit` passes

### Add user-scoped storage key to WishlistContext [state]

Thay đổi storage key trong WishlistContext từ `baby-bliss-wishlist` sang `baby-bliss-wishlist-{userId}` hoặc `baby-bliss-wishlist-guest`. WishlistContext consume `useAuth()` để lấy user ID. Re-hydrate wishlist khi user thay đổi.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Add user-scoped storage key to CartContext"]
files:
  - frontend/src/contexts/WishlistContext.tsx
```

**Verification:**

- localStorage key changes based on logged-in user
- Wishlist re-hydrates when user changes
- `cd frontend && npx tsc --noEmit` passes

### Add logout cleanup to AuthContext [integration]

Thêm cleanup logic vào hàm `logout()` trong AuthContext: clear cart/wishlist localStorage entries và reset React state. Sử dụng callback pattern hoặc custom event để tránh circular dependency giữa AuthContext và CartContext/WishlistContext.

**Metadata:**

```yaml
depends_on: ["Add user-scoped storage key to CartContext", "Add user-scoped storage key to WishlistContext"]
parallel: false
conflicts_with: []
files:
  - frontend/src/contexts/AuthContext.tsx
```

**Verification:**

- Logout clears cart and wishlist from both React state and localStorage
- No circular dependency errors
- `cd frontend && npx tsc --noEmit` passes
- `cd frontend && npm run build` succeeds

### Verify end-to-end user isolation [checkpoint:human-verify]

Kiểm tra end-to-end flow: User A login → add cart items → logout → User B login → verify empty cart. Đảm bảo không có data leakage.

**Metadata:**

```yaml
depends_on: ["Add logout cleanup to AuthContext"]
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- Login as User A, add items to cart and wishlist
- Logout as User A
- Login as User B, verify cart and wishlist are empty
- Check localStorage in DevTools — only User B keys exist
- `cd frontend && npm run build` succeeds

---

## Dependency Legend

| Field | Purpose | Example |
| --- | --- | --- |
| `depends_on` | Must complete before this task starts | `["Add user-scoped storage key to CartContext"]` |
| `parallel` | Can run concurrently with other parallel tasks | `true` / `false` |
| `conflicts_with` | Cannot run in parallel (same files) | `["Update config"]` |
| `files` | Files this task modifies (for conflict detection) | `["src/contexts/CartContext.tsx"]` |

---

## Notes

- Provider nesting order trong `layout.tsx` là `AuthProvider → CartProvider → WishlistProvider`, nghĩa là CartContext và WishlistContext có thể access AuthContext qua `useAuth()` — không cần thay đổi nesting order
- `buyNowItem` trong CartContext là session-only (không persist vào localStorage), không bị ảnh hưởng bởi bug này
- WishlistContext có cùng vulnerability pattern với CartContext — cần fix song song
- Cần xử lý backward compatibility: key `baby-bliss-cart` cũ có thể còn tồn tại trong localStorage của users hiện tại
