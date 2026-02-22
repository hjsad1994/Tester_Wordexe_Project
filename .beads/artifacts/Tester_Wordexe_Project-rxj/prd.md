# Beads PRD: Fix Product Images Not Loading

**Bead:** Tester_Wordexe_Project-rxj  
**Created:** 2026-02-22  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: ["Tester_Wordexe_Project-znh"] # Both touch checkout-related pages
blocks: []
estimated_hours: 3
```

---

## Problem Statement

### What problem are we solving?

Product images uploaded to Cloudinary are not displayed on the wishlist, cart, checkout, and order success pages. Instead, these pages only show SVG illustrations (or fallback emojis like 🎁). This means products with real uploaded photos never show those photos in the purchase flow.

**Two distinct bugs cause this:**

1. **Wishlist page** stores full `Product` objects (which include `imageUrl` from Cloudinary) but the render code only uses `product.illustration` to look up SVG components — it never checks for a real `imageUrl`.

2. **Cart data model** stores `image` as an illustration key string (e.g. `'teddy'`, `'clothes'`) instead of the Cloudinary URL. All `addToCart()` call sites pass `product.illustration` instead of `product.imageUrl`. Cart, checkout, and order success pages then use this key to look up SVG illustrations, so real product photos are never shown.

### Why now?

Products are being uploaded with real images via Cloudinary. Users expect to see actual product photos throughout the purchase flow (wishlist → cart → checkout → confirmation), but only see generic illustrations.

### Who is affected?

- **Primary users:** Shoppers browsing wishlist, adding to cart, and completing checkout
- **Secondary users:** Admin users who upload product images expecting them to appear everywhere

---

## Scope

### In-Scope

- Fix wishlist page to show Cloudinary images when available (fallback to SVG illustration)
- Update `CartItem` interface to carry `imageUrl` alongside existing `image` field
- Update all `addToCart()` call sites to pass `imageUrl`
- Fix cart page to show Cloudinary images when available
- Fix checkout page to show Cloudinary images when available
- Fix order success page to show Cloudinary images when available (using backend `orderItem.image` which already stores `product.images[0]`)

### Out-of-Scope

- Profile order history page (uses hardcoded sample data — separate fix)
- Admin orders panel (no images by design)
- Cloudinary URL transformation/optimization (not currently used anywhere)
- Deduplicating `mapApiProductToCard()` across files (tech debt, separate task)
- Adding `publicId` tracking to Product images schema

---

## Proposed Solution

### Overview

Add an `imageUrl` field to the `CartItem` interface and pass the Cloudinary URL through all `addToCart()` calls. Update wishlist, cart, checkout, and order success page rendering to check for a real image URL first, using `next/image` `<Image>` component when available, and falling back to SVG illustrations when no URL exists. This mirrors the existing pattern used successfully in `ProductCard.tsx` and the product detail page.

### User Flow

1. User views a product with a Cloudinary image → sees real photo (already works)
2. User adds product to wishlist → wishlist page shows real photo (currently broken → fix)
3. User adds product to cart → cart page shows real photo (currently broken → fix)
4. User proceeds to checkout → checkout page shows real photo (currently broken → fix)
5. User completes order → success page shows real photo (currently broken → fix)

---

## Requirements

### Functional Requirements

#### FR1: Wishlist Image Display

The wishlist page must show the product's Cloudinary image when available, falling back to SVG illustration.

**Scenarios:**

- **WHEN** a product with a Cloudinary image is in the wishlist **THEN** the wishlist page renders the Cloudinary image via `next/image` `<Image>`
- **WHEN** a product without a Cloudinary image is in the wishlist **THEN** the wishlist page renders the SVG illustration (existing behavior)

#### FR2: Cart Image Display

The cart page must show the product's Cloudinary image when available, falling back to SVG illustration.

**Scenarios:**

- **WHEN** a product with a Cloudinary image is added to cart **THEN** the `CartItem` stores the Cloudinary URL in `imageUrl`
- **WHEN** the cart page renders **THEN** it checks `item.imageUrl` first, renders `<Image>` if present, otherwise uses SVG illustration via `item.image`

#### FR3: Checkout Image Display

The checkout page must show product images from Cloudinary when available.

**Scenarios:**

- **WHEN** checkout renders order items **THEN** it checks `item.imageUrl` first, renders `<Image>` if present, otherwise uses SVG illustration
- **WHEN** `item.imageUrl` is a valid URL **THEN** it renders inside a properly sized container matching current layout

#### FR4: Order Success Image Display

The order success page must show product images from the order data (backend already stores `product.images[0]` in `orderItem.image`).

**Scenarios:**

- **WHEN** order success page renders items **THEN** it checks if `item.image` is a URL (starts with `http`) and renders `<Image>` if so
- **WHEN** `item.image` is an illustration key **THEN** it falls back to SVG illustration (backward compatible with old orders)

### Non-Functional Requirements

- **Performance:** Use `next/image` with appropriate `sizes` prop for responsive loading; images should be lazy loaded except above-the-fold
- **Compatibility:** Must work with existing `res.cloudinary.com` domain allowlist in `next.config.ts`
- **Backward compatibility:** Existing cart data in localStorage must still work (old items without `imageUrl` show illustrations)

---

## Success Criteria

- [ ] Wishlist page displays Cloudinary product images when available
  - Verify: `Open wishlist page with products that have uploaded images → real photos visible`
- [ ] Cart page displays Cloudinary product images when available
  - Verify: `Add product with image to cart → cart page shows real photo`
- [ ] Checkout page displays Cloudinary product images when available
  - Verify: `Proceed to checkout with products that have images → checkout shows real photos`
- [ ] Order success page displays product images from order data
  - Verify: `Complete an order → success page shows real product photos`
- [ ] Products without Cloudinary images still show SVG illustrations (no regression)
  - Verify: `Add product without uploaded image → all pages show SVG illustration as before`
- [ ] TypeScript compiles without errors
  - Verify: `npm run typecheck`
- [ ] Linting passes
  - Verify: `npm run lint:fix`

---

## Technical Context

### Existing Patterns

- `ProductCard.tsx:150-162` — Dual rendering: checks `product.imageUrl` first, falls back to `IllustrationComponent`. This is the pattern to replicate.
- `products/[id]/page.tsx:543-560` — Same dual rendering pattern on product detail page.
- `FeaturedProducts.tsx:21-36` — Maps `product.images?.[0]` → `imageUrl` via `mapApiProductToCard()`.

### Key Files

- `frontend/src/contexts/CartContext.tsx:21-27` — `CartItem` interface (needs `imageUrl` field)
- `frontend/src/components/ProductCard.tsx:201-206` — `addToCart()` call (passes `image: product.illustration`)
- `frontend/src/app/products/[id]/page.tsx:746-751` — `addToCart()` call from detail page
- `frontend/src/app/wishlist/page.tsx:99-131` — Wishlist rendering (only uses illustration)
- `frontend/src/app/cart/page.tsx:89-105` — Cart rendering (only uses illustration)
- `frontend/src/app/checkout/page.tsx:434-457` — Checkout rendering (only uses illustration)
- `frontend/src/app/checkout/success/page.tsx:224-251` — Success page rendering
- `frontend/src/components/icons/ProductIllustrations.tsx:808-821` — Illustration component map
- `backend/src/services/orderService.js:88-94` — Backend already stores `product.images[0]` in order items

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/contexts/CartContext.tsx # Add imageUrl to CartItem interface
  - frontend/src/components/ProductCard.tsx # Pass imageUrl in addToCart()
  - frontend/src/app/products/[id]/page.tsx # Pass imageUrl in addToCart()
  - frontend/src/app/wishlist/page.tsx # Fix image rendering + addToCart()
  - frontend/src/app/cart/page.tsx # Use imageUrl with Image component
  - frontend/src/app/checkout/page.tsx # Use imageUrl with Image component
  - frontend/src/app/checkout/success/page.tsx # Use imageUrl with Image component
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Existing cart items in localStorage lack `imageUrl` | High | Low | Treat missing `imageUrl` as undefined → fall back to illustration |
| Old orders have illustration key in `image` field | High | Low | Check if `image` starts with `http` to distinguish URL vs key |
| Cloudinary domain not in next.config allowlist | Low | Med | Already allowlisted at `frontend/next.config.ts:7-17` |

---

## Open Questions

| Question | Owner | Due Date | Status |
| --- | --- | --- | --- |
| (none) | - | - | - |

---

## Tasks

### Update CartItem interface [data-model]

The `CartItem` interface includes an optional `imageUrl` field for Cloudinary URLs, while preserving the existing `image` field for backward compatibility.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/contexts/CartContext.tsx
```

