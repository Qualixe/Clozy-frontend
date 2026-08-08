import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ThemePromoBannerForm } from "@/components/dashboard/theme-promo-banner-form";
import { getPromoBanner } from "@/lib/get-promo-banner";

export default async function DashboardThemePromoBannerPage() {
  const data = await getPromoBanner();

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
