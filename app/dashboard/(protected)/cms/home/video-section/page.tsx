import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ThemeVideoSectionForm } from "@/components/dashboard/theme-video-section-form";
import { getVideoSection } from "@/lib/get-video-section";

export default async function DashboardCmsHomeVideoSectionPage() {
  const data = await getVideoSection();

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
          Video Section
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload the portrait videos, captions, and heading for the
          homepage&apos;s video carousel.
        </p>
      </div>

      <ThemeVideoSectionForm initial={data} />
    </div>
  );
}
