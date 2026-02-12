# Login & Register Pages with Header Auth UI

**Bead:** bd-15n  
**Created:** 2026-02-13  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 4
```

---

## Problem Statement

### What problem are we solving?

Baby Bliss e-commerce site has a profile page (`/profile`) and a profile icon in the header, but **no login or register pages exist**. Users cannot create accounts or sign in. For an e-commerce site, authentication is a fundamental requirement for order tracking, wishlists, and personalized experiences.

### Why now?

The storefront is feature-complete with products, cart, checkout, and wishlist — but lacks the most basic auth entry points. Without login/register, users have no path to account creation.

### Who is affected?

- **Primary users:** Shoppers who want to create an account to track orders and save preferences
- **Secondary users:** Developers who need auth UI scaffolding for future backend integration

---

## Scope

### In-Scope

- Login page (`/login`) with email + password fields
- Register page (`/register`) with name, email, phone, password, confirm password fields
- Client-side form validation (required fields, email format, password match, phone format)
- Header update: show Login/Register links when not authenticated, profile icon when authenticated
- Mock auth state management (AuthContext) — frontend-only, no real API calls
- Vietnamese UI text consistent with existing site
- Pink pastel theme matching existing design system
- Responsive design (mobile + desktop)
- New SVG icons as needed (LoginIcon, RegisterIcon, or similar)

### Out-of-Scope

- Backend API integration (no real authentication)
- Password reset / forgot password flow
- OAuth / social login (Google, Facebook)
- Email verification
- Remember me / session persistence (beyond simple React state)
- Profile page modifications (already exists)

---

## Proposed Solution

### Overview

Create two new pages — Login and Register — following the existing page pattern (Header + main + Footer within a `min-h-screen` wrapper). Add a lightweight `AuthContext` that tracks a mock `isAuthenticated` state. Update the Header to conditionally render Login/Register links (when logged out) or the existing profile icon (when logged in). All form validation is client-side only; submit handlers show a success toast/message without calling any API.

### User Flow

#### Login

1. User navigates to `/login` (or clicks "Đăng nhập" in header)
2. Fills in email and password
3. Clicks submit → mock login succeeds → redirect to home page
4. Header now shows profile icon instead of login/register links

#### Register

1. User navigates to `/register` (or clicks "Đăng ký" in header)
2. Fills in full name, email, phone, password, confirm password
3. Client-side validation runs (all fields required, email format, phone format, passwords match, password min length)
4. Clicks submit → mock register succeeds → redirect to login page or home page
5. User can then log in

---

## Requirements

### Functional Requirements

#### Login Page

Login page renders at `/login` with email and password fields, form validation, and submit handling.

**Scenarios:**

- **WHEN** user visits `/login` **THEN** a login form is displayed with email field, password field, and submit button
- **WHEN** user submits with empty fields **THEN** validation errors are shown inline
- **WHEN** user submits with invalid email format **THEN** email validation error is shown
- **WHEN** user submits valid credentials **THEN** auth state is set to authenticated and user is redirected to home
- **WHEN** user clicks "Đăng ký" link **THEN** navigated to `/register`

#### Register Page

Register page renders at `/register` with name, email, phone, password, and confirm password fields.

**Scenarios:**

- **WHEN** user visits `/register` **THEN** a registration form is displayed with all required fields
- **WHEN** user submits with empty fields **THEN** validation errors are shown for each missing field
- **WHEN** passwords don't match **THEN** confirm password field shows mismatch error
- **WHEN** password is less than 8 characters **THEN** password validation error is shown
- **WHEN** phone number format is invalid **THEN** phone validation error is shown
- **WHEN** user submits valid data **THEN** mock registration succeeds and user is redirected
- **WHEN** user clicks "Đăng nhập" link **THEN** navigated to `/login`

#### Header Auth State

Header conditionally renders auth-related icons based on authentication state.

**Scenarios:**

- **WHEN** user is not authenticated **THEN** header shows Login and Register links/icons instead of profile icon
- **WHEN** user is authenticated **THEN** header shows profile icon (existing behavior) and a logout option
- **WHEN** user clicks logout **THEN** auth state is cleared and header reverts to login/register links
- **WHEN** on mobile menu **THEN** auth links appear in the mobile navigation section

#### Auth Context

A React context providing mock authentication state across the app.

**Scenarios:**

- **WHEN** app loads **THEN** `isAuthenticated` defaults to `false`
- **WHEN** login is called **THEN** `isAuthenticated` is set to `true` and user info is stored
- **WHEN** logout is called **THEN** `isAuthenticated` is set to `false` and user info is cleared

### Non-Functional Requirements

- **Performance:** Pages must load without additional bundle dependencies (use existing Next.js + Tailwind only)
- **Accessibility:** Form inputs must have labels, error messages must be announced to screen readers, keyboard-navigable
- **Compatibility:** Works on all viewports (mobile-first responsive)
- **Styling:** Must use existing CSS variables (--pink-50 through --pink-600, --text-primary, etc.) and Tailwind utilities

---

## Success Criteria

- [ ] Login page renders at `/login` with email + password fields and submit button
  - Verify: `curl -s http://localhost:3000/login | grep -q "Đăng nhập"`
