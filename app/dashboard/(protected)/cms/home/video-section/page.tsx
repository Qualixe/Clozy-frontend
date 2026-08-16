import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ThemeVideoSectionForm } from "@/components/dashboard/theme-video-section-form";
import type { VideoSectionData } from "@/components/video-section";

// Local no-store fetcher rather than the shared lib/get-video-section.ts
// (ISR revalidate: 60 for the public storefront) — see category-banners/page.tsx
// for why that breaks static prerendering of this dashboard page.
async function getVideoSection(): Promise<VideoSectionData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/video-section`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

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
