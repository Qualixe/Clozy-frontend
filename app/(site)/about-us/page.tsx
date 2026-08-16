import type { Metadata } from "next";

import { AboutHero } from "@/components/about-hero";
import { AboutStory } from "@/components/about-story";
import { AboutValues } from "@/components/about-values";
import { AboutCta } from "@/components/about-cta";
import { getAboutPage } from "@/lib/get-about-page";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutPage().catch(() => null);
  return {
    title: data?.seoTitle || "About Us",
    description: data?.seoDescription || undefined,
  };
}

export default async function Page() {
  const data = await getAboutPage();

  return (
    <>
      <AboutHero data={data} />
      <AboutStory data={data} />
      <AboutValues data={data} />
      <AboutCta data={data} />
    </>
  );
}
