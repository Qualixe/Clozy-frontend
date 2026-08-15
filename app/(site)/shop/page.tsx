import CollectionPage from "@/components/collection-page";
import type { Product } from "@/components/product-card";

async function getProducts(search?: string): Promise<Product[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/products`);
  if (search) url.searchParams.set("search", search);

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const products = await getProducts(search);

  return (
    <CollectionPage
      products={products}
      title={search ? `Results for "${search}"` : "All Products"}
      description={
        search
          ? `${products.length} product${products.length === 1 ? "" : "s"} matching your search.`
          : undefined
      }
    />
  );
}
