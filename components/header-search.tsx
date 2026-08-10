"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ImageOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/components/product-card";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 6;

export function HeaderSearch() {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setStatus("idle");
  }

  function toggleOpen() {
    setOpen((next) => {
      const willOpen = !next;
      if (willOpen) {
        requestAnimationFrame(() => inputRef.current?.focus());
      } else {
        setQuery("");
        setResults([]);
        setStatus("idle");
      }
      return willOpen;
    });
  }

  // Debounced fetch as the user types.
  React.useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const controller = new AbortController();

    const timer = setTimeout(() => {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?search=${encodeURIComponent(trimmed)}&limit=${RESULT_LIMIT}`,
        { signal: controller.signal }
      )
        .then((res) => {
          if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
          return res.json();
        })
        .then((data: Product[]) => {
          setResults(data);
          setStatus("ready");
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          setStatus("error");
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close on outside click.
  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function goToResults() {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    close();
  }

  const showResults = query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className="relative flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        aria-label={open ? "Close search" : "Search"}
        onClick={toggleOpen}
      >
        {open ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl bg-popover p-2 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 sm:w-96">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search products…"
              className="h-9 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
                if (e.key === "Enter") goToResults();
              }}
            />
          </div>

          {showResults && (
          <div className="mt-2">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          )}

          {status === "error" && (
            <p className="py-8 text-center text-destructive">Could not load results.</p>
          )}

          {status === "ready" && results.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No products match &quot;{query.trim()}&quot;.
            </p>
          )}

          {status === "ready" && results.length > 0 && (
            <ul className="max-h-96 space-y-1 overflow-y-auto">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={close}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                  >
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {status === "ready" && (
            <button
              type="button"
              onClick={goToResults}
              className="mt-1 w-full rounded-lg px-2 py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              View all results for &quot;{query.trim()}&quot;
            </button>
          )}
          </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HeaderSearch;
