import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ThemeCategoryBannersForm } from "@/components/dashboard/theme-category-banners-form";
import type { CategoryGridBannerData } from "@/components/category-grid-banners";

// Local no-store fetcher rather than the shared lib/get-category-grid-banner.ts
// (which uses ISR revalidate: 60 for the public storefront) — that ISR
// config makes Next try to statically prerender this dashboard page at
// `next build` time, which fails whenever the backend isn't reachable
// during the build. See hero/page.tsx for the same pattern.
async function getCategoryGridBanner(): Promise<CategoryGridBannerData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category-grid-banner`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function DashboardCmsHomeCategoryBannersPage() {
  const data = await getCategoryGridBanner();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/cms/home"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
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
