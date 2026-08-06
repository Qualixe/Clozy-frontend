"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, PackageSearch, XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderDetail, OrderStatus } from "@/data/orders";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Fulfilled: "bg-foreground text-background",
  Processing: "bg-muted text-foreground",
  Cancelled: "bg-destructive text-destructive-foreground",
};

const STEPS = ["Processing", "Fulfilled"] as const;

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
        <XCircle className="h-4 w-4 shrink-0" />
        This order was cancelled.
      </div>
    );
  }

  const activeIndex = STEPS.indexOf(status as (typeof STEPS)[number]);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                i <= activeIndex
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < activeIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs",
                i <= activeIndex ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "mx-2 mb-5 h-px flex-1",
                i < activeIndex ? "bg-foreground" : "bg-border"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<OrderDetail | null>(null);

  const lookupOrder = React.useCallback(
    async (orderNumberValue: string, contactValue: string) => {
      if (!orderNumberValue.trim() || !contactValue.trim()) return;

      setLoading(true);
      setError(null);
      setOrder(null);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: orderNumberValue.trim(),
            contact: contactValue.trim(),
          }),
        });

        const body = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            body?.message ?? "We couldn't find an order matching those details."
          );
        }

        setOrder(body as OrderDetail);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "We couldn't find an order matching those details."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Pre-fill (and auto-search) when arriving from the checkout confirmation
  // page's "Track Your Order" link, which passes ?order=...&contact=....
  React.useEffect(() => {
    const initialOrder = searchParams.get("order") ?? "";
    const initialContact = searchParams.get("contact") ?? "";

    if (initialOrder) setOrderNumber(initialOrder);
    if (initialContact) setContact(initialContact);

    if (initialOrder && initialContact) {
      lookupOrder(initialOrder, initialContact);
    }
    // Only ever run once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    lookupOrder(orderNumber, contact);
  }

  function reset() {
    setOrder(null);
    setError(null);
    setOrderNumber("");
    setContact("");
  }

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Track Your Order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your order number and the email or phone number you used at
            checkout.
          </p>
        </div>

        {!order ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                placeholder="e.g. #1005"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact">Email or Phone Number</Label>
              <Input
                id="contact"
                placeholder="you@example.com or 01XXXXXXXXX"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Searching…" : "Track Order"}
            </Button>
          </form>
        ) : (
          <div className="mt-8 space-y-6 rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
              </div>
              <Badge variant="secondary" className={STATUS_STYLES[order.status]}>
                {order.status}
              </Badge>
            </div>

            <StatusTimeline status={order.status} />

            <Separator />

            <div>
              <p className="text-sm font-semibold text-foreground">Items</p>
              <ul className="mt-3 divide-y divide-border">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <div>
                        <p className="text-foreground">{item.name}</p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          ×{item.qty}
                        </p>
                      </div>
                      <span className="font-medium text-foreground">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${order.subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">${order.shippingCost}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Discount{order.discountCode ? ` (${order.discountCode})` : ""}
                  </span>
                  <span className="text-foreground">
                    -${order.discountAmount}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${order.total}</span>
              </div>
            </div>

            {(order.address || order.district) && (
              <>
                <Separator />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Shipping to</p>
                  <p className="mt-1 text-muted-foreground">
                    {[order.address, order.district].filter(Boolean).join(", ")}
                  </p>
                </div>
              </>
            )}

            <Button variant="outline" className="w-full" onClick={reset}>
              Track Another Order
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default TrackOrderPage;
