import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ThemeAboutPageForm } from "@/components/dashboard/theme-about-page-form";
import { getAboutPage } from "@/lib/get-about-page";

export default async function DashboardAboutPagePage() {
  const data = await getAboutPage();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/cms"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          CMS
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">About Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the hero, story, values, and call-to-action shown on your
          storefront&apos;s About page.
        </p>
      </div>

      <ThemeAboutPageForm initial={data} />
    </div>
  );
}
