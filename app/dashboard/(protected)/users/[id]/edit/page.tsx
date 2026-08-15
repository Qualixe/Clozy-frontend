import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { UserEditForm } from "@/components/dashboard/user-edit-form";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";
import type { ManagedUser } from "@/components/dashboard/user-dialog";

async function getUser(id: string): Promise<ManagedUser | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  if (res.status === 404) return null;
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Users
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">{user.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update this account&apos;s details and exactly which permissions it holds.
        </p>
      </div>

      <UserEditForm user={user} />
    </div>
  );
}
