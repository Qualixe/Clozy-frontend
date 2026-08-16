import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductPage, { type ProductDetail } from "@/components/single-product";
import { getSiteUrl } from "@/lib/site-url";

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

  return res.json();
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) return {};

  const description = product.description ? truncate(product.description, 160) : undefined;
  const image = product.images[0];
  const url = `${getSiteUrl()}/products/${product.slug}`;

  return {
    // Plain string — templated to "<name> | <site name>" by the (site)
    // layout's generateMetadata(), which is the one place that knows the
    // dashboard-configured site name.
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      url,
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

/** Whether at least one size is actually purchasable. Products with no
 *  size variants at all (accessories, one-size items) are treated as in
 *  stock — `outOfStockSizes` only ever narrows a non-empty `sizes` list. */
function isInStock(product: ProductDetail): boolean {
  if (product.sizes.length === 0) return true;
  return product.sizes.some((size) => !product.outOfStockSizes.includes(size));
}

function buildProductJsonLd(product: ProductDetail) {
  const url = `${getSiteUrl()}/products/${product.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description || undefined,
    sku: product.id,
    category: product.category || undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BDT",
      price: product.price,
      availability: isInStock(product)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews,
          },
        }
      : {}),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const jsonLd = buildProductJsonLd(product);

  return (
    <>
      {/* JSON.stringify alone does NOT escape `<`, so admin-entered product
          data (name/description) could otherwise break out of the script
          tag via a literal `</script>` substring. Escaping `<` to its
          unicode form neutralizes that while staying valid JSON. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductPage product={product} />
    </>
  );
}
