# Admin Navigation Full-Width Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Make admin navigation and content render across full viewport width (not cropped by constrained container), while keeping admin auth/redirect behavior intact.

**Architecture:** Keep `Header`/`Footer` unchanged. Update admin layout shell to remove `max-w-7xl` constraint and expose stable test selector. Keep sidebar behavior responsive; only adjust sidebar classes if needed after red-green checks. Add Playwright regression coverage that logs in as admin via JWT cookie (no hardcoded credentials) and asserts full-width shell + visible navigation.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Playwright

---

### Task 1: Add failing regression tests for full-width admin shell [test]

**Files:**

- Modify: `playwright/tests/rbac/admin-route-flow.spec.ts`
- Reference: `playwright/tests/rbac/admin-product-category.spec.ts`
- Reference: `frontend/src/app/admin/layout.tsx`

**Step 1: Add backend bootstrap + JWT helper code to admin route flow test**

Insert imports and helpers at top of `playwright/tests/rbac/admin-route-flow.spec.ts` so tests can create an admin cookie without fixed credentials.

```ts
import { type ChildProcess, spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const API_URL = "http://127.0.0.1:3001";
const backendDir = path.resolve(__dirname, "../../../backend");
const envPath = path.join(backendDir, ".env");

let backendProcess: ChildProcess | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseEnvValue = (content: string, key: string) => {
  const line = content
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${key}=`));

  if (!line) return null;
  const raw = line.slice(key.length + 1).trim();
  if (!raw) return null;
  return raw.replace(/^['"]|['"]$/g, "");
};

const resolveJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    const envContent = readFileSync(envPath, "utf8");
    return parseEnvValue(envContent, "JWT_SECRET");
  } catch {
    return null;
  }
};

const base64Url = (value: string) => Buffer.from(value).toString("base64url");

const signJwt = (payload: Record<string, unknown>, secret: string) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const waitForBackendReady = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error("Backend failed to become ready on /health");
};

test.beforeAll(async () => {
  backendProcess = spawn("npm", ["run", "start"], {
    cwd: backendDir,
    env: process.env,
    stdio: "pipe",
    shell: process.platform === "win32",
  });
  await waitForBackendReady();
});

test.afterAll(async () => {
  if (backendProcess) {
    backendProcess.kill("SIGTERM");
    backendProcess = null;
  }
});

