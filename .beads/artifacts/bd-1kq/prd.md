# Backend Auth (Register/Login) with MongoDB + FE Integration

**Bead:** bd-1kq  
**Created:** 2026-02-13  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: [] # No blockers
parallel: false # Touches both backend and frontend
conflicts_with: ["bd-15n"] # Both modify frontend auth files
blocks: []
estimated_hours: 4
```

---

## Problem Statement

### What problem are we solving?

The frontend login and register pages (built in bd-15n) currently use a mock `AuthContext` that always succeeds — no real authentication occurs. Users cannot actually create accounts, verify credentials, or maintain sessions. The backend has no auth endpoints, no User model, and no JWT token handling.

### Why now?

The frontend auth UI is complete and merged. The mock implementation was always intended as a placeholder. Without real auth, the app cannot differentiate users, protect routes, or persist user accounts.

### Who is affected?

- **Primary users:** End users who register/login on the Baby Bliss website
- **Secondary users:** Developers who need auth middleware to protect future endpoints (e.g., orders, profile)

---

## Scope

### In-Scope

- User model in MongoDB (Mongoose) with email, name, phone, password
- Register endpoint (`POST /api/auth/register`) with bcrypt password hashing
- Login endpoint (`POST /api/auth/login`) with JWT token generation
- Get current user endpoint (`GET /api/auth/me`) using auth middleware
- Logout endpoint (`POST /api/auth/logout`) to clear cookies
- JWT access tokens in httpOnly cookies
- Auth middleware for protecting routes
- Input validation with express-validator
- CORS configuration for credentials (cookies) between ports 3000 ↔ 3001
- Update frontend `AuthContext` to call real API endpoints
- Update frontend login/register pages to handle API errors
- Update `.env.example` with new env vars (JWT_SECRET, FRONTEND_URL)
- Pass CI/CD (lint, format, typecheck, build)

### Out-of-Scope

- Refresh token rotation (future iteration)
- OAuth / social login (Google, Facebook, etc.)
- Email verification / password reset
- Role-based access control (admin vs user)
- Rate limiting (express-rate-limit) — nice-to-have but not required
- Profile page implementation
- Backend unit tests (test scripts are placeholders)

---

## Proposed Solution

### Overview

Add a complete auth layer to the Express backend using bcrypt for password hashing and JWT for stateless authentication. Tokens are stored in httpOnly cookies for XSS protection. The frontend AuthContext switches from mock functions to real API calls with `fetch` + `credentials: 'include'`. Error handling displays backend validation messages in the existing form UI.

### User Flow

1. **Register:** User fills form → FE validates → `POST /api/auth/register` → backend validates, hashes password, saves to MongoDB, returns JWT cookie + user data → FE sets auth state, redirects to home
2. **Login:** User fills form → FE validates → `POST /api/auth/login` → backend verifies email/password, returns JWT cookie + user data → FE sets auth state, redirects to home
3. **Session persistence:** On page load, FE calls `GET /api/auth/me` with cookie → backend verifies JWT, returns user data → FE restores auth state
4. **Logout:** User clicks logout → FE calls `POST /api/auth/logout` → backend clears cookie → FE clears auth state

---

## Requirements

### Functional Requirements

#### User Registration

User can create an account with name, email, phone, and password.

**Scenarios:**

- **WHEN** valid data is submitted **THEN** user is created in MongoDB with hashed password, JWT cookie is set, user data returned (without password)
- **WHEN** email already exists **THEN** return 409 with error message "Email đã được sử dụng"
- **WHEN** required fields are missing **THEN** return 400 with field-specific validation errors
- **WHEN** password is shorter than 8 characters **THEN** return 400 with validation error

#### User Login

User can authenticate with email and password.

**Scenarios:**

- **WHEN** valid credentials submitted **THEN** JWT cookie is set, user data returned
- **WHEN** email not found **THEN** return 401 "Email hoặc mật khẩu không đúng"
- **WHEN** password doesn't match **THEN** return 401 "Email hoặc mật khẩu không đúng" (same message to prevent enumeration)
- **WHEN** fields are missing **THEN** return 400 with validation errors

#### Get Current User

Authenticated user can retrieve their profile data.

**Scenarios:**

- **WHEN** valid JWT cookie present **THEN** return user data (id, name, email, phone)
- **WHEN** no cookie or invalid/expired JWT **THEN** return 401

#### Logout

User can end their session.

**Scenarios:**

- **WHEN** logout called **THEN** JWT cookie is cleared, return success message

#### Frontend Integration

Existing login/register pages call real API instead of mock functions.

**Scenarios:**

- **WHEN** API returns success **THEN** auth state is set, user is redirected to home
- **WHEN** API returns validation error **THEN** error messages are displayed in the form
- **WHEN** API returns server error **THEN** generic error message is shown
- **WHEN** page loads and user has valid cookie **THEN** auth state is restored automatically

### Non-Functional Requirements

- **Performance:** Auth endpoints respond in < 500ms
- **Security:** Passwords hashed with bcrypt (10 salt rounds), JWT in httpOnly cookies with sameSite, password never returned in API responses, `select: false` on password field
- **Compatibility:** Works with existing Express middleware stack, existing error handler, existing CORS setup
- **CI/CD:** Must pass `npm run lint`, `npm run format:check` (backend), `npm run lint`, `npm run typecheck`, `npm run build` (frontend)

---

## Success Criteria

- [ ] User can register with name, email, phone, password via `POST /api/auth/register`
  - Verify: `curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com","phone":"0901234567","password":"12345678"}' -v` returns 201 with Set-Cookie header
