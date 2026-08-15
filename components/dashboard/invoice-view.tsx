"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth-context";
import type { OrderDetail } from "@/data/orders";

const STATUS_LABELS: Record<NonNullable<OrderDetail["paymentStatus"]>, string> = {
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Payment Failed",
};

export function InvoiceView({
  order,
  logoUrl,
  backHref = "/dashboard/orders",
  backLabel = "Back to Orders",
  /** /api/invoice/pdf URL (see app/api/invoice/pdf/route.ts) — a real,
   *  pixel-perfect PDF rendered via headless Chrome. The dashboard route
   *  needs auth, the public track-order one doesn't, so the token is only
   *  attached when present. */
  pdfUrl,
}: {
  order: OrderDetail;
  logoUrl: string | null;
  backHref?: string;
  backLabel?: string;
  pdfUrl?: string;
}) {
  const { token } = useAuth();
  const [downloading, setDownloading] = React.useState(false);

  async function handleDownloadPdf() {
    if (!pdfUrl || downloading) return;

    setDownloading(true);
    try {
      const res = await fetch(pdfUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Could not generate the PDF.");

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `invoice-${order.orderNumber.replace(/^#/, "")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.alert("Could not download the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 print:min-h-0 print:bg-white print:py-0">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide browser UI elements from your page */
          .no-print,
          .print-button,
          .back-button {
            display: none !important;
          }

          /* Invoice container */
          .invoice-page {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 15mm 16mm !important;
            box-sizing: border-box !important;

            background: #fff !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <div className="no-print mx-auto flex max-w-3xl items-center justify-between px-4 pb-4 print:hidden">
        <Link
          href={backHref}
          className="back-button inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="print-button inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          {pdfUrl && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download PDF
            </button>
          )}
        </div>
      </div>

      <div className="invoice-page mx-auto max-w-3xl bg-background p-8 shadow-sm print:border-none print:p-0 print:shadow-none sm:p-10">
        {/* Letterhead */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Clozy"
                width={144}
                height={36}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-base font-bold text-background">
                  C
                </span>
                <span className="text-xl font-semibold tracking-tight text-foreground">
                  Clozy
                </span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            INVOICE
          </h1>
        </div>

        {/* Two-tone accent rule under the letterhead */}
        <div className="mt-4 flex h-1.5 w-full">
          <div className="flex-1 bg-foreground" />
          <div className="w-24 bg-amber-400" />
        </div>

        {/* Bill to / Invoice details */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Invoice To
            </p>
            <p className="mt-1.5 text-base font-semibold text-foreground">
              {order.customer}
            </p>
            {(order.address || order.district) && (
              <p className="text-sm text-muted-foreground">
                {[order.address, order.district].filter(Boolean).join(", ")}
              </p>
            )}
            {order.email && (
              <p className="text-sm text-muted-foreground">{order.email}</p>
            )}
            {order.phone && (
              <p className="text-sm text-muted-foreground">{order.phone}</p>
            )}
          </div>

          <dl className="space-y-1 text-sm">
            <div className="flex items-center justify-end gap-4">
              <dt className="font-semibold text-foreground">Invoice No</dt>
              <dd className="text-muted-foreground">{order.orderNumber}</dd>
            </div>
            <div className="flex items-center justify-end gap-4">
              <dt className="font-semibold text-foreground">Date</dt>
              <dd className="text-muted-foreground">{order.date}</dd>
            </div>
            <div className="flex items-center justify-end gap-4">
              <dt className="font-semibold text-foreground">Status</dt>
              <dd className="text-muted-foreground">{order.status}</dd>
            </div>
            <div className="flex items-center justify-end gap-4">
              <dt className="font-semibold text-foreground">Payment</dt>
              <dd className="text-muted-foreground">
                {order.payment}
                {order.bkashNumber ? ` · ${order.bkashNumber}` : ""}
                {order.paymentStatus && ` — ${STATUS_LABELS[order.paymentStatus]}`}
              </dd>
            </div>
          </dl>
        </div>

        {/* Items */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-foreground text-background">
                <th className="w-12 py-2.5 pl-3 text-left text-xs font-semibold uppercase tracking-wide">
                  SL.
                </th>
                <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                  Item Description
                </th>
                <th className="py-2.5 text-center text-xs font-semibold uppercase tracking-wide">
                  Qty.
                </th>
                <th className="py-2.5 text-center text-xs font-semibold uppercase tracking-wide">
                  Price
                </th>
                <th className="w-28 py-2.5 pr-3 text-right text-xs font-semibold uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={item.id}>
                  <td
                    className={`py-3 pl-3 text-muted-foreground ${i % 2 === 1 ? "bg-muted/50" : ""}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className={`py-3 pr-2 ${i % 2 === 1 ? "bg-muted/50" : ""}`}>
                    <p className="text-foreground">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">{item.variant}</p>
                    )}
                  </td>
                  <td
                    className={`py-3 text-center text-foreground ${i % 2 === 1 ? "bg-muted/50" : ""}`}
                  >
                    {item.qty}
                  </td>
                  <td
                    className={`py-3 text-center text-foreground ${i % 2 === 1 ? "bg-muted/50" : ""}`}
                  >
                    {formatCurrency(item.price)}
                  </td>
                  <td className="bg-amber-400/20 py-3 pr-3 text-right font-medium text-foreground">
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
              <span className="text-muted-foreground">Sub Total</span>
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
            <div className="flex items-center justify-between bg-amber-400 px-3 py-2 text-base font-bold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
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

        <div className="mt-12 border-t border-border pt-4 text-center">
          <p className="text-sm font-semibold text-foreground">
            Thank you for shopping with us.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            For questions about this order, please contact support with your order number.
          </p>
        </div>
      </div>
    </div>
  );
}

export default InvoiceView;
