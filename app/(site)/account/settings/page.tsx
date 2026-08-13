import { RequireAuth } from "@/components/require-auth";
import { AccountTabs } from "@/components/account-tabs";
import { AccountSettings } from "@/components/account-settings";

export default function Page() {
  return (
    <RequireAuth>
      <AccountTabs>
        <AccountSettings />
      </AccountTabs>
    </RequireAuth>
  );
}
