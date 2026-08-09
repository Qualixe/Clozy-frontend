import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Category } from "@/components/category-card";

function Banner({
  category,
  className,
  priority,
}: {
  category: Category;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      className={cn(
        "group relative flex items-end overflow-hidden rounded-2xl bg-muted",
        className
      )}
    >
      {category.image && (
        <Image
          src={category.image}
          alt={category.name}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="relative z-10 p-6 sm:p-8">
        <h3 className="max-w-[14ch] text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
          {category.name}
        </h3>
        <span className="mt-4 inline-flex items-center rounded-md bg-black/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition-colors group-hover:bg-black">
          Shop Now
        </span>
      </div>
    </Link>
  );
}

export function CategoryBanners({ categories }: { categories: Category[] }) {
  const items = categories.filter((c) => c.image).slice(0, 3);

  if (items.length === 0) return null;

  const [large, ...rest] = items;

  return (
    <section className="w-full bg-background py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:h-[34rem] lg:grid-cols-3">
          <Banner
            category={large}
            priority
            className="aspect-[4/3] lg:col-span-2 lg:aspect-auto lg:h-full"
          />

          {rest.length > 0 && (
            <div className="flex flex-col gap-4 lg:col-span-1 lg:h-full">
              {rest.map((category) => (
                <Banner
                  key={category.id}
                  category={category}
                  className="aspect-[4/3] lg:aspect-auto lg:flex-1"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CategoryBanners;
