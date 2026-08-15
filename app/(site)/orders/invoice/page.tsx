import { Suspense } from "react";

import OrderInvoicePage from "@/components/order-invoice-page";

export default function Page() {
  return (
    <Suspense>
      <OrderInvoicePage />
    </Suspense>
  );
}
