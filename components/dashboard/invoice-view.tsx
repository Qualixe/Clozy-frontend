"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import type { OrderDetail } from "@/data/orders";

const STATUS_LABELS: Record<NonNullable<OrderDetail["paymentStatus"]>, string> = {
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Payment Failed",
};

export function InvoiceView({
  order,
  logoUrl,
}: {
  order: OrderDetail;
  logoUrl: string | null;
}) {
  return (
    <div className="min-h-screen bg-muted/30 py-8 print:bg-white print:py-0">
      <style>{`@page { size: auto; margin: 14mm; }`}</style>

      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pb-4 print:hidden">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>

      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-background p-8 shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none sm:p-10">
        {/* Letterhead */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Clozy"
                width={128}
                height={32}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <>
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  C
                </span>
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  Clozy
                </span>
              </>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Invoice
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {order.orderNumber}
            </p>
          </div>
        </div>

        {/* Bill to / Invoice details */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Bill To
            </p>
            <p className="mt-1.5 text-sm font-medium text-foreground">
              {order.customer}
            </p>
            {order.email && (
              <p className="text-sm text-muted-foreground">{order.email}</p>
            )}
            {order.phone && (
              <p className="text-sm text-muted-foreground">{order.phone}</p>
            )}
            {(order.address || order.district) && (
              <p className="text-sm text-muted-foreground">
                {[order.address, order.district].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Details
            </p>
            <dl className="mt-1.5 space-y-1 text-sm">
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="text-foreground">{order.date}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="text-foreground">{order.status}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="text-foreground">
                  {order.payment}
                  {order.bkashNumber ? ` · ${order.bkashNumber}` : ""}
                  {order.paymentStatus && ` — ${STATUS_LABELS[order.paymentStatus]}`}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Items */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <th className="py-2 pr-2 font-medium">Item</th>
                <th className="px-2 py-2 text-center font-medium">Qty</th>
                <th className="px-2 py-2 text-right font-medium">Unit Price</th>
                <th className="py-2 pl-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="py-3 pr-2">
                    <p className="text-foreground">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">{item.variant}</p>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center text-foreground">{item.qty}</td>
                  <td className="px-2 py-3 text-right text-foreground">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3 pl-2 text-right font-medium text-foreground">
                    {formatCurrency(item.price * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">{formatCurrency(order.shippingCost)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Discount{order.discountCode ? ` (${order.discountCode})` : ""}
                </span>
                <span className="text-foreground">
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatCurrency(order.total)}</span>
            </div>
            {order.advanceAmount !== null && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paid via bKash</span>
                  <span className="text-foreground">
                    {formatCurrency(order.advanceAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-foreground">Due on Delivery</span>
                  <span className="text-foreground">
                    {formatCurrency(order.codAmountDue)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Thank you for shopping with us. For questions about this order,
          please contact support with your order number.
        </p>
      </div>
    </div>
  );
}

export default InvoiceView;
