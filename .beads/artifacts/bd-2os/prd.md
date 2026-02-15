# Beads PRD

**Bead:** bd-2os  
**Created:** 2026-02-15  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: false
conflicts_with: []
blocks: []
estimated_hours: 8
```

---

## Problem Statement

### What problem are we solving?

Admin product management is currently embedded inside the public `/products` page via `#admin-panel`, and admin category management is embedded inside the homepage categories section. This mixes storefront and back-office workflows, makes navigation harder for admins, and creates an awkward UX for future admin modules.

### Why now?

The team needs a dedicated admin surface with left-side navigation for product/category operations so admin workflows scale cleanly and remain visually consistent with the site. Keeping admin controls embedded in public pages increases maintenance overhead and makes future management features harder to extend.

### Who is affected?

- **Primary users:** Admin users managing products and categories
- **Secondary users:** Storefront users who should see cleaner product/home pages without embedded admin panels

---

## Scope

### In-Scope

- Create a dedicated admin route group/page separate from `/products#admin-panel`
- Add a left sidebar navigation for admin sections (at minimum: product management, category management)
- Move existing admin product CRUD UI out of `frontend/src/app/products/page.tsx` into the new admin area
- Move existing admin category CRUD UI out of `frontend/src/components/Categories.tsx` into the new admin area
- Update header/admin entry links to the new admin route
- Preserve current website visual language (layout rhythm, color system, typography usage, interaction tone)
- Keep existing backend RBAC/API integration behavior unchanged
- Keep CI checks green

### Out-of-Scope

- Redesigning the entire storefront visual identity
- Introducing new backend APIs, role models, or permission systems
- Adding unrelated admin domains (orders, users, analytics) beyond navigation placeholders
- Migrating to a different state management or data fetching architecture

---

## Proposed Solution

### Overview

Introduce a dedicated `/admin` experience using App Router pages and a shared admin layout with a left sidebar. Extract and relocate existing product/category admin CRUD sections from public pages into admin-focused pages while reusing current API client functions and auth role checks (`isAdmin`) so behavior remains consistent. Update entry points to navigate admins directly to `/admin` instead of hash-based anchors.

### User Flow

1. Admin opens website and selects the admin entry from header navigation.
2. Admin lands on a dedicated admin page with a persistent left sidebar.
3. Admin chooses "Products" or "Categories" from sidebar and performs existing CRUD workflows.
4. Non-admin users do not see admin entry points and cannot access admin write UI.

---

## Requirements

### Functional Requirements

#### Dedicated Admin Routing and Layout

Admin workflows live under a dedicated route space with a reusable layout and left sidebar navigation.

**Scenarios:**

- **WHEN** an admin visits `/admin` **THEN** the page renders an admin-specific layout with a left sidebar and default management content.
- **WHEN** an admin navigates within admin sections **THEN** navigation state remains clear and the selected section is visually active.

#### Product and Category Management Relocation

Existing admin CRUD capabilities for products and categories are moved from public pages into admin pages without behavior regressions.

**Scenarios:**

- **WHEN** an admin opens product management in admin area **THEN** they can create/edit/delete products using current API integrations.
- **WHEN** an admin opens category management in admin area **THEN** they can create/edit/delete categories using current API integrations.

#### Public Page Cleanup

Public-facing pages no longer embed admin management panels.

**Scenarios:**

- **WHEN** any user opens `/products` **THEN** the page does not include the former `#admin-panel` section.
- **WHEN** any user opens homepage categories section **THEN** embedded category admin CRUD controls are not shown there.

#### Updated Admin Entry Points

Navigation links previously targeting `/products#admin-panel` point to the new admin route.

**Scenarios:**

- **WHEN** an admin uses desktop or mobile header navigation **THEN** admin links route to `/admin` (or selected default subpage).
- **WHEN** non-admin users browse header navigation **THEN** admin links remain hidden as today.

