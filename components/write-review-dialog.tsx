"use client";

import * as React from "react";
import { Check, Star } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMPTY_FORM = { author: "", email: "", rating: 0, body: "" };

export function WriteReviewDialog({ productId }: { productId: string }) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setForm(EMPTY_FORM);
      setSubmitError(null);
      setSubmitted(false);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!form.author.trim() || !form.rating || !form.body.trim()) {
      setSubmitError("Please add your name, a rating, and a review.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: form.author,
            email: form.email || undefined,
            rating: form.rating,
            body: form.body,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm">Write a review</Button>} />
      <DialogContent className="w-full sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
            <p className="text-sm font-medium text-foreground">
              Thanks for your review!
            </p>
            <p className="text-sm text-muted-foreground">
              It'll appear here once it's approved.
            </p>
            <Button className="mt-2" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share what you thought — it'll be reviewed before it goes live.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-4">
              <div className="space-y-1.5">
                <Label>Rating</Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const value = i + 1;
                    const filled = value <= (hoverRating || form.rating);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, rating: value }))}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        className="p-0.5"
                      >
                        <Star
                          className={cn(
                            "h-6 w-6 transition-colors",
                            filled
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted-foreground"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review-author">Name</Label>
                <Input
                  id="review-author"
                  placeholder="Jane Doe"
                  value={form.author}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review-email">
                  Email{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional, not shown publicly)
                  </span>
                </Label>
                <Input
                  id="review-email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review-body">Review</Label>
                <Textarea
                  id="review-body"
                  rows={4}
                  placeholder="What did you like or dislike?"
                  value={form.body}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, body: e.target.value }))
                  }
                />
              </div>
            </div>

            {submitError && (
              <p className="mt-3 text-sm text-destructive">{submitError}</p>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WriteReviewDialog;
