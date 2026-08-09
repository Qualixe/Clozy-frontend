import { SettingsForm } from "@/components/dashboard/settings-form";
import type { AdminStoreSettings } from "@/lib/get-settings";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";

async function getAdminSettings(): Promise<AdminStoreSettings> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/admin`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function DashboardSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [settings, { tab }] = await Promise.all([getAdminSettings(), searchParams]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your store, shipping, and payment options.
        </p>
      </div>

      <SettingsForm initialSettings={settings} activeTab={tab} />
    </div>
  );
}
