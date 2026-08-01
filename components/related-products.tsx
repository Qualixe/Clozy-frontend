import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

import type { RelatedProduct } from "@/components/single-product";

export function RelatedProducts({ items }: { items: RelatedProduct[] }) {
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
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
        {items.map((item) => (
          <Link key={item.id} href={`/products/${item.id}`} className="group">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              {item.name}
            </p>
            <p className="text-sm text-muted-foreground">${item.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelatedProducts;
