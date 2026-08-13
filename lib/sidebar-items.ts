import type { Permission } from "@/lib/permissions";

export type SidebarSubItem = {
  title: string;
  href: string;
  /** Item is visible/reachable if the user has ANY of these permissions. Omit for "always visible to staff". */
  permissions?: Permission[];
};

export type SidebarItem = SidebarSubItem & {
  children?: SidebarSubItem[];
};

/**
 * Single source of truth for the dashboard's navigation — used to both
 * render (and filter) the sidebar and to enforce per-route access in
 * `proxy.ts`, so the two can never drift. Kept free of icon/component
 * imports so it stays safe to import from the edge-runtime proxy; icons are
 * mapped separately in `app-sidebar.tsx`.
 */
export const SIDEBAR_ITEMS: SidebarItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  {
    title: "Products",
    href: "/dashboard/products",
    permissions: ["view_products", "create_products", "edit_products"],
    children: [
      {
        title: "Categories",
        href: "/dashboard/products/categories",
        permissions: ["view_categories", "create_categories", "edit_categories"],
      },
    ],
  },
  { title: "Orders", href: "/dashboard/orders", permissions: ["view_orders"] },
  {
    title: "Discounts",
    href: "/dashboard/discounts",
    permissions: ["view_discounts", "create_discounts", "edit_discounts"],
  },
  { title: "Reviews", href: "/dashboard/reviews", permissions: ["view_reviews"] },
  // The Customers page has no dedicated backend endpoint — it's derived
  // from GET /orders, so it shares that permission.
  { title: "Customers", href: "/dashboard/customers", permissions: ["view_orders"] },
  { title: "Analytics", href: "/dashboard/analytics", permissions: ["view_analytics"] },
  {
    title: "Content",
    href: "/dashboard/content",
    permissions: [
      "view_menus",
      "create_menus",
      "edit_menus",
      "view_media",
      "create_media",
      "edit_media",
    ],
    children: [
      {
        title: "Menus",
        href: "/dashboard/content/menus",
        permissions: ["view_menus", "create_menus", "edit_menus"],
      },
      {
        title: "Media",
        href: "/dashboard/content/media",
        permissions: ["view_media", "create_media", "edit_media"],
      },
    ],
  },
  {
    title: "CMS",
    href: "/dashboard/cms",
    permissions: ["view_cms_pages", "create_cms_pages", "edit_cms_pages", "edit_theme"],
    children: [
      {
        title: "Home",
        href: "/dashboard/cms/home",
        permissions: ["edit_theme"],
      },
      {
        title: "About Page",
        href: "/dashboard/cms/about-page",
        permissions: ["edit_cms_pages"],
      },
      {
        title: "Policies",
        href: "/dashboard/cms/policies",
        permissions: ["view_cms_pages", "create_cms_pages", "edit_cms_pages"],
      },
      {
        title: "FAQs",
        href: "/dashboard/cms/faqs",
        permissions: ["view_cms_pages", "create_cms_pages", "edit_cms_pages"],
      },
    ],
  },
  {
    title: "SMS",
    href: "/dashboard/sms",
    permissions: ["view_sms", "manage_sms"],
    children: [
      { title: "Promotional", href: "/dashboard/sms/promotional", permissions: ["manage_sms"] },
      { title: "Logs", href: "/dashboard/sms/logs", permissions: ["view_sms"] },
    ],
  },
];

/** Rendered in the sidebar's separate "Account" group, but filtered the same way. */
export const ACCOUNT_SIDEBAR_ITEMS: SidebarSubItem[] = [
  {
    title: "Users",
    href: "/dashboard/users",
    permissions: ["view_staff", "create_staff", "edit_staff"],
  },
  { title: "Subscribers", href: "/dashboard/subscribers", permissions: ["manage_settings"] },
  { title: "Settings", href: "/dashboard/settings", permissions: ["manage_settings"] },
];

/** All items flattened (parents + children), most specific href first — used for path-based permission lookups. */
const ALL_ITEMS: SidebarSubItem[] = [
  ...SIDEBAR_ITEMS.flatMap((item) => [item, ...(item.children ?? [])]),
  ...ACCOUNT_SIDEBAR_ITEMS,
].sort((a, b) => b.href.length - a.href.length);

/**
 * Finds the permissions required to view a given dashboard pathname, by
 * matching the most specific configured href that's a prefix of it. Returns
 * `undefined` when the path isn't a known nav destination or requires no
 * specific permission (e.g. the dashboard home).
 */
export function permissionsForPath(pathname: string): Permission[] | undefined {
  const match = ALL_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  return match?.permissions;
}
