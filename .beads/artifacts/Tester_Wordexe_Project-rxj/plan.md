# Implementation Plan: Fix Product Images Not Loading

**Bead:** Tester_Wordexe_Project-rxj  
**Created:** 2026-02-22  
**Estimated:** ~2 hours  

---

## Execution Waves

| Wave | Tasks | Dependencies |
|------|-------|-------------|
| 1 | data-model-1, ui-1, ui-4 | None (parallel) |
| 2 | integration-1 | data-model-1 |
| 3 | ui-2, ui-3 | data-model-1 (parallel) |

**Verification after each wave:** `npm run typecheck` (in `frontend/`)

**Final verification:** `npm run typecheck` + `npm run lint:fix`

---

## Wave 1: Foundation (Parallel)

### Task 1: data-model-1 — Update CartItem Interface

**File:** `frontend/src/contexts/CartContext.tsx`

**Change 1:** Add `imageUrl` to CartItem interface (line 21-27)

```tsx
// BEFORE (lines 21-27):
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// AFTER:
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  imageUrl?: string;
  quantity: number;
}
```

That's it. No other changes needed — `addToCart` uses `Omit<CartItem, 'quantity'>` so it automatically picks up the new optional field. localStorage validation doesn't need updating since `imageUrl` is optional.

**Verify:** `cd frontend && npx tsc --noEmit`

---

### Task 2: ui-1 — Fix Wishlist Page Image Rendering

**File:** `frontend/src/app/wishlist/page.tsx`

**Change 1:** Add `Image` import (after line 3, where `Link` is imported)

```tsx
// BEFORE (lines 3-4):
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// AFTER:
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
```

**Change 2:** Replace illustration-only rendering with dual-render pattern (lines 110-131)

```tsx
// BEFORE (lines 110-131):
                    <Link href={productPath}>
                      <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
                        {product.badge && (
                          <div
                            className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              product.badge === 'new'
                                ? 'bg-blue-500 text-white'
                                : product.badge === 'sale'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-amber-500 text-white'
                            }`}
                          >
                            {product.badge === 'new'
                              ? 'Mới'
                              : product.badge === 'sale'
                                ? 'Sale'
                                : 'Hot'}
                          </div>
                        )}
                        {IllustrationComponent && <IllustrationComponent size={120} />}
                      </div>
                    </Link>

