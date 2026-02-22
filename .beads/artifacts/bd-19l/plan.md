# Product Description Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Product detail page, modal, and admin list display real descriptions from API instead of hardcoded mock data.

**Discovery Level:** 0 — Pure internal work. `description` field already exists in backend model, frontend types, API payload, and admin form. No new libraries or schema changes.

**Context Budget:** ~40% (S-M size, 5 files, straightforward changes)

---

## Must-Haves

### Observable Truths

1. Product detail page shows real description from API (not hardcoded mock)
2. ProductDetailModal shows real description from props (not hardcoded mock)
3. Admin product list has a "Mô tả" column with truncated text (max 50 chars)
4. Empty/missing description shows placeholder "Chưa có mô tả cho sản phẩm này"
5. All 16 seed products have unique, meaningful descriptions
6. `grep -r "productDetails["` returns 0 matches in both detail page and modal
7. TypeScript compiles without errors

### Required Artifacts

| Artifact                            | Provides                        | Path                                                                  |
| ----------------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| Product type with description       | Shared type infrastructure      | `frontend/src/components/ProductCard.tsx`                             |
| Updated mapping functions (3 files) | Description flows from API → UI | `products/[id]/page.tsx`, `products/page.tsx`, `FeaturedProducts.tsx` |
| Refactored detail page              | Real descriptions, no mock      | `frontend/src/app/products/[id]/page.tsx`                             |
| Refactored modal                    | Real descriptions, no mock      | `frontend/src/components/ProductDetailModal.tsx`                      |
| Admin description column            | Truncated description in table  | `frontend/src/components/admin/AdminProductsPanel.tsx`                |
| Seed descriptions                   | 16 unique product descriptions  | `backend/src/seed.js`                                                 |

### Key Links

| From                  | To                    | Via                                | Risk                                         |
| --------------------- | --------------------- | ---------------------------------- | -------------------------------------------- |
| `mapApiProductToCard` | `Product.description` | `description: product.description` | If not mapped → description undefined in UI  |
| Detail page JSX       | `product.description` | Direct prop access                 | If still referencing mock → shows wrong data |
| Admin table `<td>`    | `product.description` | `.slice(0, 50)`                    | Missing colSpan update → broken layout       |

## Dependency Graph

```
Task 1 (ProductCard type + mapping): needs nothing
  creates: description field in Product type + 3 mapApiProductToCard updates

Task 2 (Seed data): needs nothing
  creates: 16 unique descriptions in seed.js

Task 3 (Admin table column): needs nothing
  creates: Mô tả column in admin product list

Task 4 (Product detail page): needs Task 1
  creates: API-driven descriptions on detail page

Task 5 (ProductDetailModal): needs Task 1
  creates: API-driven descriptions in modal

Task 6 (Verification): needs Tasks 1-5

Wave 1: Tasks 1, 2, 3 (independent)
Wave 2: Tasks 4, 5 (depend on Task 1)
Wave 3: Task 6 (depends on all)
```

---

## Tasks

### Task 1: Add `description` to ProductCard.Product type + update all mappers

**Files:** `frontend/src/components/ProductCard.tsx`, `frontend/src/app/products/[id]/page.tsx`, `frontend/src/app/products/page.tsx`, `frontend/src/components/FeaturedProducts.tsx`

**Why:** The `Product` type in `ProductCard.tsx` has NO `description` field. The `mapApiProductToCard` function (defined in 3 separate files) strips `description` when converting `ApiProduct` → `Product`. Without this change, description data is lost during mapping.

**Step 1.1:** Add `description` to `ProductCard.Product` interface in `frontend/src/components/ProductCard.tsx`.

Find the `Product` interface and add after the last field:

```typescript
description?: string;
```

**Step 1.2:** Update `mapApiProductToCard` in `frontend/src/app/products/[id]/page.tsx` (lines 46-61).

Add to the return object:

```typescript
description: product.description,
```

**Step 1.3:** Update `mapApiProductToCard` in `frontend/src/app/products/page.tsx` (line 56).

Add to the return object:

```typescript
description: product.description,
```

**Step 1.4:** Update `mapApiProductToCard` in `frontend/src/components/FeaturedProducts.tsx` (line 21).

Add to the return object:

```typescript
description: product.description,
```

**Verification:**

```bash
cd frontend && npx tsc --noEmit
# Must pass — description is optional, so no breaking changes
```

