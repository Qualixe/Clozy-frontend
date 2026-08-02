export type MenuLink = {
  id: string;
  label: string;
  type: "custom" | "collection";
  url: string;
  /** Only meaningful on top-level items — controls how children render. */
  displayStyle: "link" | "dropdown" | "megamenu";
  /** Only meaningful on a megamenu's column-group items. */
  icon: string | null;
  children: MenuLink[];
};

export type Menu = {
  id: string;
  name: string;
  handle: string;
  itemCount: number;
  items: MenuLink[];
};

export async function getMenuByHandle(handle: string): Promise<Menu | null> {
  // Force this to render dynamically (fetched per-request) rather than at
  // build time — the backend isn't guaranteed to be reachable during a
  // Vercel build, and a failed build-time fetch fails the whole build.
  // Also swallow network-level failures (backend unreachable at request
  // time) so the header falls back to its static links instead of a 500.
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menus/handle/${handle}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
