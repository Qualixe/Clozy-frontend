import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NoAccess } from "@/components/dashboard/no-access";
import { getOrdersOrForbidden } from "@/lib/get-orders";
import { formatCurrency } from "@/lib/currency";
import type { OrderStatus } from "@/data/orders";

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  Fulfilled: "bg-foreground text-background",
  Processing: "bg-muted text-foreground",
  Cancelled: "bg-destructive text-destructive-foreground",
};

export default async function DashboardPage() {
  const result = await getOrdersOrForbidden();

  if (result.forbidden) {
    return (
      <div className="flex flex-col gap-6">
        <NoAccess message="You don't have access to order data — ask an owner or admin to grant it." />
      </div>
    );
  }

  const orders = result.orders;
  const recentOrders = orders.slice(0, 5);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Customers and conversion rate need their own tracking (no such data
  // source yet) — left as placeholders until that exists.
  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
    },
    {
      label: "Orders",
      value: orders.length.toLocaleString(),
      icon: ShoppingCart,
    },
    { label: "Customers", value: "—", icon: Users },
    { label: "Conversion Rate", value: "—", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-semibold">
                {stat.value}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            A snapshot of the latest orders placed in the store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Badge
                        className={ORDER_STATUS_STYLES[order.status]}
                        variant="secondary"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.date}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
