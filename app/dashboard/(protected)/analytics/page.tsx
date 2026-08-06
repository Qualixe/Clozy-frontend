import { DollarSign, ShoppingBag, Receipt, CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueChart, type RevenuePoint } from "@/components/dashboard/revenue-chart";
import { StatusChart, type StatusPoint } from "@/components/dashboard/status-chart";
import { AiInsightsCard } from "@/components/dashboard/ai-insights-card";
import { getOrders } from "@/lib/get-orders";
import type { Order, OrderStatus } from "@/data/orders";

function getRevenueByDay(orders: Order[]): RevenuePoint[] {
  const byDate = new Map<string, number>();
  for (const order of orders) {
    byDate.set(order.date, (byDate.get(order.date) ?? 0) + order.total);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, revenue]) => ({ date, revenue }));
}

function getStatusBreakdown(orders: Order[]): StatusPoint[] {
  const counts: Record<OrderStatus, number> = {
    Fulfilled: 0,
    Processing: 0,
    Cancelled: 0,
  };
  for (const order of orders) counts[order.status] += 1;

  return [
    { label: "Fulfilled", count: counts.Fulfilled, tone: "good" },
    { label: "Processing", count: counts.Processing, tone: "warning" },
    { label: "Cancelled", count: counts.Cancelled, tone: "critical" },
  ];
}

export default async function DashboardAnalyticsPage() {
  const orders = await getOrders();
  const revenueByDay = getRevenueByDay(orders);
  const statusBreakdown = getStatusBreakdown(orders);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const fulfilledRate =
    totalOrders > 0
      ? Math.round((statusBreakdown[0].count / totalOrders) * 100)
      : 0;

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue}`, icon: DollarSign },
    { label: "Total Orders", value: `${totalOrders}`, icon: ShoppingBag },
    { label: "Avg Order Value", value: `$${avgOrderValue}`, icon: Receipt },
    { label: "Fulfilled Rate", value: `${fulfilledRate}%`, icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store performance based on recent orders.
        </p>
      </div>

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Daily revenue from recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByDay.length > 0 ? (
              <RevenueChart data={revenueByDay} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No orders yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Where recent orders stand.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart data={statusBreakdown} />
          </CardContent>
        </Card>
      </div>

      <AiInsightsCard />
    </div>
  );
}
