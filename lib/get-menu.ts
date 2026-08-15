import navData from "@/data/nav.json";

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

// Fallback used wherever the "main-menu" Menu (editable at
// /dashboard/cms/menus) is missing or unreachable.
const FALLBACK_LINKS: MenuLink[] = navData.links.map((link) => ({
  id: link.href,
  label: link.label,
  url: link.href,
  type: "custom",
  displayStyle: "link",
  icon: null,
  children: [],
}));

export function getNavLinks(menu: Menu | null): MenuLink[] {
  return menu?.items.length ? menu.items : FALLBACK_LINKS;
}

export async function getMenuByHandle(handle: string): Promise<Menu | null> {
  // ISR instead of no-store: menu links only change via the admin
  // dashboard, so a 60s revalidation window is safe. `getSettings()`
  // (lib/get-settings.ts) stays `no-store` and is fetched alongside this
  // in every storefront route via app/(site)/layout.tsx, which keeps those
  // routes dynamically rendered — so this fetch is still never run during
  // `next build`, only at request time (then cached for 60s).
  // Also swallow network-level failures (backend unreachable at request
  // time) so the header falls back to its static links instead of a 500.
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menus/handle/${handle}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
