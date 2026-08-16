import type { Metadata } from "next";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AdminChatWidget } from "@/components/dashboard/admin-chat-widget";
import { getSettings } from "@/lib/get-settings";

// Same override as app/(site)/layout.tsx — the dashboard should reflect
// the branding settings too, not just the storefront.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  if (!settings) return {};

  const metadata: Metadata = {};
  if (settings.faviconUrl) metadata.icons = { icon: settings.faviconUrl };
  return metadata;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings().catch(() => null);

  return (
    <SidebarProvider>
      <AppSidebar logoUrl={settings?.logoUrl ?? null} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <p className="text-sm font-medium text-foreground">Dashboard</p>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">{children}</div>
      </SidebarInset>
      <AdminChatWidget />
    </SidebarProvider>
  );
}
