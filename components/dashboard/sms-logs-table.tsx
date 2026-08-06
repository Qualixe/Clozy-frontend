"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type SmsLog = {
  id: string;
  orderNumber: string | null;
  type: "order_confirmation" | "order_cancelled" | "promotional";
  recipient: string;
  message: string;
  status: "sent" | "failed";
  response: string | null;
  date: string;
};

const TYPE_LABELS: Record<SmsLog["type"], string> = {
  order_confirmation: "Order Confirmation",
  order_cancelled: "Order Cancelled",
  promotional: "Promotional",
};

export function SmsLogsTable({ logs }: { logs: SmsLog[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = logs.filter((log) => {
    const haystack = `${log.recipient} ${log.message} ${log.orderNumber ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search logs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-foreground">
                  {TYPE_LABELS[log.type]}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.recipient}
                </TableCell>
                <TableCell
                  className="max-w-xs truncate text-muted-foreground"
                  title={log.response ?? undefined}
                >
                  {log.message}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.orderNumber ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      log.status === "sent"
                        ? "bg-foreground text-background"
                        : "bg-destructive text-destructive-foreground"
                    }
                  >
                    {log.status === "sent" ? "Sent" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(log.date).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No SMS sent yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default SmsLogsTable;
