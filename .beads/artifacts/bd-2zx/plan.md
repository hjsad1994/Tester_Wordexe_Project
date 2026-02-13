# RBAC Roles (admin/user) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Add RBAC roles (admin/user) to enforce backend authorization on product/category write endpoints and expose role-aware controls in the frontend.

**Architecture:** Server-side enforcement via a reusable `requireRole` Express middleware applied to product/category write routes. The User mongoose schema gets a `role` field (enum: `admin`/`user`, default: `user`). JWT payload and auth responses include role. Frontend `AuthContext` consumes role for conditional UI rendering (UX-only, not security).

**Tech Stack:** Express.js + Mongoose (backend), Next.js 16 + React 19 + Tailwind v4 (frontend), Playwright (E2E tests)

---

## Task 1: Persist role in auth domain [backend]

**Files:**

- Modify: `backend/src/models/User.js`
- Modify: `backend/src/services/authService.js`

**Step 1: Add `role` field to User schema**

In `backend/src/models/User.js`, add `role` field to the schema after the `password` field:

```js
role: {
  type: String,
  enum: ['admin', 'user'],
  default: 'user',
},
```

**Step 2: Run lint to verify schema change**

Run: `cd backend && npm run lint`
Expected: PASS, no errors

**Step 3: Include `role` in `toUserResponse` and JWT payload**

In `backend/src/services/authService.js`:

1. Change `signToken` to accept `userId` and `role`:

```js
const signToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new InternalServerError("JWT_SECRET is not configured");
  }
  return jwt.sign({ userId, role }, secret, { expiresIn: TOKEN_EXPIRES_IN });
};
```

2. Add `role` to `toUserResponse`:

```js
const toUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});
```

3. Update `register` to pass role to `signToken`:

```js
const token = signToken(user._id.toString(), user.role);
```

4. Update `login` to pass role to `signToken`:

```js
const token = signToken(user._id.toString(), user.role);
```

**Step 4: Run lint to verify service changes**

Run: `cd backend && npm run lint`
Expected: PASS

**Step 5: Manual API verification**

1. Start backend: `cd backend && npm run dev`
2. Register a new user → response should include `role: "user"`
3. Login → response should include `role: "user"`
4. GET `/api/auth/me` → response should include `role: "user"`

**Step 6: Commit**

```bash
git add backend/src/models/User.js backend/src/services/authService.js
git commit -m "feat(auth): add role field to User schema and auth responses (bd-2zx)"
```

---

## Task 2: Create requireRole middleware & protect routes [backend]

**Files:**

- Create: `backend/src/middlewares/requireRole.js`
- Modify: `backend/src/middlewares/authMiddleware.js`
- Modify: `backend/src/routes/productRoutes.js`
- Modify: `backend/src/routes/categoryRoutes.js`

**Step 1: Update authMiddleware to include `role` on `req`**

In `backend/src/middlewares/authMiddleware.js`, add `req.userRole = payload.role;` after `req.userId = payload.userId;`:

```js
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors");

module.exports = (req, _res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    throw new UnauthorizedError("Bạn chưa đăng nhập");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    req.userRole = payload.role;
    return next();
  } catch {
    throw new UnauthorizedError("Phiên đăng nhập không hợp lệ");
  }
};
```

**Step 2: Create `requireRole` middleware**

Create `backend/src/middlewares/requireRole.js`:

```js
const { ForbiddenError } = require("../errors");

const requireRole = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      throw new ForbiddenError("Bạn không có quyền thực hiện hành động này");
    }
    return next();
  };
};

module.exports = requireRole;
```

**Step 3: Protect product write routes**

Replace `backend/src/routes/productRoutes.js` with:

```js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

// Public read routes
router.get("/", productController.getAllProducts);
router.get("/active", productController.getActiveProducts);
router.get("/search", productController.searchProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.get("/slug/:slug", productController.getProductBySlug);

// Admin-only write routes
router.post("/", authMiddleware, requireRole("admin"), productController.createProduct);
router.put("/:id", authMiddleware, requireRole("admin"), productController.updateProduct);
router.delete("/:id", authMiddleware, requireRole("admin"), productController.deleteProduct);

module.exports = router;
```