---

### Task 2: Add unique descriptions to seed data

**File:** `backend/src/seed.js`

**Why:** All 16 products currently get the same generic template description: `"${name} - Sản phẩm chất lượng cao cho bé yêu"`. Each product needs a unique, meaningful Vietnamese description.

**Step 2.1:** Add `description` field to each of the 16 objects in `SEED_PRODUCTS` array (lines 32-145).

Each product should have a unique description of 50-150 characters in Vietnamese, relevant to the product type (baby clothes, toys, accessories, etc.).

Example format:

```javascript
{
  name: 'Áo thun bé trai họa tiết khủng long',
  description: 'Áo thun cotton mềm mại với họa tiết khủng long ngộ nghĩnh, thoáng mát và an toàn cho làn da nhạy cảm của bé.',
  price: 150000,
  quantity: 50,
  categoryName: 'Áo',
  imageIdx: 0,
},
```

**Step 2.2:** Update the product creation line (line 234) to use `productData.description` instead of the template:

```javascript
// BEFORE:
description: `${productData.name} - Sản phẩm chất lượng cao cho bé yêu`,

// AFTER:
description: productData.description,
```

**Verification:**

```bash
grep "description:" backend/src/seed.js | wc -l
# Must return >= 16 (one per product + the creation line)
cd backend && node -e "const s = require('./src/seed'); console.log('syntax ok')" 2>/dev/null || echo "Check manually"
```

---

### Task 3: Add description column to admin product list

**File:** `frontend/src/components/admin/AdminProductsPanel.tsx`

**Why:** Admin cannot see which products have descriptions. A truncated description column helps manage content.

**Step 3.1:** Add table header `<th>` for "Mô tả" after the "Tên" column header (around line 529).

```tsx
<th className="...">Mô tả</th>
```

Use the same styling as existing `<th>` elements.

**Step 3.2:** Add table data `<td>` for description after the product name cell (around line 568).

```tsx
<td className="...">
  {product.description ? (
    <span className="text-sm text-gray-600" title={product.description}>
      {product.description.length > 50
        ? `${product.description.slice(0, 50)}...`
        : product.description}
    </span>
  ) : (
    <span className="text-sm text-gray-400 italic">Chưa có mô tả</span>
  )}
</td>
```

**Step 3.3:** Update `colSpan` from `7` to `8` in the loading/empty state rows (around line 539).

**Verification:**

```bash
grep -i "mô tả\|description" frontend/src/components/admin/AdminProductsPanel.tsx | grep -i "th>\|td>\|truncat\|slice\|substring\|50"
# Must return matches
cd frontend && npx tsc --noEmit
```

---

### Task 4: Replace mock descriptions on product detail page

**File:** `frontend/src/app/products/[id]/page.tsx`

**Why:** Lines 191-288 contain a `productDetails` hardcoded mock object with fake `description` and `longDescription`. The page uses `productDetails[product.id]` to display descriptions instead of the real `product.description` from API.

**Step 4.1:** Rename `productDetails` → `productExtras` and remove `description`/`longDescription` fields.

The renamed object should ONLY contain: `features`, `specifications`, `colors`, `sizes`. Remove `description` and `longDescription` from all entries ('1', '2', '3', 'default').

```typescript
// BEFORE:
const productDetails: Record<string, {...}> = {
  '1': { description: '...', longDescription: '...', features: [...], ... },
  ...
};

// AFTER:
const productExtras: Record<string, { features: string[]; specifications: Record<string, string>; colors?: string[]; sizes?: string[] }> = {
  '1': { features: [...], specifications: {...}, colors: [...], sizes: [...] },
  '2': { features: [...], specifications: {...}, colors: [...], sizes: [...] },
  '3': { features: [...], specifications: {...} },
  'default': { features: [...], specifications: {...} },
};
```

**Step 4.2:** Update the `details` variable assignment (around line 432-434).

```typescript
// BEFORE:
const details = productDetails[product.id] || productDetails.default;

// AFTER:
const extras = productExtras[product.id] || productExtras.default;
```

**Step 4.3:** Replace description display (line 716 — short description below price).

```tsx
// BEFORE:
{
  details.description;
}

// AFTER:
{
  product.description || "Chưa có mô tả cho sản phẩm này";
}
```

