import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ThemePromoBannerForm } from "@/components/dashboard/theme-promo-banner-form";
import type { PromoBannerData } from "@/lib/get-promo-banner";

// Local no-store fetcher rather than the shared lib/get-promo-banner.ts
// (ISR revalidate: 60 for the public storefront) — see category-banners/page.tsx
// for why that breaks static prerendering of this dashboard page.
async function getPromoBanner(): Promise<PromoBannerData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-banner`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function DashboardCmsHomePromoBannerPage() {
  const data = await getPromoBanner();

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
          Promo Banner
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the full-width promotional banner shown on the homepage.
        </p>
      </div>

      <ThemePromoBannerForm initial={data} />
    </div>
  );
}
