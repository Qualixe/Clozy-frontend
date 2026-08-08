import type { CategoryGridBannerData } from "@/components/category-grid-banners";

export async function getCategoryGridBanner(): Promise<CategoryGridBannerData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category-grid-banner`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
