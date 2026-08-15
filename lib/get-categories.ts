import type { Category } from "@/components/category-card";

export async function getCategories(): Promise<Category[]> {
  // ISR instead of no-store: category data changes rarely (only via the
  // admin dashboard), so a 60s revalidation window is safe. This still
  // avoids the original build-time-reachability concern — `getSettings()`
  // (lib/get-settings.ts) remains `no-store` and is always fetched
  // alongside this in every storefront route via app/(site)/layout.tsx,
  // which keeps those routes dynamically rendered at request time. Because
  // of that, this fetch is never executed during `next build`; it only
  // runs (and gets cached for 60s) at request time.
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
