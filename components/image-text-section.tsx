import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ImageTextSectionProps = {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Which side the image sits on at desktop width. Defaults to "left". */
  imagePosition?: "left" | "right";
  className?: string;
  /** Set when this section renders above the fold (e.g. directly after the hero). */
  priority?: boolean;
};

/**
 * A reusable half-image, half-text marketing block. Use it anywhere on the
 * site — pass different image/copy/CTA props per placement.
 */
export function ImageTextSection({
  image,
  imageAlt,
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  imagePosition = "left",
  className,
  priority = false,
}: ImageTextSectionProps) {
  return (
    <section className={cn("w-full bg-background py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted",
              imagePosition === "right" && "lg:order-2"
            )}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority={priority}
            />
          </div>

          <div className={cn(imagePosition === "right" && "lg:order-1")}>
            {eyebrow && (
              <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
            )}
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 max-w-md text-base text-muted-foreground">{body}</p>

            {ctaLabel && ctaHref && (
              <Button
                className="mt-6"
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

export default ImageTextSection;
