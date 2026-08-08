import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ThemeNewArrivalsForm } from "@/components/dashboard/theme-new-arrivals-form";
import { getNewArrivals } from "@/lib/get-new-arrivals";

export default async function DashboardThemeNewArrivalsPage() {
  const data = await getNewArrivals();

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
