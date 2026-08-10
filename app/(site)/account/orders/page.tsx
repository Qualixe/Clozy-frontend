import { RequireAuth } from "@/components/require-auth";
import { AccountOrders } from "@/components/account-orders";

export default function Page() {
  return (
    <RequireAuth>
      <AccountOrders />
    </RequireAuth>
  );
}
