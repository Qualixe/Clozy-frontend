"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug?: string | null;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  tag?: "New" | "Sale";
  tabs: Array<"featured" | "bestsellers" | "new" | "sale">;
};

export function ProductCard({
  product,
  as: MediaWrapper = "div",
}: {
  product: Product;
  /** Element/component the image is wrapped in — pass `ProductCarouselMedia`
   *  when rendering inside a `ProductCarousel` so its height can be measured. */
  as?: React.ElementType;
}) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  function handleAddToCart() {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  }

  function handleToggleWishlist() {
    toggle({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
    });
  }

  return (
    <div className="group">
      <MediaWrapper className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
        <Link href={`/products/${product.slug}`} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {product.tag && (
          <Badge
            className={cn(
              "absolute left-3 top-3",
              product.tag === "Sale"
                ? "bg-green-600 text-white"
                : "bg-foreground text-background"
            )}
          >
            {product.tag}
          </Badge>
        )}

        <Button
          variant="secondary"
          size="icon"
          onClick={handleToggleWishlist}
          aria-label={
            wishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          className="absolute right-3 top-3 h-8 w-8 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              wishlisted && "fill-destructive text-destructive"
            )}
          />
        </Button>

        <div className="absolute inset-x-3 bottom-3 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </MediaWrapper>

      <div className="mt-3">
        <Link
          href={`/products/${product.slug}`}
          className="block text-sm font-medium text-foreground hover:underline underline-offset-4"
        >
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
