# Profile & Account Improvements

**Bead:** br-on5  
**Created:** 2026-02-23  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: ["bd-1ez"] # bd-1ez touches checkout, may overlap on address logic
blocks: []
estimated_hours: 8
```

---

## Problem Statement

### What problem are we solving?

The user profile and account area has four incomplete or broken features:

1. **Change password does not work** — The profile page has a full password change form (3 fields, validation, submit button) but `handlePasswordSubmit` is stubbed: it shows a fake success toast without calling any API. No backend endpoint exists for password change.

2. **Order history shows mock data** — The "Đơn hàng" tab displays 3 hardcoded sample orders (`orderHistorySamples` at `profile/page.tsx:37-70`) instead of fetching real orders from MongoDB. No API endpoint exists for users to fetch their own orders (`GET /api/orders` is admin-only).

3. **Checkout address intermittently doesn't load** — The checkout pre-fills address from `AuthContext.user`, which bootstraps via `GET /api/auth/me`. If the user navigates to checkout before the auth bootstrap completes, address fields remain empty. There is no loading state guard or retry mechanism.

4. **Avatar upload has no explicit save button** — The current avatar upload auto-saves immediately on file selection (`handleAvatarChange` calls `uploadAvatar()` at line 243). Users cannot preview the image before uploading, and there's no "Update Avatar" button for explicit control.

### Why now?

These are core user-facing features that directly affect trust and usability:

- Users cannot change their passwords, which is a security gap
- Fake order history breaks user trust and provides no value
- Address not loading forces users to re-enter data, causing checkout abandonment
- Auto-save avatar upload can lead to accidental profile image changes

### Who is affected?

- **Primary users:** Registered customers who log in to manage their account, view orders, and checkout
- **Secondary users:** Admin users who may need to verify user accounts and order data

---

## Scope

### In-Scope

- Backend API endpoint for password change (`PATCH /api/users/me/password`)
- Backend API endpoint for user's own order history (`GET /api/orders/my`)
- Frontend: wire password change form to real API
- Frontend: replace mock order history with real API data (with loading/empty/error states)
- Frontend: add loading state guard for checkout address pre-fill
- Frontend: add preview + explicit "Cập nhật ảnh đại diện" button for avatar upload
- Vietnamese UI labels for order statuses (mapping `pending`/`paid`/`processing`/`shipped`/`delivered`/`cancelled`)

### Out-of-Scope

- Password reset via email (forgot password flow)
- Order history pagination (can be added later; initial load is sufficient for MVP)
- Order detail page with tracking
- Avatar cropping before upload
- Address management (add/edit/delete multiple addresses)
- Closing bead `bd-1ez` (separate concern)

---

## Proposed Solution

### Overview

Add two new backend API endpoints (password change and user order history) and update the profile page frontend to wire the existing password form to the real API, replace mock order data with MongoDB queries, improve checkout address loading reliability with a loading guard, and add an explicit avatar update button with preview.

### User Flow

1. **Change Password:** User goes to profile → "Đổi mật khẩu" tab → enters current + new + confirm password → clicks submit → API validates current password via bcrypt → updates password → shows success toast
2. **Order History:** User goes to profile → "Đơn hàng" tab → sees loading skeleton → real orders load from MongoDB sorted by newest first → each order shows number, date, status badge, items, total → expandable detail
3. **Checkout Address:** User goes to checkout → sees loading skeleton while auth bootstraps → once user data loads, address fields pre-fill → if already loaded, instant fill
4. **Avatar Upload:** User clicks camera icon → selects image → preview appears (no upload yet) → user clicks "Cập nhật ảnh đại diện" button → image uploads to Cloudinary → avatar updates → or clicks "Hủy" to discard

---

## Requirements

### Functional Requirements

#### FR1: Password Change API

Backend endpoint allows authenticated users to change their password by verifying the current password first.

**Scenarios:**

- **WHEN** user submits valid current password and valid new password (≥8 chars) **THEN** password is updated, response returns success
- **WHEN** user submits incorrect current password **THEN** response returns 400 with generic error message (no enumeration)
- **WHEN** new password is less than 8 characters **THEN** response returns 400 validation error
- **WHEN** user is not authenticated **THEN** response returns 401

#### FR2: Password Change Frontend Wiring

The existing password form calls the real API and displays appropriate feedback.

**Scenarios:**

- **WHEN** form is submitted with valid data **THEN** loading spinner shows, API is called, success toast appears, form resets
- **WHEN** API returns error **THEN** error message displays under the form
- **WHEN** form has client-side validation errors **THEN** submit is prevented, error messages show inline

#### FR3: User Order History API

Backend endpoint returns the authenticated user's orders from MongoDB, sorted by newest first.

**Scenarios:**

- **WHEN** authenticated user requests their orders **THEN** returns orders where `user` field matches `req.userId`, sorted by `createdAt` descending
- **WHEN** user has no orders **THEN** returns empty array
- **WHEN** user is not authenticated **THEN** returns 401
- **WHEN** orders include items with product references **THEN** item data includes `productName`, `productPrice`, `quantity`, `image`

#### FR4: Order History Frontend

Profile page "Đơn hàng" tab displays real order data from API with proper loading, empty, and error states.

**Scenarios:**

- **WHEN** tab is active and data is loading **THEN** skeleton/spinner displays
- **WHEN** orders load successfully **THEN** each order shows order number, date (formatted Vietnamese), status badge (Vietnamese labels), items list, total
- **WHEN** user has no orders **THEN** empty state message displays ("Bạn chưa có đơn hàng nào")
- **WHEN** API call fails **THEN** error state with retry button displays
- **WHEN** user clicks an order **THEN** order details expand/collapse

#### FR5: Checkout Address Loading Guard

Checkout page waits for auth context to finish loading before rendering the form, preventing empty address fields.

**Scenarios:**

- **WHEN** auth context is still loading (`isLoading === true`) **THEN** checkout form shows loading skeleton
- **WHEN** auth context finishes and user has address **THEN** address field pre-fills
- **WHEN** auth context finishes and user has no address **THEN** address field remains empty for manual entry

#### FR6: Avatar Upload with Preview and Save Button

Avatar section shows preview after file selection and requires explicit button click to upload.

**Scenarios:**

- **WHEN** user selects a file **THEN** preview displays immediately (via `URL.createObjectURL`), "Cập nhật ảnh đại diện" and "Hủy" buttons appear
- **WHEN** user clicks "Cập nhật ảnh đại diện" **THEN** image uploads to Cloudinary, avatar updates in UI and auth context
- **WHEN** user clicks "Hủy" **THEN** preview is discarded, no upload occurs, UI returns to previous state
- **WHEN** upload is in progress **THEN** buttons are disabled, loading indicator shows
- **WHEN** upload fails **THEN** error message displays, user can retry

### Non-Functional Requirements

- **Performance:** Order history API should respond within 500ms for up to 100 orders per user
- **Security:** Password change must verify current password via bcrypt; never reveal whether current password was wrong vs user not found (generic error)
- **Accessibility:** All form inputs have proper labels; loading states are announced to screen readers
- **Compatibility:** Works on existing supported browsers (modern Chrome, Safari, Firefox)

---

## Success Criteria

- [ ] Password change works end-to-end: user can change password and log in with new password
  - Verify: `curl -X PATCH http://localhost:3001/api/users/me/password -H "Cookie: accessToken=..." -H "Content-Type: application/json" -d '{"currentPassword":"old","newPassword":"newpass123"}' | jq .status`
