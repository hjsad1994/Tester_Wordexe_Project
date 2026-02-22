# PRD: Product Detail — Remove Specs Section + Add Wishlist Toast

**Bead:** Tester_Wordexe_Project-vhy  
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

The product detail page (`/products/[id]`) has a "Thông số" (specifications) tab that is unnecessary and should be removed. Additionally, when a user adds or removes a product from the wishlist, there is no visual feedback — unlike the add-to-cart action which shows a sonner toast notification. This creates an inconsistent UX where cart actions provide confirmation but wishlist actions are silent.

### Why now?

UI cleanup and UX consistency improvement. The specifications section uses hardcoded mock data (not from the database), and the silent wishlist toggle confuses users about whether their action was registered.

### Who is affected?

- **Primary users:** Shoppers browsing product detail pages and using the wishlist feature
- **Secondary users:** All users interacting with wishlist toggles across ProductCard, ProductDetailModal, and the product detail page

---

## Scope

### In-Scope

- Remove the "Thông số" tab header from the tab list on the product detail page
- Remove the "Thông số" tab content panel from the product detail page
- Remove the `specifications` data from the `productExtras` object
- Clean up the `activeTab` type to exclude `'specs'`
- Add sonner toast notification when adding a product to the wishlist (3 components)
- Add sonner toast notification when removing a product from the wishlist (3 components)

### Out-of-Scope

- Removing/modifying the `ProductDetailModal.tsx` tabs (it already has no specs tab)
- Adding toast to the wishlist page itself (it already has cart toasts)
- Refactoring the profile page custom toast to use sonner
- Adding E2E tests for these changes
- Backend changes (wishlist is client-side only via localStorage)

---

## Proposed Solution

### Overview

Remove the "Thông số" specifications tab and its associated data from the product detail page. Add sonner `toast.success()` and `toast()` calls to the wishlist toggle handlers in all three components (ProductCard, ProductDetailModal, product detail page) to provide visual feedback consistent with the existing add-to-cart toast pattern.

### User Flow

1. User navigates to product detail page → sees only "Mô tả sản phẩm" and "Đánh giá" tabs (no more "Thông số")
2. User clicks the heart icon on any product → toast shows "Đã thêm vào danh sách yêu thích" with an action button to view wishlist
3. User clicks the heart icon again to remove → toast shows "Đã xóa khỏi danh sách yêu thích"

---

## Requirements

### Functional Requirements

#### Remove Specifications Section

The product detail page must not render the "Thông số" tab or its content.

**Scenarios:**

- **WHEN** user visits `/products/[id]` **THEN** only "Mô tả sản phẩm" and "Đánh giá" tabs are visible
- **WHEN** user clicks between tabs **THEN** the tab system works correctly with only 2 tabs
- **WHEN** `activeTab` state initializes **THEN** it defaults to `'description'` (no change)

#### Wishlist Toast Notification

Adding/removing products from the wishlist shows a sonner toast notification.

**Scenarios:**

- **WHEN** user clicks the heart icon to add a product to wishlist **THEN** a success toast appears with the message "Đã thêm vào danh sách yêu thích" and an action button "Xem danh sách"
- **WHEN** user clicks the heart icon to remove a product from wishlist **THEN** a toast appears with the message "Đã xóa khỏi danh sách yêu thích"
- **WHEN** user adds to wishlist from ProductCard **THEN** toast appears (same behavior)
- **WHEN** user adds to wishlist from ProductDetailModal **THEN** toast appears (same behavior)
- **WHEN** user adds a product already in the wishlist **THEN** no duplicate is added (existing behavior, no change needed — context reducer is idempotent)

### Non-Functional Requirements

- **Performance:** No additional API calls — wishlist is fully client-side
- **Consistency:** Toast style must match existing add-to-cart toasts (sonner, top-right, 4s duration)
- **Accessibility:** Toast is announced by screen readers (sonner handles this by default)

---

## Success Criteria

- [ ] The "Thông số" tab is no longer visible on the product detail page
  - Verify: `Navigate to /products/1 → confirm only 2 tabs visible`
- [ ] The specifications data is removed from the source code
  - Verify: `grep -r "specifications" frontend/src/app/products/\[id\]/page.tsx` returns no matches
- [ ] Adding to wishlist shows a toast notification in ProductCard
  - Verify: `Click heart icon on any product card → toast appears`
- [ ] Adding to wishlist shows a toast notification in ProductDetailModal
  - Verify: `Open product modal → click heart → toast appears`
- [ ] Adding to wishlist shows a toast notification on product detail page
  - Verify: `Navigate to /products/1 → click heart → toast appears`
