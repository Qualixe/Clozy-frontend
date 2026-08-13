import CheckoutPage from "@/components/checkout-page";
import { getSettings } from "@/lib/get-settings";

export default async function Page() {
  const settings = await getSettings().catch(() => ({
    insideDhakaRate: 3,
    outsideDhakaRate: 6,
    codEnabled: true,
    bkashGatewayEnabled: false,
    bkashShippingAdvanceEnabled: false,
    bkashPartialAdvanceEnabled: false,
    bkashPartialAdvanceMode: "percentage" as const,
    bkashPartialAdvancePercent: 20,
    bkashPartialAdvanceFixedAmount: null,
  }));

  return (
    <CheckoutPage
      insideDhakaRate={settings.insideDhakaRate}
      outsideDhakaRate={settings.outsideDhakaRate}
      codEnabled={settings.codEnabled}
      bkashGatewayEnabled={settings.bkashGatewayEnabled}
      bkashShippingAdvanceEnabled={settings.bkashShippingAdvanceEnabled}
      bkashPartialAdvanceEnabled={settings.bkashPartialAdvanceEnabled}
      bkashPartialAdvanceMode={settings.bkashPartialAdvanceMode}
      bkashPartialAdvancePercent={settings.bkashPartialAdvancePercent}
      bkashPartialAdvanceFixedAmount={settings.bkashPartialAdvanceFixedAmount}
    />
  );
}
