import Image from "next/image";

export function AboutStory() {
  return (
    <section className="w-full bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-muted lg:order-1">
            <Image
              src="https://picsum.photos/seed/clozy-story/900/1100"
              alt="The Clozy design studio"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-medium text-muted-foreground">
              Our Story
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built by people who care about clothes
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
              <p>
                Clozy started in 2018 with a simple frustration: most
                clothing is either fast fashion that falls apart, or
                designer pricing for basics that shouldn't cost that much.
                We set out to build the middle ground — considered
                essentials, priced honestly.
              </p>
              <p>
                Every piece is designed in-house, sampled and tested before
                it ever reaches production, and made from materials chosen
                to hold up for years of wear, not one season.
              </p>
              <p>
                Today we ship to more than 50 countries, but the process
                hasn't changed: small batches, careful sourcing, and a
                genuine dislike of anything disposable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutStory;
