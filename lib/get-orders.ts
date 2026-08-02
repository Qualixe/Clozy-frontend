import type { Order } from "@/data/orders";
import { getServerAuthHeaders } from "@/lib/auth-server";

export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
