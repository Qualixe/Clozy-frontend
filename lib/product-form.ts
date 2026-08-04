export type Metafield = { key: string; value: string };

export type ProductOption = { id: string; name: string; values: string[] };

export type ProductVariant = {
  id: string;
  optionValues: Record<string, string>;
  price: string;
  sku: string;
  stock: string;
  image: string;
};

export type ProductFormValues = {
  title: string;
  shortDescription: string;
  description: string;
  stock: string;
  sku: string;
  tags: string[];
  category: string;
  /** Additional collection ids the product also shows up under, beyond `category`. */
  collections: string[];
  metafields: Metafield[];
  images: string[];
  seoTitle: string;
  seoDescription: string;
  hasVariants: boolean;
  options: ProductOption[];
  variants: ProductVariant[];
};

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  title: "",
  shortDescription: "",
  description: "",
  stock: "",
  sku: "",
  tags: [],
  category: "",
  collections: [],
  metafields: [{ key: "", value: "" }],
  images: [],
  seoTitle: "",
  seoDescription: "",
  hasVariants: false,
  options: [],
  variants: [],
};

// ---------------------------------------------------------------------------
// Variant helpers
// ---------------------------------------------------------------------------

export function comboKey(combo: Record<string, string>) {
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
export function regenerateVariants(
  options: ProductOption[],
  existing: ProductVariant[]
): ProductVariant[] {
  return cartesian(options).map((combo) => {
    const key = comboKey(combo);
    const match = existing.find((v) => comboKey(v.optionValues) === key);
    return (
      match ?? { id: key, optionValues: combo, price: "", sku: "", stock: "", image: "" }
    );
  });
}

let idCounter = 0;
export function nextId() {
  idCounter += 1;
  return `id-${idCounter}`;
}

export type ProductEditResponse = {
  title: string;
  shortDescription: string | null;
  description: string | null;
  stock: number | null;
  sku: string | null;
  category: string | null;
  collections: string[];
  tags: string[];
  metafields: Metafield[];
  images: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  hasVariants: boolean;
  options: { name: string; values: string[] }[];
  variants: {
    optionValues: Record<string, string>;
    price: string;
    sku: string;
    stock: string;
    image: string;
  }[];
};

export function fromEditResponse(data: ProductEditResponse): ProductFormValues {
  return {
    title: data.title ?? "",
    shortDescription: data.shortDescription ?? "",
    description: data.description ?? "",
    stock: data.stock != null ? String(data.stock) : "",
    sku: data.sku ?? "",
    tags: data.tags ?? [],
    category: data.category ?? "",
    collections: data.collections ?? [],
    metafields: data.metafields?.length ? data.metafields : [{ key: "", value: "" }],
    images: data.images ?? [],
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
      image: v.image ?? "",
    })),
  };
}
