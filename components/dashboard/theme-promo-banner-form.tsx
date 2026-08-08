"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { useAuth } from "@/lib/auth-context";
import type { PromoBannerData } from "@/lib/get-promo-banner";

export function ThemePromoBannerForm({ initial }: { initial: PromoBannerData }) {
  const router = useRouter();
  const { token } = useAuth();

  const [enabled, setEnabled] = React.useState(initial.enabled);
  const [image, setImage] = React.useState(initial.image ?? "");
  const [eyebrow, setEyebrow] = React.useState(initial.eyebrow ?? "");
  const [heading, setHeading] = React.useState(initial.heading ?? "");
  const [body, setBody] = React.useState(initial.body ?? "");
  const [ctaLabel, setCtaLabel] = React.useState(initial.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = React.useState(initial.ctaHref ?? "");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-banner`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          enabled,
          image: image || null,
          eyebrow: eyebrow || null,
          heading: heading || null,
          body: body || null,
          ctaLabel: ctaLabel || null,
          ctaHref: ctaHref || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save the banner section."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Show this section</p>
          <p className="text-xs text-muted-foreground">
            Turn the promo banner on or off on the homepage.
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => {
            setEnabled(checked);
            setSaved(false);
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-muted-foreground">Image</Label>
          <ImageUploader
            value={image}
            onChange={(url) => {
              setImage(url);
              setSaved(false);
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pb-eyebrow">Eyebrow</Label>
            <Input
              id="pb-eyebrow"
              placeholder="Limited Time"
              value={eyebrow}
              onChange={(e) => {
                setEyebrow(e.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pb-heading">Heading</Label>
            <Input
              id="pb-heading"
              placeholder="Up to 40% off selected styles"
              value={heading}
              onChange={(e) => {
                setHeading(e.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pb-body">Body</Label>
            <Textarea
              id="pb-body"
              rows={2}
              placeholder="Considered essentials at a considered price — while stocks last."
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pb-cta-label">Button label</Label>
            <Input
              id="pb-cta-label"
              placeholder="Shop the Sale"
              value={ctaLabel}
              onChange={(e) => {
                setCtaLabel(e.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pb-cta-href">Button link</Label>
            <Input
              id="pb-cta-href"
              placeholder="/shop"
              value={ctaHref}
              onChange={(e) => {
                setCtaHref(e.target.value);
                setSaved(false);
              }}
            />
          </div>
        </div>
      </div>

      <Separator />

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save Changes"}
        </Button>
        {saved && !submitting && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-500">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

export default ThemePromoBannerForm;
