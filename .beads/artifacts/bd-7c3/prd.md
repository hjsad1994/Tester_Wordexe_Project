# Fix wishlist button not navigating to /wishlist page

**Bead:** bd-7c3  
**Created:** 2026-02-13  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 0.5
```

---

## Problem Statement

### What problem are we solving?

Clicking the "Yêu thích" (wishlist) button in the Header does not navigate the user to the `/wishlist` page. Both the desktop icon and mobile menu item are rendered as plain `<button>` elements with no `Link` or `href`, so clicking them has no effect.

### Why now?

The wishlist page (`/wishlist`) and WishlistContext already exist and work correctly. The Header is the primary entry point for users to access their wishlist, but the navigation is broken — making the feature effectively unreachable from the header.

### Who is affected?

- **Primary users:** All site visitors trying to access their wishlist from the header
- **Secondary users:** Mobile users using the hamburger menu

---

## Scope

### In-Scope

- Convert desktop wishlist `<button>` to `<Link href="/wishlist">` in Header
- Convert mobile menu wishlist `<button>` to `<Link href="/wishlist">` in Header
- Wire `useWishlist()` hook for dynamic badge count (replace hardcoded "3")
- Close mobile menu on wishlist link click

### Out-of-Scope

- Changes to the `/wishlist` page itself
- Changes to WishlistContext
- Changes to ProductCard or ProductDetailModal wishlist toggles
- Adding Playwright tests (can be a separate task)

---

## Proposed Solution

### Overview

Replace the two `<button>` elements for wishlist in `Header.tsx` with Next.js `<Link href="/wishlist">` components. Import and use `useWishlist()` from `WishlistContext` to show the real wishlist count badge instead of the hardcoded "3". Close the mobile menu when the wishlist link is clicked.

### User Flow

1. User clicks the heart icon in the header (desktop) or "Yêu thích" in the mobile menu
2. Browser navigates to `/wishlist`
3. Wishlist page displays the user's saved items

---

## Requirements

### Functional Requirements

#### Desktop wishlist navigation

The desktop wishlist icon in the header navigates to `/wishlist` when clicked.

**Scenarios:**

- **WHEN** user clicks the heart icon in the desktop header **THEN** browser navigates to `/wishlist`
- **WHEN** user has items in wishlist **THEN** badge shows actual count (capped at "99+")
- **WHEN** wishlist is empty **THEN** no badge is shown

#### Mobile wishlist navigation

The mobile menu "Yêu thích" item navigates to `/wishlist` and closes the menu.

**Scenarios:**

- **WHEN** user taps "Yêu thích" in the mobile menu **THEN** browser navigates to `/wishlist` and menu closes
- **WHEN** user has items in wishlist **THEN** count is shown inline (e.g., "Yêu thích (2)")

### Non-Functional Requirements

- **Accessibility:** `aria-label` must remain on the desktop link for screen readers
- **Performance:** No additional network requests; uses existing WishlistContext

---

## Success Criteria

- [ ] Clicking the desktop heart icon navigates to `/wishlist`
  - Verify: `Open browser → click heart icon in header → URL is /wishlist`
- [ ] Clicking "Yêu thích" in mobile menu navigates to `/wishlist`
  - Verify: `Open browser at mobile width → open menu → click "Yêu thích" → URL is /wishlist`
- [ ] Badge shows dynamic wishlist count (not hardcoded)
  - Verify: `Add items to wishlist → badge count matches actual items`
- [ ] `npm run lint:fix` passes
  - Verify: `npm run lint:fix`
- [ ] `npm run typecheck` passes
  - Verify: `npm run typecheck`
- [ ] `npm run format:check` passes
  - Verify: `npm run format:check`

---

## Technical Context

### Existing Patterns

- `src/components/Header.tsx:89-98` — Desktop wishlist: `<button>` with `HeartOutlineIcon`, hardcoded badge "3", no navigation
- `src/components/Header.tsx:158-163` — Mobile wishlist: `<button>` with "Yêu thích" text, no navigation
- `src/contexts/WishlistContext.tsx` — Provides `useWishlist()` hook with `wishlistCount`, `wishlistItems`, etc.
- `src/app/wishlist/page.tsx` — Wishlist page, renders at `/wishlist` via App Router

### Key Files

- `src/components/Header.tsx` — The only file that needs changes
- `src/contexts/WishlistContext.tsx` — Provides the `useWishlist()` hook (read-only dependency)

### Affected Files

Files this bead will modify:

```yaml
files:
  - frontend/src/components/Header.tsx # Convert buttons to Links, add useWishlist
```

---

## Tasks

### Convert desktop wishlist button to Link [ui]

Desktop wishlist heart icon in Header navigates to `/wishlist` with dynamic badge count from `useWishlist()`.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Convert mobile wishlist button to Link"]
files:
  - frontend/src/components/Header.tsx
```

**Verification:**

- Open `http://localhost:3000` → click heart icon → URL changes to `/wishlist`
- Badge shows real wishlist count (not hardcoded "3")
- `npm run typecheck`

### Convert mobile wishlist button to Link [ui]

Mobile menu "Yêu thích" item navigates to `/wishlist` and closes the mobile menu on click.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Convert desktop wishlist button to Link"]
files:
  - frontend/src/components/Header.tsx
```

**Verification:**

- Open `http://localhost:3000` at mobile width → open menu → tap "Yêu thích" → URL changes to `/wishlist` and menu closes
- Count shown inline when items exist
- `npm run typecheck`

### Run verification gates [qa]

All lint, typecheck, and format checks pass after changes.

**Metadata:**

```yaml
depends_on: ["Convert desktop wishlist button to Link", "Convert mobile wishlist button to Link"]
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `npm run lint:fix`
- `npm run typecheck`
- `npm run format:check`

---

## Notes

- The WishlistContext and `/wishlist` page already exist and are functional (shipped in PR #12).
- This bug exists because the PR #13 (remove header search) reverted the Header to use plain `<button>` instead of `<Link>` for wishlist items.
- Both tasks modify the same file so they should be done together in a single pass.
