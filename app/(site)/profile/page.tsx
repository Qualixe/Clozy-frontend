import { RequireAuth } from "@/components/require-auth";
import { AccountTabs } from "@/components/account-tabs";
import { ProfilePage } from "@/components/profile-page";

export default function Page() {
  return (
    <RequireAuth requireVerified={false}>
      <AccountTabs>
        <ProfilePage />
      </AccountTabs>
    </RequireAuth>
  );
}
