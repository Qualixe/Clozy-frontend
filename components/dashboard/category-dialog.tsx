"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  productCount: number;
};

type CategoryForm = {
  name: string;
  image: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

function toForm(category?: Category): CategoryForm {
  return {
    name: category?.name ?? "",
    image: category?.image ?? "",
    description: category?.description ?? "",
    seoTitle: category?.seoTitle ?? "",
    seoDescription: category?.seoDescription ?? "",
  };
}

export function CategoryDialog({
  category,
  trigger,
}: {
  /** Pass an existing category to edit it; omit to create a new one. */
  category?: Category;
  /** Custom trigger element (e.g. an Edit menu item). Defaults to an "Add Category" button. */
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const isEditing = !!category;

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<CategoryForm>(toForm(category));
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  function update<K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name") setNameError(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setForm(toForm(category));
      setNameError(null);
      setSubmitError(null);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      setNameError("Name is required.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/categories/${category.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/categories`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.errors?.name?.[0] ??
          body?.message ??
          `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save category."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] w-full overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this category's details."
                : "Create a new category to organize your products."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-6">
            <section className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="category-name">Title</Label>
                <Input
                  id="category-name"
                  placeholder="e.g. Outerwear"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  aria-invalid={!!nameError}
                />
                {nameError && (
                  <p className="text-xs text-destructive">{nameError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  rows={3}
                  placeholder="A short description of this category"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category-image">Image</Label>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {form.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.image}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    ) : (
                      <ImagePlus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="category-image"
                    placeholder="https://example.com/image.jpg"
                    value={form.image}
                    onChange={(e) => update("image", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <Label>SEO</Label>
              <div className="space-y-1.5">
                <Label
                  htmlFor="category-seo-title"
                  className="text-xs font-normal text-muted-foreground"
                >
                  Meta title
                </Label>
                <Input
                  id="category-seo-title"
                  placeholder="Shown in search engine results"
                  value={form.seoTitle}
                  onChange={(e) => update("seoTitle", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="category-seo-description"
                  className="text-xs font-normal text-muted-foreground"
                >
                  Meta description
                </Label>
                <Textarea
                  id="category-seo-description"
                  rows={2}
                  placeholder="A short summary for search engines"
                  value={form.seoDescription}
                  onChange={(e) => update("seoDescription", e.target.value)}
                />
              </div>
            </section>
          </div>

          {submitError && (
            <p className="mt-4 text-sm text-destructive">{submitError}</p>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEditing ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryDialog;
