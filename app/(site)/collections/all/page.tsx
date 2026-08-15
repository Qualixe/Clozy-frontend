import { CategoryCard, type Category } from "@/components/category-card";

async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export default async function Page() {
  // A backend hiccup at request time (or a cold ISR revalidation racing an
  // unreachable backend at build time) shouldn't crash the page — same
  // catch-and-fallback pattern used by the homepage's data fetches.
  const categories = await getCategories().catch(() => []);

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-2.5 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Browse</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            All Collections
          </h1>
        </div>

        {categories.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No collections yet.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
