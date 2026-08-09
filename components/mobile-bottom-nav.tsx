"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, User, Menu as MenuIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import { getNavLinks, type Menu as NavMenu } from "@/lib/get-menu";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  count?: number;
  onClick?: () => void;
  isActive: (pathname: string) => boolean;
};

export function MobileBottomNav({ menu }: { menu: NavMenu | null }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navLinks = getNavLinks(menu);

  // Hidden on dashboard routes — the dashboard has its own navigation.
  if (pathname?.startsWith("/dashboard")) return null;

  const items: NavItem[] = [
    {
      label: "Home",
      icon: Home,
      href: "/",
      isActive: (p) => p === "/",
    },
    {
      label: "Shop",
      icon: ShoppingBag,
      href: "/shop",
      isActive: (p) => p.startsWith("/shop") || p.startsWith("/collections") || p.startsWith("/products"),
    },
    {
      label: "Menu",
      icon: MenuIcon,
      onClick: () => setMenuOpen(true),
      isActive: () => false,
    },
    {
      label: "Wishlist",
      icon: Heart,
      href: "/account/wishlist",
      count: wishlistCount,
      isActive: (p) => p.startsWith("/account/wishlist"),
    },
    {
      label: "Account",
      icon: User,
      href: user ? "/account/orders" : "/login",
      isActive: (p) => p.startsWith("/account") && !p.startsWith("/account/wishlist"),
    },
  ];

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-stretch justify-around px-1">
          {items.map((item) => {
            const active = item.isActive(pathname ?? "");
            const content = (
              <>
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                    fill={active && item.label === "Wishlist" ? "currentColor" : "none"}
                  />
                  {!!item.count && (
                    <Badge className="absolute -right-2 -top-2 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                      {item.count}
                    </Badge>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </>
            );

            const className = cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-md py-1.5 transition-colors active:bg-accent"
            );

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={className}
                  aria-label={item.label}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href!}
                className={className}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Full site nav — reached via the bottom nav's "Menu" tab on mobile */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1">
            {navLinks.map((link) => (
              <React.Fragment key={link.id}>
                <Link
                  href={link.url}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  {link.label}
                </Link>
                {link.children.map((child) =>
                  child.children.length > 0 ? (
                    <React.Fragment key={child.id}>
                      <span className="px-3 pt-2 pb-1 pl-6 text-xs font-medium text-muted-foreground">
                        {child.label}
                      </span>
                      {child.children.map((leaf) => (
                        <Link
                          key={leaf.id}
                          href={leaf.url}
                          onClick={() => setMenuOpen(false)}
                          className="rounded-md px-3 py-2 pl-9 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          {leaf.label}
                        </Link>
                      ))}
                    </React.Fragment>
                  ) : (
                    <Link
                      key={child.id}
                      href={child.url}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-2 pl-6 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {child.label}
                    </Link>
                  )
                )}
              </React.Fragment>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default MobileBottomNav;