- [ ] Removing from wishlist shows a toast notification in all 3 components
  - Verify: `Click filled heart icon → "removed" toast appears`
- [ ] TypeScript compiles without errors
  - Verify: `cd frontend && npx tsc --noEmit`
- [ ] Lint passes
  - Verify: `cd frontend && npm run lint`

---

## Technical Context

### Existing Patterns

- **Toast (add-to-cart):** `frontend/src/components/ProductCard.tsx:196-208` — Uses `toast.success()` from sonner with `id` for deduplication, `description` for subtitle, `action` for navigation
- **Wishlist toggle:** `frontend/src/contexts/WishlistContext.tsx:157-163` — `addToWishlist` / `removeFromWishlist` / `isInWishlist` via React Context
- **Tab system:** `frontend/src/app/products/[id]/page.tsx:857-878` — Array-based tab rendering with `activeTab` state

### Key Files

- `frontend/src/app/products/[id]/page.tsx` — Product detail page (981 lines, client component)
- `frontend/src/components/ProductCard.tsx` — Product card with wishlist toggle
- `frontend/src/components/ProductDetailModal.tsx` — Product modal with wishlist toggle
- `frontend/src/contexts/WishlistContext.tsx` — Wishlist state management
- `frontend/src/app/layout.tsx` — Sonner `<Toaster>` provider (already configured)

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/app/products/[id]/page.tsx # Remove specs tab/data + add wishlist toast
  - frontend/src/components/ProductCard.tsx # Add wishlist toast
  - frontend/src/components/ProductDetailModal.tsx # Add wishlist toast
```

---

## Tasks

### Remove specifications data from productExtras [cleanup]

The `productExtras` object no longer contains `specifications` fields, and its TypeScript type no longer includes `specifications: Record<string, string>`.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Remove specs tab UI"]
files:
  - frontend/src/app/products/[id]/page.tsx
```

**Verification:**

- `grep -n "specifications" frontend/src/app/products/\[id\]/page.tsx` returns no matches
- `cd frontend && npx tsc --noEmit` passes

### Remove specs tab UI [cleanup]

The tab list renders only "Mô tả sản phẩm" and "Đánh giá" tabs. The `activeTab` state type is `'description' | 'reviews'`. The `{activeTab === 'specs' && ...}` content block is removed.

**Metadata:**

```yaml
depends_on: ["Remove specifications data from productExtras"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/products/[id]/page.tsx
```

**Verification:**

- `grep -n "specs\|Thông số" frontend/src/app/products/\[id\]/page.tsx` returns no matches
- `cd frontend && npx tsc --noEmit` passes
- Navigate to `/products/1` and confirm only 2 tabs visible

### Add wishlist toast to ProductCard [feature]

Clicking the wishlist heart icon on `ProductCard` triggers a sonner toast: "Đã thêm vào danh sách yêu thích" (add) or "Đã xóa khỏi danh sách yêu thích" (remove), with an action button "Xem danh sách" linking to `/wishlist` on add.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Add wishlist toast to ProductDetailModal", "Add wishlist toast to product detail page"]
files:
  - frontend/src/components/ProductCard.tsx
```

**Verification:**

- `cd frontend && npx tsc --noEmit` passes
- Click heart on product card → toast appears top-right

### Add wishlist toast to ProductDetailModal [feature]

Clicking the wishlist heart icon on `ProductDetailModal` triggers a sonner toast with the same messaging pattern as ProductCard.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Add wishlist toast to ProductCard", "Add wishlist toast to product detail page"]
files:
  - frontend/src/components/ProductDetailModal.tsx
```

**Verification:**

- `cd frontend && npx tsc --noEmit` passes
- Open product modal → click heart → toast appears

### Add wishlist toast to product detail page [feature]

Clicking the wishlist heart icon on the product detail page triggers a sonner toast with the same messaging pattern as ProductCard.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Remove specs tab UI", "Remove specifications data from productExtras"]
files:
  - frontend/src/app/products/[id]/page.tsx
```

**Verification:**

- `cd frontend && npx tsc --noEmit` passes
- Navigate to `/products/1` → click heart → toast appears

---

## Notes

- The `specifications` data in `productExtras` is hardcoded mock data (not from the database API), making removal low-risk
- Sonner is already imported in all 3 affected files for the add-to-cart toast, so no new imports are needed
- The `useRouter` hook is already available in all 3 components for the action button navigation
- The wishlist toast should use `toast.success()` for add and `toast()` (default/info) for remove to differentiate the actions
- Toast deduplication: use `id: \`wishlist-${product.id}\`` pattern to prevent stacking
