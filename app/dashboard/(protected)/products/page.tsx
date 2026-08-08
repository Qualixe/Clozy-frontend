import Link from "next/link";
import { FolderTree, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/dashboard/products-table";
import type { Product } from "@/components/product-card";

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function DashboardProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} products in your catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/dashboard/products/categories">
                <FolderTree className="h-4 w-4" />
                Categories
              </Link>
            }
          />
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href="/dashboard/products/new">
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            }
          />
        </div>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
