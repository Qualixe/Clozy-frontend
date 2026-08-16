"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InvoiceView } from "@/components/dashboard/invoice-view";
import { getSettings } from "@/lib/get-settings";
import type { OrderDetail } from "@/data/orders";

/**
 * Customer-facing invoice — same order+contact lookup as /track-order (see
 * that page), so a guest checkout can't be used to view someone else's
 * invoice just by guessing an order number. Reuses the dashboard's
 * InvoiceView (identical printable layout) with the "Back" link pointed
 * here instead of at /dashboard/orders.
 */
export function OrderInvoicePage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [contactInfo, setContactInfo] = React.useState<{
    supportPhone: string | null;
    supportEmail: string | null;
    storeAddress: string | null;
  }>({ supportPhone: null, supportEmail: null, storeAddress: null });

  const lookupOrder = React.useCallback(
    async (orderNumberValue: string, contactValue: string) => {
      if (!orderNumberValue.trim() || !contactValue.trim()) return;

      setLoading(true);
      setError(null);
      setOrder(null);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: orderNumberValue.trim(),
            contact: contactValue.trim(),
          }),
        });

        const body = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            body?.message ?? "We couldn't find an order matching those details."
          );
        }

        setOrder(body as OrderDetail);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "We couldn't find an order matching those details."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    getSettings()
      .then((s) => {
        setLogoUrl(s.logoUrl);
        setContactInfo({
          supportPhone: s.supportPhone,
          supportEmail: s.supportEmail,
          storeAddress: s.storeAddress,
        });
      })
      .catch(() => {
        // Best-effort — the invoice falls back to the text wordmark and
        // omits the contact footer.
      });
  }, []);

  React.useEffect(() => {
    const initialOrder = searchParams.get("order") ?? "";
    const initialContact = searchParams.get("contact") ?? "";

    if (initialOrder) setOrderNumber(initialOrder);
    if (initialContact) setContact(initialContact);

    if (initialOrder && initialContact) {
      lookupOrder(initialOrder, initialContact);
    }
    // Only ever run once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    lookupOrder(orderNumber, contact);
  }

  if (order) {
    return (
      <InvoiceView
        order={order}
        logoUrl={logoUrl}
        backHref="/orders/invoice"
        backLabel="Look up another order"
        pdfUrl={`/api/invoice/pdf?orderNumber=${encodeURIComponent(order.orderNumber)}&contact=${encodeURIComponent(contact)}`}
        supportPhone={contactInfo.supportPhone}
        supportEmail={contactInfo.supportEmail}
        storeAddress={contactInfo.storeAddress}
      />
    );
  }

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            View Invoice
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your order number and the email or phone number you used at
            checkout.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="orderNumber">Order Number</Label>
            <Input
              id="orderNumber"
              placeholder="e.g. #1005"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact">Email or Phone Number</Label>
            <Input
              id="contact"
              placeholder="you@example.com or 01XXXXXXXXX"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Searching…" : "View Invoice"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Looking for order status instead?{" "}
          <Link
            href="/track-order"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Track your order
          </Link>
        </p>
      </div>
    </main>
  );
}

export default OrderInvoicePage;
