# Profile DB Data + Cloudinary Avatar PRD

**Bead:** bd-19v  
**Created:** 2026-02-16  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 8
```

---

## Problem Statement

### What problem are we solving?

The `/profile` page currently uses hardcoded mock user data and local-only avatar preview, so profile information does not come from MongoDB and avatar changes are not persisted via Cloudinary.

### Why now?

Users cannot trust profile data if it resets on refresh, and the current flow cannot support real account management. Shipping DB-backed profile data and persisted avatar upload is required to make profile management production-ready.

### Who is affected?

- **Primary users:** Authenticated end users managing their account at `/profile`.
- **Secondary users:** Support/admin teams diagnosing account issues with user profile data.

---

## Scope

### In-Scope

- Load authenticated user profile data from backend DB instead of frontend mock constants.
- Persist profile edits for supported user fields through authenticated backend API.
- Support avatar upload from `/profile` to Cloudinary and persist returned secure URL on the user record.
- Add frontend loading/error/success states for profile fetch/update/avatar upload.
- Add or extend Playwright coverage for profile load, update, and avatar upload behavior.

### Out-of-Scope

- Rebuilding profile page visual design.
- Replacing mock orders history with DB-backed orders.
- Social login, account deletion, or full media management features.

---

## Proposed Solution

### Overview

Implement authenticated profile endpoints in backend to read and update the current user, then integrate `/profile` UI to fetch and submit real data. Reuse existing backend Cloudinary and upload middleware patterns to upload avatar images, store versioned `secure_url` on user document, and render persisted avatar on page reload.

### User Flow

1. Logged-in user opens `/profile` and sees DB-backed profile data.
2. User edits profile fields and saves; UI confirms persisted success.
3. User uploads a valid avatar image; backend uploads to Cloudinary and updates user avatar URL.
4. Page refresh still shows updated profile fields and avatar from DB.

---

## Requirements

### Functional Requirements

#### Authenticated Profile Retrieval

Profile page must request the authenticated user profile from backend and render returned fields.

**Scenarios:**

- **WHEN** an authenticated user opens `/profile` **THEN** frontend requests profile data from backend and renders DB values.
- **WHEN** auth cookie is missing/invalid **THEN** frontend follows existing unauthorized handling path and does not show stale mock profile data.

#### Authenticated Profile Update

User profile edits must persist to DB and return updated values to frontend.

**Scenarios:**

- **WHEN** user submits valid profile edits **THEN** backend validates payload, updates user record, and returns normalized profile response.
- **WHEN** payload is invalid **THEN** backend rejects with validation error and frontend displays actionable message without losing current form state.

#### Avatar Upload to Cloudinary

Avatar upload must validate image input, upload to Cloudinary, and persist returned URL in user record.

**Scenarios:**

- **WHEN** user uploads valid image file **THEN** backend uploads to Cloudinary and stores `secure_url` as user avatar.
- **WHEN** file type/size is invalid or Cloudinary fails **THEN** backend returns structured error and frontend keeps previous avatar.

### Non-Functional Requirements

- **Performance:** Profile fetch should complete within normal API latency budget and avoid unnecessary duplicate requests.
- **Security:** All profile read/update/upload routes require authentication; upload validation enforces MIME and size limits.
- **Accessibility:** Profile and upload controls remain keyboard accessible with visible feedback.
- **Compatibility:** Works with current Next.js frontend + Express backend setup and existing cookie-based auth flow.

---

## Success Criteria

- [ ] `/profile` no longer depends on `initialUser`/mock profile constants for displayed account data.
  - Verify: `grep -n "initialUser\|mockOrders" frontend/src/app/profile/page.tsx`
- [ ] Backend exposes authenticated profile read/update and returns DB-backed user data used by frontend.
  - Verify: `cd backend && npm run lint`
- [ ] Avatar upload from `/profile` persists Cloudinary URL and survives page refresh.
  - Verify: `cd frontend && npm run typecheck`
  - Verify: Manual check in browser at `http://localhost:3000/profile` with authenticated user.
- [ ] E2E coverage exists for profile data load/update and avatar upload path.
  - Verify: `cd playwright && npm test -- tests/demo-user-11/test-cases.spec.ts`
  - Verify: `cd playwright && npm test -- tests/demo-user-12/test-cases.spec.ts`

---

## Technical Context

### Existing Patterns

- Authenticated user bootstrap in frontend: `frontend/src/contexts/AuthContext.tsx` (`/api/auth/me`, `credentials: 'include'`).
- Profile page currently local-state only: `frontend/src/app/profile/page.tsx`.
- Backend user retrieval pattern: `backend/src/services/authService.js` + `backend/src/repositories/userRepository.js`.
- Existing Cloudinary upload path for products: `backend/src/services/productService.js` + `backend/src/config/cloudinary.js` + `backend/src/middlewares/uploadMiddleware.js`.
- Existing route mounting pattern: `backend/src/routes/index.js`.

### Key Files

