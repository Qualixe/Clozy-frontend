"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  LayoutTemplate,
  Percent,
  MessageSquareText,
  MessageCircle,
  Mail,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { useAuthStore } from "@/lib/auth-store";
import { ACCOUNT_SIDEBAR_ITEMS, SIDEBAR_ITEMS } from "@/lib/sidebar-items";

/** Icons live here (UI-only), keyed by the matching config href — `sidebar-items.ts` stays edge-safe/serializable. */
const ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/products": Package,
  "/dashboard/orders": ShoppingCart,
  "/dashboard/discounts": Percent,
  "/dashboard/reviews": MessageSquareText,
  "/dashboard/customers": Users,
  "/dashboard/analytics": BarChart3,
  "/dashboard/content": FileText,
  "/dashboard/cms": LayoutTemplate,
  "/dashboard/sms": MessageCircle,
  "/dashboard/users": Users,
  "/dashboard/subscribers": Mail,
  "/dashboard/settings": Settings,
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const hasPermission = useAuthStore((s) => s.hasPermission);

  async function handleSignOut() {
    await logout();
    router.push("/login");
  }

  const initials = user
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const navItems = SIDEBAR_ITEMS.map((item) => ({
    ...item,
    children: item.children?.filter(
      (child) => !child.permissions || hasPermission(child.permissions)
    ),
  })).filter(
    (item) =>
      !item.permissions || hasPermission(item.permissions) || (item.children?.length ?? 0) > 0
  );

  const accountItems = ACCOUNT_SIDEBAR_ITEMS.filter(
    (item) => !item.permissions || hasPermission(item.permissions)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            C
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            Clozy Admin
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = ICONS[item.href] ?? LayoutDashboard;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      render={
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                    {item.children && item.children.length > 0 && (
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              isActive={pathname === child.href}
                              render={
                                <Link href={child.href}>
                                  <span>{child.title}</span>
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => {
                const Icon = ICONS[item.href] ?? Settings;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      render={
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Account" className="pointer-events-none">
              <Avatar className="h-6 w-6 rounded-md">
                <AvatarFallback className="rounded-md text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">{user?.name ?? "…"}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign out" onClick={handleSignOut}>
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
