export type PromoBannerData = {
  enabled: boolean;
  image: string | null;
  eyebrow: string | null;
  heading: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export async function getPromoBanner(): Promise<PromoBannerData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-banner`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
