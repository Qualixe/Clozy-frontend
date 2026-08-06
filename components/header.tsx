"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Menu,
  Package,
  Heart,
  LogOut,
  Settings,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import { HeaderSearch } from "@/components/header-search";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { canAccessDashboard } from "@/lib/auth-cookie";
import { MENU_ICONS } from "@/lib/menu-icons";
import type { Menu as NavMenu, MenuLink } from "@/lib/get-menu";
import navData from "@/data/nav.json";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
// Top-level nav links come from the "main-menu" Menu (editable at
// /dashboard/content/menus), with `data/nav.json`'s `links` as a fallback if
// that menu is missing/unreachable.

const FALLBACK_LINKS: MenuLink[] = navData.links.map((link) => ({
  id: link.href,
  label: link.label,
  url: link.href,
  type: "custom",
  displayStyle: "link",
  icon: null,
  children: [],
}));

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export function SiteHeader({ menu }: { menu: NavMenu | null }) {
  const [isDark, setIsDark] = React.useState(false);
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const navLinks = menu?.items.length ? menu.items : FALLBACK_LINKS;

  async function handleSignOut() {
    await logout();
    router.push("/");
    router.refresh();
  }

  function toggleTheme() {
    // Demo-only toggle. If the project already uses next-themes,
    // swap this for useTheme()'s setTheme("dark" | "light") instead.
    document.documentElement.classList.toggle("dark");
    setIsDark((d) => !d);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            C
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Clozy
          </span>
        </Link>

        {/* Desktop nav */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navLinks.map((link) => {
              if (link.children.length === 0) {
                return (
                  <NavigationMenuItem key={link.id}>
                    <NavigationMenuLink
                      render={
                        <Link
                          href={link.url}
                          className={cn(
                            "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      }
                    />
                  </NavigationMenuItem>
                );
              }

              if (link.displayStyle === "megamenu") {
                return (
                  <NavigationMenuItem key={link.id}>
                    <NavigationMenuTrigger>{link.label}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div
                        className="grid gap-6 p-5"
                        style={{
                          gridTemplateColumns: `repeat(${Math.max(link.children.length, 1)}, minmax(140px, 1fr))`,
                        }}
                      >
                        {link.children.map((group) => {
                          const Icon = group.icon ? MENU_ICONS[group.icon] : null;
                          return (
                            <div key={group.id}>
                              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                {group.label}
                              </div>
                              <ul className="space-y-2">
                                {group.children.map((leaf) => (
                                  <li key={leaf.id}>
                                    <NavigationMenuLink
                                      render={
                                        <Link
                                          href={leaf.url}
                                          className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
                                        >
                                          {leaf.label}
                                        </Link>
                                      }
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              }

              return (
                <NavigationMenuItem key={link.id}>
                  <NavigationMenuTrigger>{link.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-56 space-y-1 p-2">
                      {link.children.map((child) => (
                        <li key={child.id}>
                          <NavigationMenuLink
                            render={
                              <Link
                                href={child.url}
                                className="block rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                {child.label}
                              </Link>
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Expandable AJAX search */}
          <HeaderSearch />

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </Button>

          {/* Account dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Account"
                >
                  <User className="h-[18px] w-[18px]" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              {ready && user ? (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {canAccessDashboard(user) && (
                    <DropdownMenuItem
                      render={
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      }
                    />
                  )}
                  <DropdownMenuItem
                    render={
                      <Link href="/account/orders">
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Link>
                    }
                  />
                  <DropdownMenuItem
                    render={
                      <Link href="/account/wishlist">
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                      </Link>
                    }
                  />
                  <DropdownMenuItem
                    render={
                      <Link href="/account/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    }
                  />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <p className="font-medium">Hi there</p>
                      <p className="text-xs font-normal text-muted-foreground">
                        Sign in to view your account
                      </p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={
                      <Link href="/login">
                        <User className="mr-2 h-4 w-4" />
                        Sign in
                      </Link>
                    }
                  />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart drawer */}
          <CartDrawer />

          {/* Mobile menu (Sheet) */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-1 px-1">
                {navLinks.map((link) => (
                  <React.Fragment key={link.id}>
                    <Link
                      href={link.url}
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
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;