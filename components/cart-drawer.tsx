"use client";

import Link from "next/link";
import Image from "next/image";
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
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/currency";

// ---------------------------------------------------------------------------
// Cart drawer
// ---------------------------------------------------------------------------

export function CartDrawer() {
  const { items, count, subtotal, isOpen, setOpen, updateQuantity, removeItem } =
    useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            aria-label="Cart"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                {count}
              </Badge>
            )}
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Your Cart ({count})</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <p className="flex-1 px-4 py-8 text-center text-sm text-muted-foreground">
            Your cart is empty.
          </p>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-auto px-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-3 text-sm">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 items-start justify-between gap-2">
                  <div>
                    <p className="text-foreground">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">
                        {item.variant}
                      </p>
                    )}
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
                      {formatCurrency(item.price * item.qty)}
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
                </div>
              </li>
            ))}
          </ul>
        )}
        <SheetFooter className="border-t border-border">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <Button
            className="w-full"
            disabled={items.length === 0}
            nativeButton={false}
            onClick={() => setOpen(false)}
            render={<Link href="/checkout">Checkout</Link>}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
