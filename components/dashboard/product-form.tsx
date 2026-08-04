"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { useAuth } from "@/lib/auth-context";
import {
  EMPTY_PRODUCT_FORM,
  comboKey,
  nextId,
  regenerateVariants,
  type Metafield,
  type ProductFormValues,
  type ProductOption,
} from "@/lib/product-form";

const CATEGORIES = [
  "Knitwear",
  "Footwear",
  "Shirts",
  "Outerwear",
  "Trousers",
  "Accessories",
] as const;

const MAX_OPTIONS = 3;

// ---------------------------------------------------------------------------
// Reusable tag/chip input
// ---------------------------------------------------------------------------

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState("");

  function commit() {
    const value = draft.trim();
    setDraft("");
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-input px-2 py-1.5">
      {values.map((value) => (
        <Badge key={value} variant="secondary" className="gap-1">
          {value}
          <button
            type="button"
            onClick={() => onChange(values.filter((v) => v !== value))}
            aria-label={`Remove ${value}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && values.length > 0) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={values.length === 0 ? placeholder : ""}
        className="min-w-[8rem] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product form — shared by the "Add Product" dialog and the dedicated
// product edit page.
// ---------------------------------------------------------------------------

export function ProductForm({
  productId,
  initialValue,
  onCancel,
  onSuccess,
}: {
  /** Pass an existing product's id to update it via PUT; omit to create via POST. */
  productId?: string;
  /** Pre-filled form values (e.g. from `fromEditResponse`). Defaults to an empty product. */
  initialValue?: ProductFormValues;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const isEditing = !!productId;

  const [form, setForm] = React.useState<ProductFormValues>(
    initialValue ?? EMPTY_PRODUCT_FORM
  );
  const [titleError, setTitleError] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  function update<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateMetafield(index: number, key: keyof Metafield, value: string) {
    const next = [...form.metafields];
    next[index] = { ...next[index], [key]: value };
    update("metafields", next);
  }

  function addMetafield() {
    update("metafields", [...form.metafields, { key: "", value: "" }]);
  }

  function removeMetafield(index: number) {
    update(
      "metafields",
      form.metafields.filter((_, i) => i !== index)
    );
  }

  function updateImage(index: number, value: string) {
    const next = [...form.images];
    next[index] = value;
    update("images", next);
  }

  function addImage() {
    update("images", [...form.images, ""]);
  }

  function removeImage(index: number) {
    update(
      "images",
      form.images.filter((_, i) => i !== index)
    );
  }

  // --- Variants ---

  function toggleVariants(enabled: boolean) {
    if (enabled && form.options.length === 0) {
      const firstOption: ProductOption = { id: nextId(), name: "", values: [] };
      setForm((f) => ({ ...f, hasVariants: true, options: [firstOption] }));
      return;
    }
    update("hasVariants", enabled);
  }

  function addOption() {
    if (form.options.length >= MAX_OPTIONS) return;
    const options = [...form.options, { id: nextId(), name: "", values: [] }];
    update("options", options);
  }

  function updateOptionName(index: number, name: string) {
    const options = [...form.options];
    options[index] = { ...options[index], name };
    const variants = regenerateVariants(options, form.variants);
    setForm((f) => ({ ...f, options, variants }));
  }

  function updateOptionValues(index: number, values: string[]) {
    const options = [...form.options];
    options[index] = { ...options[index], values };
    const variants = regenerateVariants(options, form.variants);
    setForm((f) => ({ ...f, options, variants }));
  }

  function removeOption(index: number) {
    const options = form.options.filter((_, i) => i !== index);
    const variants = regenerateVariants(options, form.variants);
    setForm((f) => ({ ...f, options, variants }));
  }

  function updateVariant(
    index: number,
    key: "price" | "sku" | "stock",
    value: string
  ) {
    const variants = [...form.variants];
    variants[index] = { ...variants[index], [key]: value };
    update("variants", variants);
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      setTitleError(true);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/products`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      onSuccess();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : `Could not ${isEditing ? "update" : "create"} product.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic info */}
        <section className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Merino Wool Crewneck"
              value={form.title}
              onChange={(e) => {
                update("title", e.target.value);
                setTitleError(false);
              }}
              aria-invalid={titleError}
            />
            {titleError && (
              <p className="text-xs text-destructive">Title is required.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shortDescription">Short Description</Label>
            <RichTextEditor
              value={form.shortDescription}
              onChange={(html) => update("shortDescription", html)}
              placeholder="A one-line summary shown on product cards"
              minHeight="4rem"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              value={form.description}
              onChange={(html) => update("description", html)}
              placeholder="Full product details"
              minHeight="10rem"
            />
          </div>
        </section>

        <Separator />

        {/* Inventory & organization */}
        <section className="space-y-4">
          {!form.hasVariants && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="e.g. CLZ-00123"
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) => {
                if (value !== null) update("category", value);
              }}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              values={form.tags}
              onChange={(values) => update("tags", values)}
              placeholder="Type a tag and press Enter"
            />
          </div>
        </section>

        <Separator />

        {/* Variants */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="hasVariants">Variants</Label>
              <p className="text-xs text-muted-foreground">
                Add options like size or color to create variants.
              </p>
            </div>
            <Switch
              id="hasVariants"
              checked={form.hasVariants}
              onCheckedChange={toggleVariants}
            />
          </div>

          {form.hasVariants && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="space-y-3">
                {form.options.map((option, i) => (
                  <div
                    key={option.id}
                    className="space-y-2 rounded-md border border-border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Option name (e.g. Size)"
                        value={option.name}
                        onChange={(e) => updateOptionName(i, e.target.value)}
                        className="max-w-[220px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove option"
                        className="ml-auto"
                        onClick={() => removeOption(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <TagInput
                      values={option.values}
                      onChange={(values) => updateOptionValues(i, values)}
                      placeholder="Add a value and press Enter"
                    />
                  </div>
                ))}

                {form.options.length < MAX_OPTIONS && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add another option
                  </Button>
                )}
              </div>

              {form.variants.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variant</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.variants.map((variant, i) => (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium text-foreground">
                            {comboKey(variant.optionValues)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              placeholder="0.00"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(i, "price", e.target.value)
                              }
                              className="h-8 w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="SKU"
                              value={variant.sku}
                              onChange={(e) =>
                                updateVariant(i, "sku", e.target.value)
                              }
                              className="h-8 w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={variant.stock}
                              onChange={(e) =>
                                updateVariant(i, "stock", e.target.value)
                              }
                              className="h-8 w-20"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </section>

        <Separator />

        {/* Metafields */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Metafields</Label>
            <Button type="button" variant="outline" size="sm" onClick={addMetafield}>
              <Plus className="h-3.5 w-3.5" />
              Add metafield
            </Button>
          </div>
          <div className="space-y-2">
            {form.metafields.map((field, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Key"
                  value={field.key}
                  onChange={(e) => updateMetafield(i, "key", e.target.value)}
                  className="w-1/3"
                />
                <Input
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => updateMetafield(i, "value", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove metafield"
                  onClick={() => removeMetafield(i)}
                  disabled={form.metafields.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Images */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Images</Label>
            <Button type="button" variant="outline" size="sm" onClick={addImage}>
              <Plus className="h-3.5 w-3.5" />
              Add image
            </Button>
          </div>
          <div className="space-y-2">
            {form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <ImageUploader
                  compact
                  value={url}
                  onChange={(next) => updateImage(i, next)}
                />
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => updateImage(i, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove image"
                  onClick={() => removeImage(i)}
                  disabled={form.images.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* SEO */}
        <section className="space-y-4">
          <Label>SEO</Label>
          <div className="space-y-1.5">
            <Label htmlFor="seoTitle" className="text-xs font-normal text-muted-foreground">
              Meta title
            </Label>
            <Input
              id="seoTitle"
              placeholder="Shown in search engine results"
              value={form.seoTitle}
              onChange={(e) => update("seoTitle", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="seoDescription"
              className="text-xs font-normal text-muted-foreground"
            >
              Meta description
            </Label>
            <Textarea
              id="seoDescription"
              rows={2}
              placeholder="A short summary for search engines"
              value={form.seoDescription}
              onChange={(e) => update("seoDescription", e.target.value)}
            />
          </div>
        </section>
      </div>

      {submitError && <p className="mt-4 text-sm text-destructive">{submitError}</p>}

      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEditing ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;