- [ ] Duplicate email returns 409 error
  - Verify: Run same curl again → returns 409
- [ ] User can login with email/password via `POST /api/auth/login`
  - Verify: `curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"12345678"}' -v` returns 200 with Set-Cookie header
- [ ] Wrong password returns 401
  - Verify: `curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"wrongpassword"}' -v` returns 401
- [ ] Authenticated user can fetch profile via `GET /api/auth/me`
  - Verify: `curl http://localhost:3001/api/auth/me --cookie "accessToken=<token>" -v` returns user data
- [ ] Password is never returned in any API response
  - Verify: Check all auth endpoint responses — no `password` field
- [ ] Frontend login page sends API request and handles success/error
  - Verify: `npm run build` in frontend succeeds, manual test in browser
- [ ] Frontend register page sends API request and handles success/error
  - Verify: `npm run build` in frontend succeeds, manual test in browser
- [ ] Backend passes CI
  - Verify: `cd backend && npm run lint && npm run format:check`
- [ ] Frontend passes CI
  - Verify: `cd frontend && npm run lint && npm run typecheck && npm run build`

---

## Technical Context

### Existing Patterns

- **Layered architecture:** `routes → controllers → services → repositories → models` (see `backend/src/controllers/productController.js`, `backend/src/services/productService.js`, `backend/src/repositories/productRepository.js`)
- **asyncHandler middleware:** wraps async controllers to forward errors to Express error handler (`backend/src/middlewares/asyncHandler.js`)
- **Centralized error handling:** `AppError` base class + `ClientError` subclasses (`BadRequestError`, `UnauthorizedError`, `NotFoundError`, etc.) at `backend/src/errors/`
- **Response helper:** `sendSuccess()` and `sendCreated()` at `backend/src/utils/responseHelper.js`
- **CommonJS modules:** All backend files use `require`/`module.exports`
- **Frontend API client:** `frontend/src/lib/api.ts` uses `fetch` with `NEXT_PUBLIC_API_URL` env var (defaults to `http://localhost:3001`)
- **Frontend AuthContext:** `frontend/src/contexts/AuthContext.tsx` — mock auth with `login()`, `logout()`, `register()`, `isAuthenticated`, `user`

### Key Files

