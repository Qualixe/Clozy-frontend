import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AboutPageData } from "@/lib/get-about-page";

export function AboutCta({ data }: { data: AboutPageData }) {
  return (
    <section className="w-full bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-foreground px-6 py-14 text-center text-background sm:px-12">
          <h2 className="max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
            {data.ctaHeading}
          </h2>
          {data.ctaBody && (
            <p className="max-w-md text-sm text-background/70">{data.ctaBody}</p>
          )}
          {data.ctaButtonLabel && (
            <Button
              size="lg"
              variant="secondary"
              nativeButton={false}
              render={
                <Link href={data.ctaButtonHref || "#"}>
                  {data.ctaButtonLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default AboutCta;
