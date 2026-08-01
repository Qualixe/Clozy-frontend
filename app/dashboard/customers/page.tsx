import {
  CustomersTable,
  type Customer,
} from "@/components/dashboard/customers-table";
import { ORDERS } from "@/data/orders";

function getCustomers(): Customer[] {
  const byEmail = new Map<string, Customer>();

  for (const order of ORDERS) {
    const existing = byEmail.get(order.email);
    if (existing) {
      existing.orders += 1;
      existing.totalSpent += order.total;
      if (order.date > existing.lastOrderDate) {
        existing.lastOrderDate = order.date;
      }
    } else {
      byEmail.set(order.email, {
        name: order.customer,
        email: order.email,
        orders: 1,
        totalSpent: order.total,
        lastOrderDate: order.date,
      });
    }
  }

  return Array.from(byEmail.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );
}

export default function DashboardCustomersPage() {
  const customers = getCustomers();

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
