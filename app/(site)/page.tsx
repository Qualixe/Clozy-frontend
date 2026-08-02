import CategoryShowcase from "@/components/category";
import HeroSlider from "@/components/hero";
import ProductsSection from "@/components/products";
import { getCategories } from "@/lib/get-categories";

export default async function Home() {
  // A backend hiccup shouldn't take the homepage down — fall back to an
  // empty category list rather than throwing.
  const categories = await getCategories().catch(() => []);

  return (
    <>
      <HeroSlider />
      <CategoryShowcase categories={categories} />
      <ProductsSection />
    </>
  );
}
