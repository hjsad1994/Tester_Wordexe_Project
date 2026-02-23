# Profile & Account Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Fix four profile/account issues: password change, order history, checkout address loading, and avatar upload UX.

**Architecture:** Two new backend endpoints (PATCH /me/password, GET /orders/my) following existing controller→service→repository pattern. Four frontend changes in profile/page.tsx, api.ts, and checkout/page.tsx.

**Tech Stack:** Express.js (CommonJS), Mongoose/MongoDB, bcrypt, Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Sonner toasts

---

## Must-Haves

**Goal:** Users can change passwords, view real order history, have checkout address reliably pre-fill, and preview avatars before uploading.

### Observable Truths

1. User can change their password by verifying current password first
2. User sees their real orders from MongoDB on the profile page
3. Checkout address fields pre-fill reliably regardless of auth bootstrap timing
4. User can preview avatar before uploading, with explicit save/cancel buttons

### Required Artifacts

| Artifact                         | Provides                               | Path                                         |
| -------------------------------- | -------------------------------------- | -------------------------------------------- |
| Password change route            | PATCH /me/password endpoint            | `backend/src/routes/userRoutes.js`           |
| Password change controller       | Request handling + validation          | `backend/src/controllers/userController.js`  |
| Password change service          | bcrypt verify + update logic           | `backend/src/services/userService.js`        |
| findByIdWithPassword repo method | User with password field               | `backend/src/repositories/userRepository.js` |
| Order history route              | GET /my endpoint                       | `backend/src/routes/orderRoutes.js`          |
| Order history controller         | Request handling                       | `backend/src/controllers/orderController.js` |
| Order history service method     | Query by user ID                       | `backend/src/services/orderService.js`       |
| User order index                 | Fast query by user + date              | `backend/src/models/Order.js`                |
| changePassword API function      | Frontend API call                      | `frontend/src/lib/api.ts`                    |
| fetchMyOrders API function       | Frontend API call                      | `frontend/src/lib/api.ts`                    |
| Password form wiring             | Real submit handler                    | `frontend/src/app/profile/page.tsx`          |
| Order history integration        | Real data + loading/empty/error states | `frontend/src/app/profile/page.tsx`          |
| Avatar preview + save button     | Preview before upload UX               | `frontend/src/app/profile/page.tsx`          |
| Checkout loading guard           | isLoading check                        | `frontend/src/app/checkout/page.tsx`         |

### Key Links

| From              | To                 | Via                 | Risk                                    |
| ----------------- | ------------------ | ------------------- | --------------------------------------- |
| Password form     | PATCH /me/password | fetch + credentials | bcrypt timing, error messages           |
| Order history tab | GET /orders/my     | fetch + credentials | Empty state handling, type mismatch     |
| Checkout form     | AuthContext.user   | useEffect           | Race condition if isLoading not checked |
| Avatar preview    | Cloudinary upload  | POST /me/avatar     | Memory leak from ObjectURL              |

### Task Dependencies

```
Task 1 (Backend password): needs nothing, creates PATCH /me/password
Task 2 (Backend orders): needs nothing, creates GET /orders/my
Task 3 (Checkout guard): needs nothing, modifies checkout/page.tsx
Task 4 (Avatar preview): needs nothing, modifies profile/page.tsx
Task 5 (Password wiring): needs Task 1, modifies api.ts + profile/page.tsx
Task 6 (Order history): needs Task 2, modifies api.ts + profile/page.tsx

Wave 1: Tasks 1, 2, 3 (parallel — independent files)
Wave 2: Task 4 (profile/page.tsx — no backend dep)
Wave 3: Task 5 (api.ts + profile/page.tsx — depends on Task 1)
Wave 4: Task 6 (api.ts + profile/page.tsx — depends on Task 2)
```

---

## Task 1: Backend Password Change Endpoint

**Files:**

- Modify: `backend/src/repositories/userRepository.js` — add `findByIdWithPassword`
- Modify: `backend/src/services/userService.js` — add `changePassword` method
- Modify: `backend/src/controllers/userController.js` — add `changePassword` handler
- Modify: `backend/src/routes/userRoutes.js` — add `PATCH /me/password` route

### Step 1: Add `findByIdWithPassword` to repository

In `backend/src/repositories/userRepository.js`, add this function before the `module.exports`:

```js
const findByIdWithPassword = (id) => User.findById(id).select("+password").exec();
```

Then add `findByIdWithPassword` to the exports object:

