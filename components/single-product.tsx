"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Minus,
  Plus,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RelatedProducts } from "@/components/related-products";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data shape — populated from the Laravel API (`GET /products/{id}`)
// ---------------------------------------------------------------------------

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  body: string;
};

export type RelatedProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  description: string;
  colors: { name: string; value: string }[];
  sizes: string[];
  outOfStockSizes: string[];
  images: string[];
  details: string[];
  reviewsList: ProductReview[];
  related: RelatedProduct[];
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ProductPage({ product }: { product: ProductDetail }) {
  const [galleryApi, setGalleryApi] = React.useState<CarouselApi>();
  const [activeImage, setActiveImage] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState(
    product.colors[0]?.name ?? ""
  );
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [wishlisted, setWishlisted] = React.useState(false);

  React.useEffect(() => {
    if (!galleryApi) return;
    setActiveImage(galleryApi.selectedScrollSnap());
    galleryApi.on("select", () => setActiveImage(galleryApi.selectedScrollSnap()));
  }, [galleryApi]);

  const discountPct = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/shop/outerwear">{product.category}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div>
            <Carousel setApi={setGalleryApi} opts={{ loop: true }} className="w-full">
              <CarouselContent className="ml-0">
                {product.images.map((img, i) => (
                  <CarouselItem key={img} className="pl-0">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={img}
                        alt={`${product.name} — view ${i + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        priority={i === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {discountPct && (
                <Badge className="absolute left-3 top-3 z-10 bg-destructive text-destructive-foreground">
                  -{discountPct}%
                </Badge>
              )}

              {product.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-3" />
                  <CarouselNext className="right-3" />
                </>
              )}
            </Carousel>

            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => galleryApi?.scrollTo(i)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-lg bg-muted ring-2 ring-offset-2 ring-offset-background transition-colors",
                      i === activeImage ? "ring-foreground" : "ring-transparent"
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {product.category}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                {product.rating}
              </span>
              <span className="text-sm text-muted-foreground">
                ({product.reviews} reviews)
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-semibold text-foreground">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <Separator className="my-6" />

            {/* Color */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground">
                  Color <span className="text-muted-foreground">— {selectedColor}</span>
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      aria-label={color.name}
                      className={cn(
                        "h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-shadow",
                        selectedColor === color.name
                          ? "ring-foreground"
                          : "ring-transparent hover:ring-border"
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Size</p>
                <Link
                  href="/size-guide"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                >
                  Size guide
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const outOfStock = product.outOfStockSizes.includes(size);
                  return (
                    <button
                      key={size}
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "flex h-10 w-12 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                        outOfStock &&
                          "cursor-not-allowed border-border text-muted-foreground/40 line-through",
                        !outOfStock &&
                          selectedSize === size &&
                          "border-foreground bg-foreground text-background",
                        !outOfStock &&
                          selectedSize !== size &&
                          "border-border text-foreground hover:border-foreground"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + actions */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-md border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-none rounded-l-md"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-sm font-medium">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-none rounded-r-md"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button className="h-11 flex-1" disabled={!selectedSize}>
                {selectedSize ? "Add to Cart" : "Select a size"}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => setWishlisted((w) => !w)}
                aria-label={
                  wishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={cn(
                    "h-[18px] w-[18px]",
                    wishlisted && "fill-destructive text-destructive"
                  )}
                />
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Truck, label: "Free shipping over $75" },
                { icon: RotateCcw, label: "30-day returns" },
                { icon: ShieldCheck, label: "Secure checkout" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <Accordion type="single" collapsible className="mt-8">
              <AccordionItem value="details">
                <AccordionTrigger>Details &amp; Care</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
                    {product.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping &amp; Returns</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Free standard shipping on orders over $75. Returns accepted
                  within 30 days of delivery, unworn and with original tags.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16 max-w-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Reviews
            </h2>
            <Button variant="outline" size="sm">
              Write a review
            </Button>
          </div>
          <Separator className="my-5" />
          <div className="space-y-6">
            {product.reviewsList.map((review) => (
              <div key={review.id}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {review.author}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {review.date}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {review.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related products */}
        <RelatedProducts items={product.related} />
      </div>
    </main>
  );
}

export default ProductPage;
