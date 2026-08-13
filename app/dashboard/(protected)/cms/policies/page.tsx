import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Can } from "@/components/can";
import { PoliciesTable } from "@/components/dashboard/policies-table";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";
import type { PolicySummary } from "@/lib/get-policies";

async function getPolicies(): Promise<PolicySummary[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/policies`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function DashboardPoliciesPage() {
  const policies = await getPolicies();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/cms"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          CMS
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Policies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Privacy, terms, and other policy pages shown on your storefront.
          </p>
        </div>
        <Can permission="create_cms_pages">
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href="/dashboard/cms/policies/new">
                <Plus className="h-4 w-4" />
                Add Policy
              </Link>
            }
          />
        </Can>
      </div>

      <PoliciesTable policies={policies} />
    </div>
  );
}
