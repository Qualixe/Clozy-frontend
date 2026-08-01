import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATS = [
  { value: "25K+", label: "Happy Customers" },
  { value: "50+", label: "Countries" },
  { value: "98%", label: "Satisfaction" },
] as const;

export function AboutHero() {
  return (
    <section className="w-full border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div>
            <Badge variant="secondary" className="mb-5">
              Since 2018
            </Badge>

            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Considered essentials,
              <span className="block text-muted-foreground">
                made to last.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
              We believe great clothing is more than style — it's confidence,
              comfort, and self-expression. Every collection is designed
              in-house and made from premium materials built for years, not
              seasons.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/shop">Shop Collection</Link>}
              />
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/contact">Contact Us</Link>}
              />
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-muted">
              <Image
                src="https://picsum.photos/seed/nordly-hero-autumn/900/900"
                alt="Inside the Clozy studio"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 left-6 hidden rounded-xl border border-border bg-background p-4 shadow-sm md:block">
              <p className="text-xs text-muted-foreground">Trusted by</p>
              <p className="mt-0.5 text-xl font-semibold text-foreground">
                25,000+
              </p>
              <p className="text-xs text-muted-foreground">
                customers worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutHero;
