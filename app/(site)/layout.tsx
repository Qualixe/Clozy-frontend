import SiteHeader from "@/components/header";
import SiteFooter from "@/components/footer";
import { Pixels } from "@/components/pixels";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { getMenuByHandle } from "@/lib/get-menu";
import { getSettings } from "@/lib/get-settings";

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
    })),
  ]);

  return (
    <CartProvider>
      <WishlistProvider>
        <Pixels settings={settings} />
        <SiteHeader menu={menu} />
        {children}
        <SiteFooter menu={footerMenu} />
      </WishlistProvider>
    </CartProvider>
  );
}
