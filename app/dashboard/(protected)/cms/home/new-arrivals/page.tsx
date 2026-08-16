import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ThemeNewArrivalsForm } from "@/components/dashboard/theme-new-arrivals-form";
import type { NewArrivalsData } from "@/components/new-arrivals";

// Local no-store fetcher rather than the shared lib/get-new-arrivals.ts
// (ISR revalidate: 60 for the public storefront) — see category-banners/page.tsx
// for why that breaks static prerendering of this dashboard page.
async function getNewArrivals(): Promise<NewArrivalsData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/new-arrivals`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function DashboardCmsHomeNewArrivalsPage() {
  const data = await getNewArrivals();

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
          New Arrivals Section
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick which products show in the homepage&apos;s New Arrivals
          section, and edit its heading.
        </p>
      </div>

      <ThemeNewArrivalsForm initial={data} />
    </div>
  );
}
