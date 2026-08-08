import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";

/** Placeholder matching `CollectionPage`'s shell — used by /shop and
 * /collections/[slug]'s route-level loading.tsx. */
export function CollectionPageSkeleton() {
  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-2 h-9 w-64" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden space-y-6 lg:block">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-36" />
            </div>

            <ProductGridSkeleton count={6} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default CollectionPageSkeleton;