- [ ] Order history displays real orders from MongoDB on profile page
  - Verify: `curl http://localhost:3001/api/orders/my -H "Cookie: accessToken=..." | jq '.data | length'`
- [ ] Checkout address pre-fills reliably (loading guard prevents empty fields)
  - Verify: Navigate to `/checkout` while logged in — address field should show loading then fill
- [ ] Avatar upload shows preview before save, with explicit update button
  - Verify: Select image on profile → preview shows → click "Cập nhật ảnh đại diện" → avatar updates
- [ ] No TypeScript errors introduced
  - Verify: `cd frontend && npx tsc --noEmit`

---

## Technical Context

### Existing Patterns

- **Layered backend:** Controller → Service → Repository pattern used consistently across all features (`userController.js` → `userService.js` → `userRepository.js`)
- **API client:** All frontend API calls in `frontend/src/lib/api.ts` using native `fetch` with `credentials: 'include'`
- **Auth:** JWT in httpOnly cookie (`accessToken`), verified by `authMiddleware.js`
- **Password hashing:** bcrypt with salt rounds 10 in User model pre-save hook (`User.js:54-58`)
- **Avatar upload:** Cloudinary via multer memory storage → `upload_stream` pattern (`userService.js:69-107`)
- **Status mapping:** Vietnamese status labels already exist in `checkout/success/page.tsx:20-27`
- **Toast notifications:** Sonner library, used via `toast.success()` / `toast.error()`