- `backend/src/index.js` — Express app bootstrap, CORS, routes mounting at `/api`
- `backend/src/routes/index.js` — Central router (add auth routes here)
- `backend/src/errors/index.js` — Exports all error classes
- `backend/src/errors/ClientError.js` — Has `UnauthorizedError` (401) already defined
- `backend/src/middlewares/asyncHandler.js` — Reuse for auth controllers
- `backend/src/utils/responseHelper.js` — Reuse for consistent responses
- `frontend/src/contexts/AuthContext.tsx` — Replace mock with real API calls
- `frontend/src/app/login/page.tsx` — Add error handling for API responses
- `frontend/src/app/register/page.tsx` — Add error handling for API responses
- `frontend/src/lib/api.ts` — API base URL config

### Affected Files

Files this bead will create or modify:

```yaml
files:
  # Backend — NEW files
  - backend/src/models/User.js # Mongoose User schema
  - backend/src/controllers/authController.js # Auth endpoint handlers
  - backend/src/services/authService.js # Auth business logic
  - backend/src/repositories/userRepository.js # User DB queries
  - backend/src/routes/authRoutes.js # Auth route definitions
  - backend/src/middlewares/authMiddleware.js # JWT verification middleware
  - backend/src/validators/authValidator.js # express-validator rules

  # Backend — MODIFIED files
  - backend/src/routes/index.js # Mount auth routes
  - backend/src/index.js # Add cookie-parser middleware, update CORS
  - backend/.env.example # Add JWT_SECRET, FRONTEND_URL

  # Frontend — MODIFIED files
  - frontend/src/contexts/AuthContext.tsx # Replace mock with real API calls
  - frontend/src/app/login/page.tsx # Handle API errors, loading states
  - frontend/src/app/register/page.tsx # Handle API errors, loading states
```

---

## Risks & Mitigations

| Risk                                       | Likelihood | Impact   | Mitigation                                                                                 |
| ------------------------------------------ | ---------- | -------- | ------------------------------------------------------------------------------------------ |
| CORS cookie issues between ports 3000/3001 | Medium     | High     | Use `credentials: true` in CORS + `sameSite: 'lax'` + `credentials: 'include'` in fetch    |
| Cookie not sent in Next.js SSR context     | Medium     | Medium   | Use client-side fetch only (`'use client'`); SSR auth deferred to future                   |
| New npm deps break CI                      | Low        | Medium   | Only add well-maintained packages (bcrypt, jsonwebtoken, cookie-parser, express-validator) |
| MongoDB connection string issues           | Low        | High     | `.env` already configured and tested with existing models                                  |
| Password stored in plain text              | Low        | Critical | Pre-save hook in Mongoose model + code review                                              |

---

## Open Questions

| Question                                           | Owner | Due Date | Status                                             |
| -------------------------------------------------- | ----- | -------- | -------------------------------------------------- |
| Should we add refresh token rotation now or later? | User  | -        | Resolved: Later (out of scope)                     |
| Store JWT in cookie or localStorage?               | -     | -        | Resolved: httpOnly cookie (security best practice) |

---

## Tasks

### Create User model with password hashing [backend]

Mongoose User schema with name, email (unique), phone, password (bcrypt hashed via pre-save hook, `select: false`), timestamps.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - backend/src/models/User.js
```

**Verification:**

- File exists at `backend/src/models/User.js`
- Schema has email unique index, password select:false, pre-save bcrypt hook
- `cd backend && npm run lint`

### Create auth service and repository [backend]

Auth service with `register()` and `login()` methods following existing layered pattern; user repository with `findByEmail()`, `createUser()` queries.

**Metadata:**

```yaml
depends_on: ["Create User model with password hashing"]
parallel: false
conflicts_with: []
files:
  - backend/src/services/authService.js
  - backend/src/repositories/userRepository.js
