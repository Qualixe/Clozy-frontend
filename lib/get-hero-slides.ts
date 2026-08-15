import type { HeroSlide } from "@/components/hero";

export async function getHeroSlides(): Promise<HeroSlide[]> {
  // ISR instead of no-store: hero slides only change via the admin
  // dashboard, so a 60s revalidation window is safe. `getSettings()`
  // (lib/get-settings.ts) stays `no-store` and is fetched alongside this
  // in every storefront route via app/(site)/layout.tsx, which keeps those
  // routes dynamically rendered — so this fetch is still never run during
  // `next build`, only at request time (then cached for 60s).
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hero-slides`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