**Step 4: Protect category write routes**

Replace `backend/src/routes/categoryRoutes.js` with:

```js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

// Public read routes
router.get("/", categoryController.getAllCategories);
router.get("/active", categoryController.getActiveCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);

// Admin-only write routes
router.post("/", authMiddleware, requireRole("admin"), categoryController.createCategory);
router.put("/:id", authMiddleware, requireRole("admin"), categoryController.updateCategory);
router.delete("/:id", authMiddleware, requireRole("admin"), categoryController.deleteCategory);

module.exports = router;
```

**Step 5: Run lint**

Run: `cd backend && npm run lint`
Expected: PASS

**Step 6: Manual API verification**

1. As a regular `user`, attempt `POST /api/products` → expect `403 Forbidden`
2. As a regular `user`, attempt `PUT /api/products/:id` → expect `403 Forbidden`
3. As a regular `user`, attempt `DELETE /api/products/:id` → expect `403 Forbidden`
4. Same for category routes
5. Read routes (GET) still work without auth → expect `200 OK`

**Step 7: Commit**

```bash
git add backend/src/middlewares/authMiddleware.js backend/src/middlewares/requireRole.js backend/src/routes/productRoutes.js backend/src/routes/categoryRoutes.js
git commit -m "feat(auth): add requireRole middleware and protect product/category write routes (bd-2zx)"
```

---

## Task 3: Create admin seed script [backend]

**Files:**

- Create: `backend/src/scripts/seedAdmin.js`
- Modify: `backend/package.json`

**Step 1: Create seed script**

Create `backend/src/scripts/seedAdmin.js`:

```js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/database");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@babybliss.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "0900000000";

const seedAdmin = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
        console.log(`Updated existing user ${ADMIN_EMAIL} to admin role`);
      } else {
        console.log(`Admin user ${ADMIN_EMAIL} already exists`);
      }
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE,
        password: ADMIN_PASSWORD,
        role: "admin",
      });
      console.log(`Created admin user: ${ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error("Seed admin failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
```

**Step 2: Add seed script to package.json**

In `backend/package.json`, add to `"scripts"`:

```json
"seed:admin": "node src/scripts/seedAdmin.js"
```

**Step 3: Run lint**

Run: `cd backend && npm run lint`
Expected: PASS

**Step 4: Test seed script** (requires running MongoDB)

Run: `cd backend && npm run seed:admin`
Expected: "Created admin user: admin@babybliss.com" (or "already exists")

**Step 5: Commit**

```bash
git add backend/src/scripts/seedAdmin.js backend/package.json
git commit -m "feat(auth): add admin seed script (bd-2zx)"
```

---

## Task 4: Expose role in frontend AuthContext [frontend]

**Files:**

- Modify: `frontend/src/contexts/AuthContext.tsx`

**Step 1: Add `role` to `AuthUser` interface**

In `frontend/src/contexts/AuthContext.tsx`, update `AuthUser`:

```ts
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
}
```

**Step 2: Add `isAdmin` helper to context**

Add `isAdmin` to `AuthContextValue` interface:

```ts
interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthResult>;
}
```

In the `AuthProvider`, compute `isAdmin` before the `value` memo:

```ts
const isAdmin = isAuthenticated && user?.role === "admin";
```

Update the `value` memo:

```ts
const value = useMemo(
  () => ({ isAuthenticated, user, isLoading, isAdmin, login, logout, register }),
  [isAuthenticated, user, isLoading, isAdmin, login, logout, register],
);
```

**Step 3: Run typecheck and lint**

Run: `cd frontend && npm run typecheck && npm run lint`
Expected: PASS

**Step 4: Commit**

```bash
git add frontend/src/contexts/AuthContext.tsx
git commit -m "feat(auth): add role and isAdmin to AuthContext (bd-2zx)"
```

---

## Task 5: Add product/category API functions [frontend]

**Files:**

- Modify: `frontend/src/lib/api.ts`

**Step 1: Add product and category API types and functions**

Append to `frontend/src/lib/api.ts`:

```ts
// ============================================
// Product API
// ============================================

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.sort) searchParams.set("sort", params.sort);
  const res = await fetch(`${API_BASE_URL}/api/products?${searchParams}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.data;
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/api/products`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to create product");
  }
  const data = await res.json();
  return data.data;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update product");
  }
  const data = await res.json();
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to delete product");
  }
}

