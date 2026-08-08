import Link from "next/link";
import Image from "next/image";

import type { Category } from "@/components/category-card";

/**
 * Four equal-width category banners — image with a bottom gradient overlay,
 * heading, and short description. Distinct from `CategoryBanners`' 1-large
 * + 2-stacked promo layout and from `CategoryShowcase`'s plain image+name
 * grid.
 */
export function CategoryGridBanners({ categories }: { categories: Category[] }) {
  const items = categories.filter((c) => c.image).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="w-full bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((category, i) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group relative flex aspect-[3/4] items-end overflow-hidden rounded-2xl bg-muted"
            >
              <Image
                src={category.image as string}
                alt={category.name}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="relative z-10 p-5 sm:p-6">
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-1 max-w-[22ch] text-sm text-white/85">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryGridBanners;
