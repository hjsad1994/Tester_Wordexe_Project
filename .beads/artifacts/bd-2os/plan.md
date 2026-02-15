# Admin Route Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `skill({ name: "executing-plans" })` to implement this plan task-by-task.

**Goal:** Move admin product/category CRUD out of public pages into a dedicated `/admin` route with left sidebar navigation while preserving existing UI style and RBAC behavior.

**Architecture:** Add a nested App Router admin layout under `frontend/src/app/admin/` that reuses existing site shell (`Header`, `Footer`) and gates UI with `useAuth().isAdmin`. Extract the existing product and category admin CRUD logic into `frontend/src/components/admin/AdminProductsPanel.tsx` and `frontend/src/components/admin/AdminCategoriesPanel.tsx`, then remove embedded admin sections from public pages. Route `/admin` redirects to `/admin/products`.

**Tech Stack:** Next.js App Router, React client components, Tailwind CSS utilities, existing API client in `frontend/src/lib/api.ts`, Playwright for regression checks.

**Decisions locked:**

- `/admin` defaults to redirecting to `/admin/products`
- Admin category CRUD is fully removed from homepage `Categories.tsx`

---

## Phase 0: Guard and Baseline

### Task 0.1: Validate branch/artifacts before implementation

**Files:**

- Read: `.beads/artifacts/bd-2os/prd.md`
- Read: `.beads/artifacts/bd-2os/prd.json`

**Step 1: Confirm bead status and branch**

Run: `br show bd-2os && git branch --show-current`

Expected:

- bead status is `IN_PROGRESS`
- branch is `feat/bd-2os-admin-panel-redesign`

**Step 2: Confirm baseline checks are currently green**

Run:

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`

Expected:

- Both commands exit 0

---

## Phase 1 (PRD frontend-1): Admin route shell + sidebar

### Task 1.1: Create sidebar component

**Files:**

- Create: `frontend/src/components/admin/AdminSidebar.tsx`

**Step 1: Add full component**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavItems = [
  { label: "Sản phẩm", href: "/admin/products" },
  { label: "Danh mục", href: "/admin/categories" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-pink-100 bg-white min-h-[calc(100vh-64px)]">
      <nav className="flex flex-col gap-1 p-3" aria-label="Điều hướng quản trị">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Quản trị
        </p>
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-pink-100 text-pink-600"
                  : "text-[var(--text-secondary)] hover:bg-pink-50 hover:text-pink-500"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Step 2: Fast compile check**

Run: `cd frontend && npm run typecheck`

Expected: no errors from `AdminSidebar.tsx`

### Task 1.2: Create admin route layout + redirect page

**Files:**

- Create: `frontend/src/app/admin/layout.tsx`
- Create: `frontend/src/app/admin/page.tsx`

**Step 1: Add admin layout**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--warm-white)]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-[var(--text-muted)]">Đang tải...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
```

**Step 2: Add `/admin` redirect page**

```tsx
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/products");
}
```

**Step 3: Add placeholder pages for route completeness**

Create files:

- `frontend/src/app/admin/products/page.tsx`
- `frontend/src/app/admin/categories/page.tsx`

Temporary content (will be replaced in Phase 2):

```tsx
"use client";

export default function Page() {
  return null;
}
```

**Step 4: Verify shell compiles**

Run: `cd frontend && npm run typecheck`

Expected: exit 0

---

## Phase 2 (PRD frontend-2 + frontend-3): Extract product/category admin CRUD

### Task 2.1: Extract product admin panel to component

**Files:**

- Create: `frontend/src/components/admin/AdminProductsPanel.tsx`
- Modify: `frontend/src/app/admin/products/page.tsx`
- Modify: `frontend/src/app/products/page.tsx`

**Step 1 (TDD-RED): Add failing regression assertion in Playwright for old anchor**

Create/append test in `playwright/tests/admin/admin-routing.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("admin entry no longer points to products admin anchor", async ({ page }) => {
  await page.goto("/");
  const adminLinks = page.locator('a[href="/products#admin-panel"]');
  await expect(adminLinks).toHaveCount(0);
});
```

Run: `cd playwright && npm test -- tests/admin/admin-routing.spec.ts`

Expected now (before implementation): FAIL because header still has `/products#admin-panel`.

**Step 2: Create `AdminProductsPanel` by moving admin block unchanged**

Source of truth to move from `frontend/src/app/products/page.tsx`:

- state block: admin state near current `isAdmin` block
- handlers: `loadAdminData`, `resetProductForm`, `handleProductSubmit`, `handleEditProduct`, `handleDeleteProduct`
- JSX: current `<section id="admin-panel">...</section>` content, converted to root `<div>` (remove id)

Required imports in new file:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  type Category as ApiCategory,
  type Product as ApiProduct,
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  fetchCategories as fetchCategoriesApi,
  fetchProducts as fetchProductsApi,
  updateProduct as updateProductApi,
} from "@/lib/api";
```

Component export:

```tsx
export default function AdminProductsPanel() {
  // moved admin state + handlers + JSX
}
```

**Step 3: Wire products admin page**

Replace `frontend/src/app/admin/products/page.tsx` with:

```tsx
"use client";

import AdminProductsPanel from "@/components/admin/AdminProductsPanel";

