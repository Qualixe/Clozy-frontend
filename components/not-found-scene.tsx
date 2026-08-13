"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Home,
  LayoutGrid,
  MessageCircle,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Shop All", href: "/shop", icon: ShoppingBag },
  { label: "Collections", href: "/collections", icon: LayoutGrid },
  { label: "Track Order", href: "/track-order", icon: PackageSearch },
  { label: "Contact Us", href: "/contact", icon: MessageCircle },
];

/** Normalized (-1..1) pointer offset from viewport center, for parallax. */
function usePointerParallax() {
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;

    function handleMove(e: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setOffset({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (e.clientY / window.innerHeight) * 2 - 1,
        });
      });
    }

    window.addEventListener("pointermove", handleMove);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return offset;
}

export function NotFoundScene() {
  const { x, y } = usePointerParallax();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-24">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute -left-32 top-[8%] h-72 w-72 rounded-full bg-foreground/[0.06] blur-3xl dark:bg-foreground/[0.08]"
          style={
            {
              "--drift-x": "36px",
              "--drift-y": "-28px",
              "--drift-scale": "1.08",
              animation: "drift 13s ease-in-out infinite",
              transform: `translate3d(${x * -18}px, ${y * -18}px, 0)`,
              transition: "transform 0.3s ease-out",
            } as React.CSSProperties
          }
        />
        <div
          className="absolute -right-24 bottom-[10%] h-96 w-96 rounded-full bg-foreground/[0.05] blur-3xl dark:bg-foreground/[0.07]"
          style={
            {
              "--drift-x": "-30px",
              "--drift-y": "24px",
              "--drift-scale": "1.1",
              animation: "drift 16s ease-in-out infinite",
              animationDelay: "-4s",
              transform: `translate3d(${x * 14}px, ${y * 14}px, 0)`,
              transition: "transform 0.3s ease-out",
            } as React.CSSProperties
          }
        />
        {/* Faint dot grid for texture */}
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklch, var(--foreground), transparent 82%) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 90%)",
          }}
        />
      </div>

      {/* Giant numeral */}
      <div
        className="animate-in fade-in zoom-in-95 fill-mode-both relative z-10 select-none text-center leading-none font-black tracking-tighter delay-100 duration-700"
        style={{
          fontSize: "clamp(6rem, 22vw, 13rem)",
          backgroundImage:
            "linear-gradient(160deg, var(--foreground) 20%, color-mix(in oklch, var(--foreground), transparent 70%) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          transform: `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 6}deg)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        404
      </div>

      {/* Heading + copy */}
      <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both relative z-10 mt-2 max-w-lg text-center delay-200 duration-700">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          This page came apart at the seams.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          The page you&apos;re looking for was moved, renamed, or never made
          it off the rack. Let&apos;s get you back to something worth
          wearing.
        </p>
      </div>

      {/* CTAs */}
      <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3 delay-300 duration-700">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/80"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:bg-muted"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      {/* Seam divider */}
      <div className="animate-in fade-in fill-mode-both relative z-10 mt-14 flex w-full max-w-md items-center gap-3 delay-500 duration-700">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-border" />
        <span className="h-px flex-1 border-t border-dashed border-border" />
        <span className="shrink-0 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
          or find your way from here
        </span>
        <span className="h-px flex-1 border-t border-dashed border-border" />
        <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-border" />
      </div>

      {/* Quick links */}
      <nav
        aria-label="Popular destinations"
        className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both relative z-10 mt-6 flex flex-wrap items-center justify-center gap-2 delay-700 duration-700"
      >
        {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <ArrowRight className="h-3 w-3 -translate-x-0.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default NotFoundScene;
