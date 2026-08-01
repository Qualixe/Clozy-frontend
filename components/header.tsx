"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Search,
  Menu,
  Package,
  Heart,
  LogOut,
  Settings,
  Shirt,
  Watch,
  Footprints,
  Gem,
  Sun,
  Moon,
  X,
  type LucideIcon,
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CartDrawer } from "@/components/cart-drawer";
import { cn } from "@/lib/utils";
import navData from "@/data/nav.json";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
// Nav structure lives in `data/nav.json`; icons can't be serialized to JSON,
// so categories reference an icon name that's resolved through this map.

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Shirt,
  Footprints,
  Watch,
  Gem,
};

const CATEGORIES = navData.categories;
const NAV_LINKS = navData.links;

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  function toggleSearch() {
    setSearchOpen((open) => {
      const next = !open;
      if (next) {
        // wait for the expand transition/mount before focusing
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
      return next;
    });
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
            <NavigationMenuItem>
              <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[640px] grid-cols-4 gap-6 p-5">
                  {CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.icon];
                    return (
                      <div key={cat.title}>
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {cat.title}
                        </div>
                        <ul className="space-y-2">
                          {cat.items.map((item) => (
                            <li key={item}>
                              <NavigationMenuLink
                                render={
                                  <Link
                                    href={`${cat.href}/${item
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")}`}
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
                                  >
                                    {item}
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
                <Separator />
                <div className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-muted-foreground">
                    New season arrivals are here.
                  </span>
                  <NavigationMenuLink
                    render={
                      <Link
                        href="/shop/new"
                        className="font-medium text-foreground hover:underline underline-offset-4"
                      >
                        Shop the collection →
                      </Link>
                    }
                  />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {NAV_LINKS.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  render={
                    <Link
                      href={link.href}
                      className={cn(
                        "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  }
                />
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Expandable search */}
          <div className="flex items-center">
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                searchOpen ? "w-40 sm:w-64 opacity-100" : "w-0 opacity-0"
              )}
            >
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search products…"
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label={searchOpen ? "Close search" : "Search"}
              onClick={toggleSearch}
            >
              {searchOpen ? (
                <X className="h-[18px] w-[18px]" />
              ) : (
                <Search className="h-[18px] w-[18px]" />
              )}
            </Button>
          </div>

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
              <DropdownMenuLabel>
                <p className="font-medium">Hi there</p>
                <p className="text-xs font-normal text-muted-foreground">
                  Sign in to view your account
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={
                  <Link href="/login">
                    <User className="mr-2 h-4 w-4" />
                    Sign in
                  </Link>
                }
              />
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
              <DropdownMenuItem
                variant="destructive"
                render={
                  <Link href="/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Link>
                }
              />
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
                <Link
                  href="/shop"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Shop
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.title}
                    href={cat.href}
                    className="rounded-md px-3 py-2 pl-6 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {cat.title}
                  </Link>
                ))}
                <Separator className="my-2" />
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    {link.label}
                  </Link>
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