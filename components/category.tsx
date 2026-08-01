"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
// Swap `image` for your own category photography, e.g. "/categories/mens.jpg"

const CATEGORIES = [
  { title: "Mens", href: "/shop/mens", image: "https://picsum.photos/seed/cat-mens/200/200" },
  { title: "Kids", href: "/shop/kids", image: "https://picsum.photos/seed/cat-kids/200/200" },
  { title: "Womens", href: "/shop/womens", image: "https://picsum.photos/seed/cat-womens/200/200" },
  { title: "Wellness", href: "/shop/wellness", image: "https://picsum.photos/seed/cat-wellness/200/200" },
  { title: "Bookings", href: "/shop/bookings", image: "https://picsum.photos/seed/cat-bookings/200/200" },
  { title: "Electronics", href: "/shop/electronics", image: "https://picsum.photos/seed/cat-electronics/200/200" },
  { title: "Household", href: "/shop/household", image: "https://picsum.photos/seed/cat-household/200/200" },
  { title: "Books & Stationery", href: "/shop/books-stationery", image: "https://picsum.photos/seed/cat-books/200/200" },
   { title: "Books & Stationery", href: "/shop/books-stationery", image: "https://picsum.photos/seed/cat-books/200/200" },
] as const;

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function CategoryCarousel() {
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
            {CATEGORIES.map((cat) => (
              <CarouselItem
                key={cat.title}
                className="basis-auto shrink-0 grow-0 pl-6 sm:pl-8"
              >
                <Link
                  href={cat.href}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted ring-1 ring-border transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                      className="object-cover"
                    />
                  </div>
                  <span className="max-w-[7rem] text-sm font-medium text-foreground sm:text-[15px]">
                    {cat.title}
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