import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard, type Product } from "@/components/product-card";

export type NewArrivalsData = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  products: Product[];
};

export function NewArrivalsSection({ data }: { data: NewArrivalsData }) {
  if (!data.enabled || data.products.length === 0) return null;

  return (
    <section className="w-full bg-muted/30 py-4 sm:py-20">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-row items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {data.eyebrow}
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {data.heading}
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivalsSection;
