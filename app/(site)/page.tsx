import CategoryShowcase from "@/components/category";
import HeroSlider from "@/components/hero";
import ProductsSection from "@/components/products";
import { NewArrivalsSection } from "@/components/new-arrivals";
import { CategoryBanners } from "@/components/category-banners";
import { CategoryGridBanners } from "@/components/category-grid-banners";
import { SingleBanner } from "@/components/single-banner";
import { VideoSection } from "@/components/video-section";
import { getCategories } from "@/lib/get-categories";
import { getCategoryGridBanner } from "@/lib/get-category-grid-banner";
import { getHeroSlides } from "@/lib/get-hero-slides";
import { getNewArrivals } from "@/lib/get-new-arrivals";
import { getPromoBanner } from "@/lib/get-promo-banner";
import { getSettings } from "@/lib/get-settings";
import { getVideoSection } from "@/lib/get-video-section";

export default async function Home() {
  // A backend hiccup shouldn't take the homepage down — fall back to an
  // empty list rather than throwing.
  const [categories, heroSlides, newArrivals, videoSection, categoryGridBanner, promoBanner, settings] =
    await Promise.all([
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
      getCategoryGridBanner().catch(() => ({ enabled: false, heading: null, categories: [] })),
      getPromoBanner().catch(() => ({
        enabled: false,
        image: null,
        eyebrow: null,
        heading: null,
        body: null,
        ctaLabel: null,
        ctaHref: null,
      })),
      getSettings().catch(() => ({
        facebookPixelId: null,
        googleAnalyticsId: null,
        googleTagManagerId: null,
        tiktokPixelId: null,
        aiChatEnabled: false,
        logoUrl: null,
        faviconUrl: null,
        categoryShowcaseHeading: null,
        footerTagline: null,
        footerInstagramUrl: null,
        footerTwitterUrl: null,
        footerFacebookUrl: null,
        footerYoutubeUrl: null,
      })),
    ]);

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <CategoryShowcase categories={categories} />

      <ProductsSection />
      <CategoryBanners
        categories={categories}
        heading={settings.categoryShowcaseHeading}
      />

      {promoBanner.enabled && promoBanner.image && promoBanner.heading && (
        <SingleBanner
          image={promoBanner.image}
          imageAlt={promoBanner.heading}
          eyebrow={promoBanner.eyebrow ?? undefined}
          heading={promoBanner.heading}
          body={promoBanner.body ?? undefined}
          ctaLabel={promoBanner.ctaLabel ?? undefined}
          ctaHref={promoBanner.ctaHref ?? undefined}
        />
      )}
      <NewArrivalsSection data={newArrivals} />
      <CategoryGridBanners data={categoryGridBanner} />
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
