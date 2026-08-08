import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PolicyNewForm } from "@/components/dashboard/policy-new-form";

export default function NewPolicyPage() {
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
        <h1 className="text-2xl font-semibold text-foreground">Add Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new policy page, e.g. Privacy Policy or Terms of Service.
        </p>
      </div>

      <PolicyNewForm />
    </div>
  );
}
