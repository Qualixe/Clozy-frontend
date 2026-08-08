"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data — populated from the Laravel API (`GET /hero-slides`), editable from
// the dashboard's Theme page.
// ---------------------------------------------------------------------------

export type HeroSlide = {
  id: string;
  eyebrow: string | null;
  ghostText: string | null;
  heading: string[];
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  textColor: string;
};

const AUTOPLAY_MS = 5500;

// ---------------------------------------------------------------------------
// Hero slider
// ---------------------------------------------------------------------------

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = React.useCallback(
    (i: number) => {
      setIndex((i + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = React.useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = React.useCallback(() => goTo(index - 1), [goTo, index]);

  const startAutoplay = React.useCallback(() => {
    stopAutoplay();
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
  }, [slides.length]);

  function stopAutoplay() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  React.useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <div className="relative h-[520px] sm:h-[560px] lg:h-[620px]">
        {/* Slide track */}
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative h-full w-full shrink-0 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${slide.gradientFrom}, ${slide.gradientTo})`,
              }}
            >
              {/* Background photo for mobile/tablet — desktop shows the
                  image in its own column instead, so this stays hidden
                  from lg up. Tinted with the slide's own gradient so it
                  still reads as the same themed slide, just with the
                  photo visible behind the text. */}
              <div className="absolute inset-0 lg:hidden">
                <Image
                  src={slide.image}
                  alt={slide.heading.join(" ")}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={slide.id === slides[0].id}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${slide.gradientFrom}, ${slide.gradientTo})`,
                    opacity: 0.55,
                  }}
                />
              </div>

              {/* Ghost watermark text */}
              <span
                aria-hidden
                className="pointer-events-none absolute right-[4%] top-1/2 hidden -translate-y-1/2 select-none whitespace-nowrap text-[7rem] font-extrabold leading-none tracking-tight lg:block xl:text-[9rem]"
                style={{ color: slide.textColor, opacity: 0.12 }}
              >
                {slide.ghostText}
              </span>

              {/* Content grid */}
              <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-6 px-6 sm:px-8 lg:grid-cols-2 lg:px-12">
                {/* Text column */}
                <div className="z-10 max-w-md">
                  <p
                    className="mb-3 text-sm font-medium uppercase tracking-wide opacity-80"
                    style={{ color: slide.textColor }}
                  >
                    {slide.eyebrow}
                  </p>
                  <h1
                    className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
                    style={{ color: slide.textColor }}
                  >
                    {slide.heading.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </h1>
                  <p
                    className="mt-4 max-w-sm text-base opacity-80"
                    style={{ color: slide.textColor }}
                  >
                    {slide.body}
                  </p>
                  {slide.ctaLabel && (
                    <Link
                      href={slide.ctaHref || "#"}
                      className="mt-7 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                      style={{ backgroundColor: slide.accentColor }}
                    >
                      {slide.ctaLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                {/* Image column */}
                <div className="relative hidden h-[70%] w-full lg:block">
                  <Image
                    src={slide.image}
                    alt={slide.heading.join(" ")}
                    fill
                    sizes="(max-width: 1024px) 0px, 45vw"
                    className="object-cover drop-shadow-[0_35px_45px_rgba(0,0,0,0.35)] rounded-[10px]"
                    priority={slide.id === slides[0].id}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            {/* Arrows */}
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-5"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-5"
            >
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default HeroSlider;