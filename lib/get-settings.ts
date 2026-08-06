export type StoreSettings = {
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  tiktokPixelId: string | null;
};

export async function getSettings(): Promise<StoreSettings> {
  // Force this to render dynamically (fetched per-request) rather than at
  // build time — the backend isn't guaranteed to be reachable during a
  // Vercel build, and a failed build-time fetch fails the whole build.
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
