import {
  Leaf,
  PenTool,
  Tag,
  Globe,
  Heart,
  Shield,
  Truck,
  Award,
  Recycle,
  Users,
  Star,
  Package,
  type LucideIcon,
} from "lucide-react";

import type { AboutPageData, AboutValueIcon } from "@/lib/get-about-page";

export const ABOUT_VALUE_ICON_MAP: Record<AboutValueIcon, LucideIcon> = {
  leaf: Leaf,
  "pen-tool": PenTool,
  tag: Tag,
  globe: Globe,
  heart: Heart,
  shield: Shield,
  truck: Truck,
  award: Award,
  recycle: Recycle,
  users: Users,
  star: Star,
  package: Package,
};

export function AboutValues({ data }: { data: AboutPageData }) {
  if (data.values.length === 0) return null;

  return (
    <section className="w-full border-t border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          {data.valuesEyebrow && (
            <p className="text-sm font-medium text-muted-foreground">
              {data.valuesEyebrow}
            </p>
          )}
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {data.valuesHeading}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.values.map((value) => {
            const Icon = ABOUT_VALUE_ICON_MAP[value.icon] ?? Leaf;
            return (
              <div
                key={value.title}
                className="rounded-xl border border-border bg-background p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AboutValues;
