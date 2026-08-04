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