```js
module.exports = {
  findByEmail,
  existsByEmail,
  createUser,
  findById,
  updateById,
  findByIdWithPassword,
};
```

### Step 2: Add `changePassword` to service

In `backend/src/services/userService.js`, add `bcrypt` import at line 1:

```js
const bcrypt = require("bcrypt");
```

Then add this method inside the `UserService` class, after the `uploadAvatar` method (before the closing `}`):

```js
  async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Vui lòng nhập đầy đủ mật khẩu');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new UnauthorizedError('Phiên đăng nhập không hợp lệ');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ValidationError('Mật khẩu hiện tại không đúng');
    }

    user.password = newPassword;
    await user.save();
  }
```

Note: `user.save()` triggers the pre-save hook in User.js which bcrypt-hashes the new password automatically.

### Step 3: Add controller handler

In `backend/src/controllers/userController.js`, add after the `uploadAvatar` export:

```js
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  await userService.changePassword(req.userId, { currentPassword, newPassword });
  sendSuccess(res, null, "Đổi mật khẩu thành công");
});
```

### Step 4: Add route

In `backend/src/routes/userRoutes.js`, add before the `module.exports`:

```js
router.patch("/me/password", authMiddleware, userController.changePassword);
```

### Step 5: Verify

```bash
# Start backend if not running
cd backend && node src/index.js &

# Test with wrong current password (should return error)
curl -s -X PATCH http://localhost:3001/api/users/me/password \
  -H "Cookie: accessToken=<valid-token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"wrong","newPassword":"newpass123"}' | jq .

# Test with correct current password (should return success)
curl -s -X PATCH http://localhost:3001/api/users/me/password \
  -H "Cookie: accessToken=<valid-token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"correct","newPassword":"newpass123"}' | jq .
```

### Step 6: Commit

```bash
git add backend/src/repositories/userRepository.js \
        backend/src/services/userService.js \
        backend/src/controllers/userController.js \
        backend/src/routes/userRoutes.js
git commit -m "feat(br-on5): add PATCH /me/password endpoint

- Add findByIdWithPassword to userRepository
- Add changePassword method to userService (bcrypt verify + save)
- Add changePassword controller handler
- Add PATCH /me/password route with authMiddleware"
```

---

## Task 2: Backend User Order History Endpoint

**Files:**

- Modify: `backend/src/models/Order.js` — add compound index `{ user: 1, createdAt: -1 }`
- Modify: `backend/src/services/orderService.js` — add `getMyOrders` method
- Modify: `backend/src/controllers/orderController.js` — add `getMyOrders` handler
- Modify: `backend/src/routes/orderRoutes.js` — add `GET /my` route

### Step 1: Add compound index to Order model

In `backend/src/models/Order.js`, find the existing indexes (near the end, before `module.exports`). There should be lines like:

```js
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
```

Add after them:

```js
orderSchema.index({ user: 1, createdAt: -1 });
```

### Step 2: Add `getMyOrders` to service

In `backend/src/services/orderService.js`, add this method inside the `OrderService` class, after the `softDeleteOrder` method:

```js
  async getMyOrders(userId) {
    const orders = await Order.find({
      user: userId,
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .select('-publicAccessToken -deletedAt -deletedBy -deleteReason -__v')
      .lean();

    return orders;
  }
```

### Step 3: Add controller handler

In `backend/src/controllers/orderController.js`, add after the last export:

```js
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.userId);
  sendSuccess(res, orders, "Lấy danh sách đơn hàng thành công");
});
```

### Step 4: Add route

In `backend/src/routes/orderRoutes.js`, add the `/my` route **BEFORE** the `/:id` route (important — Express matches routes in order, and `/my` would otherwise match `/:id`):

After `router.get('/', authMiddleware, requireRole('admin'), orderController.getAdminOrders);` add:

```js
router.get("/my", authMiddleware, orderController.getMyOrders);
```

This must come before `router.get('/:id', ...)`.

### Step 5: Verify

```bash
# Test with auth (should return user's orders)
curl -s http://localhost:3001/api/orders/my \
  -H "Cookie: accessToken=<valid-token>" | jq '.data | length'

# Test without auth (should return 401)
curl -s http://localhost:3001/api/orders/my | jq .
```

### Step 6: Commit

```bash
git add backend/src/models/Order.js \
        backend/src/services/orderService.js \
        backend/src/controllers/orderController.js \
        backend/src/routes/orderRoutes.js
git commit -m "feat(br-on5): add GET /orders/my endpoint for user order history

- Add compound index { user: 1, createdAt: -1 } to Order model
- Add getMyOrders method to orderService (sorted by newest, excludes deleted)
- Add getMyOrders controller handler
- Add GET /my route before /:id (route order matters)"
```

