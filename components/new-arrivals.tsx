import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard, type Product } from "@/components/product-card";

export function NewArrivalsSection({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.tabs.includes("new")).slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="w-full bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Just In
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              New Arrivals
            </h2>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/shop">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivalsSection;
