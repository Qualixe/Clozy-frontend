import {
  CustomersTable,
  type Customer,
} from "@/components/dashboard/customers-table";
import { getOrders } from "@/lib/get-orders";
import type { Order } from "@/data/orders";

function toCustomers(orders: Order[]): Customer[] {
  const byKey = new Map<string, Customer>();

  for (const order of orders) {
    // Walk-in/POS orders have no email — each one is its own customer
    // rather than being merged together under a shared null key.
    const key = order.email ?? `order-${order.id}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.orders += 1;
      existing.totalSpent += order.total;
      if (order.date > existing.lastOrderDate) {
        existing.lastOrderDate = order.date;
      }
    } else {
      byKey.set(key, {
        name: order.customer,
        email: order.email ?? "—",
        orders: 1,
        totalSpent: order.total,
        lastOrderDate: order.date,
      });
    }
  }

  return Array.from(byKey.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );
}

export default async function DashboardCustomersPage() {
  const orders = await getOrders();
  const customers = toCustomers(orders);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {customers.length} customers on record.
        </p>
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}