// AFTER:
                    <Link href={productPath}>
                      <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center overflow-hidden">
                        {product.badge && (
                          <div
                            className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              product.badge === 'new'
                                ? 'bg-blue-500 text-white'
                                : product.badge === 'sale'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-amber-500 text-white'
                            }`}
                          >
                            {product.badge === 'new'
                              ? 'Mới'
                              : product.badge === 'sale'
                                ? 'Sale'
                                : 'Hot'}
                          </div>
                        )}
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-4">
                            {IllustrationComponent && <IllustrationComponent size={120} />}
                          </div>
                        )}
                      </div>
                    </Link>
```

Key changes:
- Added `overflow-hidden` to container (for `fill` Image)
- Removed `p-4` from container (conflicts with `fill` Image), moved to illustration fallback div
- Added `product.imageUrl` check with `<Image>` component
- Wrapped illustration in a centered div

**Verify:** `cd frontend && npx tsc --noEmit`

---

### Task 3: ui-4 — Fix Order Success Page Image Rendering

**File:** `frontend/src/app/checkout/success/page.tsx`

**Change 1:** Add `Image` import (after line 3)

```tsx
// BEFORE (lines 3-4):
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// AFTER:
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
```

**Change 2:** Replace illustration-only rendering with URL detection (lines 224-251)

The success page gets `item.image` from the backend order API. The backend stores `product.images[0]` (a Cloudinary URL) at order creation. Old orders may have illustration keys. We detect by checking if the value starts with `http`.

```tsx
// BEFORE (lines 224-251):
              {order.items.map((item) => {
                const Illustration = productIllustrations[item.image as ProductIllustrationType];
                const key =
                  typeof item.product === 'string'
                    ? `${item.product}-${item.productName}`
                    : `${item.product._id}-${item.productName}`;

                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center flex-shrink-0">
                      {Illustration ? (
                        <Illustration size={32} />
                      ) : (
                        <span className="text-pink-300 text-lg">🎁</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatPrice(item.productPrice * item.quantity)}
                    </p>
                  </div>
                );
              })}

// AFTER:
              {order.items.map((item) => {
                const isImageUrl = item.image?.startsWith('http');
                const Illustration = !isImageUrl
                  ? productIllustrations[item.image as ProductIllustrationType]
                  : null;
                const key =
                  typeof item.product === 'string'
                    ? `${item.product}-${item.productName}`
                    : `${item.product._id}-${item.productName}`;

                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {isImageUrl ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : Illustration ? (
                        <Illustration size={32} />
                      ) : (
                        <span className="text-pink-300 text-lg">🎁</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatPrice(item.productPrice * item.quantity)}
                    </p>
                  </div>
                );
              })}
```

Key changes:
- Check `item.image?.startsWith('http')` to distinguish URL from illustration key
- Render `<Image>` for URLs, illustration for keys, 🎁 for unknown
- Added `relative` and `overflow-hidden` to container for `fill` Image
- Added `sizes="48px"` matching the 12×12 (48px) container

**Verify:** `cd frontend && npx tsc --noEmit`

---

## Wave 2: Integration (Sequential)

### Task 4: integration-1 — Update All addToCart Call Sites

Three files need `imageUrl` passed to `addToCart()`.

**File 1:** `frontend/src/components/ProductCard.tsx` (line 201-206)

```tsx
// BEFORE (lines 201-206):
            const result = addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.illustration,
            });

// AFTER:
            const result = addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.illustration,
              imageUrl: product.imageUrl,
            });
```

**File 2:** `frontend/src/app/products/[id]/page.tsx` (lines 746-751)

```tsx
// BEFORE (lines 746-751):
                      const result = addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.illustration,
                      });

// AFTER:
                      const result = addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.illustration,
                        imageUrl: product.imageUrl,
                      });
```

Also update the `setBuyNowItem` call (lines 782-788):

```tsx
// BEFORE (lines 782-788):
                    setBuyNowItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.illustration,
                      quantity: selectedQuantity,
                    });

// AFTER:
                    setBuyNowItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.illustration,
                      imageUrl: product.imageUrl,
                      quantity: selectedQuantity,
                    });
```

**File 3:** `frontend/src/app/wishlist/page.tsx` (lines 157-162)

```tsx
// BEFORE (lines 157-162):
                            const result = addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.illustration,
                            });

// AFTER:
                            const result = addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.illustration,
                              imageUrl: product.imageUrl,
                            });
```

**Verify:** `cd frontend && npx tsc --noEmit` + `grep -rn "addToCart(" frontend/src/ | grep -v node_modules` to confirm all call sites include `imageUrl`

---

## Wave 3: UI Rendering (Parallel)

### Task 5: ui-2 — Fix Cart Page Image Rendering

**File:** `frontend/src/app/cart/page.tsx`

**Change 1:** Add `Image` import (after line 3)

```tsx
// BEFORE (lines 3-4):
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// AFTER:
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
```

**Change 2:** Replace illustration-only rendering with dual-render pattern (lines 89-105)

```tsx
// BEFORE (lines 89-105):
                {cartItems.map((item) => {
                  const IllustrationComponent =
                    productIllustrations[item.image as ProductIllustrationType];

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-md border border-pink-50 p-4 sm:p-5 flex gap-4 sm:gap-5 items-center transition-all hover:shadow-lg"
                    >
                      {/* Product Illustration */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center overflow-hidden">
                        {IllustrationComponent ? (
                          <IllustrationComponent size={64} />
                        ) : (
                          <CartIcon size={32} className="text-pink-300" />
                        )}
                      </div>

// AFTER:
                {cartItems.map((item) => {
                  const IllustrationComponent =
                    productIllustrations[item.image as ProductIllustrationType];

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-md border border-pink-50 p-4 sm:p-5 flex gap-4 sm:gap-5 items-center transition-all hover:shadow-lg"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 80px, 96px"
                          />
                        ) : IllustrationComponent ? (
                          <IllustrationComponent size={64} />
                        ) : (
                          <CartIcon size={32} className="text-pink-300" />
                        )}
                      </div>
```

Key changes:
- Added `relative` to container for `fill` Image
- Check `item.imageUrl` first → `<Image>`, then illustration, then fallback icon
- Comment updated from "Illustration" to "Image"
- Added `sizes` matching w-20/w-24 containers

**Verify:** `cd frontend && npx tsc --noEmit`

---

### Task 6: ui-3 — Fix Checkout Page Image Rendering

**File:** `frontend/src/app/checkout/page.tsx`

**Change 1:** Add `Image` import (after line 3)

```tsx
// BEFORE (lines 3-4):
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// AFTER:
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
```

**Change 2:** Replace illustration-only rendering with dual-render pattern (lines 434-457)

```tsx
// BEFORE (lines 434-457):
                    {checkoutItems.map((item) => {
                      const Illustration =
                        productIllustrations[item.image as ProductIllustrationType];
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {Illustration ? (
                              <Illustration size={36} />
                            ) : (
                              <span className="text-pink-300 text-lg">🎁</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      );
                    })}

// AFTER:
                    {checkoutItems.map((item) => {
                      const Illustration =
                        productIllustrations[item.image as ProductIllustrationType];
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : Illustration ? (
                              <Illustration size={36} />
                            ) : (
                              <span className="text-pink-300 text-lg">🎁</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      );
                    })}
```

Key changes:
- Added `relative` to container for `fill` Image
- Check `item.imageUrl` first → `<Image>`, then illustration, then 🎁 emoji
- Added `sizes="56px"` matching the w-14 (56px) container

**Verify:** `cd frontend && npx tsc --noEmit`

---

## Post-Implementation Verification

After all waves complete:

```bash
cd frontend
npx tsc --noEmit              # TypeScript passes
npm run lint:fix               # Lint passes (or auto-fixes)
```

Search all `addToCart(` calls to confirm none were missed:
```bash
grep -rn "addToCart(" frontend/src/ --include="*.tsx" --include="*.ts"
```

## Backward Compatibility Notes

- `imageUrl` is optional on `CartItem` → existing localStorage data works without migration
- Success page detects URL vs illustration key via `startsWith('http')` → works with both old and new orders
- All rendering has 3-tier fallback: imageUrl → illustration → emoji/icon
