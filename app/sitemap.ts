import type { MetadataRoute } from "next";

import { getCategories } from "@/lib/get-categories";
import { getSiteUrl } from "@/lib/site-url";

type ProductSlug = { slug: string };

async function getProductSlugs(): Promise<ProductSlug[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  // A backend hiccup shouldn't break sitemap generation — fall back to the
  // static routes only, same error-fallback pattern used across the
  // storefront's data fetches.
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProductSlugs().catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/collections/all`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/about-us`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/collections/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
