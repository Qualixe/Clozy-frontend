import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MenusTable, type MenuSummary } from "@/components/dashboard/menus-table";
import { AddMenuDialog } from "@/components/dashboard/add-menu-dialog";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";

async function getMenus(): Promise<MenuSummary[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menus`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function DashboardMenusPage() {
  const menus = await getMenus();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/content"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Content
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Menus</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The navigation menus used across your storefront.
          </p>
        </div>
        <AddMenuDialog />
      </div>

      <MenusTable menus={menus} />
    </div>
  );
}
