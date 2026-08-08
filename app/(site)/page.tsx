import CategoryShowcase from "@/components/category";
import HeroSlider from "@/components/hero";
import ProductsSection from "@/components/products";
import { NewArrivalsSection } from "@/components/new-arrivals";
import { CategoryBanners } from "@/components/category-banners";
import { CategoryGridBanners } from "@/components/category-grid-banners";
import { SingleBanner } from "@/components/single-banner";
import { VideoSection } from "@/components/video-section";
import { getCategories } from "@/lib/get-categories";
import { getHeroSlides } from "@/lib/get-hero-slides";
import { getNewArrivals } from "@/lib/get-new-arrivals";
import { getVideoSection } from "@/lib/get-video-section";

export default async function Home() {
  // A backend hiccup shouldn't take the homepage down — fall back to an
  // empty list rather than throwing.
  const [categories, heroSlides, newArrivals, videoSection] = await Promise.all([
    getCategories().catch(() => []),
    getHeroSlides().catch(() => []),
    getNewArrivals().catch(() => ({
      enabled: false,
      eyebrow: "",
      heading: "",
      products: [],
    })),
    getVideoSection().catch(() => ({
      enabled: false,
      heading: "",
      items: [],
    })),
  ]);

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <CategoryShowcase categories={categories} />

      <ProductsSection />
      <CategoryBanners categories={categories} />
      <NewArrivalsSection data={newArrivals} />
      <SingleBanner
        image="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop"
        imageAlt="Seasonal sale"
        eyebrow="Limited Time"
        heading="Up to 40% off selected styles"
        body="Considered essentials at a considered price — while stocks last."
        ctaLabel="Shop the Sale"
        ctaHref="/shop"
      />
      <CategoryGridBanners categories={categories} />
      <VideoSection data={videoSection} />
      {/* <ImageTextSection
        image="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200&auto=format&fit=crop"
        imageAlt="Considered essentials, made to last"
        eyebrow="Our Story"
        heading="Designed in-house, built to outlast trends"
        body="Every piece starts with the fabric — we work with mills we trust, cut in small batches, and skip anything that won't hold up after a hundred washes."
        ctaLabel="Learn more"
        ctaHref="/about-us"
        imagePosition="left"
      /> */}
    </>
  );
}
