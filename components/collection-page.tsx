"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductFilters, type FiltersState } from "@/components/product-filters";
import { ProductSort, type SortValue } from "@/components/product-sort";
import { ProductGrid } from "@/components/product-grid";
import type { Product } from "@/components/product-card";

const PAGE_SIZE = 6;

function roundDownToStep(value: number, step: number) {
  return Math.floor(value / step) * step;
}

function roundUpToStep(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

function getPriceBounds(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 100];
  const prices = products.map((p) => p.price);
  return [
    roundDownToStep(Math.min(...prices), 5),
    roundUpToStep(Math.max(...prices), 5),
  ];
}

/** Page numbers to render, with "ellipsis" markers for gaps. */
function getPageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: Array<number | "ellipsis"> = [1];
  if (current > 3) items.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) items.push(i);

  if (current < total - 2) items.push("ellipsis");
  items.push(total);

  return items;
}

export function CollectionPage({
  products,
  eyebrow = "Shop",
  title = "All Products",
  description,
}: {
  products: Product[];
  eyebrow?: string;
  title?: string;
  description?: string | null;
}) {
  const availableCategories = React.useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );
  const priceBounds = React.useMemo(() => getPriceBounds(products), [products]);

  const [filters, setFilters] = React.useState<FiltersState>({
    categories: [],
    onSaleOnly: false,
    newOnly: false,
    priceRange: priceBounds,
  });
  const [sort, setSort] = React.useState<SortValue>("featured");
  const [page, setPage] = React.useState(1);

  // Keep the price range in sync once the real product bounds are known.
  React.useEffect(() => {
    setFilters((f) => ({ ...f, priceRange: priceBounds }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Changing filters or sort invalidates the current page.
  React.useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  function resetFilters() {
    setFilters({
      categories: [],
      onSaleOnly: false,
      newOnly: false,
      priceRange: priceBounds,
    });
  }

  const visibleProducts = React.useMemo(() => {
    const filtered = products.filter((product) => {
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }
      if (filters.onSaleOnly && product.tag !== "Sale") return false;
      if (filters.newOnly && product.tag !== "New") return false;
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        sorted.sort(
          (a, b) => Number(b.tag === "New") - Number(a.tag === "New")
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [products, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = visibleProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <ProductFilters
              availableCategories={availableCategories}
              priceBounds={priceBounds}
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile filter trigger */}
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                      </Button>
                    }
                  />
                  <SheetContent side="left" className="w-full sm:max-w-xs">
                    <SheetHeader className="border-b border-border">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-auto px-4 py-4">
                      <ProductFilters
                        availableCategories={availableCategories}
                        priceBounds={priceBounds}
                        filters={filters}
                        onChange={setFilters}
                        onReset={resetFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  {visibleProducts.length} product
                  {visibleProducts.length === 1 ? "" : "s"}
                </p>
              </div>

              <ProductSort value={sort} onValueChange={setSort} />
            </div>

            <ProductGrid products={paginatedProducts} />

            {totalPages > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>

                  {getPageItems(currentPage, totalPages).map((item, i) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={item === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default CollectionPage;