**Verification:**

- `npm run typecheck` passes
- `CartItem` interface has `imageUrl?: string` field

### Update all addToCart call sites [integration]

All `addToCart()` calls pass `imageUrl: product.imageUrl` (or `product.images?.[0]`) alongside the existing `image` field, so cart items carry real Cloudinary URLs when available.

**Metadata:**

```yaml
depends_on: ["Update CartItem interface"]
parallel: false
conflicts_with: []
files:
  - frontend/src/components/ProductCard.tsx
  - frontend/src/app/products/[id]/page.tsx
  - frontend/src/app/wishlist/page.tsx
```

**Verification:**

- `npm run typecheck` passes
- Search all `addToCart(` calls — each includes `imageUrl` parameter

### Fix wishlist page image rendering [ui]

The wishlist page checks `product.imageUrl` first and renders via `next/image` `<Image>`, falling back to SVG illustration — matching `ProductCard.tsx` pattern.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/app/wishlist/page.tsx
```

**Verification:**

- `npm run typecheck` passes
- Wishlist page renders `<Image>` for products with Cloudinary URLs

### Fix cart page image rendering [ui]

The cart page checks `item.imageUrl` first and renders via `next/image` `<Image>`, falling back to SVG illustration via `item.image`.

**Metadata:**

```yaml
depends_on: ["Update CartItem interface"]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/cart/page.tsx
```

**Verification:**

- `npm run typecheck` passes
- Cart page renders `<Image>` for items with `imageUrl`

### Fix checkout page image rendering [ui]

The checkout page checks `item.imageUrl` first and renders via `next/image` `<Image>`, falling back to SVG illustration via `item.image`.

**Metadata:**

```yaml
depends_on: ["Update CartItem interface"]
parallel: true
conflicts_with: ["Tester_Wordexe_Project-znh"]
files:
  - frontend/src/app/checkout/page.tsx
