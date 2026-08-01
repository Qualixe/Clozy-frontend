"use client";

import * as React from "react";

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

export function ProductsSection() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [status, setStatus] = React.useState<"loading" | "error" | "ready">(
    "loading"
  );

  React.useEffect(() => {
    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: Product[]) => {
        if (cancelled) return;
        setProducts(data);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="featured">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Shop
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Our Products
              </h2>
            </div>
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {status === "loading" && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading products…
            </p>
          )}

          {status === "error" && (
            <p className="py-12 text-center text-sm text-destructive">
              Could not load products. Is the backend running?
            </p>
          )}

          {status === "ready" &&
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