export default function AdminProductsPage() {
  return <AdminProductsPanel />;
}
```

**Step 4: Remove embedded admin panel from public products page**

From `frontend/src/app/products/page.tsx`, remove:

- admin-only imports from `@/lib/api`
- `useAuth` import and `const { isAdmin } = useAuth();`
- admin state/handlers/effects
- admin CTA button that scrolls to `#admin-panel`
- full `{isAdmin && <section id="admin-panel">...` block

Leave all public catalog/search/filter rendering unchanged.

**Step 5 (TDD-GREEN): Run focused checks**

Run:

- `cd frontend && npm run typecheck`
- `cd frontend && npm run lint`

Expected: both exit 0

### Task 2.2: Extract category admin panel to component

**Files:**

- Create: `frontend/src/components/admin/AdminCategoriesPanel.tsx`
- Modify: `frontend/src/app/admin/categories/page.tsx`
- Modify: `frontend/src/components/Categories.tsx`

**Step 1 (TDD-RED): Add failing assertion for homepage admin controls absence**

Append to `playwright/tests/admin/admin-routing.spec.ts`:

```ts
test("homepage categories does not render admin category button", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "+ Thêm danh mục" })).toHaveCount(0);
});
```

Run: `cd playwright && npm test -- tests/admin/admin-routing.spec.ts`

Expected now (before implementation): FAIL if admin button is still present under admin session; may PASS for anonymous users. If PASS due anonymous default, keep test but add a route-level test for `/admin/categories` in Task 3.

**Step 2: Create `AdminCategoriesPanel` by moving admin block unchanged**

Move from `frontend/src/components/Categories.tsx`:

- admin state block
- admin handlers
- admin panel JSX currently gated by `isAdmin`

Required imports in new file:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  type Category as ApiCategory,
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/lib/api";
```

Export:

```tsx
export default function AdminCategoriesPanel() {
  // moved admin state + handlers + JSX
}
```

**Step 3: Wire categories admin page**

Replace `frontend/src/app/admin/categories/page.tsx` with:

```tsx
"use client";

import AdminCategoriesPanel from "@/components/admin/AdminCategoriesPanel";

export default function AdminCategoriesPage() {
  return <AdminCategoriesPanel />;
}
```

**Step 4: Remove admin CRUD from homepage categories component**

From `frontend/src/components/Categories.tsx`, remove:

- `useAuth` + category CRUD API imports
- all admin state/effects/handlers
- admin button `+ Thêm danh mục`
- admin table/form block

Keep public category cards and promo section unchanged.

**Step 5 (TDD-GREEN): Run focused checks**

Run:

- `cd frontend && npm run typecheck`
- `cd frontend && npm run lint`

Expected: both exit 0

---

## Phase 3 (PRD frontend-4 + testing-1): Navigation updates + regression coverage

### Task 3.1: Update header admin entry links

**Files:**

- Modify: `frontend/src/components/Header.tsx`

**Step 1: Update desktop link**

Change:

```tsx
href = "/products#admin-panel";
```

to:

```tsx
href = "/admin";
```

**Step 2: Update mobile link**

Change the same href in mobile menu admin link from `/products#admin-panel` to `/admin`.

**Step 3: Verify typecheck**

Run: `cd frontend && npm run typecheck`

Expected: exit 0

### Task 3.2: Add regression coverage for new admin route flow

**Files:**

- Create/Modify: `playwright/tests/admin/admin-routing.spec.ts`

**Step 1: Finalize tests (GREEN target)**

Minimum suite:

```ts
import { test, expect } from "@playwright/test";

test("old admin anchor link is removed", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="/products#admin-panel"]')).toHaveCount(0);
});

test("/admin redirects non-admin users away from admin content", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin\/products$/);
});

test("products page no longer has admin panel section", async ({ page }) => {
  await page.goto("/products");
  await expect(page.locator("#admin-panel")).toHaveCount(0);
});
```

Notes:

- Keep tests resilient to auth state assumptions.
- If route redirect target differs by middleware/SSR, assert absence of admin shell instead of exact URL.

**Step 2: Run targeted test file**

Run: `cd playwright && npm test -- tests/admin/admin-routing.spec.ts`

Expected: PASS

**Step 3: Run full required verification**

Run in order:

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd playwright && npm test`

Expected:

- all commands exit 0

---

## Completion Checklist (must be true before `/ship` close)

- `frontend/src/app/admin/layout.tsx` exists and renders left sidebar shell
- `frontend/src/app/admin/page.tsx` redirects to `/admin/products`
- `frontend/src/app/admin/products/page.tsx` renders extracted admin products panel
- `frontend/src/app/admin/categories/page.tsx` renders extracted admin categories panel
- `frontend/src/app/products/page.tsx` has no admin panel section and no `#admin-panel`
- `frontend/src/components/Categories.tsx` has no embedded admin CRUD controls
- `frontend/src/components/Header.tsx` admin links point to `/admin` on desktop and mobile
- regression test file for admin route behavior exists and passes
- `npm run lint`, `npm run typecheck`, and Playwright suite are green

---

## Suggested Commit Cadence

1. `feat(admin): add admin route layout and sidebar shell`
2. `feat(admin): extract product CRUD to admin products page`
3. `feat(admin): extract category CRUD to admin categories page`
4. `feat(nav): route admin entry links to /admin`
5. `test(admin): add regression coverage for admin route migration`

---

## Execution Command

Next command: `/ship bd-2os`
