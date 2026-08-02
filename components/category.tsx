"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import type { Category } from "@/components/category-card";

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function CategoryCarousel({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="w-full bg-background py-12 sm:py-16">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Carousel
          opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}
          className="group/carousel"
        >
          {/* Edge fade masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-16 bg-gradient-to-r from-background to-transparent sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] hidden w-16 bg-gradient-to-l from-background to-transparent sm:block" />

          <CarouselContent className="-ml-6 px-1 py-1 sm:-ml-8 sm:px-12">
            {categories.map((category) => (
              <CarouselItem
                key={category.id}
                className="basis-auto shrink-0 grow-0 pl-6 sm:pl-8"
              >
                <Link
                  href={`/collections/${category.slug}`}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                        className="object-cover"
                      />
                    ) : (
                      <ImageOff className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="max-w-[7rem] text-sm font-medium text-foreground sm:text-[15px]">
                    {category.name}
                  </span>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious
            size="icon"
            className="left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 bg-background shadow-sm sm:flex sm:left-4 lg:-left-2"
          />
          <CarouselNext
            size="icon"
            className="right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 bg-background shadow-sm sm:flex sm:right-4 lg:-right-2"
          />
        </Carousel>
      </div>
    </section>
  );
}

export default CategoryCarousel;
