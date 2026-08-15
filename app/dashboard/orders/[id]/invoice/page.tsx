import { InvoiceView } from "@/components/dashboard/invoice-view";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";
import { getSettings } from "@/lib/get-settings";
import type { OrderDetail } from "@/data/orders";

async function getOrder(id: string): Promise<OrderDetail> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

// Deliberately outside app/dashboard/(protected) — an invoice should print
// cleanly without the dashboard sidebar/topbar. Still gated the same as
// every other /dashboard/* route: proxy.ts matches on the URL regardless of
// route group, and permissionsForPath("/dashboard/orders/...") resolves to
// the Orders nav entry's view_orders permission (see lib/sidebar-items.ts).
export default async function OrderInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getOrder(id),
    getSettings().catch(() => null),
  ]);

  return (
    <InvoiceView
      order={order}
      logoUrl={settings?.logoUrl ?? null}
      pdfUrl={`/api/invoice/pdf?orderId=${id}`}
    />
  );
}
