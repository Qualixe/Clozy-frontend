import { notFound } from "next/navigation";

import ProductPage, { type ProductDetail } from "@/components/single-product";

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

  return res.json();
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return <ProductPage product={product} />;
}