```

**Verification:**

- `authService.register()` creates user, returns user without password
- `authService.login()` verifies credentials, returns JWT + user
- `cd backend && npm run lint`

### Create auth routes, controller, and validators [backend]

Express routes for `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` with express-validator input validation and auth middleware.

**Metadata:**

```yaml
depends_on: ["Create auth service and repository"]
parallel: false
conflicts_with: []
files:
  - backend/src/controllers/authController.js
  - backend/src/routes/authRoutes.js
  - backend/src/validators/authValidator.js
  - backend/src/middlewares/authMiddleware.js
```

**Verification:**

- Routes respond to correct HTTP methods and paths
- Validators check required fields, email format, password length
- `cd backend && npm run lint`

### Wire auth into Express app [backend]

Mount auth routes in central router, add `cookie-parser` middleware, update CORS to allow credentials, add JWT_SECRET and FRONTEND_URL to `.env.example`.

**Metadata:**

```yaml
depends_on: ["Create auth routes, controller, and validators"]
parallel: false
conflicts_with: []
files:
  - backend/src/routes/index.js
  - backend/src/index.js
  - backend/.env.example
```

**Verification:**

- `cd backend && npm run lint && npm run format:check`
- `curl http://localhost:3001/api/auth/register` returns 400 (not 404)

### Install backend dependencies [backend]

Install `bcrypt`, `jsonwebtoken`, `cookie-parser`, `express-validator` as production dependencies.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - backend/package.json
  - backend/package-lock.json
```

**Verification:**

- `cd backend && npm ls bcrypt jsonwebtoken cookie-parser express-validator`

### Update frontend AuthContext for real API [frontend]

Replace mock `login()`, `logout()`, `register()` with `fetch` calls to backend API using `credentials: 'include'`. Add `checkAuth()` function that calls `GET /api/auth/me` on mount. Add loading and error states.

**Metadata:**

```yaml
depends_on: ["Wire auth into Express app"]
parallel: false
conflicts_with: ["bd-15n"]
files:
  - frontend/src/contexts/AuthContext.tsx
```

**Verification:**

- `cd frontend && npm run typecheck && npm run build`
- AuthContext exposes `login`, `logout`, `register`, `isAuthenticated`, `user`, `isLoading`, `error`

### Update login/register pages to handle API errors [frontend]

Login and register pages display backend validation errors, show loading spinner during API call, handle network errors gracefully.

**Metadata:**

```yaml
depends_on: ["Update frontend AuthContext for real API"]
parallel: false
conflicts_with: ["bd-15n"]
files:
  - frontend/src/app/login/page.tsx
  - frontend/src/app/register/page.tsx
```

**Verification:**

- `cd frontend && npm run typecheck && npm run build`
- `cd frontend && npm run lint && npm run format:check`

### Full CI verification [ci]

Run complete CI checks for both backend and frontend to ensure everything passes.

**Metadata:**

```yaml
depends_on: ["Update login/register pages to handle API errors"]
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `cd backend && npm run lint && npm run format:check`
- `cd frontend && npm run lint && npm run typecheck && npm run build && npm run format:check`

---

## Dependency Legend

| Field            | Purpose                                           | Example                          |
| ---------------- | ------------------------------------------------- | -------------------------------- |
| `depends_on`     | Must complete before this task starts             | `["Create User model"]`          |
| `parallel`       | Can run concurrently with other parallel tasks    | `true` / `false`                 |
| `conflicts_with` | Cannot run in parallel (same files)               | `["bd-15n"]`                     |
| `files`          | Files this task modifies (for conflict detection) | `["backend/src/models/User.js"]` |

---

## Notes

- Backend is JavaScript (CommonJS), NOT TypeScript
- Follow existing layered architecture: routes → controllers → services → repositories → models
- Reuse existing error classes (`UnauthorizedError`, `BadRequestError`, `ValidationError`) from `backend/src/errors/`
- Reuse `asyncHandler` middleware for all auth controllers
- Reuse `sendSuccess`/`sendCreated` response helpers
- Vietnamese UI text in frontend error messages
- Cookie `sameSite: 'lax'` for dev (cross-port), `secure: true` only in production
- JWT expiry: 7 days (single token, no refresh — keep it simple for now)
