# Beads PRD: Redesign Footer to Be More Compact

**Bead:** bd-frz  
**Created:** 2026-02-13  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 1
```

---

## Problem Statement

### What problem are we solving?

The current footer occupies too much vertical space with a 5-column grid layout (brand column spanning 2 + 3 link columns), large padding (`py-16`), generous spacing between items, and decorative blur elements. On a baby e-commerce site, the footer should feel light, compact, and informative — not dominate the bottom of every page.

### Why now?

Part of ongoing UI refinement to make the website feel more polished and professional. A compact footer improves the overall page proportion and reduces unnecessary scrolling.

### Who is affected?

- **Primary users:** All site visitors (footer appears on all 9 pages)
- **Secondary users:** Site maintainers (simpler structure is easier to maintain)

---

## Scope

### In-Scope

- Reduce footer vertical height by consolidating layout
- Combine link columns into a more compact arrangement (e.g., horizontal groups or 2-row grid)
- Keep all existing information: brand, contact info, social links, navigation links, copyright
- Maintain pink pastel design system consistency
- Maintain responsive behavior (mobile/tablet/desktop)
- Keep existing link hover animations

### Out-of-Scope

- Adding new footer sections or links
- Changing footer content/text (only layout changes)
- Modifying the icon components
- Adding newsletter signup or other new features
- Changes to `globals.css` or design tokens

---

## Proposed Solution

### Overview

Redesign the footer into a more compact 2-section layout: a **main row** containing the brand (logo + tagline inline), link groups arranged horizontally, and contact/social info condensed into a single line or small group; followed by a slim **bottom bar** with copyright. Remove decorative blur circles and reduce vertical padding to create a footer that is roughly 40-50% shorter while retaining all necessary information.

### Design Approach

1. **Top section**: Horizontal layout with brand on left, link groups in the middle, and contact + social on the right — all in a single visual "band"
2. **Bottom bar**: Slim copyright line (keep "Made with ♥ in Vietnam")
3. Reduce `py-16` to `py-8` or `py-6`
4. Reduce `gap-12` to `gap-6` or `gap-8`
5. Reduce link spacing from `space-y-3` to `space-y-2` or `space-y-1.5`
6. Remove or simplify decorative blur circles
7. Contact info on a single line or compact group (icons inline, no wrapping `div` backgrounds)

---

## Requirements

### Functional Requirements

#### Compact Layout

All footer information must remain visible but in a denser arrangement.

**Scenarios:**

- **WHEN** user views the footer on desktop **THEN** all links, contact info, social icons, and copyright are visible in a compact layout
- **WHEN** user views the footer on mobile **THEN** content stacks vertically but with reduced padding/spacing compared to current design
- **WHEN** user hovers over a link **THEN** the pink hover effect and underline animation still works

#### Information Retention

No existing content should be removed.

**Scenarios:**

- **WHEN** user looks at the footer **THEN** they see: brand logo + name, tagline, description, phone, email, address, Facebook, Instagram, all shop/support/company links, and copyright
- **WHEN** user clicks a footer link **THEN** it navigates to the correct page (same behavior as current)

### Non-Functional Requirements

- **Performance:** No additional JS or dependencies; pure layout/styling change
- **Accessibility:** Maintain all existing `aria-label` attributes and semantic HTML
- **Compatibility:** Works on all breakpoints (mobile, tablet, desktop via existing Tailwind responsive prefixes)

---

## Success Criteria

- [ ] Footer vertical height is visibly reduced (roughly 40-50% shorter on desktop)
  - Verify: `Visual comparison of before/after`
- [ ] All existing information is still present (brand, contact, social, links, copyright)
  - Verify: `grep -c "href=" frontend/src/components/Footer.tsx` returns same or more link count (currently 16 href attributes)
- [ ] Responsive design works on mobile, tablet, desktop
  - Verify: `Resize browser to 375px, 768px, 1280px and confirm layout adapts`
- [ ] TypeScript compiles without errors
  - Verify: `npm run typecheck`
- [ ] Linting passes
  - Verify: `npm run lint:fix`
- [ ] Pink pastel theme is maintained (no color changes)
  - Verify: `Visual inspection confirms pink gradient background, pink hover effects`

---

## Technical Context

### Existing Patterns

- Tailwind utility classes + CSS variables for theming: `frontend/src/app/globals.css`
- Icon components: `frontend/src/components/icons/index.tsx`
- Header uses similar pink pastel styling: `frontend/src/components/Header.tsx`

### Key Files

- `frontend/src/components/Footer.tsx` — The only file to modify

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/components/Footer.tsx # Layout and styling changes
```

---

## Tasks

### Redesign footer layout to compact structure [ui]

The footer component has a condensed layout with reduced padding, tighter spacing, and a more horizontal arrangement of content while preserving all existing links, contact info, social icons, and copyright text.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/components/Footer.tsx
```

**Verification:**

- `npm run typecheck` passes
- `npm run lint:fix` passes
- Visual inspection confirms compact layout at 375px, 768px, and 1280px widths
- All 16 `href` attributes are still present in the file
- Pink pastel theme colors are preserved

---

## Notes

- This is a single-file change (Footer.tsx only)
- The footer is used on 9 pages — all will benefit from the compact redesign
- No test files exist for the footer; verification is visual + typecheck/lint
- Vietnamese text must be preserved exactly as-is
