import { ShieldAlert } from "lucide-react";

import { UsersTable } from "@/components/dashboard/users-table";
import { UserDialog, type ManagedUser } from "@/components/dashboard/user-dialog";
import { getServerAuthHeaders } from "@/lib/auth-server";

async function getUsers(): Promise<{ users: ManagedUser[] | null; forbidden: boolean }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  if (res.status === 403) return { users: null, forbidden: true };
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return { users: await res.json(), forbidden: false };
}

export default async function DashboardUsersPage() {
  const { users, forbidden } = await getUsers();

  if (forbidden || !users) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border py-20 text-center">
        <ShieldAlert className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Only admins can manage user accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} accounts — admins and editors can access the dashboard.
          </p>
        </div>
        <UserDialog />
      </div>

      <UsersTable users={users} />
    </div>
  );
}
