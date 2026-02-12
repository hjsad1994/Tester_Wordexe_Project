# Wishlist/Favorites Feature

**Bead:** bd-235
**Created:** 2026-02-12
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 4
```

---

## Problem Statement

### What problem are we solving?

Hiện tại, icon yêu thích (heart) trên ProductCard, ProductDetailModal, và trang chi tiết sản phẩm chỉ dùng local state (`isLiked`) — khi reload trang hoặc chuyển page thì mất. Badge số "3" trên Header là hardcode, không phản ánh trạng thái thực. Không có trang yêu thích để xem/quản lý sản phẩm đã thích.

Users cannot persistently favorite products, view their favorites list, or navigate to a dedicated wishlist page. The heart icon interactions are cosmetic only.

### Why now?

This is a core e-commerce feature that complements the existing cart. The UI scaffolding (heart icons, header badge) already exists but isn't functional.

### Who is affected?

- **Primary users:** Shoppers browsing products who want to save items for later
- **Secondary users:** Site owners wanting engagement metrics on product interest

---

## Scope

### In-Scope

- Global WishlistContext (mirroring CartContext pattern) with add/remove/check/clear actions
- Connect existing heart icons in ProductCard, ProductDetailModal, and product detail page to global wishlist state
- Dynamic wishlist badge count on Header (replacing hardcoded "3")
- Dedicated `/wishlist` page with product grid, remove action, add-to-cart action, clear all, and empty state
- localStorage persistence for wishlist state
- Vietnamese UI text consistent with existing site

### Out-of-Scope

- Backend API / database persistence (mock/local only, matching current cart pattern)
- User authentication integration
- Wishlist sharing or public wishlists
- Product availability checks
- Notification when wishlist items go on sale
- Analytics/tracking

---

## Proposed Solution

### Overview

Create a `WishlistContext` (mirroring the existing `CartContext` pattern with `useReducer` + Context) that stores favorited product objects. Wire existing heart icon buttons in ProductCard, ProductDetailModal, and the product detail page to this context. Replace the hardcoded "3" badge in Header with live wishlist count. Build a `/wishlist` page following the cart page structure: Header + product grid with remove/add-to-cart actions + empty state + Footer.

### User Flow

1. User browses products on homepage, /products, or /products/[id]
2. User clicks heart icon → product added to wishlist, heart fills, header badge increments
3. User clicks filled heart → product removed from wishlist, heart unfills, header badge decrements
4. User clicks wishlist icon in Header → navigates to /wishlist page
5. On /wishlist page, user sees grid of favorited products with options to remove or add to cart
6. User can clear entire wishlist with "Xóa tất cả" button

---

## Requirements

### Functional Requirements

#### Wishlist State Management

A global context provides wishlist state and actions across the app.

**Scenarios:**

- **WHEN** user adds a product to wishlist **THEN** product is stored in context and persisted to localStorage
- **WHEN** user removes a product from wishlist **THEN** product is removed from context and localStorage updated
- **WHEN** user refreshes the page **THEN** wishlist state is restored from localStorage
- **WHEN** user adds a duplicate product **THEN** the product is not added again (idempotent)

#### Heart Icon Integration

Existing heart icons reflect global wishlist state.

**Scenarios:**

- **WHEN** product is in wishlist **THEN** heart icon shows filled (HeartIcon) with pink color
- **WHEN** product is not in wishlist **THEN** heart icon shows outline (HeartOutlineIcon)
- **WHEN** user clicks heart on ProductCard **THEN** wishlist toggles for that product
- **WHEN** user clicks heart on ProductDetailModal **THEN** wishlist toggles for that product
- **WHEN** user clicks heart on /products/[id] page **THEN** wishlist toggles for that product

#### Header Badge

Header wishlist icon shows live count.

**Scenarios:**

- **WHEN** wishlist has items **THEN** badge shows count (capped at 99+)
- **WHEN** wishlist is empty **THEN** no badge is shown
- **WHEN** user clicks wishlist icon in header **THEN** navigates to /wishlist

#### Wishlist Page

Dedicated page to view and manage favorited products.

**Scenarios:**

- **WHEN** user navigates to /wishlist with items **THEN** product grid is displayed with remove and add-to-cart buttons
- **WHEN** user clicks "Xóa" on a wishlist item **THEN** item is removed from wishlist
- **WHEN** user clicks "Thêm vào giỏ" on a wishlist item **THEN** item is added to cart
- **WHEN** user clicks "Xóa tất cả" **THEN** all wishlist items are cleared
- **WHEN** wishlist is empty **THEN** empty state with illustration and CTA to /products is shown

### Non-Functional Requirements

- **Performance:** Wishlist operations must be instant (local state + localStorage, no network)
- **Accessibility:** Heart buttons must have aria-label describing action ("Thêm vào yêu thích" / "Xóa khỏi yêu thích")
- **Compatibility:** Works on all browsers supporting localStorage (all modern browsers)

---

## Success Criteria

- [ ] Heart icons on ProductCard, ProductDetailModal, and /products/[id] reflect global wishlist state
  - Verify: `Click heart on homepage product → navigate to /products → same product heart is filled`
- [ ] Header badge shows real wishlist count, updates on add/remove
  - Verify: `Add 2 products → badge shows "2" → remove 1 → badge shows "1" → remove last → badge disappears`
- [ ] Wishlist persists across page refresh
  - Verify: `Add product to wishlist → refresh page → heart still filled, badge still shows count`
- [ ] /wishlist page displays all favorited products with remove and add-to-cart actions
  - Verify: `Navigate to /wishlist → see all favorited products → click remove → item disappears`
- [ ] Empty state shows on /wishlist when no items
  - Verify: `Clear wishlist → see empty state with CTA to /products`
- [ ] Build passes without errors
  - Verify: `npm run build` (in frontend directory)

---

## Technical Context

### Existing Patterns

- `frontend/src/contexts/CartContext.tsx` — useReducer + Context + useMemo pattern for global state. Wishlist will mirror this exactly.
- `frontend/src/components/ProductCard.tsx` (lines 26, 97-112) — Local `isLiked` state with heart toggle. Will be replaced with `useWishlist()`.
- `frontend/src/components/ProductDetailModal.tsx` (lines 61-153) — Local `isLiked` state. Will be replaced.
- `frontend/src/app/products/[id]/page.tsx` (lines 425-435) — Local heart toggle. Will be replaced.
- `frontend/src/components/Header.tsx` (lines 101-110) — Hardcoded badge "3". Will use `useWishlist()`.
- `frontend/src/app/cart/page.tsx` — Page structure template (Header + content + empty state + Footer).

### Key Files

- `frontend/src/components/icons/index.tsx` — HeartIcon and HeartOutlineIcon already exist
- `frontend/src/app/layout.tsx` — Provider hierarchy, needs WishlistProvider added
- `frontend/src/components/ProductCard.tsx` — Product interface definition (id, name, price, originalPrice, illustration, rating, reviews, badge, category)

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/contexts/WishlistContext.tsx # New: global wishlist state
  - frontend/src/app/wishlist/page.tsx # New: wishlist page
  - frontend/src/app/layout.tsx # Add WishlistProvider
  - frontend/src/components/ProductCard.tsx # Replace local isLiked with useWishlist
  - frontend/src/components/ProductDetailModal.tsx # Replace local isLiked with useWishlist
  - frontend/src/app/products/[id]/page.tsx # Replace local heart with useWishlist
  - frontend/src/components/Header.tsx # Dynamic badge + link to /wishlist
```

