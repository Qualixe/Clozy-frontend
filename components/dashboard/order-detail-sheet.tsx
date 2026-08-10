"use client";

import * as React from "react";
import Image from "next/image";
import { Truck, MapPin, Phone, Mail, CreditCard, Send, RefreshCw } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Can } from "@/components/can";
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
  const [shipping, setShipping] = React.useState(false);
  const [shipError, setShipError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!order) {
      setDetail(null);
      return;
    }

    setLoading(true);
    setError(null);
    setShipError(null);
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

  async function shipOrder() {
    if (!order) return;
    setShipping(true);
    setShipError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/ship`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      setDetail((d) => (d ? { ...d, ...body } : d));
    } catch (err) {
      setShipError(err instanceof Error ? err.message : "Could not send to Steadfast.");
    } finally {
      setShipping(false);
    }
  }

  async function refreshTracking() {
    if (!order) return;
    setRefreshing(true);
    setShipError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/tracking`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      setDetail((d) => (d ? { ...d, ...body } : d));
    } catch (err) {
      setShipError(err instanceof Error ? err.message : "Could not refresh tracking status.");
    } finally {
      setRefreshing(false);
    }
  }

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
              {detail.email && (
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{detail.email}</span>
                </div>
              )}
              {detail.phone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{detail.phone}</span>
                </div>
              )}
              {(detail.address || detail.district) && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">
                    {[detail.address, detail.district].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">
                  {detail.payment}
                  {detail.bkashNumber ? ` · ${detail.bkashNumber}` : ""}
                </span>
              </div>
            </div>

            <Separator />

            <Can permission="manage_orders">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Steadfast Courier
                    </p>
                    {detail.steadfastTrackingCode ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {detail.steadfastConsignmentId} · {detail.steadfastTrackingCode}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Not sent yet
                      </p>
                    )}
                  </div>

                  {detail.steadfastTrackingCode ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {detail.steadfastStatus?.replace(/_/g, " ") ?? "unknown"}
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        aria-label="Refresh tracking status"
                        disabled={refreshing}
                        onClick={refreshTracking}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={shipping}
                      onClick={shipOrder}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {shipping ? "Sending…" : "Send to Steadfast"}
                    </Button>
                  )}
                </div>
                {shipError && (
                  <p className="mt-2 text-xs text-destructive">{shipError}</p>
                )}
              </div>
            </Can>

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
