"use client";

import { useRouter } from "next/navigation";

import { PolicyForm, type PolicyFormValues } from "@/components/dashboard/policy-form";

export function PolicyEditForm({
  policyId,
  initialValue,
}: {
  policyId: string;
  initialValue: PolicyFormValues;
}) {
  const router = useRouter();

  return (
    <PolicyForm
      policyId={policyId}
      initialValue={initialValue}
      onCancel={() => router.push("/dashboard/content/policies")}
      onSuccess={() => {
        router.push("/dashboard/content/policies");
        router.refresh();
      }}
    />
  );
}

export default PolicyEditForm;
