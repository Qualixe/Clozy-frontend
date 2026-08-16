import type { OrderDetail } from "@/data/orders";

const STATUS_LABELS: Record<NonNullable<OrderDetail["paymentStatus"]>, string> = {
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Payment Failed",
};

function money(amount: number): string {
  return `৳${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Self-contained HTML + inline CSS for the invoice — fed straight into
 * Puppeteer's page.setContent() (see app/api/invoice/pdf/route.ts), so it
 * can't rely on the app's compiled Tailwind stylesheet the way
 * components/dashboard/invoice-view.tsx does. Kept visually in sync with
 * that component by hand (two-tone accent bar, dark table header, amber
 * "Total" column/row) rather than sharing code, since one renders in the
 * browser and the other in a headless one with no bundler in between.
 */
export type InvoiceContactInfo = {
  supportPhone?: string | null;
  supportEmail?: string | null;
  storeAddress?: string | null;
};

const ICON_PHONE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg>`;
const ICON_MAIL = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#171717" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
const ICON_PIN = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#737373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;

export function renderInvoiceHtml(
  order: OrderDetail,
  logoUrl: string | null,
  contact: InvoiceContactInfo = {}
): string {
  const billToLines = [
    [order.address, order.district].filter(Boolean).join(", "),
    order.email,
    order.phone,
  ].filter(Boolean) as string[];

  const paymentLine = [
    order.payment,
    order.bkashNumber ? `· ${order.bkashNumber}` : null,
    order.paymentStatus ? `— ${STATUS_LABELS[order.paymentStatus]}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const itemRows = order.items
    .map(
      (item, i) => `
        <tr>
          <td class="sl ${i % 2 === 1 ? "zebra" : ""}">${String(i + 1).padStart(2, "0")}</td>
          <td class="desc ${i % 2 === 1 ? "zebra" : ""}">
            <div class="item-row">
              <div class="item-thumb">
                ${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" />` : ""}
              </div>
              <div>
                <p class="item-name">${esc(item.name)}</p>
                ${item.variant ? `<p class="item-variant">${esc(item.variant)}</p>` : ""}
              </div>
            </div>
          </td>
          <td class="qty ${i % 2 === 1 ? "zebra" : ""}">${item.qty}</td>
          <td class="price ${i % 2 === 1 ? "zebra" : ""}">${money(item.price)}</td>
          <td class="total-col">${money(item.price * item.qty)}</td>
        </tr>`
    )
    .join("");

  const discountRow =
    order.discountAmount > 0
      ? `<div class="totals-row">
          <span class="muted">Discount${order.discountCode ? ` (${esc(order.discountCode)})` : ""}</span>
          <span>-${money(order.discountAmount)}</span>
        </div>`
      : "";

  const advanceRows =
    order.advanceAmount !== null
      ? `<div class="totals-row">
          <span class="muted">Paid via bKash</span>
          <span>${money(order.advanceAmount)}</span>
        </div>
        <div class="totals-row" style="font-weight: 600;">
          <span>Due on Delivery</span>
          <span>${money(order.codAmountDue)}</span>
        </div>`
      : "";

  const contactBar =
    contact.supportPhone || contact.supportEmail || contact.storeAddress
      ? `<div class="contact-bar">
          ${
            contact.supportPhone
              ? `<div class="contact-item"><span class="badge dark">${ICON_PHONE}</span><span class="text">${esc(contact.supportPhone)}</span></div>`
              : ""
          }
          ${
            contact.supportEmail
              ? `<div class="contact-item"><span class="badge amber">${ICON_MAIL}</span><span class="text">${esc(contact.supportEmail)}</span></div>`
              : ""
          }
          ${
            contact.storeAddress
              ? `<div class="contact-item">${ICON_PIN}<span class="text">${esc(contact.storeAddress)}</span></div>`
              : ""
          }
        </div>`
      : "";

  const letterhead = logoUrl
    ? `<img src="${esc(logoUrl)}" alt="Clozy" style="height: 36px; max-width: 180px; object-fit: contain;" />`
    : `<div style="display: flex; align-items: center; gap: 10px;">
        <span style="display: flex; height: 36px; width: 36px; align-items: center; justify-content: center; border-radius: 6px; background: #171717; color: #fff; font-weight: 700; font-size: 16px;">C</span>
        <span style="font-size: 20px; font-weight: 600; color: #171717;">Clozy</span>
      </div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Invoice ${esc(order.orderNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 40px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #171717;
    background: #fff;
  }
  .muted { color: #737373; }
  .letterhead-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  h1.invoice-title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .accent-bar {
    display: flex;
    height: 6px;
    width: 100%;
    margin-top: 16px;
  }
  .accent-bar .dark { flex: 1; background: #171717; }
  .accent-bar .amber { width: 96px; background: #fbbf24; }
  .meta-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-top: 24px;
  }
  .bill-to .label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #737373; }
  .bill-to .name { margin: 6px 0 0; font-size: 15px; font-weight: 600; }
  .bill-to p { margin: 2px 0 0; font-size: 13px; color: #737373; }
  .invoice-meta { font-size: 13px; }
  .invoice-meta .row { display: flex; justify-content: flex-end; gap: 16px; margin-top: 4px; }
  .invoice-meta .row dt { font-weight: 600; margin: 0; }
  .invoice-meta .row dd { margin: 0; color: #737373; }
  table { width: 100%; border-collapse: collapse; margin-top: 32px; font-size: 13px; border: 1px solid #d4d4d4; }
  thead tr { background: #171717; color: #fff; }
  thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #d4d4d4; }
  thead th.center { text-align: center; }
  thead th.right { text-align: right; }
  tbody td { padding: 10px 12px; vertical-align: top; border: 1px solid #d4d4d4; }
  tbody td.sl { color: #737373; width: 40px; }
  tbody td.qty { text-align: center; }
  tbody td.price { text-align: center; }
  tbody td.total-col { text-align: right; font-weight: 600; background: rgba(251, 191, 36, 0.2); width: 100px; }
  tbody .zebra { background: #f5f5f5; }
  .item-row { display: flex; align-items: center; gap: 10px; }
  .item-thumb {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 6px;
    border: 1px solid #d4d4d4;
    background: #f5f5f5;
    overflow: hidden;
  }
  .item-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .item-name { margin: 0; }
  .item-variant { margin: 2px 0 0; font-size: 11px; color: #737373; }
  .totals-wrap { display: flex; justify-content: flex-end; margin-top: 24px; }
  .totals { width: 260px; font-size: 13px; }
  .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals-row.grand { background: #fbbf24; padding: 10px 12px; margin-top: 4px; font-size: 15px; font-weight: 700; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; text-align: center; }
  .footer p { margin: 0; }
  .footer .thanks { font-size: 14px; font-weight: 600; }
  .footer .contact { margin-top: 4px; font-size: 11px; color: #737373; }
  .contact-bar {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e5e5e5;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 32px;
  }
  .contact-item { display: flex; align-items: center; gap: 8px; }
  .contact-item .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    flex-shrink: 0;
  }
  .contact-item .badge.dark { background: #171717; }
  .contact-item .badge.amber { background: #fbbf24; }
  .contact-item span.text { font-size: 12px; color: #171717; }
</style>
</head>
<body>
  <div class="letterhead-row">
    ${letterhead}
    <h1 class="invoice-title">INVOICE</h1>
  </div>

  <div class="accent-bar">
    <div class="dark"></div>
    <div class="amber"></div>
  </div>

  <div class="meta-row">
    <div class="bill-to">
      <p class="label">Invoice To</p>
      <p class="name">${esc(order.customer)}</p>
      ${billToLines.map((line) => `<p>${esc(line)}</p>`).join("")}
    </div>
    <dl class="invoice-meta">
      <div class="row"><dt>Invoice No</dt><dd>${esc(order.orderNumber)}</dd></div>
      <div class="row"><dt>Date</dt><dd>${esc(order.date)}</dd></div>
      <div class="row"><dt>Status</dt><dd>${esc(order.status)}</dd></div>
      <div class="row"><dt>Payment</dt><dd>${esc(paymentLine)}</dd></div>
    </dl>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">SL.</th>
        <th>Item Description</th>
        <th class="center">Qty.</th>
        <th class="center">Price</th>
        <th class="right" style="width: 100px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row"><span class="muted">Sub Total</span><span>${money(order.subtotal)}</span></div>
      <div class="totals-row"><span class="muted">Shipping</span><span>${money(order.shippingCost)}</span></div>
      ${discountRow}
      <div class="totals-row grand"><span>Total</span><span>${money(order.total)}</span></div>
      ${advanceRows}
    </div>
  </div>

  <div class="footer">
    <p class="thanks">Thank you for shopping with us.</p>
  </div>

  ${contactBar}
</body>
</html>`;
}
