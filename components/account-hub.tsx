"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Settings, Heart, LogOut, ChevronRight } from "lucide-react";

import { useAuth } from "@/lib/auth-context";

const LINKS = [
  {
    title: "Orders",
    description: "Track and review your past orders.",
    href: "/account/orders",
    icon: Package,
  },
  {
    title: "Wishlist",
    description: "Products you've saved for later.",
    href: "/account/wishlist",
    icon: Heart,
  },
  {
    title: "Settings",
    description: "Update your name, email, and password.",
    href: "/account/settings",
    icon: Settings,
  },
];

export function AccountHub() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await logout();
    router.push("/");
  }

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Account</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Hi, {user?.name ?? "there"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <div className="mt-8 divide-y divide-border rounded-xl border border-border">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <link.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{link.title}</p>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Sign out</p>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}

export default AccountHub;
