"use client";

import { useRouter } from "next/navigation";

import { ProductForm } from "@/components/dashboard/product-form";

export function ProductNewForm() {
  const router = useRouter();

  return (
    <ProductForm
      onCancel={() => router.push("/dashboard/products")}
      onSuccess={() => {
        router.push("/dashboard/products");
        router.refresh();
      }}
    />
  );
}

export default ProductNewForm;
