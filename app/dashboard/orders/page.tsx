import { OrdersTable } from "@/components/dashboard/orders-table";
import { getOrders } from "@/lib/get-orders";

export default async function DashboardOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} orders placed.
        </p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