const createAdminCookie = () => {
  const secret = resolveJwtSecret();
  expect(secret).toBeTruthy();

  const token = signJwt(
    {
      userId: "000000000000000000000001",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    secret as string,
  );

  return `accessToken=${token}`;
};
```

**Step 2: Add failing UI regression test (RED)**

Append this test inside the existing `test.describe("Admin route flow", ...)`:

```ts
test("admin layout shell is full-width and navigation is fully visible", async ({
  page,
  baseURL,
}) => {
  const cookieValue = createAdminCookie();
  const adminUrl = new URL("/admin/products", baseURL);

  await page.context().addCookies([
    {
      name: "accessToken",
      value: cookieValue.replace("accessToken=", ""),
      domain: adminUrl.hostname,
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/admin/products");

  const shell = page.locator('[data-testid="admin-layout-shell"]');
  await expect(shell).toBeVisible();
  await expect(shell).not.toHaveClass(/max-w-7xl/);

  const nav = page.locator('nav[aria-label="Điều hướng quản trị"]');
  await expect(nav).toBeVisible();
  await expect(nav.locator('a[href="/admin/products"]')).toBeVisible();
  await expect(nav.locator('a[href="/admin/categories"]')).toBeVisible();
});
```

**Step 3: Run only the new test and verify failure**

Run: `cd playwright && npx playwright test tests/rbac/admin-route-flow.spec.ts -g "full-width"`

Expected: FAIL because `data-testid="admin-layout-shell"` does not exist yet.

---

### Task 2: Implement full-width admin shell fix [layout]

**Files:**

- Modify: `frontend/src/app/admin/layout.tsx`

**Step 1: Add stable selector and remove constrained width classes**

Update the shell container in `frontend/src/app/admin/layout.tsx`:

```tsx
// BEFORE
<div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row">
  <AdminSidebar />
  <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
</div>

// AFTER
<div data-testid="admin-layout-shell" className="flex w-full flex-col md:flex-row">
  <AdminSidebar />
  <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
</div>
```

**Step 2: Re-run targeted test (GREEN)**

Run: `cd playwright && npx playwright test tests/rbac/admin-route-flow.spec.ts -g "full-width"`

Expected: PASS.

**Step 3: Run frontend static checks**

Run: `cd frontend && npm run typecheck`

Expected: PASS.

Run: `cd frontend && npm run lint`

Expected: PASS (or only unrelated pre-existing warnings).

---

### Task 3: Verify sidebar responsive visibility and preserve current behavior [ui]

**Files:**

- Modify (only if needed): `frontend/src/components/admin/AdminSidebar.tsx`
- Reference: `frontend/src/app/globals.css`

**Step 1: Add failing mobile assertion (RED)**

Add a second test in `playwright/tests/rbac/admin-route-flow.spec.ts`:

```ts
test("admin navigation remains reachable on mobile viewport", async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const cookieValue = createAdminCookie();
  const adminUrl = new URL("/admin/products", baseURL);
  await page.context().addCookies([
    {
      name: "accessToken",
      value: cookieValue.replace("accessToken=", ""),
      domain: adminUrl.hostname,
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/admin/products");

  const nav = page.locator('nav[aria-label="Điều hướng quản trị"]');
  await expect(nav).toBeVisible();
  await expect(nav).toHaveClass(/overflow-x-auto/);
  await expect(nav.locator('a[href="/admin/products"]')).toBeVisible();
  await expect(nav.locator('a[href="/admin/categories"]')).toBeVisible();
});
```

Run: `cd playwright && npx playwright test tests/rbac/admin-route-flow.spec.ts -g "mobile viewport"`

Expected: FAIL if navigation is clipped or selector assumptions are wrong.

**Step 2: Minimal sidebar class adjustments only if RED fails**

If failure indicates clipping, update only necessary classes in `frontend/src/components/admin/AdminSidebar.tsx`.

Allowed minimal changes:

```tsx
<aside className="w-full shrink-0 border-b border-pink-100 bg-white md:w-56 md:min-h-[calc(100vh-72px)] md:border-b-0 md:border-r">
  <nav
    aria-label="Điều hướng quản trị"
    className="flex gap-2 overflow-x-auto px-4 py-3 md:flex-col md:gap-1 md:overflow-visible"
  >
```

Only adjust classes if test proves breakage; do not widen scope.

**Step 3: Re-run mobile test (GREEN)**

Run: `cd playwright && npx playwright test tests/rbac/admin-route-flow.spec.ts -g "mobile viewport"`

Expected: PASS.

---

### Task 4: Preserve existing RBAC route behavior and finalize verification [routing]

**Files:**

- Modify: `playwright/tests/rbac/admin-route-flow.spec.ts`
- Verify only: `frontend/src/app/admin/page.tsx`, `frontend/src/app/admin/layout.tsx`

**Step 1: Run full admin route flow spec**

Run: `cd playwright && npx playwright test tests/rbac/admin-route-flow.spec.ts`

Expected: PASS for legacy tests plus new full-width/mobile tests.

**Step 2: Run frontend build**

Run: `cd frontend && npm run build`

Expected: PASS.

**Step 3: Run lint fix + final typecheck before commit**

Run: `cd frontend && npm run lint:fix`

Expected: PASS and any auto-fixes applied.

Run: `cd frontend && npm run typecheck`

Expected: PASS.

**Step 4: Commit**

```bash
git add frontend/src/app/admin/layout.tsx playwright/tests/rbac/admin-route-flow.spec.ts frontend/src/components/admin/AdminSidebar.tsx
git commit -m "fix: make admin navigation full-width and add regression coverage (bd-3ub)"
```

If `frontend/src/components/admin/AdminSidebar.tsx` is unchanged, remove it from `git add`.

---

## Verification Matrix

- Layout shell is full viewport width (no `max-w-7xl`) and addressable via `data-testid="admin-layout-shell"`.
- Admin navigation links remain visible and reachable on desktop + mobile viewport.
- Non-admin redirect behavior remains intact.
- `npm run lint:fix`, `npm run typecheck`, `npm run build`, and Playwright admin route flow spec pass.

## Execution Order

1. `Task 1` (RED)
2. `Task 2` (GREEN for full-width)
3. `Task 3` (mobile/regression hardening)
4. `Task 4` (full verification + commit)
