"use client";

import * as React from "react";

export type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  isWishlisted: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const WISHLIST_STORAGE_KEY = "clozy-wishlist";

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const hydrated = React.useRef(false);

  // Load any previously saved wishlist once, after mount (avoids SSR/client
  // hydration mismatches — server always renders an empty wishlist).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Ignore malformed/unavailable storage.
    }
    hydrated.current = true;
  }, []);

  React.useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isWishlisted = React.useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  );

  const toggle = React.useCallback((item: WishlistItem) => {
    setItems((current) => {
      const exists = current.some((i) => i.id === item.id);
      if (exists) return current.filter((i) => i.id !== item.id);
      return [...current, item];
    });
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const count = items.length;

  const value = React.useMemo(
    () => ({ items, count, isWishlisted, toggle, removeItem, clear }),
    [items, count, isWishlisted, toggle, removeItem, clear]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = React.useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a <WishlistProvider />");
  }
  return context;
}