### Non-Functional Requirements

- **Performance:** Admin route should not introduce unnecessary duplicate data fetching versus current CRUD flows.
- **Security:** Frontend role gating remains UX-only; backend RBAC enforcement on write APIs remains the security boundary.
- **Accessibility:** Sidebar supports keyboard navigation, visible focus states, and active state semantics (e.g., `aria-current`).
- **Compatibility:** Maintain current cookie-based API authentication (`credentials: "include"`) and existing admin CRUD API contracts.

---

## Success Criteria

- [ ] Admin panel is no longer hosted at `/products#admin-panel` and is accessible via a dedicated `/admin` route with left sidebar navigation.
  - Verify: Manual check `http://localhost:3000/products` has no admin panel section and `http://localhost:3000/admin` renders admin layout + sidebar.
- [ ] Product and category admin CRUD workflows still work from the new admin pages.
  - Verify: Manual admin smoke test for create/update/delete products and categories via admin pages.
- [ ] Header admin navigation targets the new route on both desktop and mobile menus.
  - Verify: Manual check of admin nav link behavior in desktop and mobile viewports.
- [ ] Frontend quality gates stay green for this refactor.
  - Verify: `cd frontend && npm run lint`
  - Verify: `cd frontend && npm run typecheck`
- [ ] End-to-end regression checks pass for existing Playwright suite.
  - Verify: `cd playwright && npm test`

---

## Technical Context

### Existing Patterns

- Admin panel currently embedded in products page: `frontend/src/app/products/page.tsx`
- Header admin links currently route to hash anchor: `frontend/src/components/Header.tsx`
- Category admin CRUD currently embedded in categories component: `frontend/src/components/Categories.tsx`
- Auth admin gating via context (`isAdmin`): `frontend/src/contexts/AuthContext.tsx`
- Shared CRUD API client with cookie auth: `frontend/src/lib/api.ts`
- Root providers/layout for consistency: `frontend/src/app/layout.tsx`

### Key Files

- `frontend/src/app/products/page.tsx` - Contains current `#admin-panel` section and product admin CRUD state/actions
- `frontend/src/components/Categories.tsx` - Contains current category admin CRUD section
- `frontend/src/components/Header.tsx` - Admin navigation entry points for desktop/mobile
- `frontend/src/contexts/AuthContext.tsx` - `isAdmin` logic used to conditionally render admin UI
- `frontend/src/lib/api.ts` - Product/category CRUD API functions to reuse

### Affected Files

```yaml
files:
  - frontend/src/app/products/page.tsx
  - frontend/src/components/Categories.tsx
  - frontend/src/components/Header.tsx
  - frontend/src/contexts/AuthContext.tsx
  - frontend/src/lib/api.ts
  - frontend/src/app/layout.tsx
  - frontend/src/app/admin/layout.tsx
  - frontend/src/app/admin/page.tsx
  - frontend/src/app/admin/products/page.tsx
  - frontend/src/app/admin/categories/page.tsx
  - frontend/src/components/admin/AdminSidebar.tsx
  - frontend/src/components/admin/AdminProductsPanel.tsx
  - frontend/src/components/admin/AdminCategoriesPanel.tsx
  - playwright/tests/**/*.spec.ts
```

---

## Risks & Mitigations

| Risk                                                            | Likelihood | Impact | Mitigation                                                                                |
| --------------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------- |
| Admin logic remains duplicated between old and new locations    | Med        | High   | Explicitly remove embedded admin sections from public pages during migration              |
| Navigation regressions break admin discoverability              | Med        | Med    | Update desktop/mobile header links together and verify both breakpoints manually          |
| UI style drift from main website after introducing admin layout | Med        | Med    | Reuse existing shared layout/components/tokens before adding new visual primitives        |
| Non-admin users can still discover admin UI route shell         | Low        | Med    | Keep client-side `isAdmin` gating and rely on existing backend RBAC for all write actions |
| Refactor introduces CI failures (lint/type errors)              | Med        | High   | Run lint/typecheck/playwright verification before completion                              |

