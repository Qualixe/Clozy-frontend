import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

import { getPublishedPolicies } from "@/lib/get-policies";

export const metadata = {
  title: "Policies",
};

export default async function PoliciesIndexPage() {
  const policies = await getPublishedPolicies();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Policies
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Our privacy, terms, and other policies.
      </p>

      {policies.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No policies have been published yet.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-border rounded-xl border border-border">
          {policies.map((policy) => (
            <li key={policy.id}>
              <Link
                href={`/policies/${policy.slug}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <span className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {policy.title}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
