"use client";

import * as React from "react";
import Link from "next/link";
import { Search, MessageCircleQuestion, ArrowRight, HelpCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { Faq } from "@/lib/get-faqs";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    );
  }, [faqs, query]);

  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircleQuestion className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Everything you need to know about shopping, shipping, and returns.
            Can&apos;t find what you&apos;re looking for? Reach out to our team.
          </p>
        </div>

        {/* Search */}
        <div className="relative mx-auto mt-8 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="h-11 pl-9"
          />
        </div>

        {/* List */}
        <div className="mt-10">
          {faqs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
              <HelpCircle className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No questions have been published yet.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
              <Search className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No questions match &quot;{query}&quot;.
              </p>
              <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card px-5 sm:px-6">
              <Accordion multiple>
                {filtered.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="py-4 text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="whitespace-pre-line text-muted-foreground">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/40 px-6 py-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            Still have questions?
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Our support team is happy to help with anything not covered here.
          </p>
          <Button
            className="mt-2"
            nativeButton={false}
            render={
              <Link href="/contact">
                Contact us
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
