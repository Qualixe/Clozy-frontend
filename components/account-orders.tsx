"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import type { Order, OrderStatus } from "@/data/orders";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Fulfilled: "bg-foreground text-background",
  Processing: "bg-muted text-foreground",
  Cancelled: "bg-destructive text-destructive-foreground",
};

export function AccountOrders() {
  const { token, user } = useAuth();
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/orders`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: Order[]) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your orders.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Account</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Orders
          </h1>
        </div>

        {error && (
          <p className="mt-8 text-center text-sm text-destructive">{error}</p>
        )}

        {!error && orders === null && (
          <div className="mt-8 flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {orders?.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/shop"
              className="text-sm font-medium text-foreground hover:underline underline-offset-4"
            >
              Start shopping
            </Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="mt-8 divide-y divide-border rounded-xl border border-border">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/track-order?order=${encodeURIComponent(order.orderNumber.replace(/^#/, ""))}&contact=${encodeURIComponent(order.email ?? user?.email ?? "")}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    ${order.total}
                  </span>
                  <Badge variant="secondary" className={STATUS_STYLES[order.status]}>
                    {order.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default AccountOrders;
