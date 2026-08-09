"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  User,
  Package,
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
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import { HeaderSearch } from "@/components/header-search";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { canAccessDashboard } from "@/lib/auth-cookie";
import { MENU_ICONS } from "@/lib/menu-icons";
import { getNavLinks, type Menu as NavMenu } from "@/lib/get-menu";

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export function SiteHeader({
  menu,
  logoUrl,
}: {
  menu: NavMenu | null;
  logoUrl?: string | null;
}) {
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid a hydration mismatch: resolvedTheme is undefined on the server and
  // on the client's first render, and only becomes accurate once next-themes
  // reads localStorage/system preference after mount. This client-only
  // "second render" is the pattern React's own docs recommend for content
  // that must differ between server and client — see
  // https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content
  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only mount flag, not derived state
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const navLinks = getNavLinks(menu);

  async function handleSignOut() {
    await logout();
    router.push("/");
    router.refresh();
  }

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-2.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Clozy"
              width={128}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          ) : (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                C
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Clozy
              </span>
            </>
          )}
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
          {/* Search icon opens a floating dropdown input + results panel, on every breakpoint */}
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

          {/* Account dropdown — desktop only; mobile uses the bottom nav's Account tab */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-9 w-9 md:inline-flex"
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

          {/* Cart drawer — kept visible on mobile alongside the theme toggle;
              all other nav/account access moves to the bottom nav there. */}
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;