### Key Files

- `frontend/src/app/profile/page.tsx` — Profile page with 3 tabs (profile, password, orders)
- `frontend/src/lib/api.ts` — All API client functions and TypeScript interfaces
- `frontend/src/contexts/AuthContext.tsx` — Auth state, `user` object, `isLoading`, `syncUser()`
- `frontend/src/app/checkout/page.tsx` — Checkout with address pre-fill (`useEffect` at line 91-100)
- `backend/src/routes/userRoutes.js` — User routes (GET/PATCH /me, POST /me/avatar)
- `backend/src/controllers/userController.js` — getMe, updateMe, uploadAvatar
- `backend/src/services/userService.js` — Business logic for user operations
- `backend/src/repositories/userRepository.js` — Mongoose user queries
- `backend/src/models/User.js` — User schema (password `select: false`, bcrypt pre-save)
- `backend/src/models/Order.js` — Order schema (user ref, items, status, customerInfo)
- `backend/src/routes/orderRoutes.js` — Order routes (currently admin-only list)
- `backend/src/controllers/orderController.js` — Order controllers
- `backend/src/services/orderService.js` — Order business logic
- `backend/src/repositories/orderRepository.js` — Order Mongoose queries
- `backend/src/services/authService.js` — Has bcrypt compare pattern to reuse

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/app/profile/page.tsx # Password form wiring, order history, avatar preview+button
  - frontend/src/lib/api.ts # Add changePassword() and fetchMyOrders() functions
  - frontend/src/app/checkout/page.tsx # Add isLoading guard for address pre-fill
  - backend/src/routes/userRoutes.js # Add PATCH /me/password route
  - backend/src/controllers/userController.js # Add changePassword controller
  - backend/src/services/userService.js # Add changePassword service method
  - backend/src/repositories/userRepository.js # Add findByIdWithPassword method
  - backend/src/routes/orderRoutes.js # Add GET /my route for user orders
  - backend/src/controllers/orderController.js # Add getMyOrders controller
  - backend/src/services/orderService.js # Add getMyOrders service method
  - backend/src/repositories/orderRepository.js # Add findByUserId method
```

---

## Risks & Mitigations

| Risk                                                       | Likelihood | Impact | Mitigation                                                                  |
| ---------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------- |
| Password bcrypt compare timing inconsistency               | Low        | Medium | bcrypt.compare is constant-time by design; use generic error messages       |
| Order history query slow for users with many orders        | Low        | Medium | Add compound index `{ user: 1, createdAt: -1 }`; defer pagination to future |
| Checkout address still empty if AuthContext fails entirely | Low        | Medium | Show error state with retry; allow manual entry as fallback                 |
| Avatar `URL.createObjectURL` memory leak                   | Medium     | Low    | Call `URL.revokeObjectURL()` in useEffect cleanup and on cancel             |
| Profile page.tsx is already large (800+ lines)             | Medium     | Low    | Keep changes minimal and targeted; consider component extraction in future  |

---

## Open Questions

| Question                                                       | Owner     | Due Date              | Status                                    |
| -------------------------------------------------------------- | --------- | --------------------- | ----------------------------------------- |
| Should we invalidate all other sessions after password change? | Developer | Before implementation | Open                                      |
| Should order history support pagination or load all at once?   | Product   | Before implementation | Resolved: Load all (out-of-scope for now) |

---

## Tasks

### Backend password change endpoint [backend]

A `PATCH /api/users/me/password` endpoint exists that verifies the current password via bcrypt, validates the new password (≥8 chars), hashes it, and saves the update — following the existing controller → service → repository pattern.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - backend/src/routes/userRoutes.js
  - backend/src/controllers/userController.js
  - backend/src/services/userService.js
  - backend/src/repositories/userRepository.js
```

**Verification:**

- `curl -X PATCH http://localhost:3001/api/users/me/password -H "Cookie: accessToken=..." -H "Content-Type: application/json" -d '{"currentPassword":"wrong","newPassword":"newpass123"}' | jq .status` returns `"error"`
- `curl -X PATCH http://localhost:3001/api/users/me/password -H "Cookie: accessToken=..." -H "Content-Type: application/json" -d '{"currentPassword":"correct","newPassword":"newpass123"}' | jq .status` returns `"success"`
- User can log in with new password after change

### Backend user order history endpoint [backend]

A `GET /api/orders/my` endpoint exists that returns the authenticated user's orders sorted by `createdAt` descending, with items populated (productName, productPrice, quantity, image).

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - backend/src/routes/orderRoutes.js
  - backend/src/controllers/orderController.js
  - backend/src/services/orderService.js
  - backend/src/repositories/orderRepository.js
