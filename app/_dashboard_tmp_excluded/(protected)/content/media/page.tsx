import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MediaLibrary } from "@/components/dashboard/media-library";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";
import type { UploadedMedia } from "@/components/dashboard/image-uploader";
import type { Product } from "@/components/product-card";
import type { Category } from "@/components/category-card";

async function getMedia(): Promise<UploadedMedia[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

type InUseItem = {
  url: string;
  label: string;
  source: "Product" | "Category";
};

async function getInUseItems(): Promise<InUseItem[]> {
  const [productsRes, categoriesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: "no-store" }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { cache: "no-store" }),
  ]);

  if (!productsRes.ok) throw new Error(`Request failed with status ${productsRes.status}`);
  if (!categoriesRes.ok) throw new Error(`Request failed with status ${categoriesRes.status}`);

  const products: Product[] = await productsRes.json();
  const categories: Category[] = await categoriesRes.json();

  const productItems: InUseItem[] = products
    .filter((p): p is Product & { image: string } => !!p.image)
    .map((p) => ({ url: p.image, label: p.name, source: "Product" }));

  const categoryItems: InUseItem[] = categories
    .filter((c): c is Category & { image: string } => !!c.image)
    .map((c) => ({ url: c.image, label: c.name, source: "Category" }));

  return [...productItems, ...categoryItems];
}

export default async function DashboardMediaPage() {
  const [media, inUseItems] = await Promise.all([getMedia(), getInUseItems()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard/content"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Content
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Media</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {media.length} uploaded image{media.length === 1 ? "" : "s"}.
        </p>
      </div>

      <MediaLibrary media={media} />

      <div>
        <h2 className="text-lg font-semibold text-foreground">In use</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Images currently referenced by a product or category.
        </p>
      </div>

      {inUseItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No product or category images yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {inUseItems.map((item, i) => (
            <div key={`${item.source}-${item.label}-${i}`} className="space-y-1.5">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={item.url}
                  alt={item.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
              </div>
              <p className="truncate text-xs font-medium text-foreground">{item.label}</p>
              <Badge variant="secondary" className="text-[10px]">
                {item.source}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
