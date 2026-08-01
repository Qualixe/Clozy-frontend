export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

// Placeholder cart contents until a real cart store exists.
export const INITIAL_CART_ITEMS: CartItem[] = [
  { id: 1, name: "Classic Oxford Shirt", price: 68, qty: 1 },
  { id: 2, name: "Suede Chelsea Boots", price: 145, qty: 1 },
];
