# Implementation Plan: bd-4cx — Fix Cart/Wishlist localStorage Data Leakage

## Strategy

**Approach:** Per-user localStorage key scoping via AuthContext consumption.

Cart and Wishlist contexts consume `useAuth()` to get the current user ID, then use `baby-bliss-cart-{userId}` and `baby-bliss-wishlist-{userId}` as storage keys. When user changes (login/logout), contexts re-hydrate from the new user's key. No changes needed in AuthContext — cleanup is reactive.

**Key Decisions:**
- On logout: Clear React state only. Keep localStorage key for session restoration on re-login.
- Per-user scoping provides isolation — User B cannot access User A's key.
- Guest users use `-guest` suffix.
- Old `baby-bliss-cart` / `baby-bliss-wishlist` keys are ignored (backward compat: no crash).
- Wait for `authLoading` to resolve before hydrating (prevents double-hydrate).

## Execution Waves

### Wave 1 (parallel): Per-user scoping

| Task | File | Changes |
|------|------|---------|
| 1 | `frontend/src/contexts/CartContext.tsx` | Import useAuth, dynamic storage key, user-reactive hydration |
| 2 | `frontend/src/contexts/WishlistContext.tsx` | Import useAuth, dynamic storage key, user-reactive hydration, add isHydrated ref |

### Wave 2 (sequential): Integration verification

| Task | File | Changes |
|------|------|---------|
| 3 | (none) | AuthContext needs no changes — Cart/Wishlist handle cleanup reactively |
| 4 | (none) | Manual E2E verification checkpoint |

## Task 1: CartContext — User-Scoped Storage Key

### Changes

1. **Line 13:** Replace `const STORAGE_KEY = 'baby-bliss-cart'` with prefix constant + helper function
2. **Line 7:** Add `useRef` already imported — add `useAuth` import
3. **Lines 107-111:** Add `useAuth()` consumption in CartProvider, compute userId
4. **Lines 115-149:** Replace mount-only hydration with user-change-reactive hydration effect
5. **Lines 151-160:** Update sync effect to use dynamic key and skip while auth loading

### Code Details

```tsx
// Replace line 13
const STORAGE_KEY_PREFIX = 'baby-bliss-cart';
function getCartStorageKey(userId: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : `${STORAGE_KEY_PREFIX}-guest`;
}

// In CartProvider, after useReducer:
const { user, isLoading: authLoading } = useAuth();
const prevUserIdRef = useRef<string | null | undefined>(undefined);
const userId = authLoading ? undefined : (user?.id ?? null);

// Replace hydration effect — react to userId changes
useEffect(() => {
  if (userId === undefined) return; // Auth still loading
  const prevUserId = prevUserIdRef.current;
  if (prevUserId !== undefined && prevUserId === userId) return; // No change
  
  // Load cart for current user
  let items: CartItem[] = [];
  try {
    const stored = localStorage.getItem(getCartStorageKey(userId));
    if (stored) { /* parse + validate same as before */ }
  } catch { /* clear corrupted data */ }
  
  dispatch({ type: 'HYDRATE', payload: { items, buyNowItem: null } });
  prevUserIdRef.current = userId;
  isHydrated.current = true;
}, [userId]);

// Replace sync effect — use dynamic key
useEffect(() => {
  if (!isHydrated.current || userId === undefined) return;
  try {
    localStorage.setItem(getCartStorageKey(userId), JSON.stringify({ items: state.items }));
  } catch { console.warn('Failed to persist cart to localStorage'); }
}, [state.items, userId]);
```

## Task 2: WishlistContext — User-Scoped Storage Key

Same pattern as Task 1. Additional fix: add `isHydrated` ref (currently missing, which causes a brief empty-array write on mount).

### Changes

1. **Line 54:** Replace `const STORAGE_KEY = 'baby-bliss-wishlist'` with prefix + helper
2. **Imports:** Add `useRef`, import `useAuth`
3. **Lines 56-57:** Add auth consumption, refs
4. **Lines 59-70:** Replace mount-only hydration with user-reactive effect
5. **Lines 72-79:** Update sync effect with dynamic key + isHydrated guard

## Task 3: AuthContext — No Code Changes

Cart and Wishlist handle all cleanup reactively by detecting user→null transitions. AuthContext's `logout()` already sets user to null, which triggers Cart/Wishlist to re-hydrate as guest (empty state).

## Task 4: E2E Verification (checkpoint:human-verify)

Manual testing:
1. Login as User A, add items to cart + wishlist
2. Check localStorage keys match `baby-bliss-cart-{userId}` pattern
3. Logout — verify empty cart/wishlist in UI
4. Login as User B — verify empty cart/wishlist
5. Login as User A again — verify cart restored

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run build
```
