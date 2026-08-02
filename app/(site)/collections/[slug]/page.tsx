import { notFound } from "next/navigation";

import CollectionPage from "@/components/collection-page";
import type { Product } from "@/components/product-card";
import type { Category } from "@/components/category-card";

async function getCategory(slug: string): Promise<Category | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

async function getProducts(slug: string): Promise<Product[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?category=${slug}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const products = await getProducts(category.slug);

  return (
    <CollectionPage
      products={products}
      eyebrow="Collection"
      title={category.name}
      description={category.description}
    />
  );
}