// ============================================
// Category API
// ============================================

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.data;
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to create category");
  }
  const data = await res.json();
  return data.data;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update category");
  }
  const data = await res.json();
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to delete category");
  }
}
```

**Step 2: Run typecheck and lint**

Run: `cd frontend && npm run typecheck && npm run lint`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat(api): add product and category CRUD API functions (bd-2zx)"
```

---

## Task 6: Gate admin controls in products page [frontend]

**Files:**

- Modify: `frontend/src/app/products/page.tsx`

**Step 1: Import `useAuth` and add admin state**

At the top of `ProductsPage`, import and use auth:

```tsx
import { useAuth } from "@/contexts/AuthContext";
```

Inside `ProductsPage` component, add:

```tsx
const { isAdmin } = useAuth();
```

**Step 2: Add admin "Add Product" button**

In the title row section (inside the `<div>` containing the `<h1>` and `<p>` with product count), add an admin-only button after the `<p>`:

```tsx
{
  isAdmin && (
    <button className="px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all">
      + Thêm sản phẩm
    </button>
  );
}
```

> [ASSUMPTION: The actual product CRUD modal/form UI will be wired up in a subsequent iteration. This task only adds the conditional visibility of the button based on role.]

**Step 3: Run typecheck and lint**

Run: `cd frontend && npm run typecheck && npm run lint`
Expected: PASS

**Step 4: Commit**

```bash
git add frontend/src/app/products/page.tsx
git commit -m "feat(ui): gate admin product controls behind role check (bd-2zx)"
```

---

## Task 7: Gate admin controls in categories [frontend]

**Files:**

- Modify: `frontend/src/components/Categories.tsx`

**Step 1: Import `useAuth` and conditionally render admin controls**

Add at top:

```tsx
import { useAuth } from "@/contexts/AuthContext";
```

Inside the `Categories` component:

```tsx
const { isAdmin } = useAuth();
```

**Step 2: Add admin "Add Category" button**

After the section header `<p>` description, add:

```tsx
{
  isAdmin && (
    <button className="mt-4 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all">
      + Thêm danh mục
    </button>
  );
}
```

**Step 3: Run typecheck and lint**

Run: `cd frontend && npm run typecheck && npm run lint`
Expected: PASS

**Step 4: Commit**

```bash
git add frontend/src/components/Categories.tsx
git commit -m "feat(ui): gate admin category controls behind role check (bd-2zx)"
```

---

## Task 8: Add Playwright RBAC regression tests [testing]

**Files:**

- Create: `playwright/tests/rbac/admin-product-category.spec.ts`

**Step 1: Create RBAC test file**

