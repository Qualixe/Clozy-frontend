import type { NewArrivalsData } from "@/components/new-arrivals";

export async function getNewArrivals(): Promise<NewArrivalsData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/new-arrivals`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