- [ ] Register page renders at `/register` with name, email, phone, password, confirm password fields
  - Verify: `curl -s http://localhost:3000/register | grep -q "Đăng ký"`
- [ ] Client-side validation works for all fields (required, email format, password match, phone format)
  - Verify: Manual test — submit empty form, check error messages appear
- [ ] Header shows Login/Register when logged out, profile icon when logged in
  - Verify: Manual test — check header state toggles
- [ ] TypeScript compiles without errors
  - Verify: `npm run typecheck`
- [ ] Linting passes
  - Verify: `npm run lint:fix`
- [ ] Pages match existing pink pastel design system
  - Verify: Visual review — pink gradients, rounded inputs, consistent fonts
- [ ] Responsive on mobile and desktop
  - Verify: Manual test at 375px and 1280px viewports

---

## Technical Context

### Existing Patterns

- Page layout: `frontend/src/app/page.tsx` — `<div min-h-screen>` + Header + main + Footer
- Form validation: `frontend/src/app/checkout/page.tsx` — manual `validate()` with `errors` state object
- Password visibility: `frontend/src/app/profile/page.tsx` — EyeIcon/EyeOffIcon toggle
- Context pattern: `frontend/src/contexts/CartContext.tsx` — createContext + Provider + useContext hook
- Icon pattern: `frontend/src/components/icons/index.tsx` — custom SVG components with size prop
- Header action buttons: `frontend/src/components/Header.tsx` — rounded-full, hover:text-pink-500 pattern

### Key Files

- `frontend/src/components/Header.tsx` — Must be modified for auth state conditional rendering
- `frontend/src/components/icons/index.tsx` — May need new icons (LoginIcon, etc.)
- `frontend/src/app/layout.tsx` — Must wrap with AuthProvider
- `frontend/src/app/globals.css` — Existing theme tokens, may need form-specific styles

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/app/login/page.tsx # New — Login page
  - frontend/src/app/register/page.tsx # New — Register page
  - frontend/src/contexts/AuthContext.tsx # New — Auth state management
  - frontend/src/components/Header.tsx # Modified — Conditional auth UI
  - frontend/src/components/icons/index.tsx # Modified — New auth icons if needed
  - frontend/src/app/layout.tsx # Modified — Add AuthProvider wrapper
```

---

## Risks & Mitigations

| Risk                                            | Likelihood | Impact | Mitigation                                                                  |
| ----------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------- |
| Header layout shifts with different auth states | Medium     | Medium | Test both states; use fixed-width containers for action buttons             |
| Form styling inconsistency with rest of site    | Low        | Medium | Reuse exact CSS variables and Tailwind patterns from checkout/profile pages |
| AuthContext interfering with existing contexts  | Low        | Low    | Keep AuthContext minimal; no shared state with Cart/Wishlist                |
| Mobile menu overflow with additional auth links | Low        | Medium | Test mobile menu with both auth states                                      |

---

## Open Questions

| Question                                                                   | Owner | Due Date              | Status                                             |
| -------------------------------------------------------------------------- | ----- | --------------------- | -------------------------------------------------- |
| Should login/register pages have Header + Footer or be standalone layouts? | User  | Before implementation | Resolved — Include Header + Footer for consistency |

---

## Tasks

### Create AuthContext provider [context]

An `AuthContext` exists at `frontend/src/contexts/AuthContext.tsx` providing `isAuthenticated`, `user`, `login()`, `logout()`, and `register()` mock functions, and is wrapped in `layout.tsx`.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Update Header with auth-conditional rendering"]
files:
  - frontend/src/contexts/AuthContext.tsx
  - frontend/src/app/layout.tsx
```

