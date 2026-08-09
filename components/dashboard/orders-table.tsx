"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { OrderDetailSheet } from "@/components/dashboard/order-detail-sheet";
import { CreateOrderDialog } from "@/components/dashboard/create-order-dialog";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/can";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/data/orders";

const PAGE_SIZE = 8;

const STATUS_TABS = ["All", "Processing", "Fulfilled", "Cancelled"] as const;

const STATUS_OPTIONS: { value: Lowercase<OrderStatus>; label: OrderStatus }[] = [
  { value: "processing", label: "Processing" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_TRIGGER_STYLES: Record<OrderStatus, string> = {
  Fulfilled: "border-transparent bg-foreground text-background",
  Processing: "border-transparent bg-muted text-foreground",
  Cancelled: "border-transparent bg-destructive text-destructive-foreground",
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<(typeof STATUS_TABS)[number]>("All");
  const [page, setPage] = React.useState(1);
  const [viewingOrder, setViewingOrder] = React.useState<Order | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [statusError, setStatusError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  const filtered = orders.filter((order) => {
    if (status !== "All" && order.status !== status) return false;
    const haystack =
      `${order.orderNumber} ${order.customer} ${order.email ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  React.useEffect(() => {
    setPage(1);
  }, [status, query]);

  async function changeStatus(order: Order, next: Lowercase<OrderStatus>) {
    setUpdatingId(order.id);
    setStatusError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: next }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      router.refresh();
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Could not update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      {statusError && (
        <p className="text-sm text-destructive">{statusError}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-foreground">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.payment}
                </TableCell>
                <TableCell>
                  <Can
                    permission="manage_orders"
                    fallback={
                      <Badge
                        variant="secondary"
                        className={STATUS_TRIGGER_STYLES[order.status]}
                      >
                        {order.status}
                      </Badge>
                    }
                  >
                    <Select
                      value={order.status.toLowerCase()}
                      disabled={updatingId === order.id}
                      onValueChange={(value) => {
                        if (value) {
                          changeStatus(order, value as Lowercase<OrderStatus>);
                        }
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className={cn(
                          "w-[120px]",
                          STATUS_TRIGGER_STYLES[order.status]
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Can>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.date}
                </TableCell>
                <TableCell className="text-right text-foreground">
                  ${order.total}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`View ${order.orderNumber}`}
                    onClick={() => setViewingOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No orders match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : undefined
                }
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <PaginationItem key={n}>
                <PaginationLink
                  href="#"
                  isActive={n === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(n);
                  }}
                >
                  {n}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <OrderDetailSheet
        order={viewingOrder}
        onOpenChange={(open) => {
          if (!open) setViewingOrder(null);
        }}
      />

      <CreateOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

export default OrdersTable;
