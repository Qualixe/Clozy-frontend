import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PolicyEditForm } from "@/components/dashboard/policy-edit-form";
import { fromPolicy } from "@/components/dashboard/policy-form";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";
import type { Policy } from "@/lib/get-policies";

async function getPolicy(id: string): Promise<Policy | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/policies/${id}`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  if (res.status === 404) return null;
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function EditPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const policy = await getPolicy(id);

  if (!policy) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/content/policies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Policies
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">{policy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update &quot;{policy.title}&quot;'s content.
        </p>
      </div>

      <PolicyEditForm policyId={id} initialValue={fromPolicy(policy)} />
    </div>
  );
}
