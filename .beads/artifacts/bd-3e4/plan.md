# Fix Cart Data Leak — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Scope cart and wishlist localStorage to individual users, preventing data leakage between accounts on the same browser.

**Architecture:** Cart and Wishlist contexts consume `useAuth()` to get the current user ID. localStorage keys become `baby-bliss-cart-{userId}` (or `-guest` for unauthenticated users). When the user changes (login/logout), state is saved to the outgoing user's key and hydrated from the incoming user's key. Old global keys are migrated on first login. No AuthContext changes needed — Cart/Wishlist observe auth state reactively.

**Tech Stack:** React Context, useReducer, useRef, localStorage, TypeScript

---

## Must-Haves

**Goal:** Each user sees only their own cart/wishlist data, persisted across sessions.

### Observable Truths

1. User A's cart items are never visible to User B
2. User A's cart is restored when they log back in
3. Guest users have their own isolated cart
4. Wishlist follows the same isolation rules
5. Existing users' data migrates from old global keys seamlessly

### Required Artifacts

| Artifact                   | Provides                         | Path                                        |
| -------------------------- | -------------------------------- | ------------------------------------------- |
| CartContext (modified)     | User-scoped cart + migration     | `frontend/src/contexts/CartContext.tsx`     |
| WishlistContext (modified) | User-scoped wishlist + migration | `frontend/src/contexts/WishlistContext.tsx` |

### Key Links

| From             | To           | Via             | Risk                                     |
| ---------------- | ------------ | --------------- | ---------------------------------------- |
| CartProvider     | AuthContext  | `useAuth()`     | Auth must resolve before hydration       |
| WishlistProvider | AuthContext  | `useAuth()`     | Same timing concern                      |
| Hydration effect | localStorage | getItem/setItem | Old key migration must happen atomically |

### Task Dependencies

```
Task 1 (CartContext refactor): needs nothing, modifies CartContext.tsx
Task 2 (WishlistContext refactor): needs nothing, modifies WishlistContext.tsx
Task 3 (Verification): needs Task 1 + Task 2

Wave 1: Task 1, Task 2 (parallel — different files)
Wave 2: Task 3 (after Wave 1)
```

---

## Task 1: Refactor CartContext — User-Scoped Keys + Migration

**PRD Tasks:** cart-1, migration-1 (cart), auth-1 (cart portion)

**Files:**

- Modify: `frontend/src/contexts/CartContext.tsx`

### Step 1: Replace static STORAGE_KEY with dynamic key function

Replace line 13:

```tsx
const STORAGE_KEY = "baby-bliss-cart";
```

With:

```tsx
const OLD_STORAGE_KEY = "baby-bliss-cart";

function getCartStorageKey(userId: string | null): string {
  return userId ? `baby-bliss-cart-${userId}` : "baby-bliss-cart-guest";
}
```

### Step 2: Import useAuth and add auth-aware refs inside CartProvider

Add to imports at top of file:

```tsx
import { useAuth } from "./AuthContext";
```

Inside `CartProvider` function body, after `isHydrated` ref (line 112), add:

```tsx
const { user, isLoading } = useAuth();
const userId = user?.id ?? null;
const prevUserIdRef = useRef<string | null | undefined>(undefined);
const stateRef = useRef(state);
stateRef.current = state;
const currentKeyRef = useRef<string>(getCartStorageKey(null));
```

### Step 3: Replace mount-only hydration with user-aware hydration

Replace the hydration `useEffect` (lines 115–149) with this effect that reacts to user changes:

```tsx
// Hydrate cart state from localStorage — re-runs on user change
useEffect(() => {
  if (isLoading) return;

  // Skip if same user and already hydrated
  if (prevUserIdRef.current === userId && isHydrated.current) return;

  // Save outgoing user's cart before switching
  if (prevUserIdRef.current !== undefined && isHydrated.current) {
    try {
      const prevKey = getCartStorageKey(prevUserIdRef.current);
      localStorage.setItem(prevKey, JSON.stringify({ items: stateRef.current.items }));
    } catch {
      // Storage not available
    }
  }

  // Determine storage key for incoming user
  const key = getCartStorageKey(userId);
  currentKeyRef.current = key;
  isHydrated.current = false;
  let newItems: CartItem[] = [];

  try {
    const stored = localStorage.getItem(key);

    // Migration: if no user-scoped data and old global key exists, migrate it
    if (!stored && userId) {
      const oldData = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldData) {
        const parsed = JSON.parse(oldData) as CartState;
        if (parsed && Array.isArray(parsed.items)) {
          newItems = parsed.items.filter((item: unknown): item is CartItem => {
            const i = item as Record<string, unknown>;
            return (
              typeof i?.id === "string" &&
              typeof i?.name === "string" &&
              typeof i?.price === "number" &&
              typeof i?.image === "string" &&
              typeof i?.quantity === "number" &&
              i.quantity > 0
            );
          });
          // Persist migrated data under user key and remove old key
          localStorage.setItem(key, JSON.stringify({ items: newItems }));
          localStorage.removeItem(OLD_STORAGE_KEY);
        }
      }
    } else if (stored) {
      const parsed = JSON.parse(stored) as CartState;
      if (parsed && Array.isArray(parsed.items)) {
        newItems = parsed.items.filter((item: unknown): item is CartItem => {
          const i = item as Record<string, unknown>;
          return (
            typeof i?.id === "string" &&
            typeof i?.name === "string" &&
            typeof i?.price === "number" &&
            typeof i?.image === "string" &&
            typeof i?.quantity === "number" &&
            i.quantity > 0
          );
        });
      }
    }
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage not available
    }
  }

  dispatch({
    type: "HYDRATE",
    payload: { items: newItems, buyNowItem: null },
  });
  prevUserIdRef.current = userId;
  isHydrated.current = true;
}, [isLoading, userId]);
```

