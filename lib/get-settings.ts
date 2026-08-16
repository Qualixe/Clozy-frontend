export type StoreSettings = {
  insideDhakaRate: number;
  outsideDhakaRate: number;
  codEnabled: boolean;
  supportEmail: string | null;
  supportPhone: string | null;
  storeAddress: string | null;
  bkashGatewayEnabled: boolean;
  bkashShippingAdvanceEnabled: boolean;
  bkashPartialAdvanceEnabled: boolean;
  bkashPartialAdvanceMode: "percentage" | "fixed";
  bkashPartialAdvancePercent: number;
  bkashPartialAdvanceFixedAmount: number | null;
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  tiktokPixelId: string | null;
  aiChatEnabled: boolean;
  logoUrl: string | null;
  faviconUrl: string | null;
  categoryShowcaseHeading: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  footerTagline: string | null;
  footerInstagramUrl: string | null;
  footerTwitterUrl: string | null;
  footerFacebookUrl: string | null;
  footerYoutubeUrl: string | null;
};

export async function getSettings(): Promise<StoreSettings> {
  // Deliberately kept as no-store (not ISR): this payload gates live
  // checkout behavior (bkash/COD toggles, shipping rates used in price
  // calculation) via app/(site)/layout.tsx and the checkout flow, so it
  // shouldn't be stale for up to a revalidation window. It also anchors
  // every storefront route (it's fetched in the shared site layout on
  // every request) as dynamically rendered, which is what keeps the
  // now-ISR'd fetches in get-categories.ts / get-hero-slides.ts /
  // get-menu.ts safe from ever running at `next build` time — the original
  // concern behind the "backend isn't guaranteed reachable during a Vercel
  // build" comments on those files.
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

/** Admin-only shape — adds the SMS gateway credentials, never sent publicly. */
export type AdminStoreSettings = StoreSettings & {
  emailLogoUrl: string | null;
  emailAccentColor: string | null;
  emailFooterText: string | null;
  smsGatewayUrl: string | null;
  smsApiKey: string | null;
  smsSenderId: string | null;
  smsOrderConfirmationEnabled: boolean;
  smsOrderConfirmationTemplate: string | null;
  smsOrderCancelledEnabled: boolean;
  smsOrderCancelledTemplate: string | null;
  smsPromotionalEnabled: boolean;
  steadfastEnabled: boolean;
  steadfastApiKey: string | null;
  steadfastSecretKey: string | null;
  pathaoEnabled: boolean;
  pathaoBaseUrl: string | null;
  pathaoClientId: string | null;
  pathaoClientSecret: string | null;
  pathaoUsername: string | null;
  pathaoPassword: string | null;
  pathaoStoreId: string | null;
  bkashBaseUrl: string | null;
  bkashAppKey: string | null;
  bkashAppSecret: string | null;
  bkashUsername: string | null;
  bkashPassword: string | null;
  anthropicApiKey: string | null;
  anthropicConfigured: boolean;
};