---

## Task 3: Frontend Checkout Address Loading Guard

**Files:**

- Modify: `frontend/src/app/checkout/page.tsx` — add `isLoading` guard

### Step 1: Destructure `isLoading` from `useAuth()`

In `frontend/src/app/checkout/page.tsx`, find line 42 where it says:

```tsx
const { user } = useAuth();
```

Change to:

```tsx
const { user, isLoading: isAuthLoading } = useAuth();
```

### Step 2: Add loading guard in the JSX

Find the return statement of `CheckoutContent`. The component should show a loading skeleton when auth is loading. Find the early return for empty cart (should be something like `if (checkoutItems.length === 0)`). Add this **before** that check:

```tsx
if (isAuthLoading) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-28 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="h-64 rounded-xl bg-gray-200" />
                <div className="h-48 rounded-xl bg-gray-200" />
              </div>
              <div className="h-80 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

### Step 3: Verify

```bash
cd frontend && npx tsc --noEmit
```

### Step 4: Commit

```bash
git add frontend/src/app/checkout/page.tsx
git commit -m "fix(br-on5): add loading guard for checkout address pre-fill

- Destructure isLoading from useAuth()
- Show skeleton while auth bootstraps
- Prevents empty address fields on direct navigation"
```

---

## Task 4: Frontend Avatar Upload with Preview and Save Button

**Files:**

- Modify: `frontend/src/app/profile/page.tsx` — refactor avatar upload UX

### Step 1: Add preview state variables

Find the state declarations around line 162-164 where `fileInputRef`, `avatarError`, `isUploadingAvatar` are declared. Add after `isUploadingAvatar`:

```tsx
const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
const [avatarFile, setAvatarFile] = useState<File | null>(null);
```

### Step 2: Add cleanup for ObjectURL

Add a `useEffect` cleanup for the preview URL. Place this after the existing useEffect hooks:

```tsx
useEffect(() => {
  return () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
  };
}, [avatarPreview]);
```

### Step 3: Refactor `handleAvatarChange` to preview-only

Replace the entire `handleAvatarChange` function. Currently it auto-uploads. Change it to only create a preview:

Find the existing `handleAvatarChange` function (around line 219) and replace it entirely with:

```tsx
const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    setAvatarError("Ảnh không được vượt quá 5MB");
    return;
  }

  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
    setAvatarError("Chỉ hỗ trợ định dạng JPG, PNG, WEBP hoặc GIF");
    return;
  }

  setAvatarError(null);
  if (avatarPreview) {
    URL.revokeObjectURL(avatarPreview);
  }
  setAvatarPreview(URL.createObjectURL(file));
  setAvatarFile(file);
};
```

### Step 4: Add avatar upload and cancel handlers

Add these two new functions after `handleAvatarChange`:

```tsx
const handleAvatarUpload = async () => {
  if (!avatarFile) return;

  setIsUploadingAvatar(true);
  setAvatarError(null);

  try {
    const updatedUser = await uploadAvatar(avatarFile);
    if (user) {
      setUser({ ...user, avatar: updatedUser.avatar });
    }
    syncUser({ ...authUser!, avatar: updatedUser.avatar });
    showToast("Cập nhật ảnh đại diện thành công");
    handleAvatarCancel();
  } catch (err) {
    setAvatarError(err instanceof Error ? err.message : "Không thể tải ảnh lên");
  } finally {
    setIsUploadingAvatar(false);
  }
};

