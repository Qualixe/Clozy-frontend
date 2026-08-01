import SiteHeader from "@/components/header";
import SiteFooter from "@/components/footer";
import { CartProvider } from "@/lib/cart-context";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </CartProvider>
  );
}
