"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { title: "Profile", href: "/profile", icon: User },
  { title: "Orders", href: "/account/orders", icon: Package },
  { title: "Settings", href: "/account/settings", icon: Settings },
];

/** Shared left-side tab nav for the account section (Profile/Orders/Settings) — each tab is a real route, not an in-page panel switch. */
export function AccountTabs({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <nav className="w-full shrink-0 sm:w-48" aria-label="Account">
            <ul className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
              {TABS.map((tab) => {
                const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
                return (
                  <li key={tab.href} className="shrink-0 sm:shrink">
                    <Link
                      href={tab.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <tab.icon className="h-4 w-4 shrink-0" />
                      {tab.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}

export default AccountTabs;
