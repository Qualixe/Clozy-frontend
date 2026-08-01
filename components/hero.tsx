"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
// Swap `image` for your own product photography (transparent PNG works best
// for the floating effect), e.g. "/hero/autumn-edit.png"

const SLIDES = [
  {
    id: "autumn-edit",
    eyebrow: "New Collection",
    ghostText: "AUTUMN",
    heading: ["Layers Built For", "The Season Ahead."],
    body: "Considered outerwear and knitwear, cut from fabrics that hold up when the weather doesn't.",
    ctaLabel: "Explore More",
    ctaHref: "/shop/autumn-edit",
    image: "https://picsum.photos/seed/nordly-hero-autumn/900/900",
    from: "#e8d9c3",
    to: "#8a6a52",
    accent: "#8a4a34",
    textColor: "#2b1d13",
  },
  {
    id: "summer-whites",
    eyebrow: "Featured",
    ghostText: "SUMMER",
    heading: ["Light Fabrics.", "Effortless Fit."],
    body: "Breathable essentials designed for warm days and easy movement, in a palette that stays quiet.",
    ctaLabel: "Shop Now",
    ctaHref: "/shop/summer-whites",
    image: "https://picsum.photos/seed/nordly-hero-summer/900/900",
    from: "#eef1ee",
    to: "#a9b8ab",
    accent: "#3f5142",
    textColor: "#1c231d",
  },
  {
    id: "night-edit",
    eyebrow: "Just Dropped",
    ghostText: "MIDNIGHT",
    heading: ["Sharper Silhouettes.", "After Dark."],
    body: "Tailored pieces in deep tones, built for evenings that call for something more deliberate.",
    ctaLabel: "Discover",
    ctaHref: "/shop/night-edit",
    image: "https://picsum.photos/seed/nordly-hero-night/900/900",
    from: "#2b2d33",
    to: "#0e0f12",
    accent: "#c9a876",
    textColor: "#f4f1ea",
  },
] as const;

const AUTOPLAY_MS = 5500;

// ---------------------------------------------------------------------------
// Hero slider
// ---------------------------------------------------------------------------

export function HeroSlider() {
  const [index, setIndex] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = React.useCallback((i: number) => {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }, []);

  const next = React.useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = React.useCallback(() => goTo(index - 1), [goTo, index]);

  const startAutoplay = React.useCallback(() => {
    stopAutoplay();
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
  }, []);

  function stopAutoplay() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  React.useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay]);

  const active = SLIDES[index];

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
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="relative h-full w-full shrink-0 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${slide.from}, ${slide.to})`,
              }}
            >
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
                  <Link
                    href={slide.ctaHref}
                    className="mt-7 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: slide.accent }}
                  >
                    {slide.ctaLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Image column */}
                <div className="relative hidden h-[70%] w-full lg:block">
                  <Image
                    src={slide.image}
                    alt={slide.heading.join(" ")}
                    fill
                    sizes="(max-width: 1024px) 0px, 45vw"
                    className="object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.35)]"
                    priority={slide.id === SLIDES[0].id}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

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
          {SLIDES.map((slide, i) => (
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
      </div>
    </section>
  );
}

export default HeroSlider;