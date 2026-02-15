# Beads PRD Template

**Bead:** bd-3ub  
**Created:** 2026-02-15  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 2
```

---

## Problem Statement

### What problem are we solving?

Admin panel navigation is being visually cropped, so users cannot reliably see the full navigation area across relevant viewport sizes. This reduces usability and can block admin actions when navigation items are partially hidden.

### Why now?

This issue is already visible in current admin usage and directly affects core admin workflows. Delaying the fix increases risk of operational friction for content/product management tasks.

### Who is affected?

- **Primary users:** Admin users managing products/categories in `/admin/*`.
- **Secondary users:** QA and support teams validating admin workflows.

---

## Scope

### In-Scope

- Fix layout/overflow behavior so admin navigation is fully visible and usable in intended desktop/mobile admin views.
- Update admin layout/sidebar classes and any scoped styling needed to remove cropping behavior.
- Add or update automated verification for admin navigation visibility/structure on admin routes.

### Out-of-Scope

- Full admin UI redesign or information architecture changes.
- Changes to non-admin page navigation behavior unless required to prevent direct regressions.
- New admin features unrelated to navigation visibility.

---

## Proposed Solution

### Overview

Adjust the admin layout container and sidebar overflow/size behavior so navigation is not constrained by unintended width/overflow rules, while preserving existing responsive behavior and admin route gating.

### User Flow (if user-facing)

1. Admin user opens `/admin` (redirects to `/admin/products`).
2. Admin sidebar/navigation renders fully without cropped items.
3. Admin user can navigate between admin sections on both mobile and desktop layouts.

---

## Requirements

### Functional Requirements

#### Admin navigation is fully visible

Admin navigation must render without visual cropping in supported admin viewports.

**Scenarios:**

- **WHEN** an admin opens `/admin/products` on desktop **THEN** the full sidebar navigation area is visible and usable.
- **WHEN** an admin opens `/admin/products` on mobile **THEN** navigation remains fully reachable (visible or scrollable as designed) without clipped controls.

#### Existing admin route behavior remains intact

Auth-based route gating and redirects must continue to work after layout changes.

**Scenarios:**

- **WHEN** a non-admin user navigates to `/admin` **THEN** they are redirected away as currently defined.
- **WHEN** an admin user navigates to `/admin` **THEN** redirect to `/admin/products` still works.

### Non-Functional Requirements

- **Performance:** No measurable increase in page load/render latency for admin pages.
- **Security:** No changes to authentication/authorization logic.
- **Accessibility:** Navigation remains keyboard reachable and current contrast semantics are preserved.
- **Compatibility:** Behavior remains correct in responsive breakpoints currently used by the project (`sm`, `md`, `lg`).

---

## Success Criteria

- [ ] Admin navigation is no longer visually cropped in admin routes across mobile and desktop breakpoints.
  - Verify: `cd frontend && npm run lint`
  - Verify: `cd frontend && npm run typecheck`
- [ ] Admin and non-admin route behavior stays correct after the layout fix.
  - Verify: `cd playwright && npm run test -- tests/rbac/admin-route-flow.spec.ts`
- [ ] No regressions in admin products/categories route rendering after navigation/layout adjustments.
  - Verify: `cd frontend && npm run build`
- [ ] Manual visual check confirms full navigation visibility on `/admin/products` and `/admin/categories`.
  - Verify: `cd frontend && npm run dev` and inspect `/admin/products`, `/admin/categories` at mobile + desktop widths

---

## Technical Context

### Existing Patterns

- Admin layout composition and route gating: `frontend/src/app/admin/layout.tsx`.
- Sidebar navigation active-state pattern with `usePathname`: `frontend/src/components/admin/AdminSidebar.tsx`.
- Global overflow/theme tokens that can affect cropping behavior: `frontend/src/app/globals.css`.
- Header uses constrained container patterns (`max-w-*`) that mirror current layout conventions: `frontend/src/components/Header.tsx`.

### Key Files

- `frontend/src/app/admin/layout.tsx` - Admin page frame, container width, auth gating, and composition with sidebar/main.
- `frontend/src/components/admin/AdminSidebar.tsx` - Sidebar width/overflow/responsive behavior and link rendering.
- `frontend/src/app/globals.css` - Global overflow rules (`overflow-x: hidden`) and theme vars affecting layout.
- `frontend/src/app/admin/page.tsx` - Admin root redirect behavior.
- `playwright/tests/rbac/admin-route-flow.spec.ts` - Existing route access/redirect test pattern for admin flows.

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/app/admin/layout.tsx
  - frontend/src/components/admin/AdminSidebar.tsx
  - frontend/src/app/globals.css
  - playwright/tests/rbac/admin-route-flow.spec.ts
  - frontend/src/app/admin/products/page.tsx
  - frontend/src/app/admin/categories/page.tsx
```

---

## Open Questions

| Question                                                                                                                | Owner            | Due Date   | Status |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------- | ------ |
| Is cropping primarily observed on mobile, desktop, or both?                                                             | Product/Reporter | 2026-02-16 | Open   |
| Should admin layout be full viewport width, or only ensure sidebar is fully visible within current max-width container? | Product/Reporter | 2026-02-16 | Open   |

---

## Tasks

Write tasks in a machine-convertible format for `prd-task` skill.

### Stabilize admin layout width behavior [layout]

Admin layout uses a container strategy that preserves current page structure while ensuring navigation is not visually cropped in the main admin frame.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: ["Harden sidebar overflow and responsive behavior"]
files:
  - frontend/src/app/admin/layout.tsx
```

**Verification:**

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`

### Harden sidebar overflow and responsive behavior [ui]

Admin sidebar renders fully with responsive width/overflow rules that avoid clipping navigation items across supported breakpoints.

**Metadata:**

```yaml
depends_on: ["Stabilize admin layout width behavior"]
parallel: false
conflicts_with: ["Stabilize admin layout width behavior"]
files:
  - frontend/src/components/admin/AdminSidebar.tsx
  - frontend/src/app/globals.css
```

**Verification:**

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run dev` and manually validate `/admin/products` at mobile and desktop widths

### Preserve admin route gating and redirect behavior [routing]

Admin auth gating and `/admin` redirect semantics remain unchanged after layout/navigation fixes.

**Metadata:**

```yaml
depends_on: ["Harden sidebar overflow and responsive behavior"]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/admin/layout.tsx
  - frontend/src/app/admin/page.tsx
  - frontend/src/app/admin/products/page.tsx
  - frontend/src/app/admin/categories/page.tsx
```

**Verification:**

- `cd playwright && npm run test -- tests/rbac/admin-route-flow.spec.ts`

### Add regression coverage for navigation visibility [test]

Automated coverage explicitly verifies admin navigation visibility/structure so future layout changes do not reintroduce cropping.

**Metadata:**

```yaml
depends_on: ["Harden sidebar overflow and responsive behavior"]
parallel: true
conflicts_with: []
files:
  - playwright/tests/rbac/admin-route-flow.spec.ts
```

**Verification:**

- `cd playwright && npm run test -- tests/rbac/admin-route-flow.spec.ts`

---

## Notes

- Current likely constraints to review during implementation: `max-w-7xl` usage in admin layout and global `overflow-x: hidden` in `globals.css`.
- Keep changes scoped to admin navigation visibility and avoid unrelated UI redesign.