- `frontend/src/app/profile/page.tsx` - Current mock profile UI and local avatar preview logic.
- `frontend/src/contexts/AuthContext.tsx` - Existing authenticated user fetch conventions.
- `frontend/src/lib/api.ts` - Central API utility patterns.
- `backend/src/routes/authRoutes.js` - Current auth route structure (`/me`).
- `backend/src/models/User.js` - User schema fields currently persisted.
- `backend/src/services/productService.js` - Cloudinary upload reference implementation.
- `playwright/tests/rbac/admin-route-flow.spec.ts` - Existing `/api/auth/me` interception/testing pattern.

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/app/profile/page.tsx # Replace mock profile state with API-backed state and avatar upload flow
  - frontend/src/lib/api.ts # Add profile read/update/avatar API clients
  - frontend/src/contexts/AuthContext.tsx # Keep auth user state consistent after profile updates
  - backend/src/routes/index.js # Mount user/profile routes
  - backend/src/routes/userRoutes.js # New authenticated profile + avatar endpoints
  - backend/src/controllers/userController.js # New profile and avatar controllers
  - backend/src/services/userService.js # New profile persistence and Cloudinary orchestration
  - backend/src/repositories/userRepository.js # Extend user update/find methods
  - backend/src/models/User.js # Add persisted avatar/profile fields if required
  - playwright/tests/demo-user-11/test-cases.spec.ts # New profile data load/update E2E spec
  - playwright/tests/demo-user-12/test-cases.spec.ts # New avatar upload E2E spec
```

---

## Risks & Mitigations

| Risk                                                                     | Likelihood | Impact | Mitigation                                                                                                  |
| ------------------------------------------------------------------------ | ---------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| Profile UI fields (`address`, `bio`) do not exist in current User schema | Medium     | High   | Decide canonical persisted profile fields before implementation; update schema + response contract together |
| Cloudinary credentials missing in environment                            | Medium     | High   | Validate required env vars on backend startup and return explicit configuration error in upload endpoint    |
| Upload endpoint abuse or invalid file payloads                           | Medium     | High   | Reuse MIME/size checks in upload middleware and keep auth required for endpoint                             |
| Avatar URL cache staleness after overwrite                               | Low        | Medium | Persist Cloudinary versioned `secure_url` returned from upload response                                     |

---

## Open Questions

| Question                                                                                                            | Owner                 | Due Date       | Status |
| ------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------- | ------ |
| Should `address` and `bio` be persisted in MongoDB now or removed from editable profile fields in this bead?        | Product + Engineering | Before `/ship` | Open   |
| Should `/profile` continue displaying mock orders tab, or should orders tab be hidden until real orders API exists? | Product + Engineering | Before `/ship` | Open   |

---

## Tasks

### Implement authenticated profile read/update API [backend]

Backend exposes DB-backed authenticated profile retrieval and update endpoints for the current user with stable response shape used by frontend.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - backend/src/routes/index.js
  - backend/src/routes/userRoutes.js
  - backend/src/controllers/userController.js
  - backend/src/services/userService.js
  - backend/src/repositories/userRepository.js
  - backend/src/models/User.js
```

**Verification:**

- `cd backend && npm run lint`
- Manual API check: authenticated `GET /api/users/me` and `PATCH /api/users/me` return updated DB-backed data.

### Implement Cloudinary avatar upload endpoint [backend-upload]

Backend accepts authenticated avatar image upload, validates file, uploads to Cloudinary, and persists returned avatar URL to user record.

**Metadata:**

```yaml
depends_on: ["Implement authenticated profile read/update API"]
parallel: false
conflicts_with: []
files:
  - backend/src/routes/userRoutes.js
  - backend/src/controllers/userController.js
  - backend/src/services/userService.js
  - backend/src/config/cloudinary.js
  - backend/src/middlewares/uploadMiddleware.js
  - backend/src/models/User.js
```

**Verification:**

- `cd backend && npm run lint`
- Manual API check: authenticated multipart upload to `POST /api/users/me/avatar` returns Cloudinary `secure_url` persisted on user.

### Integrate `/profile` with DB data and avatar upload [frontend]

Profile page renders server-backed profile values and updates UI state through real API calls for both profile edits and avatar upload.

**Metadata:**

```yaml
depends_on:
  - "Implement authenticated profile read/update API"
  - "Implement Cloudinary avatar upload endpoint"
parallel: false
conflicts_with: []
files:
  - frontend/src/app/profile/page.tsx
  - frontend/src/lib/api.ts
  - frontend/src/contexts/AuthContext.tsx
```

**Verification:**

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- Manual check: edit profile and upload avatar at `http://localhost:3000/profile`, then refresh and confirm persisted values.

### Add Playwright coverage for profile + avatar flows [test]

Playwright specs validate DB-backed profile loading, profile update persistence, avatar upload validation, and successful avatar persistence behavior.

**Metadata:**

```yaml
depends_on: ["Integrate `/profile` with DB data and avatar upload"]
parallel: false
conflicts_with: []
files:
  - playwright/tests/demo-user-11/test-cases.spec.ts
  - playwright/tests/demo-user-12/test-cases.spec.ts
  - playwright/tests/rbac/admin-route-flow.spec.ts
```

**Verification:**

- `cd playwright && npm test -- tests/demo-user-11/test-cases.spec.ts`
- `cd playwright && npm test -- tests/demo-user-12/test-cases.spec.ts`

---

## Notes

- This PRD intentionally avoids implementation details and code snippets.
- Existing product image Cloudinary integration in backend is the reference pattern for avatar upload endpoint behavior.
