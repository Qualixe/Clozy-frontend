import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MenuEditor, type MenuDetail } from "@/components/dashboard/menu-editor";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";

async function getMenu(id: string): Promise<MenuDetail | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menus/${id}`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  if (res.status === 404) return null;
  assertDashboardFetchOk(res);
  return res.json();
}

async function getCategories(): Promise<{ id: string; name: string; slug: string }[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [menu, categories] = await Promise.all([getMenu(id), getCategories()]);

  if (!menu) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/content/menus"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Menus
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">{menu.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, remove, reorder, and nest links in this menu.
        </p>
      </div>

      <MenuEditor menu={menu} categories={categories} />
    </div>
  );
}
