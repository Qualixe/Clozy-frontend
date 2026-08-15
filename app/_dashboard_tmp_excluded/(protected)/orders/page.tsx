import { OrdersTable } from "@/components/dashboard/orders-table";
import { NoAccess } from "@/components/dashboard/no-access";
import { getOrdersOrForbidden } from "@/lib/get-orders";

export default async function DashboardOrdersPage() {
  const result = await getOrdersOrForbidden();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.forbidden ? "—" : `${result.orders.length} orders placed.`}
        </p>
      </div>

      {result.forbidden ? (
        <NoAccess message="You don't have access to orders — ask an owner or admin to grant it." />
      ) : (
        <OrdersTable orders={result.orders} />
      )}
    </div>
  );
}
