import type { Order } from "@/data/orders";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";

export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

/**
 * Same as `getOrders`, but reports a missing `view_orders` permission
 * instead of throwing — for call sites where the page itself is reachable
 * without that specific permission (e.g. the dashboard home page, or the
 * Analytics page which only requires `view_analytics`).
 */
export async function getOrdersOrForbidden(): Promise<
  { orders: Order[]; forbidden: false } | { orders: null; forbidden: true }
> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  if (res.status === 403) return { orders: null, forbidden: true };
  assertDashboardFetchOk(res);
  return { orders: await res.json(), forbidden: false };
}
