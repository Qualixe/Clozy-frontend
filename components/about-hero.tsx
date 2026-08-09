import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AboutPageData } from "@/lib/get-about-page";

export function AboutHero({ data }: { data: AboutPageData }) {
  return (
    <section className="w-full border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div>
            {data.heroBadge && (
              <Badge variant="secondary" className="mb-5">
                {data.heroBadge}
              </Badge>
            )}

            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {data.heroHeadingLine1}
              {data.heroHeadingLine2 && (
                <span className="block text-muted-foreground">
                  {data.heroHeadingLine2}
                </span>
              )}
            </h1>

            {data.heroBody && (
              <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
                {data.heroBody}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {data.heroPrimaryCtaLabel && (
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href={data.heroPrimaryCtaHref || "#"}>{data.heroPrimaryCtaLabel}</Link>}
                />
              )}
              {data.heroSecondaryCtaLabel && (
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link href={data.heroSecondaryCtaHref || "#"}>
                      {data.heroSecondaryCtaLabel}
                    </Link>
                  }
                />
              )}
            </div>

            {/* Stats */}
            {data.heroStats.length > 0 && (
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
                {data.heroStats.map((stat) => (
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
            )}
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-muted">
              <Image
                src={data.heroImage}
                alt="Inside the Clozy studio"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Floating card */}
            {data.heroBadgeValue && (
              <div className="absolute -bottom-6 left-6 hidden rounded-xl border border-border bg-background p-4 shadow-sm md:block">
                {data.heroBadgeTitle && (
                  <p className="text-xs text-muted-foreground">{data.heroBadgeTitle}</p>
                )}
                <p className="mt-0.5 text-xl font-semibold text-foreground">
                  {data.heroBadgeValue}
                </p>
                {data.heroBadgeSubtitle && (
                  <p className="text-xs text-muted-foreground">{data.heroBadgeSubtitle}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutHero;
