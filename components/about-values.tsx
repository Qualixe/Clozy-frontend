import { Leaf, PenTool, Tag, Globe } from "lucide-react";

const VALUES = [
  {
    icon: Leaf,
    title: "Considered Materials",
    description:
      "Sourced responsibly and chosen to last, not to be replaced next season.",
  },
  {
    icon: PenTool,
    title: "Designed In-House",
    description:
      "Every piece is designed, sampled, and tested by our own team before production.",
  },
  {
    icon: Tag,
    title: "Honest Pricing",
    description:
      "No markup games — fair prices on quality goods, every day.",
  },
  {
    icon: Globe,
    title: "Shipped Worldwide",
    description: "Delivering to more than 50 countries, with care.",
  },
] as const;

export function AboutValues() {
  return (
    <section className="w-full border-t border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-muted-foreground">
            What We Stand For
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Our values
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-xl border border-border bg-background p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                <value.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {value.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutValues;