**Verification:**

- `npm run typecheck` passes
- AuthContext exports `useAuth` hook with correct types

### Create Login page [page]

A fully styled Login page exists at `/login` with email + password fields, client-side validation, password show/hide toggle, mock submit handler that calls `authContext.login()`, and links to register page. Styled with pink pastel theme.

**Metadata:**

```yaml
depends_on: ["Create AuthContext provider"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/login/page.tsx
```

**Verification:**

- `npm run typecheck` passes
- Page renders at `http://localhost:3000/login`
- Form validation blocks empty/invalid submissions
- Successful submit sets `isAuthenticated = true`

### Create Register page [page]

A fully styled Register page exists at `/register` with name, email, phone, password, and confirm password fields, client-side validation (email format, phone format, password match, min length), mock submit handler, and links to login page. Styled with pink pastel theme.

**Metadata:**

```yaml
depends_on: ["Create AuthContext provider"]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/register/page.tsx
```

**Verification:**

- `npm run typecheck` passes
- Page renders at `http://localhost:3000/register`
- Validation catches: empty fields, invalid email, short password, password mismatch, invalid phone
- Successful submit redirects appropriately

### Add auth icons to icon set [ui]

New SVG icons (e.g., LoginIcon, LogoutIcon) are added to the custom icon set if needed for header auth UI, following the existing icon component pattern (size prop, SVG paths).

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Update Header with auth-conditional rendering"]
files:
  - frontend/src/components/icons/index.tsx
```

**Verification:**

- `npm run typecheck` passes
- Icons render correctly when imported

### Update Header with auth-conditional rendering [ui]

Header component conditionally renders: Login/Register links when `isAuthenticated === false`, profile icon + logout button when `isAuthenticated === true`. Both desktop and mobile menu updated. Layout remains stable between states.

**Metadata:**

```yaml
depends_on: ["Create AuthContext provider", "Add auth icons to icon set"]
parallel: false
conflicts_with: []
files:
  - frontend/src/components/Header.tsx
```

**Verification:**

- `npm run typecheck` passes
- Header shows login/register when logged out
- Header shows profile icon + logout when logged in
- Mobile menu includes auth links in both states
- No layout shift between states

### CI/CD validation [verification]

All pages and components pass TypeScript typecheck, linting, and formatting checks.

**Metadata:**

```yaml
depends_on:
  ["Create Login page", "Create Register page", "Update Header with auth-conditional rendering"]
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `npm run typecheck` passes with zero errors
- `npm run lint:fix` passes
- `npx prettier --check "frontend/src/**/*.tsx"` passes

---

## Dependency Legend

| Field            | Purpose                                           | Example                            |
| ---------------- | ------------------------------------------------- | ---------------------------------- |
| `depends_on`     | Must complete before this task starts             | `["Create AuthContext provider"]`  |
| `parallel`       | Can run concurrently with other parallel tasks    | `true` / `false`                   |
| `conflicts_with` | Cannot run in parallel (same files)               | `["Update Header"]`                |
| `files`          | Files this task modifies (for conflict detection) | `["src/contexts/AuthContext.tsx"]` |

---

## Notes

- All UI text must be in **Vietnamese**
- No new npm dependencies — use existing Next.js + Tailwind + custom icons only
- Form patterns should follow existing checkout page validation style (manual `validate()` + `errors` state)
- Password show/hide toggle should follow profile page pattern (EyeIcon/EyeOffIcon)
- Auth state is ephemeral (React state only) — no localStorage/sessionStorage persistence in this iteration
