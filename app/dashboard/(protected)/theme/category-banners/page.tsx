import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ThemeCategoryBannersForm } from "@/components/dashboard/theme-category-banners-form";
import { getCategoryGridBanner } from "@/lib/get-category-grid-banner";

export default async function DashboardThemeCategoryBannersPage() {
  const data = await getCategoryGridBanner();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/theme"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Theme
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Category Banners
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick which categories show in the homepage&apos;s 4-up category
          grid banner, and their order.
        </p>
      </div>

      <ThemeCategoryBannersForm initial={data} />
    </div>
  );
}
