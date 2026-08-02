"use client";

import { useRouter } from "next/navigation";

import { ProductForm } from "@/components/dashboard/product-form";
import type { ProductFormValues } from "@/lib/product-form";

export function ProductEditForm({
  productId,
  initialValue,
}: {
  productId: string;
  initialValue: ProductFormValues;
}) {
  const router = useRouter();

  return (
    <ProductForm
      productId={productId}
      initialValue={initialValue}
      onCancel={() => router.push("/dashboard/products")}
      onSuccess={() => {
        router.push("/dashboard/products");
        router.refresh();
      }}
    />
  );
}

export default ProductEditForm;
