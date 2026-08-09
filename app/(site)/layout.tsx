import type { Metadata } from "next";

import SiteHeader from "@/components/header";
import SiteFooter from "@/components/footer";
import { Pixels } from "@/components/pixels";
import { ChatWidget } from "@/components/chat-widget";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { getMenuByHandle } from "@/lib/get-menu";
import { getSettings } from "@/lib/get-settings";

// Overrides the root layout's default favicon with the dashboard-uploaded
// one, when set. Runs only for storefront routes — the dashboard keeps the
// default icon from the root layout.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  if (!settings?.faviconUrl) return {};
  return { icons: { icon: settings.faviconUrl } };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menu, footerMenu, settings] = await Promise.all([
    getMenuByHandle("main-menu"),
    getMenuByHandle("footer-menu"),
    // A backend hiccup shouldn't take the storefront down over analytics.
    getSettings().catch(() => ({
      facebookPixelId: null,
      googleAnalyticsId: null,
      googleTagManagerId: null,
      tiktokPixelId: null,
      aiChatEnabled: false,
      logoUrl: null,
      faviconUrl: null,
    })),
  ]);

  return (
    <CartProvider>
      <WishlistProvider>
        <Pixels settings={settings} />
        <SiteHeader menu={menu} logoUrl={settings.logoUrl} />
        <div className="pb-16 md:pb-0">
          {children}
          <SiteFooter menu={footerMenu} logoUrl={settings.logoUrl} />
        </div>
        <ChatWidget enabled={settings.aiChatEnabled} />
        <MobileBottomNav menu={menu} />
      </WishlistProvider>
    </CartProvider>
  );
}
