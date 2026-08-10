"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Search, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/components/product-card";

type CartLine = {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
};

type PaymentMethod = "cash" | "cod" | "bkash";

const EMPTY_STATE = {
  customerName: "",
  customerPhone: "",
  paymentMethod: "cash" as PaymentMethod,
  bkashNumber: "",
};

export function CreateOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { token } = useAuth();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [productQuery, setProductQuery] = React.useState("");
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [form, setForm] = React.useState(EMPTY_STATE);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setProductQuery("");
    setCart([]);
    setForm(EMPTY_STATE);
    setSubmitError(null);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]));
  }, [open]);

  const matches =
    productQuery.trim().length === 0
      ? []
      : products
          .filter((p) => p.name.toLowerCase().includes(productQuery.trim().toLowerCase()))
          .slice(0, 6);

  function addProduct(product: Product) {
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id ? { ...line, qty: line.qty + 1 } : line
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          qty: 1,
        },
      ];
    });
    setProductQuery("");
  }

  function updateQty(productId: string, qty: number) {
    if (qty < 1) return;
    setCart((current) =>
      current.map((line) => (line.productId === productId ? { ...line, qty } : line))
    );
  }

  function updatePrice(productId: string, price: number) {
    setCart((current) =>
      current.map((line) => (line.productId === productId ? { ...line, price } : line))
    );
  }

  function removeLine(productId: string) {
    setCart((current) => current.filter((line) => line.productId !== productId));
  }

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!form.customerName.trim() || cart.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.customerName,
          phone: form.customerPhone || undefined,
          paymentMethod: form.paymentMethod,
          bkashNumber: form.paymentMethod === "bkash" ? form.bkashNumber : undefined,
          shippingCost: 0,
          items: cart.map((line) => ({
            productId: line.productId,
            name: line.name,
            image: line.image,
            price: line.price,
            qty: line.qty,
          })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not create order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col overflow-hidden sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>
            Log a walk-in or phone sale directly — it'll show up in the orders list
            just like a storefront checkout.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-hidden"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products to add…"
              className="pl-8"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
            />
            {matches.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
                {matches.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left text-sm hover:bg-muted"
                  >
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <span className="flex-1 truncate text-foreground">
                      {product.name}
                    </span>
                    <span className="text-muted-foreground">{formatCurrency(product.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Search above and add products to this order.
              </p>
            ) : (
              cart.map((line) => (
                <div
                  key={line.productId}
                  className="flex items-center gap-2.5 rounded-lg border border-border p-2"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={line.image}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {line.name}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.price}
                    onChange={(e) => updatePrice(line.productId, Number(e.target.value))}
                    className="h-8 w-20"
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Decrease quantity"
                      onClick={() => updateQty(line.productId, line.qty - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-6 text-center text-sm">{line.qty}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Increase quantity"
                      onClick={() => updateQty(line.productId, line.qty + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeLine(line.productId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="Walk-in customer"
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">Phone (optional)</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={form.customerPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerPhone: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup
              className="grid-cols-3"
              value={form.paymentMethod}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, paymentMethod: value as PaymentMethod }))
              }
            >
              <Label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border p-2 text-sm has-data-checked:border-foreground">
                <RadioGroupItem value="cash" />
                Cash
              </Label>
              <Label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border p-2 text-sm has-data-checked:border-foreground">
                <RadioGroupItem value="cod" />
                COD
              </Label>
              <Label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border p-2 text-sm has-data-checked:border-foreground">
                <RadioGroupItem value="bkash" />
                bKash
              </Label>
            </RadioGroup>
            {form.paymentMethod === "bkash" && (
              <Input
                placeholder="bKash number"
                value={form.bkashNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bkashNumber: e.target.value }))
                }
              />
            )}
          </div>

          <div className="flex items-center justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || cart.length === 0 || !form.customerName.trim()}
            >
              {submitting ? "Creating…" : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateOrderDialog;
