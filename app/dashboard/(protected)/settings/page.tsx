import { SettingsForm } from "@/components/dashboard/settings-form";

export default function DashboardSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your store, shipping, and payment options.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
