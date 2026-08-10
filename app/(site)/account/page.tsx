import { RequireAuth } from "@/components/require-auth";
import { AccountHub } from "@/components/account-hub";

export default function Page() {
  return (
    <RequireAuth>
      <AccountHub />
    </RequireAuth>
  );
}
