# Fix Cart Data Leaking Between User Accounts

**Bead:** bd-3e4
**Created:** 2026-02-22
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: ["bd-3m7"] # Add-to-cart toast — both touch CartContext
blocks: []
estimated_hours: 3
```

---

## Problem Statement

### What problem are we solving?

Giỏ hàng (cart) sử dụng một localStorage key duy nhất `baby-bliss-cart` cho tất cả người dùng trên cùng trình duyệt. Khi User A đăng xuất và User B đăng nhập, User B thấy giỏ hàng của User A. Đây là lỗi bảo mật và UX nghiêm trọng — dữ liệu cá nhân bị rò rỉ giữa các tài khoản.

**Impact:**

- Privacy violation: users see other users' shopping selections
- UX confusion: users see items they didn't add
- Potential order errors: users may accidentally purchase someone else's items

### Why now?

Bug đã được report bởi người dùng. Hiện tại không có cơ chế bảo vệ nào — mỗi lần đăng xuất/đăng nhập đều gặp vấn đề này.

### Who is affected?

- **Primary users:** Tất cả người dùng chia sẻ trình duyệt (gia đình, thiết bị công cộng, testing)
- **Secondary users:** Bất kỳ người dùng nào đăng xuất rồi đăng nhập lại — giỏ hàng cũ không được khôi phục nếu ai đó khác đã dùng trình duyệt

---

## Scope

### In-Scope

- User-scoped cart persistence (mỗi user có cart riêng trong localStorage)
- Cart state clearing on logout
- Cart state restoration on login (khôi phục cart cũ khi đăng nhập lại)
- Guest cart handling (cart cho người chưa đăng nhập)
- Wishlist cũng cần fix cùng bug (key `baby-bliss-wishlist` cũng bị global)

### Out-of-Scope

- Server-side cart persistence (move cart to MongoDB) — deferred to future iteration
- Cart merging (merge guest cart with user cart on login) — deferred
- Cross-device cart sync — requires server-side storage
- Wishlist hydration race condition fix (separate bug, tracked independently)

---

## Proposed Solution

### Overview

Chuyển localStorage key từ global (`baby-bliss-cart`) sang user-scoped (`baby-bliss-cart-{userId}`). Khi user đăng nhập, cart hydrate từ key riêng của user. Khi đăng xuất, cart hiện tại được lưu vào key của user đang logout, sau đó state được reset. Guest users sử dụng key `baby-bliss-cart-guest`. Áp dụng pattern tương tự cho wishlist (`baby-bliss-wishlist-{userId}`).

### User Flow

1. **Guest browsing:** Cart lưu vào `baby-bliss-cart-guest`
2. **User A logs in:** Cart hydrate từ `baby-bliss-cart-{userA_id}`. Guest cart giữ nguyên riêng.
3. **User A adds items:** Cart sync vào `baby-bliss-cart-{userA_id}`
4. **User A logs out:** Cart state reset về rỗng. Key `baby-bliss-cart-{userA_id}` giữ nguyên trong localStorage.
5. **Guest browsing again:** Cart hydrate từ `baby-bliss-cart-guest`
6. **User B logs in:** Cart hydrate từ `baby-bliss-cart-{userB_id}` (rỗng nếu chưa có). User B thấy cart riêng.
7. **User A logs in lại:** Cart hydrate từ `baby-bliss-cart-{userA_id}` — items cũ được khôi phục.

---

## Requirements

### Functional Requirements

#### FR1: User-scoped cart storage

Mỗi user phải có localStorage key riêng cho cart data.

**Scenarios:**

- **WHEN** user đăng nhập **THEN** cart hydrate từ `baby-bliss-cart-{userId}`
- **WHEN** user chưa đăng nhập (guest) **THEN** cart sử dụng key `baby-bliss-cart-guest`
- **WHEN** user A đăng xuất và user B đăng nhập **THEN** user B thấy cart riêng, không thấy items của user A

#### FR2: Cart persistence across sessions

Cart của mỗi user phải được lưu trữ và khôi phục khi đăng nhập lại.

**Scenarios:**

- **WHEN** user đăng nhập lại sau khi đã đăng xuất **THEN** cart cũ được khôi phục đầy đủ (items + quantities)
- **WHEN** user đăng nhập trên cùng trình duyệt **THEN** cart của lần trước hiện lại

#### FR3: Cart cleanup on logout

Khi đăng xuất, cart state phải được reset.

**Scenarios:**

- **WHEN** user đăng xuất **THEN** cart UI hiển thị rỗng (0 items)
- **WHEN** user đăng xuất **THEN** cart data của user vẫn được lưu trong localStorage (để khôi phục khi login lại)
- **WHEN** đăng xuất thất bại (network error) **THEN** cart state vẫn được reset trên client

#### FR4: User-scoped wishlist storage

Áp dụng cùng pattern cho wishlist.

**Scenarios:**

- **WHEN** user đăng nhập **THEN** wishlist hydrate từ `baby-bliss-wishlist-{userId}`
- **WHEN** user đăng xuất **THEN** wishlist state reset, data lưu giữ cho user
- **WHEN** guest browsing **THEN** wishlist sử dụng key `baby-bliss-wishlist-guest`

### Non-Functional Requirements

- **Performance:** Hydration phải xảy ra trong < 50ms (localStorage is synchronous, should be trivial)
- **Security:** Cart data không được leak giữa các user accounts
- **Compatibility:** Backwards-compatible — migration từ old key `baby-bliss-cart` sang user-scoped key cho existing users

---

## Success Criteria

- [ ] User A đăng xuất, User B đăng nhập → User B thấy cart rỗng (hoặc cart riêng của B)
  - Verify: `Manual test: Login as User A, add items, logout, login as User B, verify cart is empty`
- [ ] User A đăng nhập lại → thấy cart cũ với đầy đủ items
  - Verify: `Manual test: Login as User A, add 3 items, logout, login as User A again, verify 3 items present`
- [ ] Guest cart hoạt động độc lập với user carts
  - Verify: `Manual test: Add items as guest, login, verify guest cart preserved in localStorage under guest key`
- [ ] Wishlist cũng isolated per user
  - Verify: `Manual test: Add wishlist items as User A, logout, login as User B, verify wishlist empty`
- [ ] Old localStorage key `baby-bliss-cart` được migrate cho logged-in user
  - Verify: `Manual test: With old key in localStorage, login, verify items migrated to user-scoped key`
- [ ] TypeCheck passes
  - Verify: `npm run typecheck`
- [ ] Lint passes
  - Verify: `npm run lint:fix`

---

## Technical Context

### Existing Patterns

- Cart state: `frontend/src/contexts/CartContext.tsx` — React Context + `useReducer` + localStorage hydrate/sync pattern
- Auth state: `frontend/src/contexts/AuthContext.tsx` — React Context + `useState`, JWT in httpOnly cookie, `useAuth()` hook provides `user` object with `id` field
- Wishlist state: `frontend/src/contexts/WishlistContext.tsx` — Same pattern as Cart, key `baby-bliss-wishlist`
- Provider tree: `frontend/src/app/layout.tsx:38-41` — `AuthProvider > CartProvider > WishlistProvider`

### Key Files

- `frontend/src/contexts/CartContext.tsx` — Core cart logic: reducer, hydration (line 115-149), sync (line 152-160), localStorage key (line 13)
- `frontend/src/contexts/AuthContext.tsx` — Auth: login (line 111-139), logout (line 179-189), user state, `AuthUser` interface (line 15-24) with `id: string`
- `frontend/src/contexts/WishlistContext.tsx` — Wishlist: same hydrate/sync pattern, key at line 54
- `frontend/src/app/layout.tsx` — Provider nesting order (line 38-41)
- `frontend/src/components/Header.tsx` — Logout buttons (line 131, 244) call `logout()` directly

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/contexts/CartContext.tsx # Add user-scoped keys, auth-aware hydration/sync
  - frontend/src/contexts/WishlistContext.tsx # Same user-scoping pattern
  - frontend/src/contexts/AuthContext.tsx # Export logout event or callback for cart/wishlist reset
  - frontend/src/app/layout.tsx # May need to adjust provider order if CartProvider needs AuthContext
```

