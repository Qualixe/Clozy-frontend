import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProductCard, type Product } from "@/components/product-card";

export function RelatedProducts({ items }: { items: Product[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          You Might Also Like
        </h2>
        <Link
          href="/shop"
          className="flex items-center gap-1 text-sm font-medium text-foreground hover:underline underline-offset-4"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default RelatedProducts;
