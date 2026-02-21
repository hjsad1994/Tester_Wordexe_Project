'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

const STORAGE_KEY = 'baby-bliss-cart';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface AddToCartResult {
  isNew: boolean;
  newQuantity: number;
  item: Omit<CartItem, 'quantity'>;
}

interface CartState {
  items: CartItem[];
  buyNowItem: CartItem | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_BUY_NOW'; payload: CartItem }
  | { type: 'CLEAR_BUY_NOW' }
  | { type: 'HYDRATE'; payload: CartState };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex((item) => item.id === action.payload.id);
      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
        };
        return { ...state, items: updatedItems };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_BUY_NOW':
      return { ...state, buyNowItem: action.payload };
    case 'CLEAR_BUY_NOW':
      return { ...state, buyNowItem: null };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface CartContextValue {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  buyNowItem: CartItem | null;
  addToCart: (item: Omit<CartItem, 'quantity'>) => AddToCartResult;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setBuyNowItem: (item: CartItem) => void;
  clearBuyNowItem: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    buyNowItem: null,
  });
  const isHydrated = useRef(false);

  // Hydrate cart state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartState;
        if (parsed && Array.isArray(parsed.items)) {
          // Validate each item has required numeric fields to prevent NaN propagation
          const validItems = parsed.items.filter((item: unknown): item is CartItem => {
            const i = item as Record<string, unknown>;
            return (
              typeof i?.id === 'string' &&
              typeof i?.name === 'string' &&
              typeof i?.price === 'number' &&
              typeof i?.image === 'string' &&
              typeof i?.quantity === 'number' &&
              i.quantity > 0
            );
          });
          // Only persist items — buyNowItem is session-scoped
          dispatch({
            type: 'HYDRATE',
            payload: { items: validItems, buyNowItem: null },
          });
        }
      }
    } catch {
      // Corrupted data — clear it and start fresh
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // localStorage not available
      }
    }
    isHydrated.current = true;
  }, []);

  // Sync cart items to localStorage on changes (buyNowItem excluded — session-scoped)
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
    } catch {
      // Storage quota exceeded or localStorage not available
      console.warn('Failed to persist cart to localStorage');
    }
  }, [state.items]);

  const cartCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  );

  const cartTotal = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items]
  );

  const addToCart = (item: Omit<CartItem, 'quantity'>): AddToCartResult => {
    const existing = state.items.find((i) => i.id === item.id);
    dispatch({ type: 'ADD_ITEM', payload: item });
    return {
      isNew: !existing,
      newQuantity: existing ? existing.quantity + 1 : 1,
      item,
    };
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setBuyNowItem = (item: CartItem) => {
    dispatch({ type: 'SET_BUY_NOW', payload: item });
  };

  const clearBuyNowItem = () => {
    dispatch({ type: 'CLEAR_BUY_NOW' });
  };

  const value = {
    cartItems: state.items,
    cartCount,
    cartTotal,
    buyNowItem: state.buyNowItem,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setBuyNowItem,
    clearBuyNowItem,
  };

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
