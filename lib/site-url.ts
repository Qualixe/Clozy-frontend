/**
 * Base URL for canonical links, OpenGraph tags, sitemap.xml, and robots.txt.
 *
 * No env var for this already existed in the project (grepped for
 * `SITE_URL`/`VERCEL_URL` across app/, lib/, next.config.ts, and
 * .env.local — only `NEXT_PUBLIC_API_URL`, the backend API origin, was
 * found). `NEXT_PUBLIC_SITE_URL` is the conventional Next.js name for this,
 * so that's what's read here; the fallback below is a guessed placeholder
 * and should be replaced by setting `NEXT_PUBLIC_SITE_URL` in the
 * production environment.
 */
const FALLBACK_SITE_URL = "https://www.clozy.com";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  return (configured && configured.trim() ? configured : FALLBACK_SITE_URL).replace(/\/+$/, "");
}
