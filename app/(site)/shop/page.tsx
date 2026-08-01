import CollectionPage from "@/components/collection-page";
import type { Product } from "@/components/product-card";

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function Page() {
  const products = await getProducts();
  return <CollectionPage products={products} />;
}
