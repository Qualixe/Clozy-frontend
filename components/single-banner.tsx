import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SingleBannerProps = {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Where the text content sits within the banner. Defaults to "left". */
  align?: "left" | "center";
  className?: string;
  priority?: boolean;
};

/**
 * A single full-width promotional banner — one image with text overlaid on
 * top, distinct from `ImageTextSection`'s side-by-side layout.
 */
export function SingleBanner({
  image,
  imageAlt,
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  align = "left",
  className,
  priority = false,
}: SingleBannerProps) {
  return (
    <section className={cn("w-full bg-background py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative flex min-h-[22rem] w-full items-end overflow-hidden rounded-2xl bg-muted sm:min-h-[26rem]",
            align === "center" && "items-center justify-center text-center"
          )}
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="100vw"
            priority={priority}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div
            className={cn(
              "relative z-10 max-w-lg p-8 sm:p-12",
              align === "center" && "flex max-w-2xl flex-col items-center"
            )}
          >
            {eyebrow && (
              <p className="text-sm font-medium uppercase tracking-wide text-white/80">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {heading}
            </h2>
            {body && (
              <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
                {body}
              </p>
            )}
            {ctaLabel && ctaHref && (
              <Button
                className="mt-6 bg-white text-foreground hover:bg-white/90"
                nativeButton={false}
                render={
                  <Link href={ctaHref}>
                    {ctaLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SingleBanner;
