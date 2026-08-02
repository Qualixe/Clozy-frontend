import CategoryShowcase from "@/components/category";
import HeroSlider from "@/components/hero";
import ProductsSection from "@/components/products";
import { getCategories } from "@/lib/get-categories";

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
