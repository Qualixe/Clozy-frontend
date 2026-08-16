export const ABOUT_VALUE_ICONS = [
  "leaf",
  "pen-tool",
  "tag",
  "globe",
  "heart",
  "shield",
  "truck",
  "award",
  "recycle",
  "users",
  "star",
  "package",
] as const;

export type AboutValueIcon = (typeof ABOUT_VALUE_ICONS)[number];

export type AboutPageData = {
  heroBadge: string;
  heroHeadingLine1: string;
  heroHeadingLine2: string;
  heroBody: string;
  heroImage: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  heroStats: { value: string; label: string }[];
  heroBadgeTitle: string;
  heroBadgeValue: string;
  heroBadgeSubtitle: string;
  storyEyebrow: string;
  storyHeading: string;
  storyBody: string;
  storyImage: string;
  valuesEyebrow: string;
  valuesHeading: string;
  values: { icon: AboutValueIcon; title: string; description: string }[];
  ctaHeading: string;
  ctaBody: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export async function getAboutPage(): Promise<AboutPageData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/about-page`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
