import type { Category } from "@/components/category-card";

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