**Step 4.4:** Replace long description display (line 923 — "Mô tả sản phẩm" tab).

```tsx
// BEFORE:
{
  details.longDescription;
}

// AFTER:
{
  product.description || "Chưa có mô tả cho sản phẩm này";
}
```

**Step 4.5:** Update all remaining references from `details.` → `extras.` for features, specifications, colors, sizes. Search for `details.features`, `details.specifications`, `details.colors`, `details.sizes` and replace with `extras.features`, etc.

**Verification:**

```bash
grep -c "productDetails\[" frontend/src/app/products/\[id\]/page.tsx
# Must return 0

grep "product\.description\|product?.description\|Chưa có mô tả" frontend/src/app/products/\[id\]/page.tsx
# Must return matches

cd frontend && npx tsc --noEmit
```

---

### Task 5: Replace mock descriptions in ProductDetailModal

**File:** `frontend/src/components/ProductDetailModal.tsx`

**Why:** Lines 29-60 contain a `productDetails` hardcoded mock object with fake descriptions. The modal uses `productDetails[product.id]` instead of `product.description`.

**Step 5.1:** Rename `productDetails` → `productExtras` and remove `description` field.

Keep only `features` and `colors` (the modal doesn't use specifications/sizes).

```typescript
// AFTER:
const productExtras: Record<string, { features: string[]; colors?: string[] }> = {
  '1': { features: [...], colors: [...] },
  '2': { features: [...], colors: [...] },
  '3': { features: [...], colors: [...] },
  'default': { features: [...] },
};
```

**Step 5.2:** Update the `details` variable (line 73).

```typescript
// BEFORE:
const details = productDetails[product.id] || productDetails.default;

// AFTER:
const extras = productExtras[product.id] || productExtras.default;
```

**Step 5.3:** Replace description display (line 252 — "Chi tiết" tab).

```tsx
// BEFORE:
{
  details.description;
}

// AFTER:
{
  product.description || "Chưa có mô tả cho sản phẩm này";
}
```

**Step 5.4:** Update all remaining references from `details.` → `extras.` for features and colors.

**Verification:**

```bash
grep -c "productDetails\[" frontend/src/components/ProductDetailModal.tsx
# Must return 0

grep "description\|Chưa có mô tả" frontend/src/components/ProductDetailModal.tsx
# Must return matches

cd frontend && npx tsc --noEmit
```

---

### Task 6: End-to-end verification

**Depends on:** All Tasks 1-5

**Step 6.1:** TypeScript compilation

```bash
cd frontend && npx tsc --noEmit
```

**Step 6.2:** ESLint

```bash
cd frontend && npx eslint src/app/products/\[id\]/page.tsx src/components/ProductDetailModal.tsx src/components/admin/AdminProductsPanel.tsx
```

**Step 6.3:** PRD success criteria grep checks

```bash
# No more productDetails[ references
grep -r "productDetails\[" frontend/src/app/products/\[id\]/page.tsx | wc -l  # Must be 0
grep -r "productDetails\[" frontend/src/components/ProductDetailModal.tsx | wc -l  # Must be 0

# Admin has description column with truncation
grep -i "description\|mô tả" frontend/src/components/admin/AdminProductsPanel.tsx | grep -i "truncat\|slice\|substring\|50"

# Form still sends description
grep "description" frontend/src/components/admin/AdminProductsPanel.tsx | grep -i "payload\|productForm"

# Seed data has descriptions
grep "description:" backend/src/seed.js | wc -l  # Must be >= 16
```

**Step 6.4:** Confirm placeholder text exists

```bash
grep "Chưa có mô tả" frontend/src/app/products/\[id\]/page.tsx
grep "Chưa có mô tả" frontend/src/components/ProductDetailModal.tsx
grep "Chưa có mô tả" frontend/src/components/admin/AdminProductsPanel.tsx
```

---

## Summary

| Wave | Tasks                                                | Files Modified | Estimated Time |
| ---- | ---------------------------------------------------- | -------------- | -------------- |
| 1    | Task 1 (type+mapping), Task 2 (seed), Task 3 (admin) | 6 files        | 15 min         |
| 2    | Task 4 (detail page), Task 5 (modal)                 | 2 files        | 15 min         |
| 3    | Task 6 (verification)                                | 0 files        | 5 min          |

**Total:** ~35 min, 7 files modified

## Next Command

`/ship bd-19l`
