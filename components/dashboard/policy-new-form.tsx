"use client";

import { useRouter } from "next/navigation";

import { PolicyForm } from "@/components/dashboard/policy-form";

export function PolicyNewForm() {
  const router = useRouter();

  return (
    <PolicyForm
      onCancel={() => router.push("/dashboard/cms/policies")}
      onSuccess={() => {
        router.push("/dashboard/cms/policies");
        router.refresh();
      }}
    />
  );
}

export default PolicyNewForm;
