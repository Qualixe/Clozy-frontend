import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Can } from "@/components/can";
import { CategoriesTable } from "@/components/dashboard/categories-table";
import { CategoryDialog, type Category } from "@/components/dashboard/category-dialog";

async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function DashboardCategoriesPage() {
  const categories = await getCategories();

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} categories organizing your catalog.
          </p>
        </div>
        <Can permission="create_categories">
          <CategoryDialog />
        </Can>
      </div>

      <CategoriesTable categories={categories} />
    </div>
  );
}
