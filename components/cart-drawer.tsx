"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_CART_ITEMS } from "@/data/cart-items";

// ---------------------------------------------------------------------------
// Cart drawer
// ---------------------------------------------------------------------------

export function CartDrawer() {
  const [cartItems, setCartItems] = React.useState(INITIAL_CART_ITEMS);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  function updateQuantity(id: number, delta: number) {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  }

  function removeItem(id: number) {
    setCartItems((items) => items.filter((item) => item.id !== id));
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            aria-label="Cart"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Your Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        {cartItems.length === 0 ? (
          <p className="flex-1 px-4 py-8 text-center text-sm text-muted-foreground">
            Your cart is empty.
          </p>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-auto px-4">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="text-foreground">{item.name}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="h-6 w-6 rounded-full"
                      aria-label={`Decrease quantity of ${item.name}`}
                      disabled={item.qty <= 1}
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center text-xs text-foreground">
                      {item.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="h-6 w-6 rounded-full"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-medium text-foreground">
                    ${item.price * item.qty}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <SheetFooter className="border-t border-border">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${cartTotal}</span>
          </div>
          <Button
            className="w-full"
            size="sm"
            disabled={cartItems.length === 0}
            nativeButton={false}
            render={<Link href="/checkout">Checkout</Link>}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
