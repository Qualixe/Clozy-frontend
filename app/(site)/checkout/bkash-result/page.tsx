"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function BkashResultPage() {
  return (
    <React.Suspense>
      <BkashResultContent />
    </React.Suspense>
  );
}

function BkashResultContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const paid = searchParams.get("status") === "paid";
  const [copied, setCopied] = React.useState(false);

  function copyOrderId() {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
      {paid ? (
        <>
          <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-500" />
          <h1 className="text-2xl font-semibold text-foreground">
            Payment successful
          </h1>
          <p className="text-sm text-muted-foreground">
            Your bKash payment was confirmed and your order is being
            processed.
          </p>

          {orderNumber && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Order ID:</span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {orderNumber}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                aria-label="Copy order ID"
                onClick={copyOrderId}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/shop">Continue Shopping</Link>}
            />
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  href={
                    orderNumber
                      ? `/track-order?order=${encodeURIComponent(orderNumber)}`
                      : "/track-order"
                  }
                >
                  Track Your Order
                </Link>
              }
            />
          </div>
        </>
      ) : (
        <>
          <XCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-semibold text-foreground">
            Payment not completed
          </h1>
          <p className="text-sm text-muted-foreground">
            Your bKash payment was cancelled or couldn&apos;t be confirmed, so
            the order hasn&apos;t been placed. No charge was made.
          </p>
          <Button
            className="mt-2"
            nativeButton={false}
            render={<Link href="/checkout">Try Again</Link>}
          />
        </>
      )}
    </main>
  );
}