```

**Verification:**

- `npm run typecheck` passes
- Checkout page renders `<Image>` for items with `imageUrl`

### Fix order success page image rendering [ui]

The order success page detects whether `item.image` is a URL (starts with `http`) or an illustration key, and renders accordingly — `<Image>` for URLs, SVG illustration for keys.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/app/checkout/success/page.tsx
```

**Verification:**

- `npm run typecheck` passes
- Success page renders `<Image>` for order items with Cloudinary URLs
- Success page still renders SVG illustrations for old orders with illustration keys

---

## Dependency Legend

| Field | Purpose | Example |
| --- | --- | --- |
| `depends_on` | Must complete before this task starts | `["Update CartItem interface"]` |
| `parallel` | Can run concurrently with other parallel tasks | `true` / `false` |
| `conflicts_with` | Cannot run in parallel (same files) | `["Update config"]` |
| `files` | Files this task modifies (for conflict detection) | `["src/db/schema.ts"]` |

---

## Notes

- The backend already correctly stores `product.images[0]` in `orderItem.image` at order creation time (`orderService.js:93`), so no backend changes are needed.
- The `next.config.ts` already allowlists `res.cloudinary.com` for `next/image`, so no config changes needed.
- Existing cart data in localStorage will lack `imageUrl` — the rendering must gracefully handle this by falling back to illustrations.
