"use client";

import * as React from "react";
import Image from "next/image";
import { Truck, MapPin, Phone, Mail, CreditCard } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import type { Order, OrderDetail, OrderStatus } from "@/data/orders";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Fulfilled: "bg-foreground text-background",
  Processing: "bg-muted text-foreground",
  Cancelled: "bg-destructive text-destructive-foreground",
};

export function OrderDetailSheet({
  order,
  onOpenChange,
}: {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { token } = useAuth();
  const [detail, setDetail] = React.useState<OrderDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!order) {
      setDetail(null);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: OrderDetail) => setDetail(data))
      .catch(() => setError("Could not load this order."))
      .finally(() => setLoading(false));
  }, [order, token]);

  return (
    <Sheet open={order !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>{order?.orderNumber}</SheetTitle>
        </SheetHeader>

        {loading && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading order…
          </p>
        )}

        {error && (
          <p className="px-4 py-8 text-center text-sm text-destructive">
            {error}
          </p>
        )}

        {detail && (
          <div className="flex-1 space-y-6 overflow-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {detail.customer}
                </p>
                <p className="text-xs text-muted-foreground">{detail.date}</p>
              </div>
              <Badge variant="secondary" className={STATUS_STYLES[detail.status]}>
                {detail.status}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{detail.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{detail.phone}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">
                  {detail.address}, {detail.district}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">
                  {detail.payment}
                  {detail.bkashNumber ? ` · ${detail.bkashNumber}` : ""}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-semibold text-foreground">Items</p>
              <ul className="mt-3 divide-y divide-border">
                {detail.items.map((item) => (
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
                <span className="text-foreground">${detail.subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  Shipping
                </span>
                <span className="text-foreground">${detail.shippingCost}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${detail.total}</span>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default OrderDetailSheet;
