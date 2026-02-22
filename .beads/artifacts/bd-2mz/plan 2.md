# Admin Inventory Stock CRUD — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Add inventory (stock quantity) CRUD to the admin products panel so admins can view, create, and update product stock alongside existing product fields.

**Architecture:** The backend already stores `quantity` on the Product model and accepts it through the full CRUD stack (controller → service → repository). The frontend types already include `quantity`. The only gap is the admin UI (`AdminProductsPanel.tsx`) which doesn't expose `quantity` in form state, table columns, or create/update payloads. This plan adds stock as a first-class field in the admin UI and adds non-negative integer validation at both form and service layers.

**Tech Stack:** Next.js (React), TypeScript, Tailwind CSS, MongoDB/Mongoose, Express.js

**Decision:** Stock edits use absolute set only (admin types exact number). Delta adjustments are out of scope.

---

## Task 1: Add `quantity` to admin product form state and payload (PRD: api-1)

**Files:**

- Modify: `frontend/src/components/admin/AdminProductsPanel.tsx:16-21` (ProductFormState type)
- Modify: `frontend/src/components/admin/AdminProductsPanel.tsx:26-31` (createEmptyProductForm)
- Modify: `frontend/src/components/admin/AdminProductsPanel.tsx:202-225` (payload build in handleProductSubmit)
- Modify: `frontend/src/components/admin/AdminProductsPanel.tsx:269-281` (handleEditProduct form population)

**Step 1: Add `quantity` to `ProductFormState` type**

At `AdminProductsPanel.tsx:16-21`, add `quantity` field:

```tsx
type ProductFormState = {
  name: string;
  price: string;
  category: string;
  description: string;
  quantity: string; // ← ADD THIS
};
```

**Step 2: Add `quantity` to `createEmptyProductForm`**

At `AdminProductsPanel.tsx:26-31`, add default:

```tsx
const createEmptyProductForm = (categoryId = ""): ProductFormState => ({
  name: "",
  price: "",
  category: categoryId,
  description: "",
  quantity: "0", // ← ADD THIS (default stock = 0)
});
```

**Step 3: Add `quantity` to payload in `handleProductSubmit`**

At `AdminProductsPanel.tsx:202-225`, modify the payload object to include `quantity`:

```tsx
const payload: {
  name: string;
  price: number;
  category: string;
  description?: string;
  images?: string[];
  quantity: number; // ← ADD THIS
} = {
  name: productForm.name.trim(),
  price: Number(productForm.price),
  category: productForm.category,
  description: productForm.description.trim() || undefined,
  quantity: Number(productForm.quantity), // ← ADD THIS
};
```

**Step 4: Populate `quantity` in `handleEditProduct`**

At `AdminProductsPanel.tsx:269-281`, add quantity to the setProductForm call:

```tsx
setProductForm({
  name: product.name,
  price: String(product.price),
  category: typeof product.category === "string" ? product.category : product.category._id,
  description: product.description || "",
  quantity: String(product.quantity ?? 0), // ← ADD THIS
});
```

**Step 5: Verify typecheck passes**

