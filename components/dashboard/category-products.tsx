"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ProductPickerDialog,
  type PickerProduct,
} from "@/components/dashboard/product-picker-dialog";
import { useAuth } from "@/lib/auth-context";

type CategoryProduct = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  isPrimary: boolean;
};

// ---------------------------------------------------------------------------
// Category products — Shopify-style manual product curation for a category.
// Add/remove save immediately, independent of the category form's own
// Save button.
// ---------------------------------------------------------------------------

export function CategoryProducts({ categoryId }: { categoryId: string }) {
  const { token } = useAuth();
  const [products, setProducts] = React.useState<CategoryProduct[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: CategoryProduct[]) => {
        setProducts(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [categoryId, token]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function persist(next: CategoryProduct[]) {
    setSaveError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}/products`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            productIds: next.filter((p) => !p.isPrimary).map((p) => p.id),
          }),
        }
      );

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save products."
      );
      load();
    }
  }

  function handleRemove(id: string) {
    setProducts((current) => {
      const next = current.filter((p) => p.id !== id);
      persist(next);
      return next;
    });
  }

  function handleAdd(picked: PickerProduct[]) {
    setProducts((current) => {
      const existingIds = new Set(current.map((p) => p.id));
      const additions: CategoryProduct[] = picked
        .filter((p) => !existingIds.has(p.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: "",
          image: p.image,
          price: p.price,
          isPrimary: false,
        }));
      const next = [...current, ...additions];
      persist(next);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Products</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add products
        </Button>
      </div>

      {status === "loading" && (
        <p className="text-xs text-muted-foreground">Loading products…</p>
      )}
      {status === "error" && (
        <p className="text-xs text-destructive">Could not load products.</p>
      )}
      {saveError && <p className="text-xs text-destructive">{saveError}</p>}

      {status === "ready" && products.length === 0 && (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          No products in this category yet.
        </p>
      )}

      {status === "ready" && products.length > 0 && (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 border-b border-border p-2 text-sm last:border-b-0"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <span className="flex-1 truncate text-foreground">
                {product.name}
              </span>
              {product.isPrimary ? (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  Primary category
                </Badge>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRemove(product.id)}
                  aria-label={`Remove ${product.name}`}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        excludeIds={products.map((p) => p.id)}
        onAdd={handleAdd}
        description="Choose products to include here, in addition to whatever already has this as its primary category."
      />
    </div>
  );
}

export default CategoryProducts;