---

## Open Questions

| Question                                                                                   | Owner        | Due Date                       | Status |
| ------------------------------------------------------------------------------------------ | ------------ | ------------------------------ | ------ |
| Should `/admin` default to products view or show a lightweight dashboard                   | Product + FE | Before `/start` implementation | Open   |
| Should admin categories be fully removed from homepage component or only hidden for admins | FE           | Before `/start` implementation | Open   |

---

## Tasks

### Create dedicated admin route shell with sidebar [frontend]

An admin route group exists with a reusable layout and left sidebar navigation that defines stable entry points for product and category management.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - frontend/src/app/admin/layout.tsx
  - frontend/src/app/admin/page.tsx
  - frontend/src/components/admin/AdminSidebar.tsx
  - frontend/src/app/layout.tsx
```

**Verification:**

- `cd frontend && npm run typecheck`
- Manual check: `/admin` renders sidebar with Products and Categories navigation links.

### Move product admin CRUD from /products to /admin/products [frontend]

Product admin CRUD interactions are available from `/admin/products` and removed from the public `/products` page.

**Metadata:**

```yaml
depends_on: ["Create dedicated admin route shell with sidebar [frontend]"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/products/page.tsx
  - frontend/src/app/admin/products/page.tsx
  - frontend/src/components/admin/AdminProductsPanel.tsx
  - frontend/src/lib/api.ts
  - frontend/src/contexts/AuthContext.tsx
```

**Verification:**

- `cd frontend && npm run lint`
- Manual check: `/products` has no `#admin-panel` section, `/admin/products` supports admin CRUD flows.

### Move category admin CRUD from homepage section to /admin/categories [frontend]

Category admin CRUD interactions are available from `/admin/categories` and no longer embedded in the storefront categories component.

**Metadata:**

```yaml
depends_on: ["Create dedicated admin route shell with sidebar [frontend]"]
parallel: true
conflicts_with: []
files:
  - frontend/src/components/Categories.tsx
  - frontend/src/app/admin/categories/page.tsx
  - frontend/src/components/admin/AdminCategoriesPanel.tsx
  - frontend/src/lib/api.ts
  - frontend/src/contexts/AuthContext.tsx
```

**Verification:**

- `cd frontend && npm run lint`
- Manual check: homepage categories section no longer exposes admin CRUD controls; `/admin/categories` supports admin CRUD flows.

### Update admin entry links and active navigation states [frontend]

All admin entry links route to the new admin pages and sidebar active states are clear on desktop/mobile paths.

**Metadata:**

```yaml
depends_on:
  - "Create dedicated admin route shell with sidebar [frontend]"
  - "Move product admin CRUD from /products to /admin/products [frontend]"
  - "Move category admin CRUD from homepage section to /admin/categories [frontend]"
parallel: false
conflicts_with: []
files:
  - frontend/src/components/Header.tsx
  - frontend/src/components/admin/AdminSidebar.tsx
```

**Verification:**

- `cd frontend && npm run typecheck`
- Manual check: header admin links no longer use `/products#admin-panel`; sidebar marks current section.

### Add/adjust regression coverage for new admin route flow [testing]

Automated checks cover the new admin route navigation and existing critical behavior remains green in CI.

**Metadata:**

```yaml
depends_on:
  - "Update admin entry links and active navigation states [frontend]"
parallel: false
conflicts_with: []
files:
  - playwright/tests/**/*.spec.ts
  - playwright/pages/*.ts
  - playwright/fixtures/*.ts
```

**Verification:**

- `cd playwright && npm test`
- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`

---

## Notes

- Preserve backend RBAC and API contracts; this bead focuses on frontend route/UX restructuring.
- Preserve existing website visual style by reusing current shared layout primitives before introducing new styling tokens.
