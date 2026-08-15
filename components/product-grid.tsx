"use client";

import { ProductCard, type Product } from "@/components/product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No products match your filters.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        // First row (up to the lg:grid-cols-4 column count) is the LCP
        // candidate on /shop and /collections/[slug] — preload those,
        // lazy-load the rest.
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}

export default ProductGrid;
