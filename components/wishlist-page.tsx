"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useWishlist, type WishlistItem } from "@/lib/wishlist-context";
import { formatCurrency } from "@/lib/currency";

export function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  function handleAddToCart(item: WishlistItem) {
    addItem({
      id: item.id,
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
        <Heart className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-2xl font-semibold text-foreground">
          Your wishlist is empty
        </h1>
        <p className="text-sm text-muted-foreground">
          Tap the heart on any product to save it here for later.
        </p>
        <Button
          className="mt-2"
          nativeButton={false}
          render={<Link href="/shop">Continue Shopping</Link>}
        />
      </main>
    );
  }

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Saved for later
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Wishlist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
                <Link href={`/products/${item.slug}`} className="block h-full w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </Link>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from wishlist`}
                  className="absolute right-3 top-3 h-8 w-8 rounded-full shadow-sm"
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="absolute inset-x-3 bottom-3 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Button className="w-full" onClick={() => handleAddToCart(item)}>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <Link
                  href={`/products/${item.slug}`}
                  className="block text-sm font-medium text-foreground hover:underline underline-offset-4"
                >
                  {item.name}
                </Link>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(item.price)}
                  </span>
                  {item.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatCurrency(item.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default WishlistPage;
