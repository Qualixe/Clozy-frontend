import type { NextRequest } from "next/server";
import puppeteer from "puppeteer";

import { renderInvoiceHtml, type InvoiceContactInfo } from "@/lib/render-invoice-html";
import type { OrderDetail } from "@/data/orders";

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Launching Chromium per request is expensive (CPU + ~100MB+ memory each),
// and this route has no other rate limit — the Laravel throttle on
// /orders/track only sees this Next.js server's own outbound IP, not the
// real visitor's, so it can't protect this endpoint. In-memory is fine for
// this app's single-server deployment; resets on restart.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return timestamps.length > RATE_LIMIT;
}

/**
 * Renders a pixel-perfect PDF via headless Chrome (see
 * lib/render-invoice-html.ts) rather than relying on the browser's own
 * print-to-PDF, which varies by browser/OS and can't be triggered
 * programmatically. Two lookup modes, both reusing existing Laravel
 * endpoints rather than adding new backend auth logic:
 *  - ?orderId=X with an Authorization header — dashboard use, forwarded
 *    straight to GET /orders/{id} so Laravel's own auth:sanctum +
 *    view_orders permission check is what actually decides access.
 *  - ?orderNumber=X&contact=Y — public, same order+contact lookup as
 *    /track-order and the customer-facing /orders/invoice page.
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return jsonError("Too many invoice requests. Please try again in a minute.", 429);
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const contact = searchParams.get("contact");

  let order: OrderDetail;

  try {
    if (orderId) {
      const auth = request.headers.get("authorization");
      if (!auth) return jsonError("Unauthorized", 401);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
        headers: { Authorization: auth, Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        return jsonError("Order not found", res.status);
      }
      order = await res.json();
    } else if (orderNumber && contact) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, contact }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        return jsonError(body?.message ?? "Order not found", res.status);
      }
      order = await res.json();
    } else {
      return jsonError("Provide either orderId or orderNumber + contact.", 400);
    }
  } catch {
    return jsonError("Could not look up the order.", 502);
  }

  let logoUrl: string | null = null;
  let contactInfo: InvoiceContactInfo = {};
  try {
    const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      cache: "no-store",
    });
    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      logoUrl = settings.logoUrl ?? null;
      contactInfo = {
        supportPhone: settings.supportPhone ?? null,
        supportEmail: settings.supportEmail ?? null,
        storeAddress: settings.storeAddress ?? null,
      };
    }
  } catch {
    // Best-effort — falls back to the text wordmark and omits the contact footer.
  }

  const html = renderInvoiceHtml(order, logoUrl, contactInfo);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    });

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.orderNumber.replace(/^#/, "")}.pdf"`,
      },
    });
  } catch {
    return jsonError("Could not generate the PDF.", 500);
  } finally {
    await browser?.close();
  }
}