Run: `npm --prefix frontend run typecheck`
Expected: PASS (may fail if quantity input JSX not yet added — that's Task 2)

**Step 6: Commit**

```bash
git add frontend/src/components/admin/AdminProductsPanel.tsx
git commit -m "feat(admin): add quantity to product form state and payload"
```

---

## Task 2: Add stock column to product table and input to modal form (PRD: frontend-1)

**Files:**

- Modify: `frontend/src/components/admin/AdminProductsPanel.tsx:423-431` (table header)
- Modify: `frontend/src/components/admin/AdminProductsPanel.tsx:441-485` (table row)
- Modify: `frontend/src/components/admin/AdminProductsPanel.tsx:548-562` (modal form, after price input)

**Step 1: Add "Tồn kho" column header to the table**

At `AdminProductsPanel.tsx:423-431`, add a new `<th>` after "Giá":

```tsx
<th className="py-2 pr-2">Ảnh</th>
<th className="py-2 pr-2">Tên</th>
<th className="py-2 pr-2">Giá</th>
<th className="py-2 pr-2">Tồn kho</th>  {/* ← ADD THIS */}
<th className="py-2 pr-2">Danh mục</th>
<th className="py-2 pr-2">Trạng thái</th>
<th className="py-2">Thao tác</th>
```

**Step 2: Add stock data cell to each table row**

In the table body row rendering (after the price `<td>`), add a new `<td>` for quantity:

```tsx
<td className="py-2 pr-2">{product.quantity ?? 0}</td>
```

**Step 3: Add stock input to the modal form**

After the "Giá bán" (price) input block (~line 562) and before the "Danh mục" select (~line 565), add a new input group:

```tsx
<div>
  <label htmlFor="product-quantity" className="mb-1 block text-sm font-medium">
    Tồn kho
  </label>
  <input
    id="product-quantity"
    type="number"
    min="0"
    step="1"
    className="w-full rounded border px-3 py-2"
    value={productForm.quantity}
    onChange={(e) => setProductForm((prev) => ({ ...prev, quantity: e.target.value }))}
    placeholder="0"
  />
</div>
```

**Step 4: Verify lint and typecheck pass**

Run: `npm --prefix frontend run lint`
Expected: PASS

Run: `npm --prefix frontend run typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/admin/AdminProductsPanel.tsx
git commit -m "feat(admin): add stock column to table and input to product modal"
```

---

## Task 3: Add stock validation at form and backend service boundaries (PRD: validation-1)

**Files:**

- Modify: `frontend/src/components/admin/AdminProductsPanel.tsx:202-208` (form validation)
- Modify: `backend/src/services/productService.js:46-69` (create validation)
- Modify: `backend/src/services/productService.js:72-91` (update validation)

**Step 1: Add frontend form validation for quantity**

In `handleProductSubmit`, after the existing required fields check (`AdminProductsPanel.tsx:202-208`), add quantity validation:

```tsx
// After existing validation:
// if (!productForm.name || !productForm.price || !productForm.category) { ... }

const quantityNum = Number(productForm.quantity);
if (productForm.quantity !== "" && (!Number.isInteger(quantityNum) || quantityNum < 0)) {
  setAdminError("Tồn kho phải là số nguyên không âm");
  return;
}
```

**Step 2: Add backend validation for quantity in `createProduct`**

In `productService.js`, inside `createProduct` function (after the category validation, before `return productRepository.create(data)`), add:

```js
if (data.quantity !== undefined && data.quantity !== null) {
  const qty = Number(data.quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    throw new ValidationError("Quantity must be a non-negative integer");
  }
  data.quantity = qty;
}
```

**Step 3: Add backend validation for quantity in `updateProduct`**

In `productService.js`, inside `updateProduct` function (after the sku uniqueness check, before `const product = await productRepository.update(id, data)`), add:

```js
if (data.quantity !== undefined && data.quantity !== null) {
  const qty = Number(data.quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    throw new ValidationError("Quantity must be a non-negative integer");
  }
  data.quantity = qty;
}
```

**Step 4: Verify backend lint passes**

Run: `npm --prefix backend run lint`
Expected: PASS

**Step 5: Verify backend test:ci passes**

Run: `npm --prefix backend run test:ci`
Expected: PASS (placeholder `echo + exit 0`)

**Step 6: Verify frontend build passes**

Run: `npm --prefix frontend run build`
Expected: PASS

**Step 7: Commit**

```bash
git add frontend/src/components/admin/AdminProductsPanel.tsx backend/src/services/productService.js
git commit -m "feat(admin): add stock validation at form and service layers"
```

---

## Task 4: Final CI verification (PRD: verification-1)

**Files:** No additional modifications. This task runs all CI checks.

**Step 1: Run all backend CI checks**

Run: `npm --prefix backend run lint`
Expected: PASS

Run: `npm --prefix backend run format:check`
Expected: PASS

Run: `npm --prefix backend run test:ci`
Expected: PASS

**Step 2: Run all frontend CI checks**

Run: `npm --prefix frontend run lint`
Expected: PASS

Run: `npm --prefix frontend run format:check`
Expected: PASS

Run: `npm --prefix frontend run typecheck`
Expected: PASS

Run: `npm --prefix frontend run build`
Expected: PASS

**Step 3: Fix any CI failures**

If any check fails, fix the issue in the relevant file and re-run.

Common issues to watch for:

- **format:check failure**: Run `npm --prefix frontend run format` or `npm --prefix backend run format` to auto-fix
- **lint failure**: Check for unused imports or style violations introduced in the changes
- **typecheck failure**: Verify `quantity` types align between `ProductFormState`, payload, and `ProductPayload`

**Step 4: Final commit (if fixes were needed)**

```bash
git add -A
git commit -m "fix: resolve CI check issues for inventory CRUD"
```

---

## Verification Checklist

After all tasks complete, confirm:

- [ ] Admin product table shows "Tồn kho" column with stock values
- [ ] Admin create product modal has stock input (defaults to 0)
- [ ] Admin edit product modal shows existing stock value
- [ ] Creating a product with stock value persists via API
- [ ] Updating product stock value persists via API
- [ ] Negative/non-integer stock values are rejected (frontend + backend)
- [ ] All 7 CI commands pass (3 backend + 4 frontend)

## Summary

| Task | PRD ID         | Description                          | Files Modified                                |
| ---- | -------------- | ------------------------------------ | --------------------------------------------- |
| 1    | api-1          | Add quantity to form state & payload | `AdminProductsPanel.tsx`                      |
| 2    | frontend-1     | Add stock column + modal input       | `AdminProductsPanel.tsx`                      |
| 3    | validation-1   | Frontend + backend validation        | `AdminProductsPanel.tsx`, `productService.js` |
| 4    | verification-1 | Full CI verification                 | (none — verification only)                    |

**Total:** 4 tasks, 16 steps, 2 files modified

## Next Command

`/ship bd-2mz`
