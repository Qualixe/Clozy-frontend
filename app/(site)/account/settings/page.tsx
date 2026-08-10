import { RequireAuth } from "@/components/require-auth";
import { AccountSettings } from "@/components/account-settings";

export default function Page() {
  return (
    <RequireAuth>
      <AccountSettings />
    </RequireAuth>
  );
}
