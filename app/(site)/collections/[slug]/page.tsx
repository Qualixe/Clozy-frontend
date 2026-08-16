import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CollectionPage from "@/components/collection-page";
import type { Product } from "@/components/product-card";
import type { Category } from "@/components/category-card";
import { getSiteUrl } from "@/lib/site-url";

async function getCategory(slug: string): Promise<Category | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

async function getProducts(slug: string): Promise<Product[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?category=${slug}`,
    { next: { revalidate: 60 } }
  );
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
  const category = await getCategory(slug).catch(() => null);
  if (!category) return {};

  const description = category.description ? truncate(category.description, 160) : undefined;
  const url = `${getSiteUrl()}/collections/${category.slug}`;

  return {
    // Plain string — templated to "<name> | <site name>" by the (site)
    // layout's generateMetadata(), which is the one place that knows the
    // dashboard-configured site name.
    title: category.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: category.name,
      description,
      url,
      type: "website",
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
    },
  };
}

function buildBreadcrumbJsonLd(category: Category) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Collections", item: `${siteUrl}/collections/all` },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${siteUrl}/collections/${category.slug}`,
      },
    ],
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // getProducts filters by the route `slug` directly (`?category=${slug}`),
  // not by anything derived from the fetched category object (e.g. a
  // numeric id) — so both requests can run concurrently instead of
  // serially waiting on getCategory to resolve first.
  const [category, products] = await Promise.all([
    getCategory(slug),
    getProducts(slug),
  ]);

  if (!category) notFound();

  const jsonLd = buildBreadcrumbJsonLd(category);

  return (
    <>
      {/* JSON.stringify alone does NOT escape `<`, so admin-entered category
          data (name) could otherwise break out of the script tag via a
          literal `</script>` substring. Escaping `<` to its unicode form
          neutralizes that while staying valid JSON. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <CollectionPage
        products={products}
        eyebrow="Collection"
        title={category.name}
        description={category.description}
      />
    </>
  );
}
