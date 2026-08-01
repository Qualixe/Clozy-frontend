"use client";

import * as React from "react";

export type CartItem = {
  /** Unique per product *and* selected variant (size/color, etc). */
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  /** Human-readable variant description, e.g. "M / Charcoal". */
  variant?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CART_STORAGE_KEY = "clozy-cart";

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setOpen] = React.useState(false);
  const hydrated = React.useRef(false);

  // Load any previously saved cart once, after mount (avoids SSR/client
  // hydration mismatches — server always renders an empty cart).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Ignore malformed/unavailable storage.
    }
    hydrated.current = true;
  }, []);

  React.useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = React.useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((current) => {
        const existing = current.find((i) => i.id === item.id);
        if (existing) {
          return current.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + qty } : i
          );
        }
        return [...current, { ...item, qty }];
      });
      setOpen(true);
    },
    []
  );

  const updateQuantity = React.useCallback((id: string, delta: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  const value = React.useMemo(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      setOpen,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, count, subtotal, isOpen, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a <CartProvider />");
  }
  return context;
}