const handleAvatarCancel = () => {
  if (avatarPreview) {
    URL.revokeObjectURL(avatarPreview);
  }
  setAvatarPreview(null);
  setAvatarFile(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};
```

Note: `authUser` and `syncUser` come from `useAuth()`. The component already destructures `const { user: authUser, syncUser } = useAuth();` — check the exact variable names used in the file and adjust accordingly.

### Step 5: Update the avatar section JSX

Find the avatar display area in the JSX (around lines 400-460). The avatar section should show:

- The preview image (if `avatarPreview` is set) instead of the current avatar
- "Cập nhật ảnh đại diện" and "Hủy" buttons when preview is active
- The camera icon only when no preview is active

Look for the avatar `<Image>` or `<img>` tag. Update the `src` prop to use preview when available:

```tsx
src={avatarPreview || user?.avatar || '/default-avatar.png'}
```

Then, below the avatar image area (after the camera icon button), add the action buttons that show when a preview is active:

```tsx
{
  avatarPreview && (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        onClick={handleAvatarUpload}
        disabled={isUploadingAvatar}
        className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-600 disabled:opacity-50"
      >
        {isUploadingAvatar ? "Đang tải..." : "Cập nhật ảnh đại diện"}
      </button>
      <button
        type="button"
        onClick={handleAvatarCancel}
        disabled={isUploadingAvatar}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        Hủy
      </button>
    </div>
  );
}
```

Hide the camera icon when preview is showing:

```tsx
{!avatarPreview && (
  <button onClick={handleAvatarClick} ...>
    <CameraIcon ... />
  </button>
)}
```

### Step 6: Verify

```bash
cd frontend && npx tsc --noEmit
```

### Step 7: Commit

```bash
git add frontend/src/app/profile/page.tsx
git commit -m "feat(br-on5): add avatar preview with explicit save/cancel buttons

- Add avatarPreview and avatarFile state
- Refactor handleAvatarChange to preview-only (no auto-upload)
- Add handleAvatarUpload for explicit save
- Add handleAvatarCancel to discard preview
- Add URL.revokeObjectURL cleanup to prevent memory leaks
- Show 'Cập nhật ảnh đại diện' and 'Hủy' buttons when preview active"
```

---

## Task 5: Frontend Password Change Wiring

**Files:**

- Modify: `frontend/src/lib/api.ts` — add `changePassword` function
- Modify: `frontend/src/app/profile/page.tsx` — wire `handlePasswordSubmit`

### Step 1: Add `changePassword` to api.ts

In `frontend/src/lib/api.ts`, add after the `uploadAvatar` function (around line 548):

```ts
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API}/users/me/password`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Không thể đổi mật khẩu"));
  }
}
```

### Step 2: Import `changePassword` in profile page

In `frontend/src/app/profile/page.tsx`, find the import from `@/lib/api` (around line 20):

```tsx
import { fetchMyProfile, UserProfile, updateMyProfile, uploadAvatar } from "@/lib/api";
```

Add `changePassword`:

```tsx
import {
  fetchMyProfile,
  UserProfile,
  updateMyProfile,
  uploadAvatar,
  changePassword,
} from "@/lib/api";
```

### Step 3: Add password loading state

Find the password-related state declarations (around lines 152-160). Add a loading state:

```tsx
const [isChangingPassword, setIsChangingPassword] = useState(false);
const [passwordRequestError, setPasswordRequestError] = useState<string | null>(null);
```

### Step 4: Wire `handlePasswordSubmit`

Find the existing `handlePasswordSubmit` function (around line 320). It currently shows a fake toast. Replace the entire function body:

```tsx
const handlePasswordSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!validatePasswordForm()) return;

  setIsChangingPassword(true);
  setPasswordRequestError(null);

  try {
    await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    showToast("Đổi mật khẩu thành công");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  } catch (err) {
    setPasswordRequestError(err instanceof Error ? err.message : "Không thể đổi mật khẩu");
  } finally {
    setIsChangingPassword(false);
  }
};
```

### Step 5: Update password form JSX

Find the password form submit button in the JSX. It should:

- Show loading state when `isChangingPassword` is true
- Display `passwordRequestError` if set

Update the submit button to include disabled state:

```tsx
<button type="submit" disabled={isChangingPassword} className="... disabled:opacity-50">
  {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
</button>
```

Add error display after the form (or before the submit button):

```tsx
{
  passwordRequestError && <p className="text-sm text-red-500">{passwordRequestError}</p>;
}
```

### Step 6: Verify

```bash
cd frontend && npx tsc --noEmit
```

### Step 7: Commit

```bash
git add frontend/src/lib/api.ts frontend/src/app/profile/page.tsx
git commit -m "feat(br-on5): wire password change form to real API

- Add changePassword() to api.ts
- Replace stubbed handlePasswordSubmit with real API call
- Add loading state and error handling
- Reset form on success, show error on failure"
```

---

## Task 6: Frontend Order History from MongoDB

**Files:**

- Modify: `frontend/src/lib/api.ts` — add `fetchMyOrders` function
- Modify: `frontend/src/app/profile/page.tsx` — replace mock data with real API

### Step 1: Add `fetchMyOrders` to api.ts

In `frontend/src/lib/api.ts`, add after the `changePassword` function:

```ts
export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch(`${API}/orders/my`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Không thể tải đơn hàng"));
  }
  const json: ApiResponse<Order[]> = await res.json();
  return json.data;
}
```

### Step 2: Import `fetchMyOrders` and types in profile page

Update the import from `@/lib/api` in `frontend/src/app/profile/page.tsx`:

```tsx
import {
  fetchMyProfile,
  UserProfile,
  updateMyProfile,
  uploadAvatar,
  changePassword,
  fetchMyOrders,
  Order as ApiOrder,
  OrderStatus,
} from "@/lib/api";
```

### Step 3: Remove mock data and local interfaces

Remove the `OrderItem` interface (lines 22-27), the `Order` interface (lines 29-35), and the `orderHistorySamples` array (lines 37-70). These will be replaced by the api.ts types.

### Step 4: Add order state variables

Replace any existing orders state with:

```tsx
const [orders, setOrders] = useState<ApiOrder[]>([]);
const [isLoadingOrders, setIsLoadingOrders] = useState(false);
const [ordersError, setOrdersError] = useState<string | null>(null);
```

### Step 5: Add order fetching effect

Add a useEffect that fetches orders when the orders tab is active:

```tsx
useEffect(() => {
  if (activeTab !== "orders") return;

  let cancelled = false;

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError(null);
    try {
      const data = await fetchMyOrders();
      if (!cancelled) {
        setOrders(data);
      }
    } catch (err) {
      if (!cancelled) {
        setOrdersError(err instanceof Error ? err.message : "Không thể tải đơn hàng");
      }
    } finally {
      if (!cancelled) {
        setIsLoadingOrders(false);
      }
    }
  };

  loadOrders();
  return () => {
    cancelled = true;
  };
}, [activeTab]);
```

### Step 6: Update StatusBadge component

Replace the existing `StatusBadge` component to map backend enum values to Vietnamese labels and colors:

```tsx
const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Đã thanh toán", className: "bg-blue-100 text-blue-800" },
  processing: { label: "Đang xử lý", className: "bg-indigo-100 text-indigo-800" },
  shipped: { label: "Đang giao", className: "bg-purple-100 text-purple-800" },
  delivered: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const info = STATUS_MAP[status] || { label: status, className: "bg-gray-100 text-gray-800" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
};
```

### Step 7: Update orders tab JSX

Replace the orders tab content. The JSX should handle three states:

**Loading state:**

```tsx
{
  isLoadingOrders && (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-5 w-20 rounded bg-gray-200" />
          </div>
          <div className="mt-4 h-4 w-48 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
```

**Error state:**

```tsx
{
  ordersError && !isLoadingOrders && (
    <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center">
      <p className="text-red-600">{ordersError}</p>
      <button
        type="button"
        onClick={() => setActiveTab("orders")}
        className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
      >
        Thử lại
      </button>
    </div>
  );
}
```

**Empty state:**

```tsx
{
  !isLoadingOrders && !ordersError && orders.length === 0 && (
    <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
      <PackageIcon className="mx-auto h-12 w-12 text-gray-300" />
      <p className="mt-4 text-gray-500">Bạn chưa có đơn hàng nào</p>
    </div>
  );
}
```

**Orders list:**

```tsx
{
  !isLoadingOrders && !ordersError && orders.length > 0 && (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order._id}
          className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
        >
          <button
            type="button"
            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <div>
              <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
              <p className="mt-1 text-sm text-gray-500">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
              <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
              {expandedOrder === order._id ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>

          {expandedOrder === order._id && (
            <div className="border-t border-gray-100 px-6 py-4">
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(item.productPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giảm giá</span>
                    <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-pink-500">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Step 8: Verify

```bash
cd frontend && npx tsc --noEmit
```

### Step 9: Commit

```bash
git add frontend/src/lib/api.ts frontend/src/app/profile/page.tsx
git commit -m "feat(br-on5): replace mock order history with real MongoDB data

- Add fetchMyOrders() to api.ts
- Remove orderHistorySamples mock data and local Order interface
- Add loading, empty, and error states for orders tab
- Update StatusBadge to map backend enum to Vietnamese labels
- Fetch orders when orders tab becomes active"
```

---

## Verification Checklist

After all tasks complete, run:

```bash
# TypeScript check
cd frontend && npx tsc --noEmit

# Backend should be running for manual testing
# Test password change API
# Test order history API
# Visual test: profile page password change
# Visual test: profile page order history
# Visual test: checkout address loading
# Visual test: avatar preview + save
```