Create `playwright/tests/rbac/admin-product-category.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const API_URL = "http://localhost:3001";

// Helper to login and get cookie
async function loginAs(request: any, email: string, password: string): Promise<string> {
  const res = await request.post(`${API_URL}/api/auth/login`, {
    data: { email, password },
  });
  const cookies = res.headers()["set-cookie"] || "";
  return cookies;
}

test.describe("RBAC: Product write endpoints", () => {
  test("non-admin user gets 403 on POST /api/products", async ({ request }) => {
    const cookie = await loginAs(request, "user@test.com", "Test@12345");

    const res = await request.post(`${API_URL}/api/products`, {
      headers: { Cookie: cookie },
      data: { name: "Test Product", price: 100 },
    });
    expect(res.status()).toBe(403);
  });

  test("non-admin user gets 403 on PUT /api/products/:id", async ({ request }) => {
    const cookie = await loginAs(request, "user@test.com", "Test@12345");

    const res = await request.put(`${API_URL}/api/products/000000000000000000000000`, {
      headers: { Cookie: cookie },
      data: { name: "Updated" },
    });
    expect(res.status()).toBe(403);
  });

  test("non-admin user gets 403 on DELETE /api/products/:id", async ({ request }) => {
    const cookie = await loginAs(request, "user@test.com", "Test@12345");

    const res = await request.delete(`${API_URL}/api/products/000000000000000000000000`, {
      headers: { Cookie: cookie },
    });
    expect(res.status()).toBe(403);
  });

  test("unauthenticated request gets 401 on POST /api/products", async ({ request }) => {
    const res = await request.post(`${API_URL}/api/products`, {
      data: { name: "Test Product", price: 100 },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("RBAC: Category write endpoints", () => {
  test("non-admin user gets 403 on POST /api/categories", async ({ request }) => {
    const cookie = await loginAs(request, "user@test.com", "Test@12345");

    const res = await request.post(`${API_URL}/api/categories`, {
      headers: { Cookie: cookie },
      data: { name: "Test Category" },
    });
    expect(res.status()).toBe(403);
  });

  test("non-admin user gets 403 on PUT /api/categories/:id", async ({ request }) => {
    const cookie = await loginAs(request, "user@test.com", "Test@12345");

    const res = await request.put(`${API_URL}/api/categories/000000000000000000000000`, {
      headers: { Cookie: cookie },
      data: { name: "Updated" },
    });
    expect(res.status()).toBe(403);
  });

  test("non-admin user gets 403 on DELETE /api/categories/:id", async ({ request }) => {
    const cookie = await loginAs(request, "user@test.com", "Test@12345");

    const res = await request.delete(`${API_URL}/api/categories/000000000000000000000000`, {
      headers: { Cookie: cookie },
    });
    expect(res.status()).toBe(403);
  });
});

test.describe("RBAC: Admin allowed operations", () => {
  test("admin user can POST /api/products", async ({ request }) => {
    const cookie = await loginAs(request, "admin@babybliss.com", "Admin@123456");

    const res = await request.post(`${API_URL}/api/products`, {
      headers: { Cookie: cookie },
      data: {
        name: "RBAC Test Product",
        price: 99000,
        description: "Test product for RBAC",
        category: "000000000000000000000000",
      },
    });
    // Admin should NOT get 401 or 403
    expect([200, 201]).toContain(res.status());
  });

  test("admin user can POST /api/categories", async ({ request }) => {
    const cookie = await loginAs(request, "admin@babybliss.com", "Admin@123456");

    const res = await request.post(`${API_URL}/api/categories`, {
      headers: { Cookie: cookie },
      data: { name: "RBAC Test Category", description: "Test" },
    });
    expect([200, 201]).toContain(res.status());
  });
});

test.describe("RBAC: Read routes remain public", () => {
  test("unauthenticated user can GET /api/products", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/products`);
    expect(res.status()).toBe(200);
  });

  test("unauthenticated user can GET /api/categories", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/categories`);
    expect(res.status()).toBe(200);
  });
});
```

**Step 2: Run Playwright tests**

Run: `cd playwright && npx playwright test tests/rbac/`
Expected: All tests pass (requires backend running + seeded admin + test user registered)

**Step 3: Commit**

```bash
git add playwright/tests/rbac/admin-product-category.spec.ts
git commit -m "test(rbac): add RBAC regression tests for product/category endpoints (bd-2zx)"
```

---

## Verification (Full Suite)

After all tasks complete:

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run typecheck && npm run lint

# E2E
cd playwright && npx playwright test tests/rbac/
```

All must pass.

---

## Dependency Graph

```
Task 1 (User.role + auth response)
  |---> Task 2 (requireRole middleware + route protection)
  |---> Task 3 (admin seed script)
  +---> Task 4 (AuthContext role + isAdmin)
          +---> Task 5 (API functions)
                  |---> Task 6 (gate product admin controls)
                  +---> Task 7 (gate category admin controls)

Task 2 + Task 6 + Task 7 ---> Task 8 (Playwright RBAC tests)
```

**Parallel tracks:**

- Tasks 2, 3, 4 can run in parallel after Task 1
- Tasks 5, 6, 7 are sequential (5 → 6, 5 → 7, but 6 and 7 can be parallel)
- Task 8 requires all prior tasks

---

## Next Command

1. Run `/start bd-2zx` to claim the bead and create a branch
2. Run `/ship bd-2zx` to begin implementation
