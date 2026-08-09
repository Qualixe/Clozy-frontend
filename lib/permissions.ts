/**
 * Mirrors the backend's role/permission vocabulary exactly — see
 * `backend/database/seeders/RolesAndPermissionsSeeder.php` for the
 * authoritative role → permission mapping. Keep these two lists in sync.
 */

export const ROLES = ["owner", "admin", "staff", "user"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "manage_products",
  "manage_categories",
  "view_orders",
  "manage_orders",
  "manage_discounts",
  "view_reviews",
  "manage_reviews",
  "view_analytics",
  "manage_menus",
  "manage_media",
  "manage_cms_pages",
  "manage_theme",
  "view_sms",
  "manage_sms",
  "manage_settings",
  "manage_staff",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  manage_products: "Manage products",
  manage_categories: "Manage categories",
  view_orders: "View orders",
  manage_orders: "Update order status",
  manage_discounts: "Manage discounts",
  view_reviews: "View reviews",
  manage_reviews: "Moderate reviews",
  view_analytics: "View analytics",
  manage_menus: "Manage menus",
  manage_media: "Manage media library",
  manage_cms_pages: "Manage About Page, Policies & FAQs",
  manage_theme: "Manage homepage theme",
  view_sms: "View SMS logs",
  manage_sms: "Send promotional SMS",
  manage_settings: "Manage store settings",
  manage_staff: "Manage staff accounts",
};

export const PERMISSION_GROUPS: { title: string; permissions: Permission[] }[] = [
  { title: "Products", permissions: ["manage_products", "manage_categories"] },
  { title: "Orders", permissions: ["view_orders", "manage_orders"] },
  { title: "Discounts", permissions: ["manage_discounts"] },
  { title: "Reviews", permissions: ["view_reviews", "manage_reviews"] },
  { title: "Analytics", permissions: ["view_analytics"] },
  { title: "Content", permissions: ["manage_menus", "manage_media", "manage_cms_pages", "manage_theme"] },
  { title: "SMS", permissions: ["view_sms", "manage_sms"] },
  { title: "Store", permissions: ["manage_settings", "manage_staff"] },
];

/** Sensible starting checkbox state when a role is picked — mirrors backend's App\Support\RolePermissions. */
export function defaultPermissionsForRole(role: Role): Permission[] {
  if (role === "admin" || role === "staff") {
    return PERMISSIONS.filter((p) => p !== "manage_settings" && p !== "manage_staff");
  }
  return [];
}
