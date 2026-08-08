import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProductNewForm } from "@/components/dashboard/product-new-form";

export default function NewProductPage() {
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
        <h1 className="text-2xl font-semibold text-foreground">Add Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details below to add a new product to your catalog.
        </p>
      </div>

      <ProductNewForm />
    </div>
  );
}