---

## Risks & Mitigations

| Risk                                                       | Likelihood | Impact | Mitigation                                                                                       |
| ---------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------ |
| Existing users lose cart on upgrade (old key not migrated) | High       | High   | Migration logic: check old `baby-bliss-cart` key, move to user-scoped key on first login         |
| CartProvider renders before AuthProvider hydrates user     | Medium     | High   | Provider order already correct (Auth wraps Cart). Use `user` from `useAuth()` — null means guest |
| Race condition: cart sync fires before auth resolves       | Medium     | Medium | Gate cart hydration on auth loading state (`isLoading` from AuthContext)                         |
| Circular dependency between Auth and Cart contexts         | Low        | Medium | Cart observes auth state via `useAuth()`, auth never imports cart — one-way dependency           |

---

## Open Questions

| Question                                                        | Owner   | Due Date              | Status                  |
| --------------------------------------------------------------- | ------- | --------------------- | ----------------------- |
| Should guest cart merge into user cart on login?                | Product | TBD                   | Deferred (out of scope) |
| Should old `baby-bliss-cart` key be cleaned up after migration? | Dev     | During implementation | Open                    |

---

## Tasks

### Refactor CartContext to support user-scoped localStorage keys [cart]

CartContext sử dụng `baby-bliss-cart-{userId}` thay vì `baby-bliss-cart`, hydrate đúng cart khi user thay đổi, và sync vào key tương ứng. Guest users dùng key `baby-bliss-cart-guest`.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - frontend/src/contexts/CartContext.tsx
```

**Verification:**

- `npm run typecheck`
- Manual: Login User A → add items → logout → login User B → cart must be empty
- Manual: Login User A again → cart items restored

### Refactor WishlistContext to support user-scoped localStorage keys [wishlist]

WishlistContext sử dụng `baby-bliss-wishlist-{userId}` thay vì `baby-bliss-wishlist`, áp dụng cùng hydrate/sync pattern như CartContext.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/contexts/WishlistContext.tsx
```