```

**Verification:**

- `curl http://localhost:3001/api/orders/my -H "Cookie: accessToken=..." | jq '.data'` returns array of orders
- `curl http://localhost:3001/api/orders/my | jq .status` returns `"error"` (401, no auth)
- Orders are sorted newest first

### Frontend password change wiring [frontend]

The profile page password form calls `changePassword()` API on submit, shows loading state during request, displays success/error feedback via toast, and resets form on success.

**Metadata:**

```yaml
depends_on: ["Backend password change endpoint"]
parallel: false
conflicts_with:
  ["Frontend order history from MongoDB", "Frontend avatar upload with preview and save button"]
files:
  - frontend/src/lib/api.ts
  - frontend/src/app/profile/page.tsx
```

**Verification:**

- Submit password form with wrong current password → error toast appears
- Submit with valid data → success toast, form resets
- `cd frontend && npx tsc --noEmit` passes

### Frontend order history from MongoDB [frontend]

The profile page "Đơn hàng" tab fetches real orders via `fetchMyOrders()` API, displays them with Vietnamese status badges, and handles loading/empty/error states — replacing all mock data.

**Metadata:**

```yaml
depends_on: ["Backend user order history endpoint"]
parallel: false
conflicts_with:
  ["Frontend password change wiring", "Frontend avatar upload with preview and save button"]
files:
  - frontend/src/lib/api.ts
  - frontend/src/app/profile/page.tsx
```

**Verification:**

- Profile orders tab shows real orders from database (not "DH001", "DH002", "DH003" mock IDs)
- Empty state shows when user has no orders
- Status badges show Vietnamese labels (Chờ xử lý, Đã thanh toán, Đang xử lý, Đang giao, Hoàn thành, Đã hủy)
- `cd frontend && npx tsc --noEmit` passes

### Frontend checkout address loading guard [frontend]

The checkout page shows a loading skeleton while `AuthContext.isLoading` is true, preventing the form from rendering with empty address fields before user data is available.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/app/checkout/page.tsx
```

**Verification:**

- Navigate directly to `/checkout` while logged in → loading skeleton shows briefly → address pre-fills
- Hard refresh on `/checkout` → no empty address flash
- `cd frontend && npx tsc --noEmit` passes

### Frontend avatar upload with preview and save button [frontend]

The profile avatar section shows a preview after file selection (via `URL.createObjectURL`) and displays "Cập nhật ảnh đại diện" and "Hủy" buttons — uploading only when user explicitly clicks update.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Frontend password change wiring", "Frontend order history from MongoDB"]
files:
  - frontend/src/app/profile/page.tsx
```

**Verification:**

- Select image → preview shows immediately (no upload yet)
- Click "Hủy" → preview removed, no network request fired
- Click "Cập nhật ảnh đại diện" → image uploads, avatar updates in profile and auth context
- `URL.revokeObjectURL` is called on cleanup (check for memory leaks in dev tools)
- `cd frontend && npx tsc --noEmit` passes

---

## Dependency Legend

| Field            | Purpose                                           | Example                               |
| ---------------- | ------------------------------------------------- | ------------------------------------- |
| `depends_on`     | Must complete before this task starts             | `["Setup database", "Create schema"]` |
| `parallel`       | Can run concurrently with other parallel tasks    | `true` / `false`                      |
| `conflicts_with` | Cannot run in parallel (same files)               | `["Update config"]`                   |
| `files`          | Files this task modifies (for conflict detection) | `["src/db/schema.ts"]`                |

---

## Notes

- The profile page (`profile/page.tsx`) is already 800+ lines. All 3 frontend tasks modify this file, so they conflict with each other and must run sequentially.
- The two backend tasks are independent and can run in parallel.
- The checkout loading guard is independent of all other tasks.
- Bead `bd-1ez` (checkout auto-fill) appears to be complete but still `in_progress` — this bead's checkout task (FR5) only adds a loading guard, not the auto-fill logic itself.
- The existing `StatusBadge` component in `profile/page.tsx` uses Vietnamese labels but doesn't match backend enum values — needs remapping.
- bcrypt pattern for password comparison already exists in `authService.js` — reuse that approach.
- Order model already has index on `{ createdAt: -1 }` and `{ status: 1, createdAt: -1 }` but NOT on `{ user: 1, createdAt: -1 }` — add this index for the user order query.
