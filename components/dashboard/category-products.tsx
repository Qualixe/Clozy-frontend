"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";

type CategoryProduct = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  isPrimary: boolean;
};

type PickerProduct = {
  id: string;
  name: string;
  image: string | null;
  price: number;
};

// ---------------------------------------------------------------------------
// Add-products picker — search the full catalog, excluding what's already
// in this category.
// ---------------------------------------------------------------------------

function ProductPickerDialog({
  open,
  onOpenChange,
  excludeIds,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds: string[];
  onAdd: (products: PickerProduct[]) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [allProducts, setAllProducts] = React.useState<PickerProduct[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // Reset for a fresh load exactly on the closed→open transition, adjusted
  // during render rather than in an effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelected(new Set());
      setStatus("loading");
    }
  }

  React.useEffect(() => {
    if (!open) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: PickerProduct[]) => {
        setAllProducts(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [open]);

  const excludeSet = React.useMemo(() => new Set(excludeIds), [excludeIds]);
  const candidates = allProducts.filter(
    (p) => !excludeSet.has(p.id) && p.name.toLowerCase().includes(query.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    onAdd(allProducts.filter((p) => selected.has(p.id)));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add products</DialogTitle>
          <DialogDescription>
            Choose products to include here, in addition to whatever already
            has this as its primary category.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
          {status === "loading" && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          )}
          {status === "error" && (
            <p className="p-4 text-center text-sm text-destructive">
              Could not load products.
            </p>
          )}
          {status === "ready" && candidates.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No matching products.
            </p>
          )}
          {status === "ready" &&
            candidates.map((product) => (
              <label
                key={product.id}
                className="flex cursor-pointer items-center gap-3 border-b border-border p-2 text-sm last:border-b-0 hover:bg-muted"
              >
                <Checkbox
                  checked={selected.has(product.id)}
                  onCheckedChange={() => toggle(product.id)}
                />
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <span className="flex-1 truncate">{product.name}</span>
              </label>
            ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={selected.size === 0}>
            Add {selected.size > 0 ? selected.size : ""} product
            {selected.size === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
      />
    </div>
  );
}

export default CategoryProducts;
