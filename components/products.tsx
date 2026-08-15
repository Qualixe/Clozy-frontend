"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ProductCarousel,
  ProductCarouselContent,
  ProductCarouselItem,
  ProductCarouselMedia,
  ProductCarouselPrevious,
  ProductCarouselNext,
} from "@/components/ui/product-carousel";
import { ProductCard, type Product } from "@/components/product-card";

const TABS = [
  { value: "featured", label: "Featured" },
  { value: "bestsellers", label: "Best Sellers" },
  { value: "new", label: "New Arrivals" },
  { value: "sale", label: "On Sale" },
] as const;

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

// Data is now fetched server-side (app/(site)/page.tsx, alongside the
// homepage's other Promise.all data sources) and passed in as a prop, so
// there's no client-side fetch/loading-skeleton-on-mount here anymore.
// This stays a client component only because the tab list itself is
// interactive (filters the already-fetched data by tab client-side).
export function ProductsSection({ products }: { products: Product[] }) {
  return (
    <section className="w-full bg-background pt-4 pb-16 sm:pt-6 sm:pb-20">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8">
        <Tabs defaultValue="featured">
          <div className="mb-8 flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Shop
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Our Products
              </h2>
            </div>
            <div className="max-w-full overflow-x-auto sm:shrink-0">
              <TabsList className="w-max">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {products.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No products available right now.
            </p>
          )}

          {products.length > 0 &&
            TABS.map((tab) => {
              const filtered = products.filter((p) =>
                p.tabs.includes(tab.value)
              );
              return (
                <TabsContent key={tab.value} value={tab.value}>
                  <ProductCarousel opts={{ align: "start" }} className="group/carousel">
                    <ProductCarouselContent>
                      {filtered.map((product) => (
                        <ProductCarouselItem
                          key={product.id}
                          className="basis-1/2 sm:basis-1/3 lg:basis-1/4"
                        >
                          <ProductCard product={product} as={ProductCarouselMedia} />
                        </ProductCarouselItem>
                      ))}
                    </ProductCarouselContent>

                    <ProductCarouselPrevious
                      size="icon"
                      className="h-9 w-9 bg-background shadow-sm lg:h-10 lg:w-10"
                    />
                    <ProductCarouselNext
                      size="icon"
                      className="h-9 w-9 bg-background shadow-sm lg:h-10 lg:w-10"
                    />
                  </ProductCarousel>
                </TabsContent>
              );
            })}
        </Tabs>
      </div>
    </section>
  );
}

export default ProductsSection;