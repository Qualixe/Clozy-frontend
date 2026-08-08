"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, ImageOff, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CategoryPickerDialog,
  type PickerCategory,
} from "@/components/dashboard/category-picker-dialog";
import { useAuth } from "@/lib/auth-context";
import type { CategoryGridBannerData } from "@/components/category-grid-banners";

type ListCategory = {
  id: string;
  name: string;
  image: string | null;
};

export function ThemeCategoryBannersForm({ initial }: { initial: CategoryGridBannerData }) {
  const router = useRouter();
  const { token } = useAuth();

  const [enabled, setEnabled] = React.useState(initial.enabled);
  const [categories, setCategories] = React.useState<ListCategory[]>(
    initial.categories.map((c) => ({ id: c.id, name: c.name, image: c.image }))
  );
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function removeCategory(id: string) {
    setCategories((current) => current.filter((c) => c.id !== id));
    setSaved(false);
  }

  function moveCategory(id: string, direction: -1 | 1) {
    setCategories((current) => {
      const index = current.findIndex((c) => c.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSaved(false);
  }

  function handleAdd(picked: PickerCategory[]) {
    setCategories((current) => {
      const existingIds = new Set(current.map((c) => c.id));
      const additions = picked.filter((c) => !existingIds.has(c.id));
      return [...current, ...additions];
    });
    setSaved(false);
  }

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category-grid-banner`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          enabled,
          categoryIds: categories.map((c) => c.id),
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
        err instanceof Error ? err.message : "Could not save the category banners."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Show this section</p>
          <p className="text-xs text-muted-foreground">
            Turn the category grid banner on or off on the homepage.
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Categories (up to 4 shown)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add categories
          </Button>
        </div>

        {categories.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No categories picked yet — add some to show this section on the
            homepage.
          </p>
        )}

        {categories.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            {categories.map((category, i) => (
              <div
                key={category.id}
                className="flex items-center gap-3 border-b border-border p-2.5 text-sm last:border-b-0"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
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
                  {category.name}
                </span>
                {i >= 4 && (
                  <span className="text-xs text-muted-foreground">Hidden</span>
                )}
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={i === 0}
                    onClick={() => moveCategory(category.id, -1)}
                    aria-label={`Move ${category.name} up`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={i === categories.length - 1}
                    onClick={() => moveCategory(category.id, 1)}
                    aria-label={`Move ${category.name} down`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeCategory(category.id)}
                    aria-label={`Remove ${category.name}`}
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

      <CategoryPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        excludeIds={categories.map((c) => c.id)}
        onAdd={handleAdd}
        description="Choose categories to feature in the homepage category grid banner."
      />
    </form>
  );
}

export default ThemeCategoryBannersForm;
