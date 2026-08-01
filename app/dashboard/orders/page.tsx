import { OrdersTable } from "@/components/dashboard/orders-table";
import { ORDERS } from "@/data/orders";

export default function DashboardOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ORDERS.length} orders placed.
        </p>
      </div>

      <OrdersTable orders={ORDERS} />
    </div>
  );
}
