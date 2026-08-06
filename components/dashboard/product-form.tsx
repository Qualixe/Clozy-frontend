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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import { MediaPickerDialog } from "@/components/dashboard/media-picker-dialog";
import { useAuth } from "@/lib/auth-context";
import {
  EMPTY_PRODUCT_FORM,
  comboKey,
  nextId,
  regenerateVariants,
  type Metafield,
  type MetafieldPlacement,
  type ProductFormValues,
  type ProductOption,
} from "@/lib/product-form";

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
// Collections multi-select — lets a product belong to any number of
// collections in addition to its primary Category.
// ---------------------------------------------------------------------------

function CollectionsPicker({
  categories,
  selected,
  onChange,
}: {
  categories: { id: string; name: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  }

  const selectedCategories = categories.filter((c) => selected.includes(c.id));

  return (
    <div className="space-y-2">
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedCategories.map((category) => (
            <Badge key={category.id} variant="secondary" className="gap-1">
              {category.name}
              <button
                type="button"
                onClick={() => toggle(category.id)}
                aria-label={`Remove ${category.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add to collection
            </Button>
          }
        />
        <PopoverContent align="start" className="p-1">
          <div className="max-h-64 overflow-y-auto">
            {categories.length === 0 && (
              <p className="p-2 text-xs text-muted-foreground">
                No collections yet.
              </p>
            )}
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                <Checkbox
                  checked={selected.includes(category.id)}
                  onCheckedChange={() => toggle(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
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
  const [imagePickerOpen, setImagePickerOpen] = React.useState(false);
  const [variantImagePickerIndex, setVariantImagePickerIndex] = React.useState<
    number | null
  >(null);
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { id: string; name: string }[]) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  function update<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateMetafield<K extends keyof Metafield>(
    index: number,
    key: K,
    value: Metafield[K]
  ) {
    const next = [...form.metafields];
    next[index] = { ...next[index], [key]: value };
    update("metafields", next);
  }

  function addMetafield() {
    update("metafields", [
      ...form.metafields,
      { key: "", value: "", placement: "after_buy_button" },
    ]);
  }

  function removeMetafield(index: number) {
    update(
      "metafields",
      form.metafields.filter((_, i) => i !== index)
    );
  }

  function addImages(urls: string[]) {
    const existing = new Set(form.images);
    const merged = [...form.images];
    for (const url of urls) {
      if (!existing.has(url)) {
        merged.push(url);
        existing.add(url);
      }
    }
    update("images", merged);
  }

  function removeImage(url: string) {
    update(
      "images",
      form.images.filter((u) => u !== url)
    );
  }

  // --- Variants ---

  function toggleVariants(enabled: boolean) {
    if (enabled && form.options.length === 0) {
      const firstOption: ProductOption = {
        id: nextId(),
        name: "",
        values: [],
        swatches: {},
      };
      setForm((f) => ({ ...f, hasVariants: true, options: [firstOption] }));
      return;
    }
    update("hasVariants", enabled);
  }

  function addOption() {
    if (form.options.length >= MAX_OPTIONS) return;
    const options = [
      ...form.options,
      { id: nextId(), name: "", values: [], swatches: {} },
    ];
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
    const previous = options[index];
    // Give every value an explicit swatch entry as soon as it's added —
    // otherwise a value whose intended color is black never actually gets
    // saved: the picker already *shows* black by default, so if the admin
    // doesn't visibly change it, the browser never fires onChange and the
    // value's swatch stays unset.
    const swatches = { ...previous.swatches };
    for (const value of values) {
      if (!(value in swatches)) swatches[value] = "#000000";
    }
    options[index] = { ...previous, values, swatches };
    const variants = regenerateVariants(options, form.variants);
    setForm((f) => ({ ...f, options, variants }));
  }

  function updateOptionSwatch(index: number, value: string, swatch: string) {
    const options = [...form.options];
    options[index] = {
      ...options[index],
      swatches: { ...options[index].swatches, [value]: swatch },
    };
    update("options", options);
  }

  function removeOption(index: number) {
    const options = form.options.filter((_, i) => i !== index);
    const variants = regenerateVariants(options, form.variants);
    setForm((f) => ({ ...f, options, variants }));
  }

  function updateVariant(
    index: number,
    key: "price" | "compareAtPrice" | "sku" | "stock" | "image",
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
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="compareAtPrice">Compare-at Price</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.compareAtPrice}
                  onChange={(e) => update("compareAtPrice", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Shown crossed out next to the price when higher — leave blank
                  if not on sale.
                </p>
              </div>
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
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
                {form.category &&
                  !categories.some((c) => c.name === form.category) && (
                    <SelectItem value={form.category}>{form.category}</SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Collections</Label>
            <p className="text-xs text-muted-foreground">
              Also show this product under other collection pages, in addition to
              its category above.
            </p>
            <CollectionsPicker
              categories={categories}
              selected={form.collections}
              onChange={(ids) => update("collections", ids)}
            />
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
                    {option.name.trim().toLowerCase() === "color" &&
                      option.values.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-1">
                          {option.values.map((value) => (
                            <div key={value} className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={
                                  /^#[0-9a-fA-F]{6}$/.test(
                                    option.swatches[value] ?? ""
                                  )
                                    ? option.swatches[value]
                                    : "#000000"
                                }
                                onChange={(e) =>
                                  updateOptionSwatch(i, value, e.target.value)
                                }
                                className="h-6 w-6 shrink-0 cursor-pointer rounded-full border border-input bg-transparent p-0"
                                aria-label={`${value} swatch color`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
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
                        <TableHead>Image</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Compare-at</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.variants.map((variant, i) => (
                        <TableRow key={variant.id}>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => setVariantImagePickerIndex(i)}
                              className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-dashed border-input bg-muted text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                              aria-label={
                                variant.image
                                  ? "Change variant image"
                                  : "Add variant image"
                              }
                            >
                              {variant.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={variant.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Plus className="mx-auto h-4 w-4" />
                              )}
                            </button>
                          </TableCell>
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
                              type="number"
                              min={0}
                              placeholder="0.00"
                              value={variant.compareAtPrice}
                              onChange={(e) =>
                                updateVariant(i, "compareAtPrice", e.target.value)
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

              <MediaPickerDialog
                open={variantImagePickerIndex !== null}
                onOpenChange={(open) => {
                  if (!open) setVariantImagePickerIndex(null);
                }}
                multiple={false}
                onSelect={([url]) => {
                  if (variantImagePickerIndex !== null) {
                    updateVariant(variantImagePickerIndex, "image", url);
                  }
                }}
              />
            </div>
          )}
        </section>

        <Separator />

        {/* Metafields / content blocks */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Content Blocks</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Custom rich-text sections shown on the product page, placed
                above or below the Add to Cart button.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={addMetafield}
            >
              <Plus className="h-3.5 w-3.5" />
              Add block
            </Button>
          </div>
          <div className="space-y-4">
            {form.metafields.map((field, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs font-normal text-muted-foreground">
                      Heading
                    </Label>
                    <Input
                      placeholder="e.g. Fit & Sizing"
                      value={field.key}
                      onChange={(e) => updateMetafield(i, "key", e.target.value)}
                    />
                  </div>
                  <div className="w-52 space-y-1.5">
                    <Label className="text-xs font-normal text-muted-foreground">
                      Placement
                    </Label>
                    <Select
                      value={field.placement}
                      onValueChange={(value) => {
                        if (value) {
                          updateMetafield(
                            i,
                            "placement",
                            value as MetafieldPlacement
                          );
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before_buy_button">
                          Before Buy Button
                        </SelectItem>
                        <SelectItem value="after_buy_button">
                          After Buy Button
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove content block"
                    onClick={() => removeMetafield(i)}
                    disabled={form.metafields.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Content
                  </Label>
                  <RichTextEditor
                    value={field.value}
                    onChange={(html) => updateMetafield(i, "value", html)}
                    placeholder="Write the content shown under this heading…"
                    minHeight="6rem"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Images */}
        <section className="space-y-3">
          <Label>Media</Label>
          <div className="flex flex-wrap gap-3">
            {form.images.map((url) => (
              <div
                key={url}
                className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setImagePickerOpen(true)}
              className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add</span>
            </button>
          </div>

          <MediaPickerDialog
            open={imagePickerOpen}
            onOpenChange={setImagePickerOpen}
            multiple
            onSelect={addImages}
          />
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
