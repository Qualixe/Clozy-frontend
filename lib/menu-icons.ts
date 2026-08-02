import {
  Shirt,
  Footprints,
  Watch,
  Gem,
  ShoppingBag,
  Tag,
  Star,
  Heart,
  Package,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** Curated icon set for mega-menu column-group headers. */
export const MENU_ICONS: Record<string, LucideIcon> = {
  Shirt,
  Footprints,
  Watch,
  Gem,
  ShoppingBag,
  Tag,
  Star,
  Heart,
  Package,
  Sparkles,
};

export const MENU_ICON_KEYS = Object.keys(MENU_ICONS) as (keyof typeof MENU_ICONS)[];
