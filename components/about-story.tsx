import Image from "next/image";

import type { AboutPageData } from "@/lib/get-about-page";

export function AboutStory({ data }: { data: AboutPageData }) {
  const paragraphs = data.storyBody.split(/\n\s*\n/).filter(Boolean);

  return (
    <section className="w-full bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-muted lg:order-1">
            <Image
              src={data.storyImage}
              alt="The Clozy design studio"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="order-1 lg:order-2">
            {data.storyEyebrow && (
              <p className="text-sm font-medium text-muted-foreground">
                {data.storyEyebrow}
              </p>
            )}
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {data.storyHeading}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
              {paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutStory;
