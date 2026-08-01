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

// ---------------------------------------------------------------------------
// Static placeholder data — swap for real data once the admin API exists.
// ---------------------------------------------------------------------------

const STATS = [
  {
    label: "Total Revenue",
    value: "$24,318",
    change: "+12.4%",
    icon: DollarSign,
  },
  {
    label: "Orders",
    value: "1,204",
    change: "+4.1%",
    icon: ShoppingCart,
  },
  {
    label: "Customers",
    value: "892",
    change: "+2.6%",
    icon: Users,
  },
  {
    label: "Conversion Rate",
    value: "3.2%",
    change: "-0.4%",
    icon: TrendingUp,
  },
];

const RECENT_ORDERS = [
  { id: "#3241", customer: "Daniel R.", status: "Fulfilled", total: "$210.00", date: "Jul 28" },
  { id: "#3240", customer: "Priya K.", status: "Processing", total: "$74.00", date: "Jul 28" },
  { id: "#3239", customer: "Marcus T.", status: "Fulfilled", total: "$145.00", date: "Jul 27" },
  { id: "#3238", customer: "Elena V.", status: "Cancelled", total: "$68.00", date: "Jul 27" },
  { id: "#3237", customer: "Sam O.", status: "Fulfilled", total: "$98.00", date: "Jul 26" },
] as const;

const ORDER_STATUS_STYLES: Record<string, string> = {
  Fulfilled: "bg-foreground text-background",
  Processing: "bg-muted text-foreground",
  Cancelled: "bg-destructive text-destructive-foreground",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-semibold">
                {stat.value}
              </CardTitle>
              <p
                className={
                  stat.change.startsWith("-")
                    ? "mt-1 text-xs text-destructive"
                    : "mt-1 text-xs text-emerald-600 dark:text-emerald-500"
                }
              >
                {stat.change} from last month
              </p>
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
              {RECENT_ORDERS.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
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
                  <TableCell className="text-right">{order.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
