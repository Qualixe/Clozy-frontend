import CheckoutPage from "@/components/checkout-page";
import { getSettings } from "@/lib/get-settings";

export default async function Page() {
  const settings = await getSettings().catch(() => ({
    insideDhakaRate: 3,
    outsideDhakaRate: 6,
  }));

  return (
    <CheckoutPage
      insideDhakaRate={settings.insideDhakaRate}
      outsideDhakaRate={settings.outsideDhakaRate}
    />
  );
}
