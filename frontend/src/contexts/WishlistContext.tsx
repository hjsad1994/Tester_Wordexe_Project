'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { Product } from '@/components/ProductCard';
import { useAuth } from './AuthContext';

interface WishlistState {
  items: Product[];
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: Product[] };

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Idempotent — don't add duplicates
      if (state.items.some((item) => item.id === action.payload.id)) {
        return state;
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'HYDRATE':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

interface WishlistContextValue {
  wishlistItems: Product[];
  wishlistCount: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY_PREFIX = 'baby-bliss-wishlist';
const OLD_WISHLIST_KEY = 'baby-bliss-wishlist';

function getWishlistStorageKey(userId: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : `${STORAGE_KEY_PREFIX}-guest`;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });
  const isHydrated = useRef(false);
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  const justTransitionedRef = useRef(false);

  const userId = authLoading ? undefined : (user?.id ?? null);

  // Hydrate/re-hydrate wishlist when user identity changes
  useEffect(() => {
    if (userId === undefined) return; // Auth still loading

    const prevUserId = prevUserIdRef.current;

    // Skip if user hasn't actually changed
    if (prevUserId !== undefined && prevUserId === userId) return;

    // One-time migration from old unscoped key
    try {
      const oldData = localStorage.getItem(OLD_WISHLIST_KEY);
      const newKey = getWishlistStorageKey(userId);
      if (oldData && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldData);
      }
      if (oldData) {
        localStorage.removeItem(OLD_WISHLIST_KEY);
      }
    } catch {
      // localStorage not available
    }

    // Load wishlist for current user
    let items: Product[] = [];
    try {
      const stored = localStorage.getItem(getWishlistStorageKey(userId));
      if (stored) {
        const parsed = JSON.parse(stored) as Product[];
        if (Array.isArray(parsed)) {
          // Validate each item has required fields to prevent crashes
          items = parsed.filter((item: unknown): item is Product => {
            const i = item as Record<string, unknown>;
            return (
              typeof i?.id === 'string' &&
              typeof i?.name === 'string' &&
              typeof i?.price === 'number' &&
              typeof i?.category === 'string'
            );
          });
        }
      }
    } catch {
      // Corrupted data — clear it
      try {
        localStorage.removeItem(getWishlistStorageKey(userId));
      } catch {
        // localStorage not available
      }
    }

    // Signal transition — prevents sync effect from writing stale data before HYDRATE processes
    justTransitionedRef.current = true;
    dispatch({ type: 'HYDRATE', payload: items });
    prevUserIdRef.current = userId;
    isHydrated.current = true;
  }, [userId]);

  // Persist to localStorage using user-scoped key
  useEffect(() => {
    if (!isHydrated.current) return;
    if (userId === undefined) return; // Auth still loading

    // Skip the first sync after a user transition — state.items is still stale
    if (justTransitionedRef.current) {
      justTransitionedRef.current = false;
      return;
    }

    try {
      localStorage.setItem(getWishlistStorageKey(userId), JSON.stringify(state.items));
    } catch {
      // Ignore quota errors
    }
  }, [state.items, userId]);

  const wishlistCount = state.items.length;

  const addToWishlist = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  }, []);

  const isInWishlist = useCallback(
    (id: string) => {
      return state.items.some((item) => item.id === id);
    },
    [state.items]
  );

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = {
    wishlistItems: state.items,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return <WishlistContext value={value}>{children}</WishlistContext>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
