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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menus/handle/${handle}`, {
    // The header renders on every page — cache briefly so a dashboard edit
    // shows up without needing a full redeploy, but normal traffic doesn't
    // hit the API on every request.
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}
