"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, ImageOff, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ProductPickerDialog,
  type PickerProduct,
} from "@/components/dashboard/product-picker-dialog";
import { useAuth } from "@/lib/auth-context";
import type { NewArrivalsData } from "@/components/new-arrivals";

type ListProduct = {
  id: string;
  name: string;
  image: string | null;
  price: number;
};

export function ThemeNewArrivalsForm({ initial }: { initial: NewArrivalsData }) {
  const router = useRouter();
  const { token } = useAuth();

  const [enabled, setEnabled] = React.useState(initial.enabled);
  const [eyebrow, setEyebrow] = React.useState(initial.eyebrow);
  const [heading, setHeading] = React.useState(initial.heading);
  const [products, setProducts] = React.useState<ListProduct[]>(
    initial.products.map((p) => ({ id: p.id, name: p.name, image: p.image, price: p.price }))
  );
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function removeProduct(id: string) {
    setProducts((current) => current.filter((p) => p.id !== id));
    setSaved(false);
  }

  function moveProduct(id: string, direction: -1 | 1) {
    setProducts((current) => {
      const index = current.findIndex((p) => p.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSaved(false);
  }

  function handleAdd(picked: PickerProduct[]) {
    setProducts((current) => {
      const existingIds = new Set(current.map((p) => p.id));
      const additions = picked.filter((p) => !existingIds.has(p.id));
      return [...current, ...additions];
    });
    setSaved(false);
  }

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/new-arrivals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          enabled,
          eyebrow: eyebrow || null,
          heading: heading || null,
          productIds: products.map((p) => p.id),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save the New Arrivals section."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Show this section
          </p>
          <p className="text-xs text-muted-foreground">
            Turn the New Arrivals section on or off on the homepage.
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => {
            setEnabled(checked);
            setSaved(false);
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="na-eyebrow">Eyebrow</Label>
          <Input
            id="na-eyebrow"
            placeholder="Just In"
            value={eyebrow}
            onChange={(e) => {
              setEyebrow(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="na-heading">Heading</Label>
          <Input
            id="na-heading"
            placeholder="New Arrivals"
            value={heading}
            onChange={(e) => {
              setHeading(e.target.value);
              setSaved(false);
            }}
          />
        </div>
      </div>

      <Separator />

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

        {products.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No products picked yet — add some to show this section on the
            homepage.
          </p>
        )}

        {products.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            {products.map((product, i) => (
              <div
                key={product.id}
                className="flex items-center gap-3 border-b border-border p-2.5 text-sm last:border-b-0"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="flex-1 truncate text-foreground">
                  {product.name}
                </span>
                <span className="text-muted-foreground">${product.price}</span>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={i === 0}
                    onClick={() => moveProduct(product.id, -1)}
                    aria-label={`Move ${product.name} up`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={i === products.length - 1}
                    onClick={() => moveProduct(product.id, 1)}
                    aria-label={`Move ${product.name} down`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeProduct(product.id)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save Changes"}
        </Button>
        {saved && !submitting && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-500">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        excludeIds={products.map((p) => p.id)}
        onAdd={handleAdd}
        description="Choose products to feature in the homepage New Arrivals section."
      />
    </form>
  );
}

export default ThemeNewArrivalsForm;
