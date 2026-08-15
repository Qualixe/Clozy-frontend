import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProductEditForm } from "@/components/dashboard/product-edit-form";
import { fromEditResponse, type ProductEditResponse } from "@/lib/product-form";
import { getServerAuthHeaders } from "@/lib/auth-server";

async function getProduct(id: string): Promise<ProductEditResponse | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}/edit`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Products
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update &quot;{product.title}&quot;'s details.
        </p>
      </div>

      <ProductEditForm productId={id} initialValue={fromEditResponse(product)} />
    </div>
  );
}
