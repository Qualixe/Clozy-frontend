import CategoryShowcase from "@/components/category";
import HeroSlider from "@/components/hero";
import { ImageTextSection } from "@/components/image-text-section";
import ProductsSection from "@/components/products";
import { NewArrivalsSection } from "@/components/new-arrivals";
import { CategoryBanners } from "@/components/category-banners";
import { getCategories } from "@/lib/get-categories";
import { getHeroSlides } from "@/lib/get-hero-slides";
import type { Product } from "@/components/product-card";

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function Home() {
  // A backend hiccup shouldn't take the homepage down — fall back to an
  // empty list rather than throwing.
  const [categories, heroSlides, products] = await Promise.all([
    getCategories().catch(() => []),
    getHeroSlides().catch(() => []),
    getProducts().catch(() => []),
  ]);

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <CategoryShowcase categories={categories} />

      <ProductsSection />
      <CategoryBanners categories={categories} />
      <NewArrivalsSection products={products} />
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
