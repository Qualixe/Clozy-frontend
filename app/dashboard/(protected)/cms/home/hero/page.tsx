import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  ThemeHeroForm,
  type HeroSlideAdmin,
} from "@/components/dashboard/theme-hero-form";

async function getHeroSlides(): Promise<HeroSlideAdmin[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hero-slides`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function DashboardCmsHomeHeroPage() {
  const slides = await getHeroSlides();

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
        <h1 className="text-2xl font-semibold text-foreground">Hero Section</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the homepage hero section — text, images, buttons, and colors
          for each slide.
        </p>
      </div>

      <ThemeHeroForm slides={slides} />
    </div>
  );
}
