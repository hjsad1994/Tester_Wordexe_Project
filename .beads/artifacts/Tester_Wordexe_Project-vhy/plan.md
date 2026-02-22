# Remove Specs Section + Add Wishlist Toast — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Remove the "Thông số" specifications tab from the product detail page and add sonner toast notifications to all 3 wishlist toggle sites.

**Architecture:** Two independent change sets — (1) specs removal in page.tsx only, (2) toast additions in 3 files. All imports already exist (sonner, useRouter, useWishlist). No new dependencies needed.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, sonner ^2.0.7

---

## Must-Haves

**Goal:** Clean product detail tabs + consistent wishlist feedback

### Observable Truths

1. Product detail page shows only "Mô tả sản phẩm" and "Đánh giá" tabs (no "Thông số")
2. Clicking heart icon to add shows toast "Đã thêm vào danh sách yêu thích" with "Xem danh sách" action
3. Clicking heart icon to remove shows toast "Đã xóa khỏi danh sách yêu thích"
4. TypeScript compiles, lint passes

### Required Artifacts

| Artifact | Change | Path |
|----------|--------|------|
| Product detail page | Remove specs data/type/tab/content + add wishlist toast | `frontend/src/app/products/[id]/page.tsx` |
| ProductCard | Add wishlist toast | `frontend/src/components/ProductCard.tsx` |
| ProductDetailModal | Add wishlist toast | `frontend/src/components/ProductDetailModal.tsx` |

### Task Dependencies

```
Task 1 (ProductCard toast): needs nothing, modifies frontend/src/components/ProductCard.tsx
Task 2 (ProductDetailModal toast): needs nothing, modifies frontend/src/components/ProductDetailModal.tsx
Task 3 (page.tsx: remove specs + add toast): needs nothing, modifies frontend/src/app/products/[id]/page.tsx

Wave 1: Task 1, Task 2, Task 3 (all parallel — different files)
```

---

## Task 1: Add wishlist toast to ProductCard

**Files:**
- Modify: `frontend/src/components/ProductCard.tsx:113-131`

**Context:**
- `toast` imported at line 7: `import { toast } from 'sonner'`
- `useRouter` imported at line 5, instantiated at line 37: `const router = useRouter()`
- `useWishlist` destructured at line 39: `const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()`
- `liked` derived at line 41: `const liked = isInWishlist(product.id)`
- Existing cart toast pattern at lines 196-208 uses `toast.success()` with `id`, `description`, `action`

**Step 1: Add toast calls to wishlist toggle handler**

Replace the onClick handler in the wishlist button (lines 114-121):

```tsx
// BEFORE (lines 114-121):
onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  if (liked) {
    removeFromWishlist(product.id);
  } else {
    addToWishlist(product);
  }
}}

// AFTER:
onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  if (liked) {
    removeFromWishlist(product.id);
    toast('Đã xóa khỏi danh sách yêu thích', {
      id: `wishlist-${product.id}`,
    });
  } else {
    addToWishlist(product);
    toast.success('Đã thêm vào danh sách yêu thích', {
      id: `wishlist-${product.id}`,
      description: product.name,
      action: {
        label: 'Xem danh sách',
        onClick: () => router.push('/wishlist'),
      },
    });
  }
}}
```

**Step 2: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add frontend/src/components/ProductCard.tsx
git commit -m "feat(vhy): add wishlist toast to ProductCard

- toast.success on add with action button to /wishlist
- toast on remove with dedup id"
```

---

## Task 2: Add wishlist toast to ProductDetailModal

**Files:**
- Modify: `frontend/src/components/ProductDetailModal.tsx:157-173`

**Context:**
- `toast` imported at line 6: `import { toast } from 'sonner'`
- `useRouter` imported at line 4, instantiated at line 58: `const router = useRouter()`
- `useWishlist` destructured at line 57: `const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()`
- `liked` derived at line 62: `const liked = isInWishlist(product.id)`
- Existing cart toast pattern at lines 88-102

**Step 1: Add toast calls to wishlist toggle handler**

Replace the onClick handler in the wishlist button (lines 158-163):

```tsx
// BEFORE (lines 158-163):
onClick={() => {
  if (liked) {
    removeFromWishlist(product.id);
  } else {
    addToWishlist(product);
  }
}}

// AFTER:
onClick={() => {
  if (liked) {
    removeFromWishlist(product.id);
    toast('Đã xóa khỏi danh sách yêu thích', {
      id: `wishlist-${product.id}`,
    });
  } else {
    addToWishlist(product);
    toast.success('Đã thêm vào danh sách yêu thích', {
      id: `wishlist-${product.id}`,
      description: product.name,
      action: {
        label: 'Xem danh sách',
        onClick: () => router.push('/wishlist'),
      },
    });
  }
}}
```

**Step 2: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add frontend/src/components/ProductDetailModal.tsx
git commit -m "feat(vhy): add wishlist toast to ProductDetailModal

- toast.success on add with action button to /wishlist
- toast on remove with dedup id"
```

