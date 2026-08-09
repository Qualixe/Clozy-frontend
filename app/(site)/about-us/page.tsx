import { AboutHero } from "@/components/about-hero";
import { AboutStory } from "@/components/about-story";
import { AboutValues } from "@/components/about-values";
import { AboutCta } from "@/components/about-cta";
import { getAboutPage } from "@/lib/get-about-page";

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
