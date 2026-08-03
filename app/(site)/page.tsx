import CategoryShowcase from "@/components/category";
import HeroSlider from "@/components/hero";
import { ImageTextSection } from "@/components/image-text-section";
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
            <ImageTextSection
        image="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200&auto=format&fit=crop"
        imageAlt="Considered essentials, made to last"
        eyebrow="Our Story"
        heading="Designed in-house, built to outlast trends"
        body="Every piece starts with the fabric — we work with mills we trust, cut in small batches, and skip anything that won't hold up after a hundred washes."
        ctaLabel="Learn more"
        ctaHref="/about-us"
        imagePosition="left"
      />
    </>
  );
}
