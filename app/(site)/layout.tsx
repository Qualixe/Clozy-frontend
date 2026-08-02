import SiteHeader from "@/components/header";
import SiteFooter from "@/components/footer";
import { CartProvider } from "@/lib/cart-context";
import { getMenuByHandle } from "@/lib/get-menu";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menu = await getMenuByHandle("main-menu");

  return (
    <CartProvider>
      <SiteHeader menu={menu} />
      {children}
      <SiteFooter />
    </CartProvider>
  );
}
