import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder matching `ProductCard`'s layout — image, title, price. */
export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
