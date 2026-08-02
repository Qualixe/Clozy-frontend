"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ImagePlus, CheckCircle2 } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";

const CATEGORIES = [
  "Knitwear",
  "Footwear",
  "Shirts",
  "Outerwear",
  "Trousers",
  "Accessories",
] as const;

const MAX_OPTIONS = 3;

type Metafield = { key: string; value: string };

type ProductOption = { id: string; name: string; values: string[] };

type ProductVariant = {
  id: string;
  optionValues: Record<string, string>;
  price: string;
  sku: string;
  stock: string;
};

type ProductForm = {
  title: string;
  shortDescription: string;
  description: string;
  stock: string;
  sku: string;
  tags: string[];
  category: string;
  metafields: Metafield[];
  images: string[];
  seoTitle: string;
  seoDescription: string;
  hasVariants: boolean;
  options: ProductOption[];
  variants: ProductVariant[];
};

const EMPTY_FORM: ProductForm = {
  title: "",
  shortDescription: "",
  description: "",
  stock: "",
  sku: "",
  tags: [],
  category: "",
  metafields: [{ key: "", value: "" }],
  images: [""],
  seoTitle: "",
  seoDescription: "",
  hasVariants: false,
  options: [],
  variants: [],
};

// ---------------------------------------------------------------------------
// Variant helpers
// ---------------------------------------------------------------------------

function comboKey(combo: Record<string, string>) {
  return Object.values(combo).join(" / ");
}

/** Cartesian product of every option's values, keyed by option name. */
function cartesian(options: ProductOption[]): Record<string, string>[] {
  const usable = options.filter((o) => o.name.trim() && o.values.length > 0);
  if (usable.length === 0) return [];

  return usable.reduce<Record<string, string>[]>((acc, option) => {
    if (acc.length === 0) {
      return option.values.map((v) => ({ [option.name]: v }));
    }
    const next: Record<string, string>[] = [];
    for (const combo of acc) {
      for (const value of option.values) {
        next.push({ ...combo, [option.name]: value });
      }
    }
    return next;
  }, []);
}

/** Regenerate the variant list from options, keeping already-entered data. */
function regenerateVariants(
  options: ProductOption[],
  existing: ProductVariant[]
): ProductVariant[] {
  return cartesian(options).map((combo) => {
    const key = comboKey(combo);
    const match = existing.find((v) => comboKey(v.optionValues) === key);
    return match ?? { id: key, optionValues: combo, price: "", sku: "", stock: "" };
  });
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `id-${idCounter}`;
}

type ProductEditResponse = {
  title: string;
  shortDescription: string | null;
  description: string | null;
  stock: number | null;
  sku: string | null;
  category: string | null;
  tags: string[];
  metafields: Metafield[];
  images: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  hasVariants: boolean;
  options: { name: string; values: string[] }[];
  variants: { optionValues: Record<string, string>; price: string; sku: string; stock: string }[];
};

function fromEditResponse(data: ProductEditResponse): ProductForm {
  return {
    title: data.title ?? "",
    shortDescription: data.shortDescription ?? "",
    description: data.description ?? "",
    stock: data.stock != null ? String(data.stock) : "",
    sku: data.sku ?? "",
    tags: data.tags ?? [],
    category: data.category ?? "",
    metafields: data.metafields?.length ? data.metafields : [{ key: "", value: "" }],
    images: data.images?.length ? data.images : [""],
    seoTitle: data.seoTitle ?? "",
    seoDescription: data.seoDescription ?? "",
    hasVariants: data.hasVariants ?? false,
    options: (data.options ?? []).map((o) => ({
      id: nextId(),
      name: o.name,
      values: o.values,
    })),
    variants: (data.variants ?? []).map((v) => ({
      id: comboKey(v.optionValues),
      optionValues: v.optionValues,
      price: v.price ?? "",
      sku: v.sku ?? "",
      stock: v.stock ?? "",
    })),
  };
}

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
// Add / edit product dialog
// ---------------------------------------------------------------------------

export function ProductDialog({
  productId,
  trigger,
}: {
  /** Pass an existing product's id to edit it; omit to create a new one. */
  productId?: string;
  /** Custom trigger element (e.g. an Edit button). Defaults to an "Add Product" button. */
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const isEditing = !!productId;

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<ProductForm>(EMPTY_FORM);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [titleError, setTitleError] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function update<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setLoadError(null);
    setTitleError(false);
    setSubmitting(false);
    setSubmitError(null);
    setSaved(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      resetForm();
      return;
    }

    if (!isEditing) {
      setForm(EMPTY_FORM);
      return;
    }

    setLoading(true);
    setLoadError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/edit`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: ProductEditResponse) => setForm(fromEditResponse(data)))
      .catch(() => setLoadError("Could not load this product."))
      .finally(() => setLoading(false));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      setSaved(true);
      router.refresh();
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] w-full overflow-y-auto sm:max-w-2xl">
        {saved ? (
          <div className="flex flex-col items-center gap-3 px-2 py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
            <h3 className="text-lg font-semibold text-foreground">
              {isEditing ? "Product updated" : "Product created"}
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              "{form.title}"
              {isEditing
                ? " has been updated."
                : form.variants.length > 0
                  ? ` has been added with ${form.variants.length} variant${form.variants.length === 1 ? "" : "s"}.`
                  : " has been added to your catalog."}
            </p>
            <Button className="mt-2" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-2 px-2 py-16 text-center">
            <p className="text-sm text-muted-foreground">Loading product…</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 px-2 py-16 text-center">
            <p className="text-sm text-destructive">{loadError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(true)}
            >
              Try again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update this product's details."
                  : "Fill in the details below to add a new product to your catalog."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-6">
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
                    <p className="text-xs text-destructive">
                      Title is required.
                    </p>
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
                              onChange={(e) =>
                                updateOptionName(i, e.target.value)
                              }
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMetafield}
                  >
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
                        onChange={(e) =>
                          updateMetafield(i, "key", e.target.value)
                        }
                        className="w-1/3"
                      />
                      <Input
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) =>
                          updateMetafield(i, "value", e.target.value)
                        }
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImage}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add image
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={url}
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
                  <Label
                    htmlFor="seoTitle"
                    className="text-xs font-normal text-muted-foreground"
                  >
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
                {submitting
                  ? "Saving…"
                  : isEditing
                    ? "Save Changes"
                    : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProductDialog;
