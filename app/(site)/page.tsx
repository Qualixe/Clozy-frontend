import CategoryShowcase from "@/components/category";
import HeroSlider from "@/components/hero";
import ProductsSection from "@/components/products";
import type { Category } from "@/components/category-card";

async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function Home() {
  const categories = await getCategories();

  return (
    <>
      <HeroSlider />
      <CategoryShowcase categories={categories} />
      <ProductsSection />
    </>
  );
}