---

## Risks & Mitigations

| Risk                                                            | Likelihood | Impact | Mitigation                                                  |
| --------------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------- |
| localStorage quota exceeded with many products                  | Low        | Low    | Store minimal product data; cap at reasonable limit         |
| Product data duplication (wishlist stores full Product objects) | Med        | Low    | Acceptable for mock data app; real app would store IDs only |
| Heart state sync across ProductCard instances                   | Med        | Med    | Global context ensures single source of truth               |

---

## Open Questions

None — scope is clear and mirrors existing cart patterns.

---

## Tasks

### Create WishlistContext with useReducer pattern [context]

A `WishlistContext.tsx` exists in `frontend/src/contexts/` providing `addToWishlist`, `removeFromWishlist`, `isInWishlist`, `clearWishlist`, `wishlistItems`, and `wishlistCount` — with localStorage persistence and hydration on mount.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/contexts/WishlistContext.tsx
```

**Verification:**

- File exists and exports `WishlistProvider` and `useWishlist` hook
- `npm run build` passes (in frontend directory)

### Wire WishlistProvider into app layout [integration]

`WishlistProvider` wraps the app children in `layout.tsx` alongside `CartProvider`.

**Metadata:**

```yaml
depends_on: ["Create WishlistContext with useReducer pattern"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/layout.tsx
```

**Verification:**

- `WishlistProvider` is imported and wrapping children in layout.tsx
- `npm run build` passes

### Connect heart icons to global wishlist state [integration]

ProductCard, ProductDetailModal, and /products/[id] page use `useWishlist()` instead of local `isLiked` state — heart icon reflects `isInWishlist(product.id)` and toggles via `addToWishlist`/`removeFromWishlist`.

**Metadata:**

```yaml
depends_on: ["Wire WishlistProvider into app layout"]
parallel: true
conflicts_with: []
files:
  - frontend/src/components/ProductCard.tsx
  - frontend/src/components/ProductDetailModal.tsx
  - frontend/src/app/products/[id]/page.tsx
```

**Verification:**

- No local `isLiked` state remains in ProductCard, ProductDetailModal, or products/[id] page for the wishlist heart
- Heart icon uses HeartIcon (filled) when in wishlist, HeartOutlineIcon when not
- `npm run build` passes

### Update Header with dynamic wishlist badge and link [ui]

Header wishlist icon shows `wishlistCount` from `useWishlist()` (replacing hardcoded "3"), hides badge when count is 0, caps at 99+, and links/navigates to `/wishlist`.

**Metadata:**

```yaml
depends_on: ["Wire WishlistProvider into app layout"]
parallel: true
conflicts_with: ["Connect heart icons to global wishlist state"]
files:
  - frontend/src/components/Header.tsx
```

**Verification:**

- No hardcoded "3" remains in Header
- Badge conditionally renders based on wishlistCount
- Wishlist icon links to /wishlist
- `npm run build` passes

### Build /wishlist page with grid, actions, and empty state [page]

A `/wishlist` page exists at `frontend/src/app/wishlist/page.tsx` with: Header, product grid showing wishlist items (using ProductCard or custom cards), remove button per item, add-to-cart button per item, "Xóa tất cả" clear button, empty state with illustration and CTA to /products, Footer — all in Vietnamese with pink pastel theme.

**Metadata:**

```yaml
depends_on: ["Wire WishlistProvider into app layout"]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/wishlist/page.tsx
```

**Verification:**

- Page renders at /wishlist
- Empty state shows when wishlist is empty
- Products display in grid when wishlist has items
- Remove and add-to-cart buttons function
- `npm run build` passes

### Final integration verification [verification]

All wishlist features work end-to-end: heart icons sync across pages, header badge updates, /wishlist page reflects state, localStorage persistence works across refresh.

**Metadata:**

```yaml
depends_on:
  [
    "Connect heart icons to global wishlist state",
    "Update Header with dynamic wishlist badge and link",
    "Build /wishlist page with grid, actions, and empty state",
  ]
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `npm run build` passes
- Manual flow: Add product on homepage → check /products (heart filled) → check header (badge = 1) → go to /wishlist (product visible) → refresh (state persists) → remove → empty state shows

---

## Notes

- Vietnamese UI text throughout (matching existing site language)
- Pink pastel theme using existing CSS variables (--pink-\*, etc.)
- Mirror CartContext pattern exactly for consistency
- HeartIcon and HeartOutlineIcon already exist in icons/index.tsx
- No authentication — wishlist is browser-local only
