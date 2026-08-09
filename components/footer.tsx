"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Menu } from "@/lib/get-menu";

// ---------------------------------------------------------------------------
// Brand icons
// ---------------------------------------------------------------------------
// lucide-react no longer ships social/brand logos, so these are drawn locally.

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.897 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.897-.419-.419-.69-.824-.897-1.38-.164-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.86.061-1.17.256-1.814.42-2.234.207-.57.478-.96.897-1.381.419-.419.81-.689 1.379-.896.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06z" />
      <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zM19.846 5.595a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.732-.009c-.7 0-1.269.09-1.735.28a2.043 2.043 0 00-1.031.874c-.229.397-.349.917-.349 1.588v1.245h4.29l-.428 3.667h-3.86v7.98H9.1z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Payment icons
// ---------------------------------------------------------------------------
// Rendered as small white "cards" so the brand marks read correctly in both
// light and dark themes, matching how these logos are shown everywhere else.

function PaymentCard({
  children,
  fill = "white",
  className,
  label,
}: {
  children: React.ReactNode;
  fill?: string;
  className?: string;
  label: string;
}) {
  return (
    <svg viewBox="0 0 48 32" className={className} role="img" aria-label={label}>
      <rect
        width="47"
        height="31"
        x="0.5"
        y="0.5"
        rx="5"
        fill={fill}
        stroke="currentColor"
        strokeOpacity="0.12"
      />
      {children}
    </svg>
  );
}

function VisaIcon(props: { className?: string }) {
  return (
    <PaymentCard {...props} label="Visa">
      <text
        x="24"
        y="21"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontStyle="italic"
        fontSize="14"
        fill="#1A1F71"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </PaymentCard>
  );
}

function MastercardIcon(props: { className?: string }) {
  return (
    <PaymentCard {...props} label="Mastercard">
      <circle cx="20" cy="16" r="9" fill="#EB001B" />
      <circle cx="28" cy="16" r="9" fill="#F79E1B" />
      <path d="M24 9.3a9 9 0 010 13.4 9 9 0 010-13.4z" fill="#FF5F00" />
    </PaymentCard>
  );
}

function BkashIcon({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="bKash"
      className={`flex items-center justify-center overflow-hidden rounded-[5px] border border-foreground/10 bg-white p-1 ${className ?? ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/BKash-bKash2-Logo.wine%20(1).svg"
        alt=""
        className="h-full w-full object-contain"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
// Columns come from the "footer-menu" Menu (editable at
// /dashboard/content/menus), with this hardcoded list as a fallback if
// that menu is missing/unreachable — top-level items are column titles,
// their children are the links inside each column.

const FALLBACK_FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Clothing", href: "/shop/clothing" },
      { label: "Footwear", href: "/shop/footwear" },
      { label: "Accessories", href: "/shop/accessories" },
      { label: "Sale", href: "/sale" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Help Center", href: "/help" },
      { label: "Track Order", href: "/track-order" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Twitter", href: "https://twitter.com", icon: TwitterIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
];

const PAYMENT_METHODS = [
  { label: "Visa", icon: VisaIcon, className: "h-8 w-12" },
  { label: "Mastercard", icon: MastercardIcon, className: "h-8 w-12" },
  { label: "bKash", icon: BkashIcon, className: "h-8 w-16" },
];

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export function SiteFooter({
  menu,
  logoUrl,
}: {
  menu: Menu | null;
  logoUrl?: string | null;
}) {
  const year = new Date().getFullYear();

  const footerColumns = menu?.items.length
    ? menu.items.map((column) => ({
        title: column.label,
        links: column.children.map((link) => ({
          label: link.label,
          href: link.url,
        })),
      }))
    : FALLBACK_FOOTER_LINKS;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="relative w-full border-t border-border bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8">
        {/* Newsletter band */}
        <div className="flex flex-col gap-6 border-b border-border py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <Mail className="h-5 w-5 text-muted-foreground" />
              Stay in the loop
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              New arrivals, restocks, and members-only sales. No spam, unsubscribe anytime.
            </p>
          </div>
          <form
            className="flex w-full max-w-sm gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="you@email.com"
              required
              className="h-10"
            />
            <Button type="submit" className="shrink-0">
              Subscribe
            </Button>
          </form>
        </div>

        {/* Link columns + brand */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-6">
          {/* Brand column with watermark */}
          <div className="relative col-span-2 overflow-hidden sm:col-span-3 lg:col-span-2">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-2 top-2 select-none whitespace-nowrap text-7xl font-bold tracking-tighter text-foreground/[0.04] sm:text-8xl"
            >
              Clozy
            </span>
            <div className="relative">
              <Link href="/" className="flex items-center gap-2">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="Clozy"
                    width={128}
                    height={32}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                      C
                    </span>
                    <span className="text-lg font-semibold tracking-tight">
                      Clozy
                    </span>
                  </>
                )}
              </Link>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                Considered essentials, made to last. Designed in-house, shipped worldwide.
              </p>
              <div className="mt-5 flex items-center gap-1">
                {SOCIALS.map(({ label, href, icon: Icon }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    nativeButton={false}
                    render={
                      <Link href={href} aria-label={label} target="_blank" rel="noreferrer">
                        <Icon className="h-[18px] w-[18px]" />
                      </Link>
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-medium text-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {year} Clozy, Inc. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PAYMENT_METHODS.map(({ label, icon: Icon, className }) => (
                <Icon key={label} className={`${className} text-foreground`} />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;