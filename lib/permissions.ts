/**
 * Mirrors the backend's role/permission vocabulary exactly — see
 * `backend/app/Support/RolePermissions.php` for the authoritative role →
 * permission mapping. Keep these two lists in sync.
 */

export const ROLES = ["owner", "admin", "staff", "user"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "view_products",
  "create_products",
  "edit_products",
  "view_categories",
  "create_categories",
  "edit_categories",
  "view_orders",
  "manage_orders",
  "view_discounts",
  "create_discounts",
  "edit_discounts",
  "view_reviews",
  "edit_reviews",
  "view_analytics",
  "view_menus",
  "create_menus",
  "edit_menus",
  "view_media",
  "create_media",
  "edit_media",
  "view_cms_pages",
  "create_cms_pages",
  "edit_cms_pages",
  "edit_theme",
  "view_sms",
  "manage_sms",
  "manage_settings",
  "view_staff",
  "create_staff",
  "edit_staff",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_products: "View products",
  create_products: "Create products",
  edit_products: "Edit & delete products",
  view_categories: "View categories",
  create_categories: "Create categories",
  edit_categories: "Edit & delete categories",
  view_orders: "View orders",
  manage_orders: "Update order status",
  view_discounts: "View discounts",
  create_discounts: "Create discounts",
  edit_discounts: "Edit & delete discounts",
  view_reviews: "View reviews",
  edit_reviews: "Moderate reviews",
  view_analytics: "View analytics",
  view_menus: "View menus",
  create_menus: "Create menus",
  edit_menus: "Edit & delete menus",
  view_media: "View media library",
  create_media: "Upload media",
  edit_media: "Delete media",
  view_cms_pages: "View About Page, Policies & FAQs",
  create_cms_pages: "Create policies & FAQs",
  edit_cms_pages: "Edit About Page, Policies & FAQs",
  edit_theme: "Manage homepage theme",
  view_sms: "View SMS logs",
  manage_sms: "Send promotional SMS",
  manage_settings: "Manage store settings",
  view_staff: "View staff accounts",
  create_staff: "Create staff accounts",
  edit_staff: "Edit & remove staff accounts",
};

export const PERMISSION_GROUPS: { title: string; permissions: Permission[] }[] = [
  {
    title: "Products",
    permissions: [
      "view_products",
      "create_products",
      "edit_products",
      "view_categories",
      "create_categories",
      "edit_categories",
    ],
  },
  { title: "Orders", permissions: ["view_orders", "manage_orders"] },
  {
    title: "Discounts",
    permissions: ["view_discounts", "create_discounts", "edit_discounts"],
  },
  { title: "Reviews", permissions: ["view_reviews", "edit_reviews"] },
  { title: "Analytics", permissions: ["view_analytics"] },
  {
    title: "Content",
    permissions: [
      "view_menus",
      "create_menus",
      "edit_menus",
      "view_media",
      "create_media",
      "edit_media",
      "view_cms_pages",
      "create_cms_pages",
      "edit_cms_pages",
      "edit_theme",
    ],
  },
  { title: "SMS", permissions: ["view_sms", "manage_sms"] },
  {
    title: "Store",
    permissions: ["manage_settings", "view_staff", "create_staff", "edit_staff"],
  },
];

/** Sensible starting checkbox state when a role is picked — mirrors backend's App\Support\RolePermissions. */
export function defaultPermissionsForRole(role: Role): Permission[] {
  if (role === "admin" || role === "staff") {
    return PERMISSIONS.filter(
      (p) =>
        p !== "manage_settings" &&
        p !== "view_staff" &&
        p !== "create_staff" &&
        p !== "edit_staff"
    );
  }
  return [];
}