---

## Task 3: Remove specs section + Add wishlist toast to product detail page

**Files:**
- Modify: `frontend/src/app/products/[id]/page.tsx`

**Context:**
- `toast` imported at line 7, `useRouter` at line 5 (instantiated line 272), `useWishlist` at line 283
- Wishlist toggle handler at lines 537-559
- `productExtras` type at lines 193-201 (includes `specifications: Record<string, string>`)
- `productExtras` data has `specifications` at lines 211-216, 229-234, 245-250, 262-266
- `activeTab` state at line 276: `useState<'description' | 'specs' | 'reviews'>('description')`
- Tab list at lines 858-862 (includes `{ id: 'specs', label: 'Thông số' }`)
- Specs tab content block at lines 915-928

**Step 1: Remove `specifications` from productExtras type**

At lines 193-201, remove the `specifications` field from the type:

```tsx
// BEFORE:
const productExtras: Record<
  string,
  {
    features: string[];
    specifications: Record<string, string>;
    colors?: string[];
    sizes?: string[];
  }
> = {

// AFTER:
const productExtras: Record<
  string,
  {
    features: string[];
    colors?: string[];
    sizes?: string[];
  }
> = {
```

**Step 2: Remove `specifications` data from all 4 entries**

Remove these blocks from each entry:
- Lines 211-216 (entry '1'): remove `specifications: { ... },`
- Lines 229-234 (entry '2'): remove `specifications: { ... },`
- Lines 245-250 (entry '3'): remove `specifications: { ... },`
- Lines 262-266 (entry 'default'): remove `specifications: { ... },`

**Step 3: Remove `'specs'` from activeTab type**

At line 276:

```tsx
// BEFORE:
const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

// AFTER:
const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
```

**Step 4: Remove specs tab from tab list**

At lines 858-862, remove `{ id: 'specs', label: 'Thông số' }`:

```tsx
// BEFORE:
{[
  { id: 'description', label: 'Mô tả sản phẩm' },
  { id: 'specs', label: 'Thông số' },
  { id: 'reviews', label: `Đánh giá (${product.reviews})` },
].map((tab) => (

// AFTER:
{[
  { id: 'description', label: 'Mô tả sản phẩm' },
  { id: 'reviews', label: `Đánh giá (${product.reviews})` },
].map((tab) => (
```

**Step 5: Remove specs tab content block**

Remove the entire block at lines 915-928:

```tsx
// REMOVE THIS ENTIRE BLOCK:
{activeTab === 'specs' && (
  <div className="animate-fadeIn">
    <div className="rounded-2xl border border-pink-100 overflow-hidden">
      {Object.entries(extras.specifications).map(([label, value], i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'bg-pink-50/50' : 'bg-white'}`}>
          <div className="w-1/3 px-6 py-4 font-medium text-[var(--text-primary)]">
            {label}
          </div>
          <div className="flex-1 px-6 py-4 text-[var(--text-secondary)]">{value}</div>
        </div>
      ))}
    </div>
  </div>
)}
```

**Step 6: Add toast calls to wishlist toggle handler**

Replace the onClick handler at lines 538-544:

```tsx
// BEFORE (lines 538-544):
onClick={() => {
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
  } else {
    addToWishlist(product);
  }
}}

// AFTER:
onClick={() => {
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
    toast('Đã xóa khỏi danh sách yêu thích', {
      id: `wishlist-${product.id}`,
    });
  } else {
    addToWishlist(product);
    toast.success('Đã thêm vào danh sách yêu thích', {
      id: `wishlist-${product.id}`,
      description: product.name,
      action: {
        label: 'Xem danh sách',
        onClick: () => router.push('/wishlist'),
      },
    });
  }
}}
```

**Step 7: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

Run: `grep -n "specifications\|specs\|Thông số" frontend/src/app/products/\[id\]/page.tsx`
Expected: No matches

**Step 8: Commit**

```bash
git add frontend/src/app/products/[id]/page.tsx
git commit -m "feat(vhy): remove specs tab + add wishlist toast on product detail page

- Remove specifications from productExtras type and data
- Remove specs tab from tab list and activeTab type
- Remove specs tab content block
- Add wishlist toast with dedup id and action button"
```

---

## Final Verification

After all tasks complete:

```bash
cd frontend && npx tsc --noEmit    # TypeScript check
cd frontend && npm run lint         # Lint check
```

Both must pass with zero errors.