### Step 4: Update sync effect to use ref-based key

Replace the sync `useEffect` (lines 152–160) with:

```tsx
// Sync cart items to localStorage on changes (buyNowItem excluded — session-scoped)
useEffect(() => {
  if (!isHydrated.current) return;
  try {
    localStorage.setItem(currentKeyRef.current, JSON.stringify({ items: state.items }));
  } catch {
    // Storage quota exceeded or localStorage not available
    console.warn("Failed to persist cart to localStorage");
  }
}, [state.items]);
```

### Step 5: Verify typecheck

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

### Step 6: Commit

```bash
git add frontend/src/contexts/CartContext.tsx
git commit -m "fix(bd-3e4): scope cart localStorage to individual users

- Replace global 'baby-bliss-cart' key with 'baby-bliss-cart-{userId}'
- Guest users use 'baby-bliss-cart-guest' key
- Auto-hydrate correct cart on user change (login/logout)
- Save outgoing user's cart before switching
- Migrate old global key data on first login
- Gate hydration on auth loading state"
```

---

## Task 2: Refactor WishlistContext — User-Scoped Keys + Migration

**PRD Tasks:** wishlist-1, migration-1 (wishlist), auth-1 (wishlist portion)

**Files:**

- Modify: `frontend/src/contexts/WishlistContext.tsx`

**Key difference from CartContext:** Wishlist stores a plain `Product[]` array in localStorage (not wrapped in `{ items: [...] }`). Adapt accordingly. Also adds missing `isHydrated` guard that CartContext already has.

### Step 1: Add useRef import, useAuth import, and dynamic key function

Update imports to add `useRef`:

```tsx
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
```

Add after the Product import:

```tsx
import { useAuth } from "./AuthContext";
```

Replace line 54:

```tsx
const STORAGE_KEY = "baby-bliss-wishlist";
```

With:

```tsx
const OLD_STORAGE_KEY = "baby-bliss-wishlist";

function getWishlistStorageKey(userId: string | null): string {
  return userId ? `baby-bliss-wishlist-${userId}` : "baby-bliss-wishlist-guest";
}
```

### Step 2: Add auth-aware state and refs to WishlistProvider

After the `useReducer` line (line 57), add:

```tsx
const { user, isLoading } = useAuth();
const userId = user?.id ?? null;
const prevUserIdRef = useRef<string | null | undefined>(undefined);
const isHydrated = useRef(false);
const stateRef = useRef(state);
stateRef.current = state;
const currentKeyRef = useRef<string>(getWishlistStorageKey(null));
```

### Step 3: Replace mount-only hydration with user-aware hydration

Replace the hydration `useEffect` (lines 60–70) with:

```tsx
// Hydrate wishlist from localStorage — re-runs on user change
useEffect(() => {
  if (isLoading) return;

  if (prevUserIdRef.current === userId && isHydrated.current) return;

  // Save outgoing user's wishlist before switching
  if (prevUserIdRef.current !== undefined && isHydrated.current) {
    try {
      const prevKey = getWishlistStorageKey(prevUserIdRef.current);
      localStorage.setItem(prevKey, JSON.stringify(stateRef.current.items));
    } catch {
      // Storage not available
    }
  }

  const key = getWishlistStorageKey(userId);
  currentKeyRef.current = key;
  isHydrated.current = false;
  let newItems: Product[] = [];

  try {
    const stored = localStorage.getItem(key);

    // Migration: check old global key if no user-scoped data
    if (!stored && userId) {
      const oldData = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldData) {
        const parsed = JSON.parse(oldData) as Product[];
        if (Array.isArray(parsed)) {
          newItems = parsed;
          localStorage.setItem(key, JSON.stringify(newItems));
          localStorage.removeItem(OLD_STORAGE_KEY);
        }
      }
    } else if (stored) {
      const parsed = JSON.parse(stored) as Product[];
      if (Array.isArray(parsed)) {
        newItems = parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }

  dispatch({ type: "HYDRATE", payload: newItems });
  prevUserIdRef.current = userId;
  isHydrated.current = true;
}, [isLoading, userId]);
```

### Step 4: Update sync effect with isHydrated guard and ref-based key

Replace the sync `useEffect` (lines 73–79) with:

```tsx
// Persist to localStorage on change (with hydration guard)
useEffect(() => {
  if (!isHydrated.current) return;
  try {
    localStorage.setItem(currentKeyRef.current, JSON.stringify(state.items));
  } catch {
    // Ignore quota errors
  }
}, [state.items]);
```

### Step 5: Verify typecheck

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

### Step 6: Commit

```bash
git add frontend/src/contexts/WishlistContext.tsx
git commit -m "fix(bd-3e4): scope wishlist localStorage to individual users

- Replace global 'baby-bliss-wishlist' key with 'baby-bliss-wishlist-{userId}'
- Guest users use 'baby-bliss-wishlist-guest' key
- Auto-hydrate correct wishlist on user change (login/logout)
- Add isHydrated guard to prevent empty-state overwrite on mount
- Migrate old global key data on first login"
```

---

## Task 3: Final Verification + Lint

**PRD Tasks:** testing-1

### Step 1: Run typecheck

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

### Step 2: Run lint:fix

Run: `npm run lint:fix` (from project root)
Expected: No errors or only auto-fixed issues

### Step 3: Commit lint fixes if any

```bash
git add -A
git commit -m "chore(bd-3e4): lint fixes for cart/wishlist user scoping"
```

Only commit if there are actual changes from lint:fix.