**Verification:**

- `npm run typecheck`
- Manual: Login User A → add wishlist items → logout → login User B → wishlist must be empty

### Add logout callback to clear cart and wishlist state [auth]

AuthContext logout function triggers cart và wishlist state reset (dispatch CLEAR actions) khi user đăng xuất, đồng thời đảm bảo data đã được save vào user-scoped key trước khi reset.

**Metadata:**

```yaml
depends_on:
  [
    "Refactor CartContext to support user-scoped localStorage keys",
    "Refactor WishlistContext to support user-scoped localStorage keys",
  ]
parallel: false
conflicts_with: []
files:
  - frontend/src/contexts/AuthContext.tsx
  - frontend/src/app/layout.tsx
```

**Verification:**

- `npm run typecheck`
- Manual: Login → add items to cart + wishlist → logout → verify cart badge shows 0, wishlist empty
- Manual: Login again → verify cart + wishlist restored

### Add migration logic for existing localStorage data [migration]

Khi user đăng nhập lần đầu sau update, nếu tồn tại old key `baby-bliss-cart` / `baby-bliss-wishlist`, migrate data sang user-scoped key và xóa old key.

**Metadata:**

```yaml
depends_on: ["Refactor CartContext to support user-scoped localStorage keys"]
parallel: false
conflicts_with: []
files:
  - frontend/src/contexts/CartContext.tsx
  - frontend/src/contexts/WishlistContext.tsx
```

**Verification:**

- Manual: Set `localStorage.setItem('baby-bliss-cart', JSON.stringify({items: [{id:'test',name:'Test',price:100,image:'/test.jpg',quantity:1}]}))` in browser console → login → verify items appear in cart → verify old key removed
- `npm run typecheck`

### End-to-end verification of user-scoped cart isolation [testing]

Full integration test: multiple users on same browser, cart isolation, persistence, and migration all working correctly.

**Metadata:**

```yaml
depends_on:
  [
    "Add logout callback to clear cart and wishlist state",
    "Add migration logic for existing localStorage data",
  ]
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `npm run typecheck`
- `npm run lint:fix`
- Manual E2E: User A login → add 3 items → logout → User B login → verify empty cart → add 2 items → logout → User A login → verify 3 items → logout → User B login → verify 2 items
- Manual E2E: Guest adds items → login → verify guest cart untouched, user cart loaded

---

## Dependency Legend

| Field            | Purpose                                           | Example                                    |
| ---------------- | ------------------------------------------------- | ------------------------------------------ |
| `depends_on`     | Must complete before this task starts             | `["Setup database", "Create schema"]`      |
| `parallel`       | Can run concurrently with other parallel tasks    | `true` / `false`                           |
| `conflicts_with` | Cannot run in parallel (same files)               | `["Update config"]`                        |
| `files`          | Files this task modifies (for conflict detection) | `["src/db/schema.ts", "src/db/client.ts"]` |

---

## Notes

- Provider order in `layout.tsx` is already correct: `AuthProvider > CartProvider > WishlistProvider` — Cart can access auth state via `useAuth()`
- `buyNowItem` in CartContext is session-scoped (not persisted) — no changes needed for it
- The `isHydrated` ref guard pattern in CartContext should be preserved and adapted for user-scoped keys
- WishlistContext is missing the `isHydrated` guard (separate bug) — not in scope but worth noting
